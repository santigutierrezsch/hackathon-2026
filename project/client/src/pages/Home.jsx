import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { isOpenNow } from "../utils/isOpenNow.js";

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expandedId, setExpandedId] = useState(null);

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
            <h1 className="h1">EcoMarket</h1>
            <p className="sub">
              Find markets, see hours, and compare CO₂ based on how you get there.
            </p>
          </div>
        </div>
      </div>

      {loading && <div className="card">Loading markets…</div>}
      {err && <div className="card">{err}</div>}

      {!loading && !err && (
        <div className="grid">
          {sorted.map((m, idx) => {
            const open = isOpenNow(m);
            const rot = ["r1", "r2", "r3", "r4"][idx % 4];
            const expanded = expandedId === m.id;

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

                {!expanded ? (
                  <div className="row">
                    <button
                      className="btn primary"
                      onClick={() => setExpandedId(m.id)}
                    >
                      View
                    </button>

                    <Link className="btn" to={`/route/${m.id}`}>
                      EcoRoute →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="sectionTitle">Quick info</div>

                    <div className="bigStat">
                      <div className="headline">Eco impact preview 🌱</div>
                      <div className="hint">
                        Tap EcoRoute to use your real location and compare CO₂.
                      </div>
                    </div>

                    <div className="row">
                      <button
                        className="btn"
                        onClick={() => setExpandedId(null)}
                      >
                        Collapse
                      </button>

                      <Link className="btn primary" to={`/route/${m.id}`}>
                        Calculate EcoRoute →
                      </Link>

                      <Link className="btn" to={`/market/${m.id}`}>
                        Details →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}