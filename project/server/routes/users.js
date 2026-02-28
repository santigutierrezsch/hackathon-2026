import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/users/me
 * Returns the current authenticated user's full profile.
 */
router.get("/me", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

/**
 * PUT /api/users/me
 * Update mutable profile fields: webhook_url, display_name, photo_url.
 * Body: { webhook_url?, display_name?, photo_url? }
 */
router.put("/me", requireAuth, (req, res) => {
  const { webhook_url, display_name, photo_url } = req.body;

  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Validate webhook URL if provided and non-empty
  if (webhook_url !== undefined && webhook_url !== "") {
    try {
      new URL(webhook_url);
    } catch {
      return res.status(400).json({ error: "Invalid webhook URL" });
    }
  }

  const updated = db.users.update(req.user.uid, { webhook_url, display_name, photo_url });
  res.json({ user: updated });
});

/**
 * GET /api/users/:username
 * Public profile — returns username, display_name, photo_url, xp, coins, garden.
 * Does NOT expose email, webhook_url, or Firebase UID.
 */
router.get("/:username", (req, res) => {
  const user = db.users.findByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Return only public fields
  const { username, display_name, photo_url, xp, coins, garden, garden_rows, garden_cols, created_at } = user;
  res.json({ user: { username, display_name, photo_url, xp, coins: coins || 0, garden: garden || [], garden_rows: garden_rows || 2, garden_cols: garden_cols || 2, created_at } });
});

export default router;
