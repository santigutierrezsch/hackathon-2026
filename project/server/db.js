/**
 * db.js — Simple JSON file store
 *
 * No native compilation required. Stores all data in data/db.json.
 * Provides a synchronous-style API that mirrors the previous SQLite interface.
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DB_FILE    = path.join(__dirname, "data", "db.json");

function normalizeUsername(value) {
  return String(value || "").trim().replace(/^@+/, "");
}

// ── Default shape ─────────────────────────────────────────────────────────────
const DEFAULT = {
  users:           [],   // { id, username, email, display_name, photo_url, xp, webhook_url, created_at }
  friend_requests: [],   // { id, from_user, to_user, status, created_at }
  friends:         [],   // { user1, user2, created_at }
  activities:      [],   // { id, user_id, type, xp_earned, details, created_at }
  _seq: { friend_requests: 0, activities: 0 }
};

// ── Load / save ───────────────────────────────────────────────────────────────
function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("db: failed to load db.json, starting fresh:", e.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT));
}

let _store = load();

function save() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(_store, null, 2));
  } catch (e) {
    console.error("db: failed to save db.json:", e.message);
  }
}

function now() { return Math.floor(Date.now() / 1000); }

function nextId(table) {
  if (!_store._seq) _store._seq = { friend_requests: 0, activities: 0 };
  _store._seq[table] = (_store._seq[table] || 0) + 1;
  return _store._seq[table];
}

// ── Users ─────────────────────────────────────────────────────────────────────
const users = {
  findById(id) {
    return _store.users.find(u => u.id === id) || null;
  },
  findByUsername(username) {
    const normalized = normalizeUsername(username).toLowerCase();
    if (!normalized) return null;
    return _store.users.find(u => (u.username || "").toLowerCase() === normalized) || null;
  },
  create({ id, email, display_name, photo_url }) {
    const user = { id, username: null, email: email || null, display_name: display_name || null,
                   photo_url: photo_url || null, xp: 0, webhook_url: null, created_at: now() };
    _store.users.push(user);
    save();
    return user;
  },
  setUsername(id, username) {
    const u = _store.users.find(u => u.id === id);
    if (!u) return null;
    u.username = username;
    save();
    return u;
  },
  update(id, fields) {
    const u = _store.users.find(u => u.id === id);
    if (!u) return null;
    if (fields.webhook_url  !== undefined) u.webhook_url  = fields.webhook_url;
    if (fields.display_name !== undefined) u.display_name = fields.display_name;
    if (fields.photo_url    !== undefined) u.photo_url    = fields.photo_url;
    save();
    return u;
  },
  addXP(id, amount) {
    const u = _store.users.find(u => u.id === id);
    if (!u) return null;
    u.xp = (u.xp || 0) + amount;
    save();
    return u;
  },
  isUsernameTaken(username, excludeId = null) {
    const normalized = normalizeUsername(username).toLowerCase();
    if (!normalized) return false;
    return _store.users.some(
      u => (u.username || "").toLowerCase() === normalized && u.id !== excludeId
    );
  },
  allWithUsername() {
    return _store.users.filter(u => u.username).sort((a, b) => b.xp - a.xp);
  }
};

// ── Friend Requests ───────────────────────────────────────────────────────────
const friendRequests = {
  findById(id) {
    return _store.friend_requests.find(r => r.id === id) || null;
  },
  findPending(fromUser, toUser) {
    return _store.friend_requests.find(r =>
      r.status === "pending" &&
      ((r.from_user === fromUser && r.to_user === toUser) ||
       (r.from_user === toUser   && r.to_user === fromUser))
    ) || null;
  },
  getIncoming(toUser) {
    return _store.friend_requests
      .filter(r => r.to_user === toUser && r.status === "pending")
      .sort((a, b) => b.created_at - a.created_at);
  },
  getOutgoing(fromUser) {
    return _store.friend_requests
      .filter(r => r.from_user === fromUser && r.status === "pending")
      .sort((a, b) => b.created_at - a.created_at);
  },
  create(fromUser, toUser) {
    const req = { id: nextId("friend_requests"), from_user: fromUser, to_user: toUser,
                  status: "pending", created_at: now() };
    _store.friend_requests.push(req);
    save();
    return req;
  },
  setStatus(id, status) {
    const r = _store.friend_requests.find(r => r.id === id);
    if (!r) return null;
    r.status = status;
    save();
    return r;
  },
  delete(id) {
    _store.friend_requests = _store.friend_requests.filter(r => r.id !== id);
    save();
  }
};

// ── Friends ───────────────────────────────────────────────────────────────────
const friends = {
  areFriends(a, b) {
    return _store.friends.some(f =>
      (f.user1 === a && f.user2 === b) || (f.user1 === b && f.user2 === a)
    );
  },
  add(user1, user2) {
    if (this.areFriends(user1, user2)) return;
    _store.friends.push({ user1, user2, created_at: now() });
    save();
  },
  remove(a, b) {
    _store.friends = _store.friends.filter(f =>
      !((f.user1 === a && f.user2 === b) || (f.user1 === b && f.user2 === a))
    );
    save();
  },
  getFriendUsernames(username) {
    return _store.friends
      .filter(f => f.user1 === username || f.user2 === username)
      .map(f => f.user1 === username ? f.user2 : f.user1);
  },
  getFriendsWithWebhooks(username) {
    const names = this.getFriendUsernames(username);
    return names
      .map(n => users.findByUsername(n))
      .filter(u => u && u.webhook_url);
  }
};

// ── Activities ────────────────────────────────────────────────────────────────
const activities = {
  create({ user_id, type, xp_earned, details }) {
    const act = { id: nextId("activities"), user_id, type, xp_earned,
                  details: details || {}, created_at: now() };
    _store.activities.push(act);
    save();
    return act;
  },
  getByUser(userId, limit = 20, offset = 0) {
    return _store.activities
      .filter(a => a.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at)
      .slice(offset, offset + limit);
  }
};

export default { users, friendRequests, friends, activities };
