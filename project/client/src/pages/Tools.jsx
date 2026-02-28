import { useState } from "react";
import { Link } from "react-router-dom";

// ── Carbon Footprint Calculator ───────────────────────────────────────────────

function CarbonCalc() {
  const [flights,  setFlights]  = useState("0");
  const [diet,     setDiet]     = useState("omnivore");
  const [kwh,      setKwh]      = useState("0");
  const [carMiles, setCarMiles] = useState("0");

  // Preset factors (kg CO2 per unit)
  const DIET_KG_PER_YEAR = { vegan: 1500, vegetarian: 1700, omnivore: 2500, heavy_meat: 3300 };
  const FLIGHT_KG        = 255;   // avg domestic round-trip
  const KWH_KG           = 0.386; // US avg grid intensity
  const CAR_KG_PER_MILE  = 0.404;

  const flightKg  = (Number(flights)  || 0) * FLIGHT_KG;
  const dietKg    = (DIET_KG_PER_YEAR[diet] || 2500) / 12; // monthly
  const energyKg  = (Number(kwh)      || 0) * KWH_KG;
  const carKg     = (Number(carMiles) || 0) * CAR_KG_PER_MILE;
  const totalKg   = flightKg + dietKg + energyKg + carKg;
  const totalTons = (totalKg / 1000).toFixed(2);

  const avgMonthlyTons = 0.833; // US avg ~10 tons/year
  const comparison = totalKg / 1000 < avgMonthlyTons
    ? `✅ Below US average (${avgMonthlyTons} t/mo)`
    : `⚠️ Above US average (${avgMonthlyTons} t/mo)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div className="sectionTitle">✈️ Flights this month (round trips)</div>
        <input className="input" type="number" min="0" step="1" value={flights}
          onChange={e => setFlights(e.target.value)} />
      </div>
      <div>
        <div className="sectionTitle">🥗 Diet type</div>
        <div className="row">
          {[["vegan","Vegan"],["vegetarian","Vegetarian"],["omnivore","Omnivore"],["heavy_meat","Heavy Meat"]].map(([v,l]) => (
            <button key={v} className={`btn ${diet === v ? "primary" : ""}`} onClick={() => setDiet(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="sectionTitle">⚡ Home electricity (kWh this month)</div>
        <input className="input" type="number" min="0" step="10" value={kwh}
          onChange={e => setKwh(e.target.value)} />
      </div>
      <div>
        <div className="sectionTitle">🚗 Miles driven this month</div>
        <input className="input" type="number" min="0" step="10" value={carMiles}
          onChange={e => setCarMiles(e.target.value)} />
      </div>
      <div className="bigStat">
        <div className="headline">{totalTons} tonnes CO₂ / month</div>
        <div className="hint">{comparison}</div>
        <div className="divider" />
        <div className="kv"><span className="k">✈️ Flights</span><span className="v">{(flightKg/1000).toFixed(3)} t</span></div>
        <div className="kv"><span className="k">🥗 Diet</span><span className="v">{(dietKg/1000).toFixed(3)} t</span></div>
        <div className="kv"><span className="k">⚡ Energy</span><span className="v">{(energyKg/1000).toFixed(3)} t</span></div>
        <div className="kv"><span className="k">🚗 Driving</span><span className="v">{(carKg/1000).toFixed(3)} t</span></div>
      </div>
    </div>
  );
}

// ── Water Usage Estimator ─────────────────────────────────────────────────────

function WaterCalc() {
  const [showers,   setShowers]   = useState("1");
  const [showerMin, setShowerMin] = useState("8");
  const [laundry,   setLaundry]   = useState("3");
  const [dishes,    setDishes]    = useState("1");
  const [lawn,      setLawn]      = useState("0");

  // Gallons per unit
  const SHOWER_GPM  = 2.1;  // avg showerhead
  const LAUNDRY_GAL = 25;   // HE washer
  const DISHES_GAL  = 6;    // efficient dishwasher
  const LAWN_GAL    = 30;   // per 10 min

  const showerGal = (Number(showers) || 0) * (Number(showerMin) || 0) * SHOWER_GPM;
  const laundryGal = (Number(laundry) || 0) * LAUNDRY_GAL;
  const dishesGal  = (Number(dishes)  || 0) * DISHES_GAL;
  const lawnGal    = (Number(lawn)    || 0) * LAWN_GAL;
  const totalGal   = showerGal + laundryGal + dishesGal + lawnGal;

  const avgDaily = 80; // US avg gallons/person/day
  const status = totalGal < avgDaily
    ? { label: "✅ Below average", color: "#2d6a4f" }
    : { label: "⚠️ Above average", color: "#c0392b" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="grid two" style={{ gap: 10 }}>
        <div>
          <div className="sectionTitle">🚿 Showers per day</div>
          <input className="input" type="number" min="0" step="1" value={showers}
            onChange={e => setShowers(e.target.value)} />
        </div>
        <div>
          <div className="sectionTitle">⏱️ Minutes per shower</div>
          <input className="input" type="number" min="0" step="1" value={showerMin}
            onChange={e => setShowerMin(e.target.value)} />
        </div>
        <div>
          <div className="sectionTitle">👕 Laundry loads / week</div>
          <input className="input" type="number" min="0" step="1" value={laundry}
            onChange={e => setLaundry(e.target.value)} />
        </div>
        <div>
          <div className="sectionTitle">🍽️ Dishwasher runs / day</div>
          <input className="input" type="number" min="0" step="1" value={dishes}
            onChange={e => setDishes(e.target.value)} />
        </div>
        <div>
          <div className="sectionTitle">🌿 Lawn watering (10-min sessions/day)</div>
          <input className="input" type="number" min="0" step="1" value={lawn}
            onChange={e => setLawn(e.target.value)} />
        </div>
      </div>
      <div className="bigStat">
        <div className="headline">{totalGal.toFixed(0)} gallons / day</div>
        <div className="hint" style={{ color: status.color, fontWeight: 800 }}>{status.label} (US avg: {avgDaily} gal/day)</div>
        <div className="divider" />
        <div className="kv"><span className="k">🚿 Showers</span><span className="v">{showerGal.toFixed(0)} gal</span></div>
        <div className="kv"><span className="k">👕 Laundry</span><span className="v">{(laundryGal/7).toFixed(0)} gal/day</span></div>
        <div className="kv"><span className="k">🍽️ Dishes</span><span className="v">{dishesGal.toFixed(0)} gal</span></div>
        <div className="kv"><span className="k">🌿 Lawn</span><span className="v">{lawnGal.toFixed(0)} gal</span></div>
      </div>
    </div>
  );
}

// ── Home Energy Audit ─────────────────────────────────────────────────────────

function EnergyAudit() {
  const APPLIANCES = [
    { id: "fridge",   label: "🧊 Refrigerator",      watts: 150,  hoursPerDay: 24 },
    { id: "washer",   label: "👕 Washing Machine",    watts: 500,  hoursPerDay: 1  },
    { id: "dryer",    label: "🌀 Clothes Dryer",      watts: 5000, hoursPerDay: 1  },
    { id: "dishwash", label: "🍽️ Dishwasher",         watts: 1800, hoursPerDay: 1  },
    { id: "ac",       label: "❄️ Air Conditioner",    watts: 3500, hoursPerDay: 8  },
    { id: "heater",   label: "🔥 Space Heater",       watts: 1500, hoursPerDay: 4  },
    { id: "tv",       label: "📺 TV",                 watts: 100,  hoursPerDay: 4  },
    { id: "pc",       label: "💻 Desktop Computer",   watts: 200,  hoursPerDay: 6  },
    { id: "lights",   label: "💡 LED Lights (10 bulbs)", watts: 100, hoursPerDay: 6 },
    { id: "ev_charge",label: "⚡ EV Charger (L2)",    watts: 7200, hoursPerDay: 2  },
  ];

  const [counts, setCounts] = useState(
    Object.fromEntries(APPLIANCES.map(a => [a.id, "1"]))
  );

  const totalKwh = APPLIANCES.reduce((sum, a) => {
    const count = Number(counts[a.id]) || 0;
    return sum + (count * a.watts * a.hoursPerDay) / 1000;
  }, 0);

  const monthlyKwh  = totalKwh * 30;
  const monthlyCost = monthlyKwh * 0.16; // US avg $0.16/kWh
  const monthlyCO2  = monthlyKwh * 0.386;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="smallNote">Enter how many of each appliance you have. Hours/day are preset averages.</div>
      {APPLIANCES.map(a => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 800 }}>{a.label}</span>
          <span style={{ fontSize: 12, color: "rgba(122,90,58,0.6)", width: 80, textAlign: "right" }}>
            {a.watts}W × {a.hoursPerDay}h
          </span>
          <input className="input" type="number" min="0" max="20" step="1"
            value={counts[a.id]}
            onChange={e => setCounts(c => ({ ...c, [a.id]: e.target.value }))}
            style={{ width: 70 }} />
        </div>
      ))}
      <div className="bigStat">
        <div className="headline">{monthlyKwh.toFixed(0)} kWh / month</div>
        <div className="hint">Estimated based on preset usage hours</div>
        <div className="divider" />
        <div className="kv"><span className="k">💰 Est. monthly cost</span><span className="v">${monthlyCost.toFixed(2)}</span></div>
        <div className="kv"><span className="k">🌍 CO₂ emissions</span><span className="v">{(monthlyCO2/1000).toFixed(2)} tonnes/mo</span></div>
        <div className="kv"><span className="k">US avg household</span><span className="v">877 kWh/mo</span></div>
      </div>
    </div>
  );
}

// ── Recycling Guide ───────────────────────────────────────────────────────────

const RECYCLING_ITEMS = [
  { emoji: "✅", items: ["Cardboard boxes", "Newspaper & magazines", "Office paper", "Plastic bottles (#1 PET, #2 HDPE)", "Aluminum cans", "Steel/tin cans", "Glass bottles & jars", "Cartons (milk, juice)"] , label: "Generally Recyclable" },
  { emoji: "❌", items: ["Plastic bags & film", "Styrofoam / polystyrene", "Greasy pizza boxes", "Broken glass", "Ceramics & pottery", "Diapers", "Hoses & cords", "Shredded paper (bag it)"], label: "Usually NOT Recyclable" },
  { emoji: "♻️", items: ["Electronics → e-waste drop-off", "Batteries → retailer take-back", "Motor oil → auto shop", "Paint → hazardous waste facility", "Medications → pharmacy take-back", "Textiles → donation or textile recycler"], label: "Special Disposal Required" },
];

function RecyclingGuide() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {RECYCLING_ITEMS.map(section => (
        <div key={section.label}>
          <div className="sectionTitle">{section.emoji} {section.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {section.items.map(item => (
              <div key={item} style={{ fontSize: 14, padding: "4px 0", borderBottom: "1px dotted rgba(122,90,58,0.12)" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="smallNote">
        ⚠️ Rules vary by municipality. Always check your local waste management guidelines.
      </div>
    </div>
  );
}

// ── Tools Hub ─────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: "markets",
    icon: "🛒",
    title: "Buy Local Produce",
    desc: "Find nearby farmers markets to buy fresh, local, seasonal food and reduce food-miles.",
    rot: "r1",
    isLink: true,
    linkTo: "/",
    linkLabel: "Browse Markets →",
  },
  {
    id: "ecoroute",
    icon: "🗺️",
    title: "EcoRoute",
    desc: "Calculate the CO₂ impact of your journey to a farmers market and compare transport modes.",
    rot: "r2",
    isLink: true,
    linkTo: "/",
    linkLabel: "Go to Markets →",
  },
  {
    id: "carbon",
    icon: "🌍",
    title: "Carbon Footprint Calculator",
    desc: "Estimate your monthly CO₂ footprint from flights, diet, energy, and driving.",
    rot: "r3",
    Component: CarbonCalc,
  },
  {
    id: "water",
    icon: "💧",
    title: "Water Usage Estimator",
    desc: "See how many gallons you use daily and compare to the US average.",
    rot: "r4",
    Component: WaterCalc,
  },
  {
    id: "energy",
    icon: "⚡",
    title: "Home Energy Audit",
    desc: "Estimate your monthly electricity usage and cost based on your appliances.",
    rot: "r1",
    Component: EnergyAudit,
  },
  {
    id: "recycling",
    icon: "♻️",
    title: "Recycling Guide",
    desc: "Quick reference for what can and can't go in the recycling bin.",
    rot: "r2",
    Component: RecyclingGuide,
  },
];

export default function Tools() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div>
            <h1 className="h1">Sustainability Tools</h1>
            <p className="sub">Resources and calculators to help you live more sustainably.</p>
          </div>
        </div>
      </div>

      <div className="grid">
        {TOOLS.map(tool => {
          const isOpen = expanded === tool.id;
          return (
            <div key={tool.id} className={`card ${tool.rot}`}>
              <div className="tape tl" />

              <div className="space">
                <div>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{tool.icon}</div>
                  <h2 className="title">{tool.title}</h2>
                  <p className="meta">{tool.desc}</p>
                </div>
              </div>

              <div className="divider" />

              {tool.isLink ? (
                <Link to={tool.linkTo} className="btn primary">{tool.linkLabel}</Link>
              ) : (
                <>
                  <button
                    className={`btn ${isOpen ? "" : "primary"}`}
                    onClick={() => setExpanded(isOpen ? null : tool.id)}
                  >
                    {isOpen ? "▲ Collapse" : "▼ Open Tool"}
                  </button>

                  {isOpen && (
                    <div style={{ marginTop: 16 }}>
                      <tool.Component />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
