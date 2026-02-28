# 🌱 EcoTracker

A full-stack sustainability tracker where you earn XP for eco-friendly actions, compete on leaderboards, and connect with friends.

---

## Features

- **Google Auth** — Sign in with your Google account
- **Username system** — Pick a unique username (3–20 chars)
- **XP Activities** — Earn XP for real eco actions:
  - 🌽 Farmers Market Visit (+50 XP flat)
  - 🚗 Carpooling (distance × extra riders × 5)
  - ♻️ Recycling (plastic ×20, paper ×10, metal ×25 per lb)
  - ⚡ Uber/Rideshare EV (distance × 8)
  - 🔋 EV/Hybrid Miles (EV ×10, Hybrid ×5 per mile)
- **Global Leaderboard** — Top 50 users by XP
- **Friends Leaderboard** — Compare with your friends
- **Friend System** — Send/accept/decline/cancel requests, remove friends
- **Webhooks** — Friends get notified via POST when you change your username
- **Sustainability Tools** — Carbon calculator, water estimator, energy audit, recycling guide
- **EcoRoute** — CO₂ comparison for getting to farmers markets

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, React Router v7, Recharts       |
| Backend  | Node.js, Express 5 (ESM)                        |
| Auth     | Firebase Authentication (Google provider)       |
| Database | JSON file store (no native compilation needed)  |
| Routing  | OSRM (open-source routing)                      |

---

## Setup

### 1. Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create project**
2. Enable **Authentication** → **Sign-in method** → **Google**
3. Add your domain to **Authorized domains** (e.g. `localhost`)
4. Go to **Project settings** → **Your apps** → **Web app** → copy the config
5. Go to **Project settings** → **Service accounts** → **Generate new private key** → download JSON

### 2. Server environment

```bash
cp project/server/.env.example project/server/.env
```

Edit `project/server/.env`:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=5000
```

> Copy `FIREBASE_PRIVATE_KEY` from the downloaded service account JSON. Keep the quotes and `\n` escapes.

### 3. Client environment

```bash
cp project/client/.env.example project/client/.env
```

Edit `project/client/.env`:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Install dependencies

```bash
# Server
cd project/server
npm install

# Client
cd project/client
npm install
```

### 5. Run

Open **two terminals**:

**Terminal 1 — Server:**
```bash
cd project/server
npm start
# or for auto-reload:
npm run dev
```

**Terminal 2 — Client:**
```bash
cd project/client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
project/
├── server/
│   ├── data/
│   │   ├── markets.json        # Farmers market data
│   │   └── db.json             # Auto-created: user/activity/friend data
│   ├── middleware/
│   │   └── auth.js             # Firebase token verification
│   ├── routes/
│   │   ├── markets.js          # GET /api/markets
│   │   ├── route.js            # GET /api/route (OSRM)
│   │   ├── auth.js             # POST /api/auth/login, /set-username, /check-username
│   │   ├── users.js            # GET/PUT /api/users/me, GET /api/users/:username
│   │   ├── activities.js       # POST /api/activities, GET /api/activities/me
│   │   ├── friends.js          # Full friend system endpoints
│   │   └── leaderboard.js      # GET /api/leaderboard/global, /friends
│   ├── db.js                   # JSON file store (no native compilation)
│   ├── index.js                # Express app entry point
│   └── .env.example
│
└── client/
    └── src/
        ├── components/
        │   ├── Navbar.jsx          # Sticky global navigation
        │   └── ProtectedRoute.jsx  # Auth guard
        ├── context/
        │   └── AuthContext.jsx     # Firebase auth state + DB user
        ├── pages/
        │   ├── Login.jsx           # Google sign-in
        │   ├── SetUsername.jsx     # Username picker
        │   ├── Dashboard.jsx       # XP activity logging
        │   ├── Leaderboard.jsx     # Global + friends leaderboard
        │   ├── Friends.jsx         # Friend management
        │   ├── Profile.jsx         # Profile + webhook settings
        │   ├── Tools.jsx           # Sustainability tools hub
        │   ├── Home.jsx            # Farmers market listing
        │   ├── Market.jsx          # Market detail
        │   └── EcoRoute.jsx        # CO₂ route calculator
        ├── utils/
        │   ├── api.js              # All API helper functions
        │   ├── xp.js               # XP formulas + tier system
        │   ├── emissions.js        # CO₂ emission factors
        │   └── isOpenNow.js        # Market hours checker
        ├── firebase.js             # Firebase client init
        └── index.css               # Design system (earthy/paper theme)
```

---

## XP Formulas

| Activity | Formula |
|---|---|
| Farmers Market | 50 XP flat |
| Carpooling | `round(miles × (people−1) × 5)` |
| Recycling | `round(plastic_lbs×20 + paper_lbs×10 + metal_lbs×25)` |
| Uber EV | `round(miles × 8)` |
| EV Miles | `round(miles × 10)` |
| Hybrid Miles | `round(miles × 5)` |

---

## Webhook Payload

When a user changes their username, a `POST` is sent to each friend's webhook URL:

```json
{
  "event": "username_changed",
  "old_username": "old_name",
  "new_username": "new_name",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Data Storage

All user data is stored in `project/server/data/db.json` (auto-created on first run). No external database required.

Schema:
- **users** — id (Firebase UID), username, email, display_name, photo_url, xp, webhook_url, created_at
- **friend_requests** — id, from_user, to_user, status (pending/accepted/declined), created_at
- **friends** — user1, user2, created_at
- **activities** — id, user_id, type, xp_earned, details (JSON), created_at
