import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LS_KEY = "ecomarket_last_calc_v1";

export default function NerdStats() {
  const raw = localStorage.getItem(LS_KEY);
  const payload = raw ? JSON.parse(raw) : null;

  const chartData = useMemo(() => {
    if (!payload) return [];
    const d = payload.distanceMiles;
    const f = payload.factors;
    return [
      { mode: "Car", kg: round2(d * f.car) },
      { mode: "Bus", kg: round2(d * f.bus) },
      { mode: "Bike", kg: round2(d * f.bike) },
      { mode: "Walk", kg: round2(d * f.walk) }
    ];
  }, [raw]);

  if (!payload) {
    return (
      <div className="container">
        <Link to="/" className="btn ghost">← Back</Link>
        <div style={{ height: 12 }} />
        <div className="card">
          <div className="tape tl" /><div className="tape tr" />
          <h1 className="h1" style={{ fontSize: 30, marginTop: 0 }}>Stats for Nerds</h1>
          <p className="sub">No calculation yet. Run EcoRoute first.</p>
          <div style={{ height: 10 }} />
          <Link to="/" className="btn primary">Back to markets →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="btn ghost">← Back</Link>
      <div style={{ height: 12 }} />

      <div className="topbar" style={{ marginBottom: 10 }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 0 }}>Stats for Nerds</h1>
          <p className="sub">Transparent numbers, formulas, and raw output.</p>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <div className="tape tl" /><div className="tape tr" />

          <div className="kv"><span className="k">Market</span><span className="v">{payload.marketName}</span></div>
          <div className="kv"><span className="k">Distance (mi)</span><span className="v">{payload.distanceMiles}</span></div>
          <div className="kv"><span className="k">Mode</span><span className="v">{payload.mode}</span></div>
          <div className="kv"><span className="k">Car baseline (kg)</span><span className="v">{payload.carKg}</span></div>
          <div className="kv"><span className="k">Chosen mode (kg)</span><span className="v">{payload.chosenKg}</span></div>
          <div className="kv"><span className="k">Saved (kg)</span><span className="v">{payload.savedKg}</span></div>

          <div className="divider" />

          <div className="sectionTitle">Formula</div>
          <div className="code">{payload.formula}</div>

          <div className="sectionTitle">Emission factors (kg / mile)</div>
          <div className="code">{JSON.stringify(payload.factors, null, 2)}</div>
        </div>

        <div className="card">
          <div className="tape tl" /><div className="tape tr" />

          <div className="sectionTitle">Emissions by Mode</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="mode" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kg" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="divider" />

          <div className="sectionTitle">Raw calculation JSON</div>
          <pre className="code" style={{ maxHeight: 280 }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function round2(x) {
  return Math.round(x * 100) / 100;
}