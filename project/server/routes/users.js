import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const PLANT_SHOP = {
  green_plant: { label: "Green Plant", cost: 0 },
  sunflower: { label: "Sunflower", cost: 0 },
  mushroom: { label: "Mushroom", cost: 20 },
  cactus: { label: "Cactus", cost: 30 },
  tree: { label: "Tree", cost: 50 },
  flower: { label: "Flower", cost: 100 },
};
const PLOT_COST = 50;
const MAX_GARDEN_SIZE = 8;

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
 * POST /api/users/me/garden/plant
 * Body: { index: number, plantId: string }
 */
router.post("/me/garden/plant", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  const index = Number(req.body?.index);
  const plantId = String(req.body?.plantId || "");

  if (!Number.isInteger(index)) return res.status(400).json({ error: "index must be an integer" });
  if (!PLANT_SHOP[plantId]) return res.status(400).json({ error: "Unknown plantId" });

  const updated = db.users.plantInGarden(req.user.uid, index, plantId);
  if (!updated) {
    return res.status(400).json({ error: "Cannot plant there or plant not owned" });
  }

  res.json({
    garden: updated.garden,
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    inventory: updated.inventory,
    coins: updated.coins
  });
});

/**
 * POST /api/users/me/garden/delete
 * Body: { index: number }
 */
router.post("/me/garden/delete", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  const index = Number(req.body?.index);
  if (!Number.isInteger(index)) return res.status(400).json({ error: "index must be an integer" });

  const updated = db.users.clearGardenTile(req.user.uid, index);
  if (!updated) return res.status(400).json({ error: "Invalid garden index" });

  res.json({
    garden: updated.garden,
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    inventory: updated.inventory,
    coins: updated.coins
  });
});

/**
 * POST /api/users/me/garden/buy-item
 * Body: { plantId: string }
 */
router.post("/me/garden/buy-item", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  const plantId = String(req.body?.plantId || "");
  const item = PLANT_SHOP[plantId];
  if (!item) return res.status(400).json({ error: "Unknown plantId" });
  if (item.cost <= 0) return res.status(400).json({ error: "This starter plant is free and already included" });
  if (user.inventory.includes(plantId)) return res.status(409).json({ error: "You already own this plant" });
  if ((user.coins || 0) < item.cost) return res.status(400).json({ error: "Not enough coins" });

  const spent = db.users.spendCoins(req.user.uid, item.cost);
  if (!spent) return res.status(400).json({ error: "Not enough coins" });
  const updated = db.users.addInventoryItem(req.user.uid, plantId);

  res.json({
    inventory: updated.inventory,
    coins: updated.coins,
    purchased: { plantId, cost: item.cost, label: item.label },
  });
});

/**
 * POST /api/users/me/garden/buy-row
 * Adds one row, up to 8.
 */
router.post("/me/garden/buy-row", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  if ((user.garden_rows || 0) >= MAX_GARDEN_SIZE) {
    return res.status(400).json({ error: "Garden already at max rows (8)" });
  }
  if ((user.coins || 0) < PLOT_COST) return res.status(400).json({ error: "Not enough coins" });

  const spent = db.users.spendCoins(req.user.uid, PLOT_COST);
  if (!spent) return res.status(400).json({ error: "Not enough coins" });
  const updated = db.users.addGardenRow(req.user.uid);
  if (!updated) return res.status(400).json({ error: "Garden already at max rows (8)" });
  res.json({
    garden: updated.garden,
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    coins: updated.coins,
    cost: PLOT_COST
  });
});

/**
 * POST /api/users/me/garden/buy-column
 * Adds one column, up to 8.
 */
router.post("/me/garden/buy-column", requireAuth, (req, res) => {
  const user = db.users.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  if ((user.garden_cols || 0) >= MAX_GARDEN_SIZE) {
    return res.status(400).json({ error: "Garden already at max columns (8)" });
  }
  if ((user.coins || 0) < PLOT_COST) return res.status(400).json({ error: "Not enough coins" });

  const spent = db.users.spendCoins(req.user.uid, PLOT_COST);
  if (!spent) return res.status(400).json({ error: "Not enough coins" });
  const updated = db.users.addGardenColumn(req.user.uid);
  if (!updated) return res.status(400).json({ error: "Garden already at max columns (8)" });
  res.json({
    garden: updated.garden,
    garden_rows: updated.garden_rows,
    garden_cols: updated.garden_cols,
    coins: updated.coins,
    cost: PLOT_COST
  });
});

/**
 * GET /api/users/:username
 * Public profile — returns username, display_name, photo_url, xp.
 * Does NOT expose email, webhook_url, or Firebase UID.
 */
router.get("/:username", (req, res) => {
  const user = db.users.findByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Return only public fields
  const { username, display_name, photo_url, xp, coins, created_at, garden, garden_rows, garden_cols } = user;
  res.json({ user: { username, display_name, photo_url, xp, coins, created_at, garden, garden_rows, garden_cols } });
});

export default router;
