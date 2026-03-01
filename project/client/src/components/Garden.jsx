import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  apiGetGarden,
  apiUpdateGarden,
  apiBuyGardenRow,
  apiBuyGardenCol,
  apiBuyGardenPlant,
} from "../utils/api.js";
import { PLANT_ART } from "./PlantGraphics.jsx";
import { getXPTier } from "../utils/xp.js";

const MAX_ROWS = 8;
const MAX_COLS = 8;
const ROW_COST = 50;
const COL_COST = 50;

const SHOP_PLANTS = [
  { plant: "🍄", cost: 20, label: "Mushroom", unlockXp: 100 },
  { plant: "🌵", cost: 30, label: "Cactus", unlockXp: 500 },
  { plant: "🌲", cost: 50, label: "Pine Tree", unlockXp: 1000 },
  { plant: "🌸", cost: 100, label: "Cherry Blossom", unlockXp: 2000 },
  { plant: "🍀", cost: 120, label: "Lucky Clover", unlockXp: 2500 },
  { plant: "🌴", cost: 140, label: "Palm", unlockXp: 3000 },
  { plant: "🍁", cost: 160, label: "Maple", unlockXp: 4000 },
  { plant: "🌿", cost: 180, label: "Herb", unlockXp: 6000 },
];

const KNOWN_PLANTS = ["🌱", "🌻", ...SHOP_PLANTS.map((p) => p.plant)];

function normalizePlant(key) {
  if (!key) return null;
  if (KNOWN_PLANTS.includes(key)) return key;
  return KNOWN_PLANTS.find((k) => String(key).includes(k)) || null;
}

const TILE_W = 82;
const TILE_H = 42;
const TILE_DEPTH = 22;

export function GardenReadOnly({ garden = [], garden_rows = 2, garden_cols = 2 }) {
  return (
    <IsometricBoard
      rows={garden_rows}
      cols={garden_cols}
      garden={garden}
      selectedPlant={null}
      selectedTile={null}
      onTileClick={() => {}}
      readOnly
    />
  );
}

function IsometricBoard({ rows, cols, garden, selectedPlant, selectedTile, onTileClick, readOnly }) {
  const boardW = (rows + cols) * (TILE_W / 2) + TILE_W;
  const boardH = (rows + cols) * (TILE_H / 2) + TILE_DEPTH + 100;

  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({ r, c });
    }
  }
  tiles.sort((a, b) => a.r + a.c - (b.r + b.c));

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        justifyContent: "center",
        padding: "16px 0 8px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: boardW,
          height: boardH,
          margin: "0 auto",
          flexShrink: 0,
        }}
      >
        {tiles.map(({ r, c }) => {
          const x = (c - r) * (TILE_W / 2) + boardW / 2 - TILE_W / 2;
          const y = (c + r) * (TILE_H / 2) + 60;

          const tile = garden.find((t) => t.row === r && t.col === c);
          const plantKey = tile ? normalizePlant(tile.plant) : null;
          const isSelected = selectedTile && selectedTile.row === r && selectedTile.col === c;

          const topColor = isSelected
            ? "linear-gradient(135deg, #cdeec6 0%, #96d98f 100%)"
            : "linear-gradient(135deg, #c29a73 0%, #ae855f 55%, #9a714f 100%)";
          const leftColor = isSelected ? "#7dbe76" : "#8a6040";
          const rightColor = isSelected ? "#6aab64" : "#775238";

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => !readOnly && onTileClick(r, c)}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: TILE_W,
                height: TILE_H + TILE_DEPTH,
                cursor: readOnly ? "default" : selectedPlant ? "crosshair" : "pointer",
                zIndex: r + c + 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: TILE_W,
                  height: TILE_H,
                  background: topColor,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.15))",
                  transition: "background 0.15s",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: TILE_H / 2 - 1,
                  left: 0,
                  width: TILE_W / 2 + 1,
                  height: TILE_H / 2 + TILE_DEPTH,
                  background: leftColor,
                  clipPath: "polygon(0% 0%, 100% 50%, 100% 100%, 0% 50%)",
                  transition: "background 0.15s",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: TILE_H / 2 - 1,
                  left: TILE_W / 2 - 1,
                  width: TILE_W / 2 + 1,
                  height: TILE_H / 2 + TILE_DEPTH,
                  background: rightColor,
                  clipPath: "polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)",
                  transition: "background 0.15s",
                }}
              />

              {plantKey && PLANT_ART[plantKey] && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: TILE_H / 2 + 1,
                    width: 60,
                    height: 60,
                    transform: "translate(-50%, -100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 20,
                    filter: "drop-shadow(0 5px 7px rgba(0,0,0,0.24))",
                  }}
                >
                  {PLANT_ART[plantKey]}
                </div>
              )}

              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: TILE_W,
                    height: TILE_H,
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.55)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Garden() {
  const { isLoggedIn, getToken, dbUser, refreshDbUser } = useAuth();

  const [garden, setGarden] = useState([]);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [inventory, setInventory] = useState(["🌱", "🌻"]);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);

  const xp = dbUser?.xp || 0;
  const tier = getXPTier(xp);

  const loadGarden = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiGetGarden(getToken);
      setGarden(data.garden || []);
      setRows(data.garden_rows || 2);
      setCols(data.garden_cols || 2);
      setInventory(data.inventory || ["🌱", "🌻"]);
      setCoins(data.coins || 0);
    } catch (e) {
      console.error("Garden load error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoggedIn]);

  useEffect(() => {
    loadGarden();
  }, [loadGarden]);

  useEffect(() => {
    if (dbUser?.coins !== undefined) setCoins(dbUser.coins);
  }, [dbUser?.coins]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }

  async function handleTileClick(row, col) {
    if (!isLoggedIn) return;

    const existingIdx = garden.findIndex((t) => t.row === row && t.col === col);

    if (selectedTile && selectedTile.row === row && selectedTile.col === col) {
      setSelectedTile(null);
      return;
    }

    if (selectedPlant) {
      let newGarden;
      if (existingIdx >= 0) {
        newGarden = garden.map((t, i) => (i === existingIdx ? { ...t, plant: selectedPlant } : t));
      } else {
        newGarden = [...garden, { row, col, plant: selectedPlant }];
      }

      setGarden(newGarden);
      try {
        await apiUpdateGarden(newGarden, getToken);
      } catch (e) {
        showToast(`❌ ${e.message}`);
        setGarden(garden);
      }
      return;
    }

    if (existingIdx >= 0) {
      setSelectedTile({ row, col });
    }
  }

  async function handleDeletePlant() {
    if (!selectedTile) return;

    const newGarden = garden.filter((t) => !(t.row === selectedTile.row && t.col === selectedTile.col));
    setGarden(newGarden);
    setSelectedTile(null);

    try {
      await apiUpdateGarden(newGarden, getToken);
    } catch (e) {
      showToast(`❌ ${e.message}`);
      setGarden(garden);
    }
  }

  async function handleBuyRow() {
    if (rows >= MAX_ROWS) return showToast(`Max rows reached (${MAX_ROWS})`);
    if (coins < ROW_COST) return showToast(`Need ${ROW_COST} coins to buy a row`);

    setBusy(true);
    try {
      const data = await apiBuyGardenRow(getToken);
      setRows(data.garden_rows);
      setCols(data.garden_cols);
      setCoins(data.coins);
      await refreshDbUser();
      showToast(`✅ ${data.message}`);
    } catch (e) {
      showToast(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleBuyCol() {
    if (cols >= MAX_COLS) return showToast(`Max columns reached (${MAX_COLS})`);
    if (coins < COL_COST) return showToast(`Need ${COL_COST} coins to buy a column`);

    setBusy(true);
    try {
      const data = await apiBuyGardenCol(getToken);
      setRows(data.garden_rows);
      setCols(data.garden_cols);
      setCoins(data.coins);
      await refreshDbUser();
      showToast(`✅ ${data.message}`);
    } catch (e) {
      showToast(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleBuyPlant(plant, cost, unlockXp = 0) {
    if (inventory.includes(plant)) return showToast("Already owned");
    if (xp < unlockXp) return showToast(`Locked: requires ${unlockXp} XP`);
    if (coins < cost) return showToast(`Need ${cost} coins`);

    setBusy(true);
    try {
      const data = await apiBuyGardenPlant(plant, cost, getToken);
      setInventory(data.inventory);
      setCoins(data.coins);
      await refreshDbUser();
      showToast(`✅ ${plant} added to inventory`);
    } catch (e) {
      showToast(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="card r2" style={{ textAlign: "center", padding: "24px", background: "#fbfdf8" }}>
        <div className="sectionTitle">Your Iso-Garden</div>
        <p className="meta" style={{ textAlign: "center" }}>
          Sign in to grow your isometric garden.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card r2" style={{ textAlign: "center", padding: "24px", background: "#fbfdf8" }}>
        <div className="meta">Loading garden...</div>
      </div>
    );
  }

  const selectedTileHasPlant =
    selectedTile && garden.some((t) => t.row === selectedTile.row && t.col === selectedTile.col);

  return (
    <div className="card r2" style={{ position: "relative", background: "linear-gradient(180deg, #f8fff4 0%, #f4f8ef 100%)" }}>
      {toast && (
        <div
          style={{
            position: "absolute",
            top: -44,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--mint)",
            border: "2px solid var(--border)",
            borderRadius: 14,
            padding: "8px 18px",
            fontWeight: 900,
            fontSize: 13,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 0 rgba(122,90,58,0.12)",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}

      <div className="space" style={{ alignItems: "center" }}>
        <div>
          <div className="sectionTitle" style={{ margin: 0 }}>
            Iso-Garden
          </div>
          <div style={{ fontSize: 12, color: "rgba(122,90,58,0.6)", marginTop: 2 }}>
            {rows}x{cols} grid | {tier.label}
          </div>
        </div>
        <div
          style={{
            background: "#FFD700",
            color: "#7a5a00",
            padding: "6px 14px",
            borderRadius: 999,
            fontWeight: 900,
            fontSize: 15,
            border: "2px solid rgba(122,90,58,0.18)",
            boxShadow: "0 3px 0 rgba(122,90,58,0.10)",
          }}
        >
          {coins.toLocaleString()} coins
        </div>
      </div>

      <div style={{ fontSize: 12, color: "rgba(122,90,58,0.65)", marginTop: 8, textAlign: "center" }}>
        {selectedPlant
          ? `Click a tile to plant ${selectedPlant}. Click inventory again to deselect.`
          : selectedTile
            ? "Tile selected. Use Delete Plant or click the tile again to deselect."
            : "Select a plant from inventory, then click a tile to place it."}
      </div>

      <div
        style={{
          marginTop: 10,
          border: "1px solid rgba(122,90,58,0.15)",
          borderRadius: 16,
          background: "linear-gradient(180deg, #d6f0cf 0%, #e8f4df 45%, #f4f8ef 100%)",
        }}
      >
        <IsometricBoard
          rows={rows}
          cols={cols}
          garden={garden}
          selectedPlant={selectedPlant}
          selectedTile={selectedTile}
          onTileClick={handleTileClick}
        />
      </div>

      {selectedTileHasPlant && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <button className="btn" onClick={handleDeletePlant} disabled={busy}>
            Delete Plant
          </button>
        </div>
      )}

      <div className="sectionTitle" style={{ marginTop: 14 }}>
        Inventory
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        {inventory.map((plant) => {
          const key = normalizePlant(plant);
          if (!key || !PLANT_ART[key]) return null;
          const isActive = selectedPlant === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedPlant(isActive ? null : key)}
              type="button"
              style={{
                padding: "8px 12px",
                borderRadius: 14,
                border: isActive ? "2px solid var(--brown)" : "2px solid var(--border)",
                background: isActive ? "var(--mint)" : "var(--paper2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "transform 0.1s, background 0.12s",
                transform: isActive ? "scale(1.06)" : "scale(1)",
                boxShadow: isActive ? "0 3px 0 rgba(122,90,58,0.15)" : "none",
              }}
            >
              <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {PLANT_ART[key]}
              </div>
            </button>
          );
        })}

        {inventory.length === 0 && <div className="meta">No plants yet. Buy some below.</div>}
      </div>

      <div className="sectionTitle">Garden Shop</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={shopCardStyle}>
          <div style={{ fontSize: 20 }}>+</div>
          <div style={{ fontSize: 12, fontWeight: 900, textAlign: "center" }}>Add Row</div>
          <div style={{ fontSize: 11, color: "rgba(122,90,58,0.6)", textAlign: "center" }}>
            {rows}/{MAX_ROWS}
          </div>
          <button className="btn" onClick={handleBuyRow} disabled={busy || rows >= MAX_ROWS || coins < ROW_COST}>
            {ROW_COST} coins
          </button>
        </div>

        <div style={shopCardStyle}>
          <div style={{ fontSize: 20 }}>+</div>
          <div style={{ fontSize: 12, fontWeight: 900, textAlign: "center" }}>Add Column</div>
          <div style={{ fontSize: 11, color: "rgba(122,90,58,0.6)", textAlign: "center" }}>
            {cols}/{MAX_COLS}
          </div>
          <button className="btn" onClick={handleBuyCol} disabled={busy || cols >= MAX_COLS || coins < COL_COST}>
            {COL_COST} coins
          </button>
        </div>

        {SHOP_PLANTS.map(({ plant, cost, label, unlockXp }) => {
          const owned = inventory.includes(plant);
          const locked = xp < unlockXp;
          return (
            <div key={plant} style={shopCardStyle}>
              <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {PLANT_ART[plant]}
              </div>
              <div style={{ fontSize: 11, fontWeight: 900, textAlign: "center" }}>{label}</div>
              <div style={{ fontSize: 10, color: "rgba(122,90,58,0.65)", textAlign: "center" }}>
                {locked ? `Unlocks at ${unlockXp} XP` : "Unlocked"}
              </div>
              <button
                className="btn"
                onClick={() => handleBuyPlant(plant, cost, unlockXp)}
                disabled={busy || owned || locked || coins < cost}
              >
                {owned ? "Owned" : `${cost} coins`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const shopCardStyle = {
  background: "#ffffff",
  border: "1px solid rgba(122,90,58,0.18)",
  borderRadius: 14,
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  minWidth: 110,
  boxShadow: "0 4px 10px rgba(35,58,30,0.06)",
};
