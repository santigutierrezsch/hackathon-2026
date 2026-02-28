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
  // Handle private key: support both literal \n and actual newlines
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
  // Strip surrounding quotes if present (common copy-paste mistake)
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }
  // Replace escaped newlines with real newlines
  privateKey = privateKey.replace(/\\n/g, "\n");
  // Trim whitespace
  privateKey = privateKey.trim();

  const projectId   = (process.env.FIREBASE_PROJECT_ID   || "").trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").trim();

  if (privateKey && projectId && clientEmail) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey })
      });
      console.log("✅ Firebase Admin initialised — project:", projectId);
    } catch (e) {
      console.error("❌ Firebase Admin init failed:", e.message);
      admin.initializeApp({ projectId: projectId || "demo-project" });
    }
  } else {
    console.warn(
      "⚠️  Firebase Admin env vars missing or empty — auth endpoints will not work.\n" +
      "   Required in server/.env:\n" +
      "     FIREBASE_PROJECT_ID=" + (projectId || "(missing)") + "\n" +
      "     FIREBASE_CLIENT_EMAIL=" + (clientEmail || "(missing)") + "\n" +
      "     FIREBASE_PRIVATE_KEY=" + (privateKey ? "(set, length=" + privateKey.length + ")" : "(missing)")
    );
    admin.initializeApp({ projectId: projectId || "demo-project" });
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
app.use("/api/social",      friendsRoute);
app.use("/api/leaderboard", leaderboardRoute);

app.get("/", (req, res) => res.send("EcoTracker API running"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
