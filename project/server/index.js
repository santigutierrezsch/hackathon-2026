import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";

import marketsRoute     from "./routes/markets.js";
import routeRoute       from "./routes/route.js";
import authRoute        from "./routes/auth.js";
import usersRoute       from "./routes/users.js";
import activitiesRoute  from "./routes/activities.js";
import friendsRoute     from "./routes/friends.js";
import leaderboardRoute from "./routes/leaderboard.js";

// ── Firebase Admin init ───────────────────────────────────────────────────────
// Reads FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY from .env
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    console.log("Firebase Admin initialised ✓");
  } else {
    console.warn(
      "⚠️  Firebase Admin env vars missing — auth endpoints will not work.\n" +
      "   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in server/.env"
    );
    // Initialise with no credential so the app doesn't crash on startup
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "demo-project" });
  }
}

// ── Express app ───────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Existing routes
app.use("/api/markets",     marketsRoute);
app.use("/api/route",       routeRoute);

// New routes
app.use("/api/auth",        authRoute);
app.use("/api/users",       usersRoute);
app.use("/api/activities",  activitiesRoute);
app.use("/api/friends",     friendsRoute);
app.use("/api/leaderboard", leaderboardRoute);

app.get("/", (req, res) => res.send("EcoTracker API running"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
