import express from "express";
import axios from "axios";

const router = express.Router();

// GET /api/route?startLat=..&startLon=..&endLat=..&endLon=..&profile=driving
router.get("/", async (req, res) => {
  try {
    const { startLat, startLon, endLat, endLon, profile = "driving" } = req.query;

    if (!startLat || !startLon || !endLat || !endLon) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLon},${startLat};${endLon},${endLat}?overview=false`;

    const r = await axios.get(url);
    const route = r.data?.routes?.[0];
    if (!route) return res.status(502).json({ error: "Routing failed" });

    res.json({
      distanceMeters: route.distance,
      durationSeconds: route.duration
    });
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: e.message });
  }
});

export default router;