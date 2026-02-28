import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/leaderboard/global
 * Returns top 50 users sorted by XP descending.
 * Public — no auth required.
 */
router.get("/global", (req, res) => {
  const all = db.users.allWithUsername();
  const top = all.slice(0, 50).map(({ username, display_name, photo_url, xp }, i) => ({
    rank: i + 1,
    username,
    display_name,
    photo_url,
    xp
  }));
  res.json({ leaderboard: top });
});

/**
 * GET /api/leaderboard/friends
 * Returns the current user + their friends sorted by XP.
 * Requires auth.
 */
router.get("/friends", requireAuth, (req, res) => {
  const me = db.users.findById(req.user.uid);
  if (!me || !me.username) {
    return res.status(400).json({ error: "Set a username first" });
  }

  const friendUsernames = db.friends.getFriendUsernames(me.username);
  const allNames = [me.username, ...friendUsernames];

  const entries = allNames
    .map(name => db.users.findByUsername(name))
    .filter(Boolean)
    .sort((a, b) => b.xp - a.xp)
    .map(({ username, display_name, photo_url, xp }, i) => ({
      rank: i + 1,
      username,
      display_name,
      photo_url,
      xp,
      isMe: username === me.username
    }));

  res.json({ leaderboard: entries });
});

export default router;
