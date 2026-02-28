import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../data/markets.json");

router.get("/", (req, res) => {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const markets = JSON.parse(raw);
    res.json(markets);
  } catch (e) {
    res.status(500).json({ error: "Failed to read markets.json", detail: e.message });
  }
});

export default router;