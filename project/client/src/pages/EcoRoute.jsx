import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { fetchMarkets } from "../utils/api.js";
import { EMISSION_FACTORS_KG_PER_MILE } from "../utils/emissions.js";

const carFactor = EMISSION_FACTORS_KG_PER_MILE.car;
const busFactor = EMISSION_FACTORS_KG_PER_MILE.bus;
const bikeFactor = EMISSION_FACTORS_KG_PER_MILE.bike;
const walkFactor = EMISSION_FACTORS_KG_PER_MILE.walk;

const startIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:999px;background:#1d4ed8;border:2px solid white;box-shadow:0 0 0 2px #1d4ed8;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const endIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:999px;background:#dc2626;border:2px solid white;box-shadow:0 0 0 2px #dc2626;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recenter({ start, end }) {
  const map = useMap();
  useEffect(() => {
    if (!start || !end) return;
    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds.pad(0.3));
  }, [map, start, end]);
  return null;
}

export default function EcoRoute() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(Boolean(id));
  const [start, setStart] = useState([41.8781, -87.6298]); // Chicago default
  const [end, setEnd] = useState([41.8819, -87.6278]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routing, setRouting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoadingMarket(true);
        const all = await fetchMarkets();
        const found = all.find(m => m.id === id);
        if (!found) throw new Error("Market not found");
        setMarket(found);
        if (Array.isArray(found.coordinates) && found.coordinates.length === 2) {
          setEnd([found.coordinates[1], found.coordinates[0]]);
        }
      } catch (e) {
        setErr(e.message || "Failed to load market");
      } finally {
        setLoadingMarket(false);
      }
    })();
  }, [id]);

  const distanceMiles = useMemo(
    () => (routeInfo?.distanceMeters ? routeInfo.distanceMeters / 1609.34 : 0),
    [routeInfo]
  );

  const co2 = useMemo(() => {
    const car = distanceMiles * carFactor;
    const bus = distanceMiles * busFactor;
    const bike = distanceMiles * bikeFactor;
    const walk = distanceMiles * walkFactor;
    return {
      car,
      bus,
      bike,
      walk,
      saveBus: car - bus,
      saveBike: car - bike,
      saveWalk: car - walk,
    };
  }, [distanceMiles]);

  async function calcRoute(profile = "driving") {
    try {
      setRouting(true);
      setErr("");
      const qs = new URLSearchParams({
        startLat: String(start[0]),
        startLon: String(start[1]),
        endLat: String(end[0]),
        endLon: String(end[1]),
        profile,
      }).toString();
      const res = await fetch(`/api/route?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Route failed");
      setRouteInfo(data);
    } catch (e) {
      setErr(e.message || "Failed to route");
    } finally {
      setRouting(false);
    }
  }

  function useCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (p) => setStart([p.coords.latitude, p.coords.longitude]),
      () => setErr("Unable to read your location")
    );
  }

  if (loadingMarket) {
    return <div className="container"><div className="card">Loading market...</div></div>;
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">EcoRoute</h1>
            <p className="sub">
              Drag both points, calculate route distance, and compare CO2 savings.
              {market ? ` Destination preset: ${market.name}.` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="row">
          <button className="btn" onClick={useCurrentLocation}>Use My Start Location</button>
          <button className="btn primary" onClick={() => calcRoute("driving")} disabled={routing}>
            {routing ? "Calculating..." : "Calculate Route"}
          </button>
          {id && <Link className="btn" to={`/market/${id}`}>Back to Market</Link>}
        </div>
        {err && <div className="smallNote" style={{ color: "#c0392b" }}>{err}</div>}
      </div>

      <div className="card r2" style={{ marginBottom: 16, overflow: "hidden" }}>
        <MapContainer center={start} zoom={13} style={{ height: 460, width: "100%", borderRadius: 14 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter start={start} end={end} />
          <Marker
            position={start}
            icon={startIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                setStart([p.lat, p.lng]);
              },
            }}
          >
            <Popup>Start Point</Popup>
          </Marker>
          <Marker
            position={end}
            icon={endIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                setEnd([p.lat, p.lng]);
              },
            }}
          >
            <Popup>End Point</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="grid">
        <div className="card r3">
          <div className="sectionTitle">Route</div>
          <div className="kv"><span className="k">Distance</span><span className="v">{distanceMiles.toFixed(2)} miles</span></div>
          <div className="kv"><span className="k">Duration</span><span className="v">{routeInfo ? `${Math.round(routeInfo.durationSeconds / 60)} min` : "-"}</span></div>
          <div className="smallNote">Distance comes from your route API.</div>
        </div>

        <div className="card r4">
          <div className="sectionTitle">CO2 Savings vs Car</div>
          <div className="kv"><span className="k">Car baseline</span><span className="v">{co2.car.toFixed(2)} kg</span></div>
          <div className="kv"><span className="k">Bus saves</span><span className="v">{co2.saveBus.toFixed(2)} kg</span></div>
          <div className="kv"><span className="k">Bike saves</span><span className="v">{co2.saveBike.toFixed(2)} kg</span></div>
          <div className="kv"><span className="k">Walk saves</span><span className="v">{co2.saveWalk.toFixed(2)} kg</span></div>
        </div>
      </div>
    </div>
  );
}
