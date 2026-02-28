import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { isOpenNow } from "../utils/isOpenNow.js";

function formatTime12(value) {
  if (!value || typeof value !== "string" || !value.includes(":")) return value || "-";
  const [hRaw, mRaw] = value.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = (h % 12) || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default function Resources() {
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
          <div>
            <h1 className="h1">Markets</h1>
            <p className="sub">Browse local farmers markets and launch EcoRoute instantly.</p>
          </div>
        </div>
      </div>

      {loading && <div className="card">Loading markets...</div>}
      {err && <div className="card" style={{ color: "#c0392b" }}>{err}</div>}

      {!loading && !err && (
        <div className="grid">
          {sorted.map((m, idx) => {
            const open = isOpenNow(m);
            const rot = ["r1", "r2", "r3", "r4"][idx % 4];
            const expanded = expandedId === m.id;

            return (
              <div key={m.id} className={`card ${rot}`}>
                <div className="space">
                  <div>
                    <h2 className="title">{m.name}</h2>
                  </div>
                  <span className={`badge ${open ? "ok" : "bad"}`}>
                    {open ? "OPEN NOW" : "CLOSED"}
                  </span>
                </div>

                <div className="divider" />

                <div className="row">
                  <button
                    className={`btn ${expanded ? "" : "primary"}`}
                    onClick={() => setExpandedId(expanded ? null : m.id)}
                  >
                    {expanded ? "Hide Details" : "Details"}
                  </button>
                  <Link className="btn" to={`/ecoroute/${m.id}`}>
                    EcoRoute
                  </Link>
                </div>

                {expanded && (
                  <div className="bigStat" style={{ marginTop: 12 }}>
                    <div className="kv"><span className="k">Address</span><span className="v">{m.address}</span></div>
                    <div className="kv"><span className="k">Days</span><span className="v">{(m.daysOpen || []).join(", ")}</span></div>
                    <div className="kv"><span className="k">Hours</span><span className="v">{formatTime12(m.hours?.open)} - {formatTime12(m.hours?.close)}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
