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

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_ROWS = 8;
const MAX_COLS = 8;
const ROW_COST = 50;
const COL_COST = 50;

const SHOP_PLANTS = [
  { plant: "🍄", cost: 20,  label: "Mushroom"       },
  { plant: "🌵", cost: 30,  label: "Cactus"         },
  { plant: "🌲", cost: 50,  label: "Pine Tree"      },
  { plant: "🌸", cost: 100, label: "Cherry Blossom" },
];

// Normalize a plant key — handles legacy emoji or unknown values
function normalizePlant(key) {
  if (!key) return null;
  const known = ["🌱", "🌻", "🍄", "🌵", "🌲", "🌸"];
  if (known.includes(key)) return key;
  const found = known.find(k => String(key).includes(k));
  return found || null;
}

// ── Isometric tile dimensions ─────────────────────────────────────────────────
const TILE_W     = 82;   // full width of the diamond
const TILE_H     = 42;   // height of the diamond (top vertex to bottom vertex)
const TILE_DEPTH = 22;   // height of the side faces (gives the 3D depth)

/*
  Correct isometric clip-paths (all relative to their own div):

  Top face div  (TILE_W × TILE_H):
    polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)

  Left face div (TILE_W/2 × TILE_H/2+TILE_DEPTH), positioned at top=TILE_H/2, left=0:
    polygon(0% 0%, 100% 50%, 100% 100%, 0% 50%)

  Right face div (TILE_W/2 × TILE_H/2+TILE_DEPTH), positioned at top=TILE_H/2, left=TILE_W/2:
    polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)
*/

// ── Read-only isometric garden (for public profiles) ─────────────────────────
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

// ── Isometric Board ───────────────────────────────────────────────────────────
function IsometricBoard({ rows, cols, garden, selectedPlant, selectedTile, onTileClick, readOnly }) {
  // Board canvas size
  const boardW = (rows + cols) * (TILE_W / 2) + TILE_W;
  const boardH = (rows + cols) * (TILE_H / 2) + TILE_DEPTH + 100; // +100 for plant headroom

  // Render tiles back-to-front so closer tiles overlap further ones correctly
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({ r, c });
    }
  }
  // Sort: lower r+c = further back = render first
  tiles.sort((a, b) => (a.r + a.c) - (b.r + b.c));

  return (
    <div style={{
      width: "100%",
      overflowX: "auto",
      display: "flex",
      justifyContent: "center",
      padding: "16px 0 8px",
    }}>
      <div style={{
        position: "relative",
        width: boardW,
        height: boardH,
        margin: "0 auto",
        flexShrink: 0,
      }}>
        {tiles.map(({ r, c }) => {
          // Isometric screen position of the tile's top vertex
          const x = (c - r) * (TILE_W / 2) + boardW / 2 - TILE_W / 2;
          const y = (c + r) * (TILE_H / 2) + 60; // +60 so plants have room above

          const tile = garden.find(t => t.row === r && t.col === c);
          const plantKey = tile ? normalizePlant(tile.plant) : null;
          const isSelected = selectedTile && selectedTile.row === r && selectedTile.col === c;

          // Colour scheme
          const topColor   = isSelected
            ? "linear-gradient(135deg, #c6edbb 0%, #8fd98c 100%)"
            : "linear-gradient(135deg, #b98e63 0%, #a67a54 55%, #916544 100%)";
          const leftColor  = isSelected ? "#79bf74" : "#8a6040";
          const rightColor = isSelected ? "#65aa62" : "#775238";

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
                cursor: readOnly ? "default" : (selectedPlant ? "crosshair" : "pointer"),
                zIndex: r + c + 1,
              }}
            >
              {/* ── Top face (diamond) ── */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: TILE_W,
                height: TILE_H,
                background: topColor,
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.15))",
                transition: "background 0.15s",
              }} />

              {/* ── Left face ── */}
              <div style={{
                position: "absolute",
                top: TILE_H / 2 - 1,
                left: 0,
                width: TILE_W / 2 + 1,
                height: TILE_H / 2 + TILE_DEPTH,
                background: leftColor,
                clipPath: "polygon(0% 0%, 100% 50%, 100% 100%, 0% 50%)",
                transition: "background 0.15s",
              }} />

              {/* ── Right face ── */}
              <div style={{
                position: "absolute",
                top: TILE_H / 2 - 1,
                left: TILE_W / 2 - 1,
                width: TILE_W / 2 + 1,
                height: TILE_H / 2 + TILE_DEPTH,
                background: rightColor,
                clipPath: "polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)",
                transition: "background 0.15s",
              }} />

              {/* ── Plant — rendered upright above the tile centre ── */}
              {plantKey && PLANT_ART[plantKey] && (
                <div style={{
                  position: "absolute",
                  // Anchor plant base exactly to tile center.
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
                }}>
                  {PLANT_ART[plantKey]}
                </div>
              )}

              {/* ── Selection ring on top face ── */}
              {isSelected && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: TILE_W,
                  height: TILE_H,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  border: "none",
                  outline: "none",
                  boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.55)",
                  pointerEvents: "none",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Garden Component ─────────────────────────────────────────────────────
export default function Garden() {
  const { isLoggedIn, getToken, dbUser, refreshDbUser } = useAuth();

  const [garden,      setGarden]      = useState([]);
  const [rows,        setRows]        = useState(2);
  const [cols,        setCols]        = useState(2);
  const [inventory,   setInventory]   = useState(["🌱", "🌻"]);
  const [coins,       setCoins]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [busy,        setBusy]        = useState(false);
  const [toast,       setToast]       = useState(null);

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedTile,  setSelectedTile]  = useState(null); // {row, col}

  // ── Load garden from backend ────────────────────────────────────────────────
  const loadGarden = useCallback(async () => {
    if (!isLoggedIn) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await apiGetGarden(getToken);
      setGarden(data.garden      || []);
      setRows(data.garden_rows   || 2);
      setCols(data.garden_cols   || 2);
      setInventory(data.inventory || ["🌱", "🌻"]);
      setCoins(data.coins        || 0);
    } catch (e) {
      console.error("Garden load error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, getToken]);

  useEffect(() => { loadGarden(); }, [loadGarden]);

  // Sync coins from dbUser when it refreshes
  useEffect(() => {
    if (dbUser?.coins !== undefined) setCoins(dbUser.coins);
  }, [dbUser?.coins]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  // ── Tile click handler ──────────────────────────────────────────────────────
  async function handleTileClick(row, col) {
    if (!isLoggedIn) return;

    const existingIdx = garden.findIndex(t => t.row === row && t.col === col);

    // Deselect if clicking the already-selected tile
    if (selectedTile && selectedTile.row === row && selectedTile.col === col) {
      setSelectedTile(null);
      return;
    }

    // Plant selected → place it
    if (selectedPlant) {
      let newGarden;
      if (existingIdx >= 0) {
        newGarden = garden.map((t, i) =>
          i === existingIdx ? { ...t, plant: selectedPlant } : t
        );
      } else {
        newGarden = [...garden, { row, col, plant: selectedPlant }];
      }
      setGarden(newGarden);
      try {
        await apiUpdateGarden(newGarden, getToken);
      } catch (e) {
        showToast("❌ " + e.message);
        setGarden(garden);
      }
      return;
    }

    // Tile has a plant → select it for deletion
    if (existingIdx >= 0) {
      setSelectedTile({ row, col });
    }
  }

  // ── Delete selected tile ────────────────────────────────────────────────────
  async function handleDeletePlant() {
    if (!selectedTile) return;
    const newGarden = garden.filter(
      t => !(t.row === selectedTile.row && t.col === selectedTile.col)
    );
    setGarden(newGarden);
    setSelectedTile(null);
    try {
      await apiUpdateGarden(newGarden, getToken);
    } catch (e) {
      showToast("❌ " + e.message);
      setGarden(garden);
    }
  }

  // ── Buy row ─────────────────────────────────────────────────────────────────
  async function handleBuyRow() {
    if (rows >= MAX_ROWS) return showToast(`Max rows reached (${MAX_ROWS})`);
    if (coins < ROW_COST) return showToast(`Need ${ROW_COST} 🪙 to buy a row`);
    setBusy(true);
    try {
      const data = await apiBuyGardenRow(getToken);
      setRows(data.garden_rows);
      setCols(data.garden_cols);
      setCoins(data.coins);
      await refreshDbUser();
      showToast(`✅ ${data.message}`);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setBusy(false);
    }
  }

  // ── Buy column ──────────────────────────────────────────────────────────────
  async function handleBuyCol() {
    if (cols >= MAX_COLS) return showToast(`Max columns reached (${MAX_COLS})`);
    if (coins < COL_COST) return showToast(`Need ${COL_COST} 🪙 to buy a column`);
    setBusy(true);
    try {
      const data = await apiBuyGardenCol(getToken);
      setRows(data.garden_rows);
      setCols(data.garden_cols);
      setCoins(data.coins);
      await refreshDbUser();
      showToast(`✅ ${data.message}`);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setBusy(false);
    }
  }

  // ── Buy plant ───────────────────────────────────────────────────────────────
  async function handleBuyPlant(plant, cost) {
    if (inventory.includes(plant)) return showToast("Already owned!");
    if (coins < cost) return showToast(`Need ${cost} 🪙`);
    setBusy(true);
    try {
      const data = await apiBuyGardenPlant(plant, cost, getToken);
      setInventory(data.inventory);
      setCoins(data.coins);
      await refreshDbUser();
      showToast(`✅ ${plant} added to inventory!`);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setBusy(false);
    }
  }

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="card r2" style={{ textAlign: "center", padding: "24px", background: "#fbfdf8" }}>
        <div className="sectionTitle">Your Iso-Garden</div>
        <p className="meta" style={{ textAlign: "center" }}>
          Sign in to grow your isometric garden!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card r2" style={{ textAlign: "center", padding: "24px", background: "#fbfdf8" }}>
        <div className="meta">Loading garden…</div>
      </div>
    );
  }

  const selectedTileHasPlant = selectedTile &&
    garden.some(t => t.row === selectedTile.row && t.col === selectedTile.col);

  return (
    <div className="card r2" style={{ position: "relative", background: "linear-gradient(180deg, #f8fff4 0%, #f4f8ef 100%)" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "absolute", top: -44, left: "50%", transform: "translateX(-50%)",
          background: "var(--mint)", border: "2px solid var(--border)",
          borderRadius: 14, padding: "8px 18px",
          fontWeight: 900, fontSize: 13, whiteSpace: "nowrap",
          boxShadow: "0 4px 0 rgba(122,90,58,0.12)", zIndex: 50,
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="space" style={{ alignItems: "center" }}>
        <div>
          <div className="sectionTitle" style={{ margin: 0 }}>🪴 Iso-Garden</div>
          <div style={{ fontSize: 12, color: "rgba(122,90,58,0.6)", marginTop: 2 }}>
            {rows}×{cols} grid
          </div>
        </div>
        <div style={{
          background: "#FFD700", color: "#7a5a00",
          padding: "6px 14px", borderRadius: 999,
          fontWeight: 900, fontSize: 15,
          border: "2px solid rgba(122,90,58,0.18)",
          boxShadow: "0 3px 0 rgba(122,90,58,0.10)",
        }}>
          {coins.toLocaleString()} 🪙
        </div>
      </div>

      {/* Instruction */}
      <div style={{ fontSize: 12, color: "rgba(122,90,58,0.65)", marginTop: 8, textAlign: "center" }}>
        {selectedPlant
          ? `🌱 Click a tile to plant ${selectedPlant} — click again to deselect`
          : selectedTile
          ? "Tile selected — press Delete Plant or click elsewhere to deselect"
          : "Select a plant from inventory, then click a tile to plant it"}
      </div>

      {/* 3D Isometric Board */}
      <div style={{
        marginTop: 10,
        border: "1px solid rgba(122,90,58,0.15)",
        borderRadius: 16,
        background: "linear-gradient(180deg, #d6f0cf 0%, #e8f4df 45%, #f4f8ef 100%)",
      }}>
        <IsometricBoard
          rows={rows}
          cols={cols}
          garden={garden}
          selectedPlant={selectedPlant}
          selectedTile={selectedTile}
          onTileClick={handleTileClick}
        />
      </div>

      {/* Delete plant button */}
      {selectedTileHasPlant && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <button
            className="btn"
            style={{
              background: "#fde8e8",
              borderColor: "#e57373",
              color: "#c0392b",
              fontSize: 13,
            }}
            onClick={handleDeletePlant}
          >
            🗑️ Delete Plant
          </button>
        </div>
      )}

      {/* Inventory */}
      <div className="sectionTitle" style={{ marginTop: 14 }}>Inventory</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        {inventory.map((plant) => {
          const key = normalizePlant(plant);
          if (!key) return null;
          const isActive = selectedPlant === key;
          return (
            <div
              key={key}
              onClick={() => setSelectedPlant(isActive ? null : key)}
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
                transform: isActive ? "scale(1.08)" : "scale(1)",
                boxShadow: isActive ? "0 3px 0 rgba(122,90,58,0.15)" : "none",
              }}
            >
              <div style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {PLANT_ART[key]}
              </div>
            </div>
          );
        })}
        {inventory.length === 0 && (
          <div className="meta">No plants yet — buy some below!</div>
        )}
      </div>

      {/* Shop */}
      <div className="sectionTitle">Garden Shop</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>

        {/* Expand row */}
        <div style={shopCardStyle}>
          <div style={{ fontSize: 20 }}>➕</div>
          <div style={{ fontSize: 12, fontWeight: 900, textAlign: "center" }}>Add Row</div>
          <div style={{ fontSize: 11, color: "rgba(122,90,58,0.6)", textAlign: "center" }}>
            {rows}/{MAX_ROWS}
          </div>
          <button
            className="btn primary"
            style={{ fontSize: 11, padding: "5px 8px", width: "100%", justifyContent: "center" }}
            onClick={handleBuyRow}
            disabled={busy || rows >= MAX_ROWS}
          >
            {rows >= MAX_ROWS ? "Max ✓" : `${ROW_COST} 🪙`}
          </button>
        </div>

        {/* Expand col */}
        <div style={shopCardStyle}>
          <div style={{ fontSize: 20 }}>➕</div>
          <div style={{ fontSize: 12, fontWeight: 900, textAlign: "center" }}>Add Col</div>
          <div style={{ fontSize: 11, color: "rgba(122,90,58,0.6)", textAlign: "center" }}>
            {cols}/{MAX_COLS}
          </div>
          <button
            className="btn primary"
            style={{ fontSize: 11, padding: "5px 8px", width: "100%", justifyContent: "center" }}
            onClick={handleBuyCol}
            disabled={busy || cols >= MAX_COLS}
          >
            {cols >= MAX_COLS ? "Max ✓" : `${COL_COST} 🪙`}
          </button>
        </div>

        {/* Plant shop items */}
        {SHOP_PLANTS.map(({ plant, cost, label }) => {
          const owned = inventory.includes(plant);
          return (
            <div key={plant} style={shopCardStyle}>
              <div style={{
                width: 40, height: 40,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {PLANT_ART[plant]}
              </div>
              <div style={{ fontSize: 11, fontWeight: 900, textAlign: "center" }}>{label}</div>
              <button
                className={`btn ${owned ? "" : "primary"}`}
                style={{
                  fontSize: 11, padding: "5px 8px", width: "100%",
                  justifyContent: "center", opacity: owned ? 0.65 : 1,
                }}
                onClick={() => !owned && handleBuyPlant(plant, cost)}
                disabled={busy || owned}
              >
                {owned ? "Owned ✓" : `${cost} 🪙`}
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
  minWidth: 88,
  boxShadow: "0 4px 10px rgba(35,58,30,0.06)",
};
