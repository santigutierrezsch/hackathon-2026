import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const MAX_ROWS = 8;
const MAX_COLS = 8;
const ROW_COST = 50;
const COL_COST = 50;

// Valid plant keys (emoji keys that map to PlantGraphics)
const VALID_PLANTS = ["🌱", "🌻", "🍄", "🌵", "🌲", "🌸"];

function normalizeGarden(garden) {
  // Ensure garden is an array of {row, col, plant} objects
  if (!Array.isArray(garden)) return [];
  return garden.filter(t =>
    typeof t.row === "number" &&
    typeof t.col === "number" &&
    typeof t.plant === "string"
  );
}

/**
 * GET /api/garden
 * Returns the current user's garden state.
 */
router.get("/", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    garden:      user.garden      || [],
    garden_rows: user.garden_rows || 2,
    garden_cols: user.garden_cols || 2,
    inventory:   user.inventory   || ["🌱", "🌻"],
    coins:       user.coins       || 0,
  });
});

/**
 * PUT /api/garden
 * Update the planted tiles.
 * Body: { garden: [{row, col, plant}] }
 */
router.put("/", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { garden } = req.body;
  if (!Array.isArray(garden)) {
    return res.status(400).json({ error: "garden must be an array" });
  }

  const rows = user.garden_rows || 2;
  const cols = user.garden_cols || 2;

  // Validate tiles are within bounds
  const valid = normalizeGarden(garden).filter(t =>
    t.row >= 0 && t.row < rows &&
    t.col >= 0 && t.col < cols
  );

  const updated = db.users.updateGarden(req.user.uid, valid);
  res.json({
    garden:      updated.garden,
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    coins:       updated.coins,
  });
});

/**
 * POST /api/garden/buy-row
 * Spend coins to add a row (max 8).
 */
router.post("/buy-row", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  const currentRows = user.garden_rows || 2;
  if (currentRows >= MAX_ROWS) {
    return res.status(400).json({ error: `Already at maximum rows (${MAX_ROWS})` });
  }

  const result = db.users.spendCoins(req.user.uid, ROW_COST);
  if (result === false) {
    return res.status(400).json({ error: `Not enough coins. Need ${ROW_COST} 🪙` });
  }

  const newRows = currentRows + 1;
  const updated = db.users.setGardenSize(req.user.uid, newRows, user.garden_cols || 2);

  res.json({
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    coins:       updated.coins,
    message:     `Row added! Garden is now ${updated.garden_rows}×${updated.garden_cols}`,
  });
});

/**
 * POST /api/garden/buy-col
 * Spend coins to add a column (max 8).
 */
router.post("/buy-col", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  const currentCols = user.garden_cols || 2;
  if (currentCols >= MAX_COLS) {
    return res.status(400).json({ error: `Already at maximum columns (${MAX_COLS})` });
  }

  const result = db.users.spendCoins(req.user.uid, COL_COST);
  if (result === false) {
    return res.status(400).json({ error: `Not enough coins. Need ${COL_COST} 🪙` });
  }

  const newCols = currentCols + 1;
  const updated = db.users.setGardenSize(req.user.uid, user.garden_rows || 2, newCols);

  res.json({
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    coins:       updated.coins,
    message:     `Column added! Garden is now ${updated.garden_rows}×${updated.garden_cols}`,
  });
});

/**
 * POST /api/garden/buy-plant
 * Spend coins to add a plant to inventory.
 * Body: { plant: string, cost: number }
 */
router.post("/buy-plant", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { plant, cost } = req.body;
  if (!plant || !VALID_PLANTS.includes(plant)) {
    return res.status(400).json({ error: "Invalid plant" });
  }

  const inventory = user.inventory || ["🌱", "🌻"];
  if (inventory.includes(plant)) {
    return res.status(409).json({ error: "Already owned" });
  }

  const plantCost = Number(cost) || 50;
  const result = db.users.spendCoins(req.user.uid, plantCost);
  if (result === false) {
    return res.status(400).json({ error: `Not enough coins. Need ${plantCost} 🪙` });
  }

  const newInventory = [...inventory, plant];
  const updated = db.users.updateInventory(req.user.uid, newInventory);

  res.json({
    inventory: updated.inventory,
    coins:     updated.coins,
  });
});

/**
 * GET /api/garden/:username
 * Public garden view — no auth required.
 */
router.get("/:username", (req, res) => {
  const user = db.users.findByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    garden:      user.garden      || [],
    garden_rows: user.garden_rows || 2,
    garden_cols: user.garden_cols || 2,
  });
});

export default router;
