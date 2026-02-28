import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { computeEmissions } from "../utils/emissions.js";

const MODES = [
  { key: "car",  label: "🚗 Car",  color: "#e74c3c" },
  { key: "bus",  label: "🚌 Bus",  color: "#e67e22" },
  { key: "bike", label: "🚲 Bike", color: "#27ae60" },
  { key: "walk", label: "🚶 Walk", color: "#2980b9" },
];

export default function EcoRoute() {
  const { id } = useParams();  // may be undefined on /ecoroute

  const [markets,   setMarkets]   = useState([]);
  const [market,    setMarket]    = useState(null);
  const [mode,      setMode]      = useState("car");
  const [distance,  setDistance]  = useState("0");
  const [routeInfo, setRouteInfo] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [userPos,   setUserPos]   = useState(null);
  const [showCalc,  setShowCalc]  = useState(false);
  const [loading,   setLoading]   = useState(!!id);
  const [err,       setErr]       = useState("");

  // Load markets
  useEffect(() => {
    fetchMarkets()
      .then(data => {
        setMarkets(data);
        if (id) {
          const found = data.find(m => m.id === id);
          if (!found) setErr("Market not found");
          else setMarket(found);
          setLoading(false);
        }
      })
      .catch(e => {
        setErr(e?.message || "Failed to load markets");
        setLoading(false);
      });
  }, [id]);

  const calc = useMemo(() => computeEmissions(distance, mode), [distance, mode]);

  // All-modes comparison
  const allModes = useMemo(() => {
    return MODES.map(m => {
      const c = computeEmissions(distance, m.key);
      return { ...m, kg: c.chosenKg, savedVsCar: c.savedKg };
    });
  }, [distance]);

  function getUserLocation() {
    setLocStatus("getting");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocStatus("ready");
      },
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function getRouteDistance(profile = "driving") {
    if (!userPos) return;
    const dest = market?.coordinates;
    if (!dest) return;

    const [endLat, endLon] = dest; // markets.json stores [lat, lon]
    const url = `/api/route?startLat=${userPos.lat}&startLon=${userPos.lon}&endLat=${endLat}&endLon=${endLon}&profile=${profile}`;

    try {
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Route failed");
      setRouteInfo(data);
      const miles = data.distanceMeters / 1609.34;
      setDistance(miles.toFixed(2));
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (err && id) return <div className="container"><div className="card" style={{ color: "#c0392b" }}>{err}</div></div>;

  const maxKg = Math.max(...allModes.map(m => m.kg), 0.01);

  return (
    <div className="container">
      {market && (
        <Link to={`/market/${market.id}`} className="btn ghost">← Back to {market.name}</Link>
      )}
      {!market && (
        <Link to="/resources" className="btn ghost">← Resources</Link>
      )}

      <div style={{ height: 12 }} />

      <div className="card r1">
        <div className="tape tl" />
        <div className="tape tr" />

        <div className="space">
          <div>
            <h2 className="h1" style={{ fontSize: 28, margin: 0 }}>🗺️ EcoRoute</h2>
            <p className="sub" style={{ marginTop: 8 }}>
              {market
                ? <>Destination: <b>{market.name}</b></>
                : "Calculate CO₂ for any journey"}
            </p>
          </div>
          <span className="badge">CO₂ Calculator</span>
        </div>

        {/* Market selector (standalone mode) */}
        {!market && markets.length > 0 && (
          <>
            <div className="sectionTitle">Select destination market</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {markets.map(m => (
                <button
                  key={m.id}
                  className={`btn ${market?.id === m.id ? "primary" : ""}`}
                  style={{ fontSize: 12 }}
                  onClick={() => setMarket(m)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Location */}
        <div className="sectionTitle">Your location</div>
        <div className="row">
          <button className="btn primary" onClick={getUserLocation}>
            📍 Use my location
          </button>

          {userPos && market && (
            <>
              <button className="btn" onClick={() => getRouteDistance("driving")}>
                🧭 Drive route
              </button>
              <button className="btn" onClick={() => getRouteDistance("cycling")}>
                🚲 Bike route
              </button>
              <button className="btn" onClick={() => getRouteDistance("walking")}>
                🚶 Walk route
              </button>
            </>
          )}
        </div>

        {locStatus === "getting" && <div className="smallNote">Requesting location…</div>}
        {locStatus === "error"   && <div className="smallNote" style={{ color: "#c0392b" }}>Location failed. Allow permission and try again.</div>}
        {userPos && (
          <div className="smallNote">
            📍 {userPos.lat.toFixed(5)}, {userPos.lon.toFixed(5)}
          </div>
        )}
        {routeInfo && (
          <div className="smallNote">
            Route: <b>{(routeInfo.distanceMeters / 1000).toFixed(2)} km</b> •{" "}
            <b>{(routeInfo.durationSeconds / 60).toFixed(0)} min</b>
          </div>
        )}

        {/* Manual distance */}
        <div className="sectionTitle">Distance (miles)</div>
        <input
          className="input"
          type="number"
          min="0"
          step="0.1"
          value={distance}
          onChange={e => setDistance(e.target.value)}
          placeholder="Enter distance in miles…"
          style={{ maxWidth: 220 }}
        />

        {/* Mode selector */}
        <div className="sectionTitle">Your transport mode</div>
        <div className="row">
          {MODES.map(m => (
            <button
              key={m.key}
              className={`btn ${mode === m.key ? "primary" : ""}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Main result */}
        <div className="bigStat" style={{ marginTop: 16 }}>
          <div className="headline">
            {calc.savedKg >= 0 ? "You save " : "You add "}
            <span style={{ fontWeight: 1000, color: calc.savedKg >= 0 ? "#2d6a4f" : "#c0392b" }}>
              {Math.abs(calc.savedKg).toFixed(2)} kg CO₂
            </span>
            {" "}vs driving
          </div>
          <div className="hint">
            Car: <b>{calc.carKg.toFixed(2)} kg</b> · Your mode ({mode}): <b>{calc.chosenKg.toFixed(2)} kg</b>
          </div>
        </div>

        {/* All-modes comparison */}
        <div className="sectionTitle">All transport modes comparison</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allModes.map(m => {
            const barPct = maxKg > 0 ? (m.kg / maxKg) * 100 : 0;
            const isCurrent = m.key === mode;
            return (
              <div
                key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: isCurrent ? "2px solid var(--brown)" : "2px solid var(--border)",
                  background: isCurrent ? "var(--mint)" : "var(--paper2)",
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 14 }}>{m.label}</span>
                  <span style={{ fontWeight: 1000, fontSize: 14, color: m.color }}>
                    {m.kg.toFixed(2)} kg CO₂
                  </span>
                </div>
                {/* Bar */}
                <div style={{
                  height: 8, borderRadius: 999,
                  background: "rgba(122,90,58,0.10)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${barPct}%`,
                    background: m.color,
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                {m.key !== "car" && (
                  <div style={{ fontSize: 11, color: "rgba(122,90,58,0.6)", marginTop: 4, fontWeight: 800 }}>
                    {m.savedVsCar >= 0
                      ? `Saves ${m.savedVsCar.toFixed(2)} kg vs car`
                      : `+${Math.abs(m.savedVsCar).toFixed(2)} kg vs car`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => setShowCalc(s => !s)}>
            {showCalc ? "Hide details" : "Show calculation"}
          </button>
          {userPos && market && (
            <a
              className="btn"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lon}&destination=${market.coordinates[0]},${market.coordinates[1]}&travelmode=driving`}
            >
              🗺️ Google Maps
            </a>
          )}
        </div>

        {showCalc && (
          <div className="bigStat" style={{ marginTop: 12 }}>
            <div className="headline" style={{ fontSize: 14 }}>Calculation details</div>
            <div className="hint">CO₂(mode) = distance_miles × factor_kg_per_mile</div>
            <div className="divider" />
            <div className="sectionTitle">Factors (kg / mile)</div>
            <pre className="code">{JSON.stringify(calc.factors, null, 2)}</pre>
            <div className="sectionTitle">Values</div>
            <pre className="code">{JSON.stringify({
              distanceMiles: calc.distanceMiles,
              mode: calc.mode,
              carKg: calc.carKg,
              chosenKg: calc.chosenKg,
              savedKg: calc.savedKg,
            }, null, 2)}</pre>
          </div>
        )}

        <div className="smallNote">
          Methodology: OSRM routing distance × public average emissions factors.
        </div>
      </div>
    </div>
  );
}
