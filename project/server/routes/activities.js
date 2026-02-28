import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ── XP Calculation Formulas ───────────────────────────────────────────────────

function calcXP(type, details) {
  switch (type) {
    case "farmers_market":
      return 50;

    case "carpool": {
      const distance = Math.max(0, Number(details.distance) || 0);
      const people   = Math.max(2, Math.round(Number(details.people) || 2));
      return Math.max(5, Math.round(distance * (people - 1) * 5));
    }

    case "recycling": {
      const plastic = Math.max(0, Number(details.plastic_lbs) || 0);
      const paper   = Math.max(0, Number(details.paper_lbs)   || 0);
      const metal   = Math.max(0, Number(details.metal_lbs)   || 0);
      return Math.max(1, Math.round(plastic * 20 + paper * 10 + metal * 25));
    }

    case "uber_ev": {
      const distance = Math.max(0, Number(details.distance) || 0);
      return Math.max(1, Math.round(distance * 8));
    }

    case "ev_miles": {
      const distance = Math.max(0, Number(details.distance) || 0);
      const isEV     = details.vehicle_type === "ev";
      return Math.max(1, Math.round(distance * (isEV ? 10 : 5)));
    }

    default:
      return 0;
  }
}

const VALID_TYPES = ["farmers_market", "carpool", "recycling", "uber_ev", "ev_miles"];

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/activities
 * Log a new XP-earning activity.
 * Body: { type: string, details: object }
 */
router.post("/", requireAuth, (req, res) => {
  const { type, details = {} } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      error: `Invalid activity type. Must be one of: ${VALID_TYPES.join(", ")}`
    });
  }

  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.username) return res.status(400).json({ error: "Set a username first" });

  const xpEarned = calcXP(type, details);
  if (xpEarned <= 0) {
    return res.status(400).json({ error: "Activity details produced 0 XP — check your inputs." });
  }

  // Log activity and update XP
  db.activities.create({ user_id: req.user.uid, type, xp_earned: xpEarned, details });
  const updatedUser = db.users.addXP(req.user.uid, xpEarned);

  res.status(201).json({
    xp_earned: xpEarned,
    total_xp: updatedUser.xp,
    type,
    details
  });
});

/**
 * GET /api/activities/me
 * Returns the current user's activity history (most recent first).
 * Query: ?limit=20&offset=0
 */
router.get("/me", requireAuth, (req, res) => {
  const limit  = Math.min(100, Math.max(1, Number(req.query.limit)  || 20));
  const offset = Math.max(0,              Number(req.query.offset) || 0);

  const acts = db.activities.getByUser(req.user.uid, limit, offset);
  res.json({ activities: acts });
});

export default router;
