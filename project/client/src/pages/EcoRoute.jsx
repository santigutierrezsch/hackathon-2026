import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";
import { computeEmissions } from "../utils/emissions.js";

export default function EcoRoute() {
  const { id } = useParams();

  const [market, setMarket] = useState(null);
  const [mode, setMode] = useState("car");

  const [distance, setDistance] = useState("0");
  const [routeInfo, setRouteInfo] = useState(null);

  const [locStatus, setLocStatus] = useState("idle");
  const [userPos, setUserPos] = useState(null);

  const [showCalc, setShowCalc] = useState(false);

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

  const calc = useMemo(() => computeEmissions(distance, mode), [distance, mode]);

  function getUserLocation() {
    setLocStatus("getting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserPos({ lat, lon });
        setLocStatus("ready");
      },
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function getRouteDistance(profile = "driving") {
    if (!userPos || !market?.coordinates) return;

    const [endLon, endLat] = market.coordinates;

    const url = `/api/route?startLat=${userPos.lat}&startLon=${userPos.lon}&endLat=${endLat}&endLon=${endLon}&profile=${profile}`;

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Route failed");

    setRouteInfo(data);

    const miles = data.distanceMeters / 1609.34;
    setDistance(miles.toFixed(2));
  }

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (err) return <div className="container"><div className="card">{err}</div></div>;

  return (
    <div className="container">
      <Link to={`/market/${market.id}`} className="btn ghost">← Back</Link>

      <div style={{ height: 12 }} />

      <div className="card">
        <div className="tape tl" />
        <div className="tape tr" />

        <div className="space">
          <div>
            <h2 className="h1" style={{ fontSize: 28, margin: 0 }}>EcoRoute</h2>
            <p className="sub" style={{ marginTop: 8 }}>
              Destination: <b>{market.name}</b>
            </p>
          </div>
          <span className="badge">Real distance</span>
        </div>

        <div className="sectionTitle">Start location</div>
        <div className="row">
          <button className="btn primary" onClick={getUserLocation}>
            📍 Use my location
          </button>

          {userPos && (
            <>
              <button className="btn" onClick={() => getRouteDistance("driving")}>
                🧭 Route (drive)
              </button>
              <button className="btn" onClick={() => getRouteDistance("cycling")}>
                🚲 Route (bike)
              </button>
              <button className="btn" onClick={() => getRouteDistance("walking")}>
                🚶 Route (walk)
              </button>
            </>
          )}
        </div>

        {locStatus === "getting" && (
          <div className="smallNote">Requesting location permission…</div>
        )}
        {locStatus === "error" && (
          <div className="smallNote">Location failed. Allow permission and try again.</div>
        )}

        {userPos && (
          <div className="smallNote">
            Your coords: {userPos.lat.toFixed(5)}, {userPos.lon.toFixed(5)}
          </div>
        )}

        {routeInfo && (
          <div className="smallNote">
            Route: {(routeInfo.distanceMeters / 1000).toFixed(2)} km •{" "}
            {(routeInfo.durationSeconds / 60).toFixed(0)} min
          </div>
        )}

        <div className="sectionTitle">Transport mode for CO₂</div>
        <div className="row">
          <button className={`btn ${mode === "car" ? "primary" : ""}`} onClick={() => setMode("car")}>🚗 Car</button>
          <button className={`btn ${mode === "bus" ? "primary" : ""}`} onClick={() => setMode("bus")}>🚌 Bus</button>
          <button className={`btn ${mode === "bike" ? "primary" : ""}`} onClick={() => setMode("bike")}>🚲 Bike</button>
          <button className={`btn ${mode === "walk" ? "primary" : ""}`} onClick={() => setMode("walk")}>🚶 Walk</button>
        </div>

        <div className="bigStat">
          <div className="headline">
            {calc.savedKg >= 0 ? "You save " : "You add "}
            <span style={{ fontWeight: 1000 }}>
              {Math.abs(calc.savedKg).toFixed(2)} kg CO₂
            </span>
          </div>
          <div className="hint">
            Car baseline: <b>{calc.carKg.toFixed(2)} kg</b> • Selected mode:{" "}
            <b>{calc.chosenKg.toFixed(2)} kg</b>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="row">
          <button className="btn" onClick={() => setShowCalc(s => !s)}>
            {showCalc ? "Hide calculation" : "Expand calculation"}
          </button>

          {userPos && (
            <a
              className="btn"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lon}&destination=${market.coordinates[1]},${market.coordinates[0]}&travelmode=driving`}
            >
              🗺️ Open in Google Maps
            </a>
          )}
        </div>

        {showCalc && (
          <div className="bigStat">
            <div className="headline">Calculation details</div>
            <div className="hint">
              CO₂(mode) = distance_miles × factor_kg_per_mile
            </div>

            <div className="divider" />

            <div className="sectionTitle">Factors (kg / mile)</div>
            <pre className="code">{JSON.stringify(calc.factors, null, 2)}</pre>

            <div className="sectionTitle">Raw output</div>
            <pre className="code">
              {JSON.stringify(
                {
                  distanceMiles: calc.distanceMiles,
                  mode: calc.mode,
                  carKg: calc.carKg,
                  chosenKg: calc.chosenKg,
                  savedKg: calc.savedKg,
                  routeInfo,
                  userPos
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div className="smallNote">
          Methodology: OSRM routing distance × public average emissions factors.
        </div>
      </div>
    </div>
  );
}