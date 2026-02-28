import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase'; // ✅ Fixed path to match your screenshot!
import { PLANT_ART } from './PlantGraphics'; // Adjust path if you saved it in assets!

const Garden = () => {
  // Database & User State
  const [user, setUser] = useState(null);
  const [garden, setGarden] = useState(Array(9).fill(null));
  const [inventory, setInventory] = useState(['🌱', '🌻']);
  const [coins, setCoins] = useState(0);
  
  // UI State
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. AUTO-DETECT USER & FETCH FIREBASE DATA
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth Status:", currentUser ? "Logged In" : "Not Logged In");
      setUser(currentUser);
      
      if (currentUser?.email) {
        try {
          const userRef = doc(db, "users", currentUser.email);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setGarden(data.garden || Array(9).fill(null));
            setInventory(data.inventory || ['🌱', '🌻']);
            setCoins(data.coins !== undefined ? data.coins : 0);
          } else {
            // First time opening the garden! Give them the starter pack.
            await setDoc(userRef, {
              email: currentUser.email,
              garden: Array(9).fill(null),
              inventory: ['🌱', '🌻'],
              coins: 100 
            });
            setCoins(100);
          }
        } catch (error) {
          console.error("🔥 FIREBASE ERROR:", error.message);
        }
      }
      // This will now ALWAYS run, even if there is an error
      setLoading(false); 
    });

    return () => unsubscribe(); 
  }, []);

  // 2. HANDLE PLANTING (Saves instantly to Firebase)
  const handlePlanting = async (index) => {
    if (!selectedPlant || !user?.email) return;
    
    const newGarden = [...garden];
    newGarden[index] = selectedPlant;
    setGarden(newGarden);

    const userRef = doc(db, "users", user.email);
    await updateDoc(userRef, { garden: newGarden });
  };

  // 3. BUY A ROW (Expands Grid)
  const handleBuyRow = async () => {
    if (!user?.email) return alert("Please log in to use the shop!");
    const ROW_COST = 50;

    if (coins < ROW_COST) return alert("Not enough coins! Do some eco-quests!");

    const newCoins = coins - ROW_COST;
    const newGarden = [...garden, null, null, null]; // Add 3 new dirt patches

    setCoins(newCoins);
    setGarden(newGarden);

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
    },
    dirtPatch: { 
      width: '80px', height: '80px', background: '#795548', borderRadius: '10px', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', 
      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5), -4px 4px 0 #5D4037', transformStyle: 'preserve-3d'
    },
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
  };

  return (
    <div style={styles.container}>
      {/* HEADER & COINS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🪴 Your Iso-Garden</h2>
        <div style={{ background: '#FFD700', color: '#B8860B', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          {coins} 🪙
        </div>
      </div>

      <p style={{color: '#666', marginTop: '10px'}}>
        {selectedPlant ? `Click the dirt to plant ${selectedPlant}!` : "Select a plant to begin."}
      </p>

      {/* 3D GARDEN BOARD */}
      <div style={styles.gridWrapper}>
        <div style={styles.grid}>
          {garden.map((plant, index) => (
            <div key={index} style={styles.dirtPatch} onClick={() => handlePlanting(index)}>
              {plant && <div style={styles.plant}>{PLANT_ART[plant] || plant}</div>}
            </div>
          ))}
        </div>
      </div>

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
          </div>
        ))}
      </div>

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
            >
              {inventory.includes(shopItem.item) ? 'Owned' : `Buy (${shopItem.price} 🪙)`}
            </button>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Garden;