import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiLogActivity, apiGetMyActivities } from "../utils/api.js";
import { calcXP, ACTIVITY_LABELS, ACTIVITY_DESCRIPTIONS, formatDate, getXPTier } from "../utils/xp.js";

// ── Activity Form Components ──────────────────────────────────────────────────

function FarmersMarketForm({ onSubmit, busy }) {
  return (
    <div>
      <div className="bigStat">
        <div className="headline">+50 XP</div>
        <div className="hint">Flat reward for visiting a local farmers market.</div>
      </div>
      <div style={{ height: 12 }} />
      <button className="btn primary" onClick={() => onSubmit({})} disabled={busy}
        style={{ width: "100%", justifyContent: "center" }}>
        {busy ? "Logging…" : "Log Visit (+50 XP)"}
      </button>
    </div>
  );
}

function CarpoolForm({ onSubmit, busy }) {
  const [distance, setDistance] = useState("");
  const [people,   setPeople]   = useState("2");
  const details = { distance, people };
  const { xp, breakdown } = calcXP("carpool", details);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div className="sectionTitle">Distance (miles)</div>
        <input className="input" type="number" min="0" step="0.1" placeholder="e.g. 12.5"
          value={distance} onChange={e => setDistance(e.target.value)} />
      </div>
      <div>
        <div className="sectionTitle">Number of people in car (including you)</div>
        <input className="input" type="number" min="2" max="20" step="1" placeholder="e.g. 3"
          value={people} onChange={e => setPeople(e.target.value)} />
      </div>
      <div className="bigStat">
        <div className="headline">+{xp} XP</div>
        <div className="hint">{breakdown}</div>
      </div>
      <button className="btn primary" onClick={() => onSubmit(details)} disabled={busy || xp <= 0}
        style={{ width: "100%", justifyContent: "center" }}>
        {busy ? "Logging…" : `Log Carpool (+${xp} XP)`}
      </button>
    </div>
  );
}

function RecyclingForm({ onSubmit, busy }) {
  const [plastic, setPlastic] = useState("");
  const [paper,   setPaper]   = useState("");
  const [metal,   setMetal]   = useState("");
  const details = { plastic_lbs: plastic, paper_lbs: paper, metal_lbs: metal };
  const { xp, breakdown } = calcXP("recycling", details);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="grid two" style={{ gap: 10 }}>
        <div>
          <div className="sectionTitle">🧴 Plastic (lbs)</div>
          <input className="input" type="number" min="0" step="0.1" placeholder="0"
            value={plastic} onChange={e => setPlastic(e.target.value)} />
        </div>
        <div>
          <div className="sectionTitle">📰 Paper (lbs)</div>
          <input className="input" type="number" min="0" step="0.1" placeholder="0"
            value={paper} onChange={e => setPaper(e.target.value)} />
        </div>
        <div>
          <div className="sectionTitle">🥫 Metal (lbs)</div>
          <input className="input" type="number" min="0" step="0.1" placeholder="0"
            value={metal} onChange={e => setMetal(e.target.value)} />
        </div>
      </div>
      <div className="bigStat">
        <div className="headline">+{xp} XP</div>
        <div className="hint">{breakdown}</div>
      </div>
      <button className="btn primary" onClick={() => onSubmit(details)} disabled={busy || xp <= 0}
        style={{ width: "100%", justifyContent: "center" }}>
        {busy ? "Logging…" : `Log Recycling (+${xp} XP)`}
      </button>
    </div>
  );
}

function UberEVForm({ onSubmit, busy }) {
  const [distance, setDistance] = useState("");
  const details = { distance };
  const { xp, breakdown } = calcXP("uber_ev", details);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div className="sectionTitle">Distance of ride (miles)</div>
        <input className="input" type="number" min="0" step="0.1" placeholder="e.g. 8.2"
          value={distance} onChange={e => setDistance(e.target.value)} />
      </div>
      <div className="bigStat">
        <div className="headline">+{xp} XP</div>
        <div className="hint">{breakdown}</div>
      </div>
      <button className="btn primary" onClick={() => onSubmit(details)} disabled={busy || xp <= 0}
        style={{ width: "100%", justifyContent: "center" }}>
        {busy ? "Logging…" : `Log EV Ride (+${xp} XP)`}
      </button>
    </div>
  );
}

function EVMilesForm({ onSubmit, busy }) {
  const [distance,    setDistance]    = useState("");
  const [vehicleType, setVehicleType] = useState("ev");
  const details = { distance, vehicle_type: vehicleType };
  const { xp, breakdown } = calcXP("ev_miles", details);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div className="sectionTitle">Miles driven</div>
        <input className="input" type="number" min="0" step="0.1" placeholder="e.g. 25"
          value={distance} onChange={e => setDistance(e.target.value)} />
      </div>
      <div>
        <div className="sectionTitle">Vehicle type</div>
        <div className="row">
          <button className={`btn ${vehicleType === "ev" ? "primary" : ""}`}
            onClick={() => setVehicleType("ev")}>⚡ Full EV</button>
          <button className={`btn ${vehicleType === "hybrid" ? "primary" : ""}`}
            onClick={() => setVehicleType("hybrid")}>🔋 Hybrid</button>
        </div>
      </div>
      <div className="bigStat">
        <div className="headline">+{xp} XP</div>
        <div className="hint">{breakdown}</div>
      </div>
      <button className="btn primary" onClick={() => onSubmit(details)} disabled={busy || xp <= 0}
        style={{ width: "100%", justifyContent: "center" }}>
        {busy ? "Logging…" : `Log Miles (+${xp} XP)`}
      </button>
    </div>
  );
}

const ACTIVITY_FORMS = {
  farmers_market: FarmersMarketForm,
  carpool:        CarpoolForm,
  recycling:      RecyclingForm,
  uber_ev:        UberEVForm,
  ev_miles:       EVMilesForm,
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { dbUser, getToken, refreshDbUser } = useAuth();

  const [activeType,  setActiveType]  = useState(null);
  const [busy,        setBusy]        = useState(false);
  const [toast,       setToast]       = useState(null); // { msg, xp }
  const [activities,  setActivities]  = useState([]);
  const [loadingActs, setLoadingActs] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      setLoadingActs(true);
      const data = await apiGetMyActivities(getToken, 10);
      setActivities(data.activities || []);
    } catch {
      // silently fail
    } finally {
      setLoadingActs(false);
    }
  }, [getToken]);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  async function handleLog(type, details) {
    setBusy(true);
    try {
      const result = await apiLogActivity(type, details, getToken);
      await refreshDbUser();
      await loadActivities();
      setActiveType(null);
      setToast({ msg: ACTIVITY_LABELS[type], xp: result.xp_earned });
      setTimeout(() => setToast(null), 3500);
    } catch (e) {
      alert(e.message || "Failed to log activity");
    } finally {
      setBusy(false);
    }
  }

  const tier = getXPTier(dbUser?.xp || 0);

  return (
    <div className="container">
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 72, right: 18, zIndex: 200,
          background: "var(--mint)", border: "2px solid var(--border)",
          borderRadius: 18, padding: "14px 20px",
          boxShadow: "0 8px 0 rgba(122,90,58,0.14)",
          fontWeight: 900, fontSize: 15,
          animation: "fadeIn .2s ease",
        }}>
          ✅ {toast.msg} logged! <span style={{ color: "#2d6a4f" }}>+{toast.xp} XP</span>
        </div>
      )}

      {/* Header */}
      <div className="topbar">
        <div className="brand">
          <div>
            <h1 className="h1">Dashboard</h1>
            <p className="sub">Log your eco-friendly activities and earn XP.</p>
          </div>
        </div>
      </div>

      {/* XP Summary */}
      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="tape tl" />
        <div className="space">
          <div>
            <div className="sectionTitle" style={{ marginTop: 0 }}>Your XP</div>
            <div style={{ fontSize: 42, fontWeight: 1000, lineHeight: 1 }}>
              {(dbUser?.xp || 0).toLocaleString()}
            </div>
            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: tier.color }}>
              {tier.label}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="sectionTitle" style={{ marginTop: 0 }}>Welcome back</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{dbUser?.username}</div>
            <div style={{
              marginTop: 8,
              background: "#FFD700", color: "#7a5a00",
              padding: "4px 12px", borderRadius: 999,
              fontWeight: 900, fontSize: 14,
              border: "2px solid rgba(122,90,58,0.18)",
              display: "inline-block",
            }}>
              {(dbUser?.coins || 0).toLocaleString()} 🪙
            </div>
          </div>
        </div>

        {/* XP tier progress bar */}
        <div style={{ marginTop: 14 }}>
          <XPProgressBar xp={dbUser?.xp || 0} />
        </div>
      </div>

      {/* Activity selector */}
      <div className="sectionTitle">Log an activity</div>
      <div className="grid" style={{ marginBottom: 16, alignItems: "start" }}>
        {Object.entries(ACTIVITY_LABELS).map(([type, label]) => (
          <div
            key={type}
            className={`card clickable r${(Object.keys(ACTIVITY_LABELS).indexOf(type) % 4) + 1}`}
            onClick={() => setActiveType(activeType === type ? null : type)}
            style={{
              border: activeType === type ? "2px solid var(--brown)" : undefined,
              background: activeType === type ? "var(--mint)" : undefined,
            }}
          >
            <div className="space">
              <div>
                <div className="title">{label}</div>
                <div className="meta" style={{ marginTop: 4 }}>
                  {ACTIVITY_DESCRIPTIONS[type]}
                </div>
              </div>
              <span style={{ fontSize: 20 }}>{activeType === type ? "▲" : "▼"}</span>
            </div>

            {activeType === type && (
              <div onClick={e => e.stopPropagation()} style={{ marginTop: 14 }}>
                <div className="divider" />
                {(() => {
                  const Form = ACTIVITY_FORMS[type];
                  return <Form onSubmit={(details) => handleLog(type, details)} busy={busy} />;
                })()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent activity history */}
      <div className="sectionTitle">Recent activity</div>
      <div className="card r3">
        <div className="tape tl" />
        {loadingActs ? (
          <div className="meta">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="meta">No activities yet. Log your first one above! 🌱</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activities.map((a, i) => (
              <div key={a.id} className="kv" style={{ paddingTop: i === 0 ? 0 : 8 }}>
                <div>
                  <div className="k">{ACTIVITY_LABELS[a.type] || a.type}</div>
                  <div style={{ fontSize: 12, color: "rgba(122,90,58,0.6)", marginTop: 2 }}>
                    {formatDate(a.created_at)}
                  </div>
                </div>
                <div className="v" style={{ color: "#2d6a4f" }}>+{a.xp_earned} XP</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── XP Progress Bar ───────────────────────────────────────────────────────────

const TIERS = [
  { min: 0,    max: 100,  label: "Sprout"        },
  { min: 100,  max: 500,  label: "Seedling"      },
  { min: 500,  max: 1000, label: "Eco Starter"   },
  { min: 1000, max: 2000, label: "Green Advocate" },
  { min: 2000, max: 5000, label: "Eco Champion"  },
  { min: 5000, max: 9999, label: "Forest Guardian" },
];

function XPProgressBar({ xp }) {
  const tier = TIERS.find(t => xp < t.max) || TIERS[TIERS.length - 1];
  const pct  = Math.min(100, Math.round(((xp - tier.min) / (tier.max - tier.min)) * 100));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 4 }}>
        <span style={{ color: "rgba(122,90,58,0.7)" }}>{tier.label}</span>
        <span style={{ color: "rgba(122,90,58,0.7)" }}>{xp} / {tier.max} XP</span>
      </div>
      <div style={{
        height: 10, borderRadius: 999,
        background: "rgba(122,90,58,0.12)",
        border: "1.5px solid var(--border)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--mint), #52b788)",
          borderRadius: 999,
          transition: "width .4s ease",
        }} />
      </div>
    </div>
  );
}
