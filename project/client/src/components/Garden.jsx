<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase'; // ✅ Fixed path to match your screenshot!
import { PLANT_ART } from './PlantGraphics'; // Adjust path if you saved it in assets!
=======
import { useMemo, useState } from "react";
import {
  apiBuyGardenColumn,
  apiBuyGardenItem,
  apiBuyGardenRow,
  apiDeleteGardenTile,
  apiPlantGarden,
} from "../utils/api.js";
>>>>>>> Stashed changes

const MAX_GARDEN_SIZE = 8;
const PLANTS = {
  green_plant: { name: "Green Plant", emoji: "🌱", cost: 0 },
  sunflower: { name: "Sunflower", emoji: "🌻", cost: 0 },
  mushroom: { name: "Mushroom", emoji: "🍄", cost: 20 },
  cactus: { name: "Cactus", emoji: "🌵", cost: 30 },
  tree: { name: "Tree", emoji: "🌲", cost: 50 },
  flower: { name: "Flower", emoji: "🌸", cost: 100 },
};
const LEGACY_TO_ID = {
  "🌱": "green_plant",
  "🌻": "sunflower",
  "🍄": "mushroom",
  "🌵": "cactus",
  "🌲": "tree",
  "🌸": "flower",
};

function normalizePlantId(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  return LEGACY_TO_ID[raw] || raw;
}

export default function Garden({
  garden = [],
  gardenRows = 3,
  gardenCols = 3,
  inventory = [],
  coins = 0,
  editable = false,
  getToken = null,
  onChanged = null,
}) {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const normalizedGarden = useMemo(() => garden.map(normalizePlantId), [garden]);
  const normalizedInventory = useMemo(
    () => inventory.map(normalizePlantId).filter(Boolean),
    [inventory]
  );

  const ownedPlants = useMemo(() => {
    return normalizedInventory.filter(id => PLANTS[id]).map(id => ({ id, ...PLANTS[id] }));
  }, [normalizedInventory]);

  const shopPlants = useMemo(() => {
    return Object.entries(PLANTS)
      .filter(([, p]) => p.cost > 0)
      .map(([id, p]) => ({ id, ...p }));
  }, []);

  const displayRows = Math.max(1, Math.min(MAX_GARDEN_SIZE, Number(gardenRows) || 3));
  const displayCols = Math.max(1, Math.min(MAX_GARDEN_SIZE, Number(gardenCols) || 3));

  async function plantAt(index) {
    if (!editable || !selectedPlant || busy || !getToken) return;
    try {
      setBusy(true);
      setMsg("");
      await apiPlantGarden(index, selectedPlant, getToken);
      await onChanged?.();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAt(index) {
    if (!editable || busy || !getToken) return;
    try {
      setBusy(true);
      setMsg("");
      await apiDeleteGardenTile(index, getToken);
      await onChanged?.();
      setMsg("Tile cleared.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function buyPlant(plantId) {
    if (!editable || busy || !getToken) return;
    try {
      setBusy(true);
      setMsg("");
      await apiBuyGardenItem(plantId, getToken);
      await onChanged?.();
      setMsg("Plant purchased.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function buyRow() {
    if (!editable || busy || !getToken) return;
    try {
      setBusy(true);
      setMsg("");
      await apiBuyGardenRow(getToken);
      await onChanged?.();
      setMsg("Added 1 row.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function buyColumn() {
    if (!editable || busy || !getToken) return;
    try {
      setBusy(true);
      setMsg("");
      await apiBuyGardenColumn(getToken);
      await onChanged?.();
      setMsg("Added 1 column.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

<<<<<<< Updated upstream
    const userRef = doc(db, "users", user.email);
    await updateDoc(userRef, { coins: newCoins, garden: newGarden });
  };

  // 4. BUY DECORATION (Adds to Inventory)
  const handleBuyDeco = async (item, cost) => {
    if (!user?.email) return alert("Please log in to use the shop!");
    if (coins < cost) return alert("Not enough coins!");
    if (inventory.includes(item)) return alert("You already own this!");

    const newCoins = coins - cost;
    const newInventory = [...inventory, item];

    setCoins(newCoins);
    setInventory(newInventory);

    const userRef = doc(db, "users", user.email);
    await updateDoc(userRef, { coins: newCoins, inventory: newInventory });
  };

  // STYLES
  // UPGRADED STYLES ✨
  const styles = {
    container: { maxWidth: '700px', margin: '0 auto', textAlign: 'center', fontFamily: 'system-ui', padding: '20px' },
    gridWrapper: { perspective: '1000px', margin: '40px auto', width: 'fit-content' },
    grid: { 
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', 
      background: '#8D6E63', padding: '20px', borderRadius: '15px',
      boxShadow: '-15px 15px 0px rgba(0,0,0,0.1)', transform: 'rotateX(55deg) rotateZ(-45deg)', 
      transformStyle: 'preserve-3d', transition: 'all 0.3s ease'
=======
  const styles = {
    container: {
      background: "var(--paper)",
      border: "2px solid var(--border)",
      borderRadius: 22,
      boxShadow: "var(--shadow)",
      padding: 16,
      position: "relative",
>>>>>>> Stashed changes
    },
    gridWrapper: { perspective: "1000px", margin: "24px auto 18px", width: "fit-content", maxWidth: "100%" },
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${displayCols}, minmax(50px, 1fr))`,
      gap: 10,
      background: "#8D6E63",
      padding: 14,
      borderRadius: 14,
      boxShadow: "-12px 12px 0 rgba(0,0,0,0.12)",
      transform: "rotateX(55deg) rotateZ(-45deg)",
      transformStyle: "preserve-3d",
      transition: "all .2s ease",
    },
    dirtPatch: {
      width: 60,
      height: 60,
      background: "#795548",
      borderRadius: 10,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "none",
      cursor: "pointer",
      boxShadow: "inset 0 0 15px rgba(0,0,0,.45), -4px 4px 0 #5D4037",
    },
    plant: {
      fontSize: 34,
      transform: "translateY(-6px)",
      pointerEvents: "none",
      filter: "drop-shadow(0 4px 2px rgba(0,0,0,.35))",
    },
<<<<<<< Updated upstream
    plant: { display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'rotateZ(45deg) rotateX(-55deg) translateY(-15px)', pointerEvents: 'none' },
    
    // NEW SHOP STYLES 👇
    shopCard: { 
      background: '#ffffff', padding: '15px', borderRadius: '16px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', gap: '12px', minWidth: '110px', border: '1px solid #f0f0f0',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    plantPreviewBox: {
      background: '#f8f9fa', width: '70px', height: '70px', borderRadius: '12px',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)' // Makes it look like a little display case
    },
    btn: { 
      background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: 'white', 
      border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', 
      fontWeight: 'bold', fontSize: '14px', width: '100%',
      boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)', transition: 'transform 0.1s'
    },
    btnDisabled: { 
      background: '#e0e0e0', color: '#9e9e9e', border: 'none', padding: '10px 20px', 
      borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', width: '100%', cursor: 'not-allowed'
    }
=======
>>>>>>> Stashed changes
  };

  return (
    <div style={styles.container}>
      <div className="tape tl" />
      <div className="space" style={{ marginTop: 4 }}>
        <div>
          <div className="sectionTitle" style={{ marginTop: 0 }}>Garden</div>
          <div className="meta">Collect plants and decorate your garden.</div>
          <div className="smallNote">{displayRows}x{displayCols} (max 8x8)</div>
        </div>
        <div className="badge ok" style={{ fontWeight: 900 }}>{coins} Coins</div>
      </div>

      <div style={styles.gridWrapper}>
        <div style={styles.grid}>
<<<<<<< Updated upstream
          {garden.map((plant, index) => (
            <div key={index} style={styles.dirtPatch} onClick={() => handlePlanting(index)}>
              {plant && <div style={styles.plant}>{PLANT_ART[plant] || plant}</div>}
            </div>
=======
          {normalizedGarden.map((plantId, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedTile(idx);
                if (selectedPlant && editable) plantAt(idx);
              }}
              disabled={busy}
              style={{
                ...styles.dirtPatch,
                cursor: editable ? "pointer" : "default",
                opacity: !editable && !plantId ? 0.8 : 1,
                outline: selectedTile === idx ? "3px solid #bfe9d3" : "none",
              }}
              title={editable ? "Select tile / plant selected item" : ""}
            >
              {plantId ? <span style={styles.plant}>{PLANTS[plantId]?.emoji || "🪴"}</span> : null}
            </button>
>>>>>>> Stashed changes
          ))}
        </div>
      </div>

<<<<<<< Updated upstream
      {/* INVENTORY */}
      <h3>🎒 Your Inventory</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        {inventory.map((plant, i) => (
          <div 
            key={i} 
            style={{ fontSize: '30px', padding: '10px', border: selectedPlant === plant ? '3px solid #4CAF50' : '3px solid #eee', borderRadius: '15px', cursor: 'pointer', background: selectedPlant === plant ? '#C8E6C9' : '#fff', transition: 'transform 0.1s', transform: selectedPlant === plant ? 'scale(1.1)' : 'scale(1)' }} 
            onClick={() => setSelectedPlant(plant === selectedPlant ? null : plant)}
          >
            {PLANT_ART[plant] || plant}
=======
      {ownedPlants.length > 0 && (
        <>
          <div className="sectionTitle">Inventory</div>
          <div className="row">
            {ownedPlants.map(plant => (
              <button
                key={plant.id}
                type="button"
                className={`btn ${selectedPlant === plant.id ? "primary" : ""}`}
                onClick={() => setSelectedPlant(selectedPlant === plant.id ? null : plant.id)}
                disabled={!editable}
              >
                {plant.emoji} {plant.name}
              </button>
            ))}
>>>>>>> Stashed changes
          </div>
        </>
      )}

<<<<<<< Updated upstream
      {/* SHOP */}
      <h3>🛒 Eco Shop</h3>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        
        {/* Buy Row Button */}
        <div style={styles.shopCard}>
          <span style={{fontWeight: 'bold'}}>Expand Land</span>
          <button style={styles.btn} onClick={handleBuyRow}>Buy Row (50 🪙)</button>
        </div>
        
        {/* Deco Items to Buy */}
        {[
          { item: '🍄', price: 20 },
          { item: '🌵', price: 30 },
          { item: '🌲', price: 50 },
          { item: '🌸', price: 100 }
        ].map((shopItem) => (
          <div key={shopItem.item} style={styles.shopCard}>
            <span style={{ fontSize: '28px' }}>{PLANT_ART[shopItem.item] || shopItem.item}</span>
            <button 
              style={{...styles.btn, background: inventory.includes(shopItem.item) ? '#ccc' : '#4CAF50', cursor: inventory.includes(shopItem.item) ? 'not-allowed' : 'pointer'}} 
              onClick={() => handleBuyDeco(shopItem.item, shopItem.price)}
              disabled={inventory.includes(shopItem.item)}
=======
      {editable && (
        <>
          <div className="sectionTitle">Tile Actions</div>
          <div className="row">
            <button
              type="button"
              className="btn"
              onClick={() => selectedTile != null && deleteAt(selectedTile)}
              disabled={busy || selectedTile == null || !normalizedGarden[selectedTile]}
>>>>>>> Stashed changes
            >
              Delete Plant
            </button>
            {selectedTile != null && <span className="smallNote">Selected tile: {selectedTile + 1}</span>}
          </div>

          <div className="sectionTitle">Shop</div>
          <div className="row">
            <button type="button" className="btn" onClick={buyRow} disabled={busy || displayRows >= MAX_GARDEN_SIZE}>
              Buy Row (50)
            </button>
            <button type="button" className="btn" onClick={buyColumn} disabled={busy || displayCols >= MAX_GARDEN_SIZE}>
              Buy Column (50)
            </button>
            {shopPlants.map(plant => (
              <button
                key={plant.id}
                type="button"
                className="btn"
                onClick={() => buyPlant(plant.id)}
                disabled={busy || normalizedInventory.includes(plant.id)}
              >
                {plant.emoji} {normalizedInventory.includes(plant.id) ? "Owned" : `${plant.name} (${plant.cost})`}
              </button>
            ))}
          </div>
          <div className="smallNote">Coins come from lifetime XP and decrease when you buy items.</div>
        </>
      )}

      {msg && (
        <div className="smallNote" style={{ color: msg.includes("Added") || msg.includes("purchased") || msg.includes("cleared") ? "#2d6a4f" : "#c0392b" }}>
          {msg}
        </div>
      )}
    </div>
  );
}
