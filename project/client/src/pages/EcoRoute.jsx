import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMarkets } from "../utils/api.js";

const FACTORS = {
  car: 0.404,
  bus: 0.15,
  bike_walk: 0,
};

export default function EcoRoute() {
  const { id } = useParams();

  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(id || "");
  const [calcMode, setCalcMode] = useState(id ? "markets" : "custom");
  const [transport, setTransport] = useState("car");

  const [distance, setDistance] = useState("0");
  const [routeInfo, setRouteInfo] = useState(null);

  const [locStatus, setLocStatus] = useState("idle");
  const [userPos, setUserPos] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  useEffect(() => {
    if (id) {
      setSelectedMarketId(id);
      setCalcMode("markets");
    }
  }, [id]);

  useEffect(() => {
    if (calcMode !== "markets" || selectedMarketId || markets.length === 0) return;
    setSelectedMarketId(markets[0].id);
  }, [calcMode, selectedMarketId, markets]);

  const selectedMarket = useMemo(
    () => markets.find((m) => m.id === selectedMarketId) || null,
    [markets, selectedMarketId]
  );

  function getUserLocation() {
    setLocStatus("getting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocStatus("ready");
      },
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function setDistanceFromMarketRoute() {
    if (!userPos || !selectedMarket?.coordinates) return;
    const [endLat, endLon] = selectedMarket.coordinates;
    let data;

    try {
      const url = `/api/route?startLat=${userPos.lat}&startLon=${userPos.lon}&endLat=${endLat}&endLon=${endLon}&profile=driving`;
      const res = await fetch(url);
      data = await res.json();
      console.log("[EcoRoute] /api/route response:", data);
      if (!res.ok) {
        throw new Error(data?.error || "Route request failed");
      }
    } catch {
      const directUrl = `https://router.project-osrm.org/route/v1/driving/${userPos.lon},${userPos.lat};${endLon},${endLat}?overview=false&steps=true`;
      const directRes = await fetch(directUrl);
      const directData = await directRes.json();
      console.log("[EcoRoute] direct OSRM response:", directData);
      const route = directData?.routes?.[0];
      if (!directRes.ok || !route) {
        throw new Error("Route request failed");
      }
      data = { distanceMeters: route.distance, durationSeconds: route.duration };
    }

    setRouteInfo(data);
    const miles = Number(data.distanceMeters || 0) / 1609.34;
    setDistance(miles.toFixed(2));
  }

  useEffect(() => {
    if (calcMode !== "markets" || !selectedMarket || !userPos) return;
    (async () => {
      try {
        setErr("");
        await setDistanceFromMarketRoute();
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [calcMode, selectedMarketId, userPos]);

  const d = Math.max(0, Number(distance) || 0);
  const carKg = d * FACTORS.car;
  const busKg = d * FACTORS.bus;
  const bikeWalkKg = d * FACTORS.bike_walk;

  const selectedKg =
    transport === "car" ? carKg : transport === "bus" ? busKg : bikeWalkKg;
  const savedVsCar = carKg - selectedKg;

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <Link to="/markets" className="btn ghost">Back to Markets</Link>

      <div style={{ height: 12 }} />

      <div className="card r1">
        <div className="space">
          <div>
            <h2 className="h1" style={{ fontSize: 28, margin: 0 }}>EcoRoute</h2>
            <p className="sub" style={{ marginTop: 8 }}>
              Baseline is always car, so savings are highlighted against driving.
            </p>
          </div>
          <span className="badge">Route + CO2</span>
        </div>

        <div className="sectionTitle">Start point</div>
        <div className="row">
          <button className="btn primary" onClick={getUserLocation}>Use Current Location</button>
          {userPos && (
            <span className="smallNote" style={{ margin: 0 }}>
              {userPos.lat.toFixed(5)}, {userPos.lon.toFixed(5)}
            </span>
          )}
        </div>

        {locStatus === "getting" && <div className="smallNote">Getting location...</div>}
        {locStatus === "error" && <div className="smallNote" style={{ color: "#c0392b" }}>Location permission failed.</div>}

        <div className="sectionTitle">Distance Source</div>
        <div className="row">
          <button className={`btn ${calcMode === "markets" ? "primary" : ""}`} onClick={() => setCalcMode("markets")}>Farmers Markets</button>
          <button className={`btn ${calcMode === "custom" ? "primary" : ""}`} onClick={() => { setCalcMode("custom"); setRouteInfo(null); }}>Custom Miles</button>
        </div>

        {calcMode === "markets" && (
          <>
            <div className="sectionTitle">Farmers Markets</div>
            <div className="row">
              {markets.map((m) => (
                <button
                  key={m.id}
                  className={`btn ${selectedMarketId === m.id ? "primary" : ""}`}
                  onClick={() => setSelectedMarketId(m.id)}
                  style={{ fontSize: 12 }}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {routeInfo && (
              <div className="smallNote">
                Driving route: {(routeInfo.distanceMeters / 1000).toFixed(2)} km, {(routeInfo.durationSeconds / 60).toFixed(0)} min
              </div>
            )}
          </>
        )}

        {calcMode === "custom" && (
          <>
            <div className="sectionTitle">Custom miles</div>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Enter miles"
              style={{ maxWidth: 260 }}
            />
          </>
        )}

        <div className="sectionTitle">Transport mode</div>
        <div className="row">
          <button className={`btn ${transport === "car" ? "primary" : ""}`} onClick={() => setTransport("car")}>Car</button>
          <button className={`btn ${transport === "bus" ? "primary" : ""}`} onClick={() => setTransport("bus")}>Bus</button>
          <button className={`btn ${transport === "bike_walk" ? "primary" : ""}`} onClick={() => setTransport("bike_walk")}>Bike / Walk</button>
        </div>

        <div className="bigStat" style={{ marginTop: 14 }}>
          <div className="headline">
            {savedVsCar >= 0 ? "Saved vs car: " : "Added vs car: "}
            <span style={{ color: savedVsCar >= 0 ? "#2d6a4f" : "#c0392b" }}>
              {Math.abs(savedVsCar).toFixed(2)} kg CO2
            </span>
          </div>
          <div className="hint">Distance: {d.toFixed(2)} miles</div>
          <div className="divider" />
          <div className="kv"><span className="k">Car</span><span className="v">{carKg.toFixed(2)} kg</span></div>
          <div className="kv"><span className="k">Bus</span><span className="v">{busKg.toFixed(2)} kg</span></div>
          <div className="kv"><span className="k">Bike / Walk</span><span className="v">{bikeWalkKg.toFixed(2)} kg</span></div>
        </div>

        {err && <div className="smallNote" style={{ color: "#c0392b" }}>{err}</div>}
      </div>
    </div>
  );
}
