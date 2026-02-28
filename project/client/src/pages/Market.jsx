import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { isOpenNow } from "../utils/isOpenNow.js";

export default function Market() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await fetchMarkets();
        const found = all.find((m) => m.id === id);
        if (!found) throw new Error("Market not found");
        setMarket(found);
      } catch (e) {
        setErr(e?.message || "Failed to load market");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (err) return <div className="container"><div className="card">{err}</div></div>;

  const open = isOpenNow(market);

  return (
    <div className="container">
      <Link to="/" className="btn ghost">← Back</Link>

      <div style={{ height: 12 }} />

      <div className="card">
        <div className="tape tl" />
        <div className="tape tr" />

        <div className="space">
          <div>
            <h2 className="h1" style={{ fontSize: 28, margin: 0 }}>
              {market.name}
            </h2>
            <p className="sub" style={{ marginTop: 8 }}>
              <b>Address:</b> {market.address}
            </p>
          </div>
          <span className={`badge ${open ? "ok" : "bad"}`}>
            {open ? "OPEN NOW" : "CLOSED"}
          </span>
        </div>

        <div className="divider" />

        <div className="meta">
          <div><b>Days:</b> {(market.daysOpen || []).join(", ")}</div>
          <div><b>Hours:</b> {market.hours?.open} – {market.hours?.close}</div>
        </div>

        <div style={{ height: 14 }} />

        <div className="row">
          <Link to={`/route/${market.id}`} className="btn primary">
            EcoRoute + CO₂ →
          </Link>
        </div>

        <div className="smallNote">
          EcoRoute uses real distance from your location and transparent emissions factors.
        </div>
      </div>
    </div>
  );
}