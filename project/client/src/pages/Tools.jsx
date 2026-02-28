import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { isOpenNow } from "../utils/isOpenNow.js";

function CarbonCalc() {
  const [miles, setMiles] = useState("50");
  const [kwh, setKwh] = useState("400");
  const carKg = (Number(miles) || 0) * 0.404;
  const energyKg = (Number(kwh) || 0) * 0.386;
  return (
    <div>
      <div className="sectionTitle">Carbon Quick Check</div>
      <div className="row">
        <input className="input" value={miles} onChange={(e) => setMiles(e.target.value)} placeholder="Monthly car miles" />
        <input className="input" value={kwh} onChange={(e) => setKwh(e.target.value)} placeholder="Monthly kWh" />
      </div>
      <div className="smallNote">Driving: {carKg.toFixed(2)} kg CO2 | Electricity: {energyKg.toFixed(2)} kg CO2</div>
    </div>
  );
}

export default function Tools() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMarkets();
        setMarkets(data || []);
      } catch (e) {
        setErr(e.message || "Failed to load markets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    return [...markets].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [markets]);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Resources</h1>
            <p className="sub">Markets, EcoRoute, and sustainability tools.</p>
          </div>
        </div>
      </div>

      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="sectionTitle" style={{ marginTop: 0 }}>EcoRoute</div>
        <div className="meta">Open the map, drag start/end points, and compare CO2 savings vs car.</div>
        <div style={{ marginTop: 10 }}>
          <Link className="btn primary" to="/ecoroute">Open EcoRoute</Link>
        </div>
      </div>

      <div className="sectionTitle">Markets</div>
      {loading && <div className="card">Loading markets...</div>}
      {err && <div className="card" style={{ color: "#c0392b" }}>{err}</div>}
      {!loading && !err && (
        <div className="grid">
          {sorted.map((m, idx) => (
            <div key={m.id} className={`card r${(idx % 4) + 1}`}>
              <div className="space">
                <div>
                  <h2 className="title">{m.name}</h2>
                  <div className="meta">
                    <div><b>Address:</b> {m.address}</div>
                    <div><b>Hours:</b> {m.hours?.open} - {m.hours?.close}</div>
                  </div>
                </div>
                <span className={`badge ${isOpenNow(m) ? "ok" : "bad"}`}>{isOpenNow(m) ? "OPEN" : "CLOSED"}</span>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <Link className="btn" to={`/market/${m.id}`}>Details</Link>
                <Link className="btn primary" to={`/ecoroute/${m.id}`}>EcoRoute</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card r2" style={{ marginTop: 16 }}>
        <CarbonCalc />
      </div>
    </div>
  );
}
