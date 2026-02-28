import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { isOpenNow } from "../utils/isOpenNow.js";

export default function Resources() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMarkets();
        setMarkets(data);
      } catch (e) {
        setErr(e?.message || "Failed to load markets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    return [...markets].sort((a, b) => {
      const ao = isOpenNow(a) ? 0 : 1;
      const bo = isOpenNow(b) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [markets]);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Resources</h1>
            <p className="sub">Local markets, eco tools, and sustainability resources.</p>
          </div>
        </div>
      </div>

      {/* ── Tools Cards ──────────────────────────────────────────────────── */}
      <div className="sectionTitle">Sustainability Tools</div>
      <div className="grid" style={{ marginBottom: 24 }}>
        <div className="card r1">
          <div className="tape tl" />
          <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
          <h2 className="title">EcoRoute Calculator</h2>
          <p className="meta">
            Calculate the CO₂ impact of your journey and compare car, bike, bus, and walking emissions.
          </p>
          <div className="divider" />
          <Link to="/ecoroute" className="btn primary">Open EcoRoute →</Link>
        </div>

        <div className="card r2">
          <div className="tape tr" />
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛠️</div>
          <h2 className="title">Sustainability Tools</h2>
          <p className="meta">
            Carbon footprint calculator, water usage estimator, home energy audit, and recycling guide.
          </p>
          <div className="divider" />
          <Link to="/tools" className="btn primary">Open Tools →</Link>
        </div>

        <div className="card r3">
          <div className="tape tl" />
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
          <h2 className="title">Dashboard & XP</h2>
          <p className="meta">
            Log eco-friendly activities to earn XP and coins. Track your progress and grow your garden.
          </p>
          <div className="divider" />
          <Link to="/dashboard" className="btn primary">Go to Dashboard →</Link>
        </div>
      </div>

      {/* ── Markets Section ───────────────────────────────────────────────── */}
      <div className="sectionTitle">Local Farmers Markets</div>

      {loading && <div className="card">Loading markets…</div>}
      {err     && <div className="card" style={{ color: "#c0392b" }}>{err}</div>}

      {!loading && !err && (
        <div className="grid">
          {sorted.map((m, idx) => {
            const open = isOpenNow(m);
            const rot  = ["r1","r2","r3","r4"][idx % 4];

            return (
              <div key={m.id} className={`card ${rot}`}>
                <div className="tape tl" />
                <div className="tape tr" />

                <div className="space">
                  <div>
                    <h2 className="title">{m.name}</h2>
                    <div className="meta">
                      <div><b>Address:</b> {m.address}</div>
                      <div><b>Days:</b> {(m.daysOpen || []).join(", ")}</div>
                      <div><b>Hours:</b> {m.hours?.open} – {m.hours?.close}</div>
                    </div>
                  </div>
                  <span className={`badge ${open ? "ok" : "bad"}`}>
                    {open ? "OPEN NOW" : "CLOSED"}
                  </span>
                </div>

                <div className="divider" />

                <div className="row">
                  <Link className="btn" to={`/market/${m.id}`}>
                    Details →
                  </Link>
                  <Link className="btn primary" to={`/ecoroute/${m.id}`}>
                    🗺️ EcoRoute
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
