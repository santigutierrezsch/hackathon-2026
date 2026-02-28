import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function getUsername(uid) {
  return db.users.findById(uid)?.username || null;
}

/**
 * GET /api/friends
 * Returns the current user's accepted friends list with their XP.
 */
router.get("/", requireAuth, (req, res) => {
  const me = getUsername(req.user.uid);
  if (!me) return res.status(400).json({ error: "Set a username first" });

  const friendUsernames = db.friends.getFriendUsernames(me);
  const friendList = friendUsernames
    .map(name => db.users.findByUsername(name))
    .filter(Boolean)
    .map(({ username, display_name, photo_url, xp }) => ({ username, display_name, photo_url, xp }))
    .sort((a, b) => b.xp - a.xp);

  res.json({ friends: friendList });
});

/**
 * GET /api/friends/requests
 * Returns pending incoming and outgoing friend requests.
 */
router.get("/requests", requireAuth, (req, res) => {
  const me = getUsername(req.user.uid);
  if (!me) return res.status(400).json({ error: "Set a username first" });

  const incoming = db.friendRequests.getIncoming(me).map(r => {
    const u = db.users.findByUsername(r.from_user);
    return { ...r, display_name: u?.display_name, photo_url: u?.photo_url, xp: u?.xp || 0 };
  });

  const outgoing = db.friendRequests.getOutgoing(me).map(r => {
    const u = db.users.findByUsername(r.to_user);
    return { ...r, display_name: u?.display_name, photo_url: u?.photo_url, xp: u?.xp || 0 };
  });

  res.json({ incoming, outgoing });
});

/**
 * POST /api/friends/request
 * Send a friend request to another user.
 * Body: { username: string }
 */
router.post("/request", requireAuth, (req, res) => {
  const me = getUsername(req.user.uid);
  if (!me) return res.status(400).json({ error: "Set a username first" });

  const targetInput = String(req.body?.username || "").trim().replace(/^@+/, "");
  if (!targetInput) return res.status(400).json({ error: "username is required" });
  if (targetInput.toLowerCase() === me.toLowerCase()) {
    return res.status(400).json({ error: "Cannot add yourself" });
  }

  const targetUser = db.users.findByUsername(targetInput);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }
  const target = targetUser.username;

  if (db.friends.areFriends(me, target)) {
    return res.status(409).json({ error: "Already friends" });
  }

  if (db.friendRequests.findPending(me, target)) {
    return res.status(409).json({ error: "Friend request already pending" });
  }

  const req2 = db.friendRequests.create(me, target);
  res.status(201).json({ id: req2.id, from_user: me, to_user: target });
});

/**
 * POST /api/friends/accept/:id
 * Accept an incoming friend request.
 */
router.post("/accept/:id", requireAuth, (req, res) => {
  const me      = getUsername(req.user.uid);
  if (!me) return res.status(400).json({ error: "Set a username first" });

  const id      = Number(req.params.id);
  const request = db.friendRequests.findById(id);

  if (!request || request.to_user !== me || request.status !== "pending") {
    return res.status(404).json({ error: "Request not found" });
  }

  db.friendRequests.setStatus(id, "accepted");
  db.friends.add(request.from_user, me);

  res.json({ message: "Friend request accepted", friend: request.from_user });
});

/**
 * POST /api/friends/decline/:id
 * Decline an incoming friend request.
 */
router.post("/decline/:id", requireAuth, (req, res) => {
  const me      = getUsername(req.user.uid);
  if (!me) return res.status(400).json({ error: "Set a username first" });

  const id      = Number(req.params.id);
  const request = db.friendRequests.findById(id);

  if (!request || request.to_user !== me || request.status !== "pending") {
    return res.status(404).json({ error: "Request not found" });
  }

  db.friendRequests.setStatus(id, "declined");
  res.json({ message: "Friend request declined" });
});

/**
 * DELETE /api/friends/cancel/:id
 * Cancel an outgoing (pending) friend request.
 */
router.delete("/cancel/:id", requireAuth, (req, res) => {
  const me      = getUsername(req.user.uid);
  if (!me) return res.status(400).json({ error: "Set a username first" });

  const id      = Number(req.params.id);
  const request = db.friendRequests.findById(id);

  if (!request || request.from_user !== me || request.status !== "pending") {
    return res.status(404).json({ error: "Request not found" });
  }

  db.friendRequests.delete(id);
  res.json({ message: "Friend request cancelled" });
});

/**
 * DELETE /api/friends/:username
 * Remove an existing friend.
 */
router.delete("/:username", requireAuth, (req, res) => {
  const me     = getUsername(req.user.uid);
  const targetInput = String(req.params.username || "").trim().replace(/^@+/, "");
  if (!me) return res.status(400).json({ error: "Set a username first" });
  const targetUser = db.users.findByUsername(targetInput);
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  const target = targetUser.username;

  if (!db.friends.areFriends(me, target)) {
    return res.status(404).json({ error: "Not friends" });
  }

  db.friends.remove(me, target);
  res.json({ message: "Friend removed" });
});

export default router;
