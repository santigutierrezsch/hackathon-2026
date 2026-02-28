import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * POST /api/auth/login
 * Called after Google sign-in. Creates user if new, returns user record.
 */
router.post("/login", requireAuth, (req, res) => {
  const { uid, email, name, picture } = req.user;

  const existing = db.users.findById(uid);
  if (existing) {
    return res.json({ user: existing, isNew: false });
  }

  const newUser = db.users.create({ id: uid, email, display_name: name, photo_url: picture });
  return res.status(201).json({ user: newUser, isNew: true });
});

/**
 * POST /api/auth/set-username
 * Sets (or changes) the username for the authenticated user.
 * Body: { username: string }
 */
router.post("/set-username", requireAuth, (req, res) => {
  const { uid } = req.user;
  const { username } = req.body;

  if (!username || !USERNAME_RE.test(username)) {
    return res.status(400).json({
      error: "Username must be 3–20 characters: letters, numbers, underscores only."
    });
  }

  if (db.users.isUsernameTaken(username, uid)) {
    return res.status(409).json({ error: "Username already taken." });
  }

  const user = db.users.findById(uid);
  if (!user) return res.status(404).json({ error: "User not found." });

  const oldUsername = user.username;
  const updated = db.users.setUsername(uid, username);

  // Fire webhooks to friends if this is a username change (not initial set)
  if (oldUsername && oldUsername !== username) {
    fireUsernameWebhooks(oldUsername, username);
  }

  return res.json({ user: updated });
});

/**
 * POST /api/auth/check-username
 * Check if a username is available (no auth required).
 * Body: { username: string }
 */
router.post("/check-username", (req, res) => {
  const { username } = req.body;

  if (!username || !USERNAME_RE.test(username)) {
    return res.json({ available: false, reason: "Invalid format" });
  }

  return res.json({ available: !db.users.isUsernameTaken(username) });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fireUsernameWebhooks(oldUsername, newUsername) {
  try {
    const friendsWithWebhooks = db.friends.getFriendsWithWebhooks(oldUsername);
    const payload = {
      event: "username_changed",
      old_username: oldUsername,
      new_username: newUsername,
      timestamp: new Date().toISOString()
    };

    for (const friend of friendsWithWebhooks) {
      try {
        await fetch(friend.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)
        });
      } catch {
        // Silently ignore individual webhook failures
      }
    }
  } catch {
    // Don't crash the request if webhooks fail
  }
}

export default router;
