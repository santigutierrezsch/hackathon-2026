# EcoTracker - Implementation TODO

## Phase 1: Backend Setup
- [x] Update server/package.json (add better-sqlite3, firebase-admin)
- [x] Create server/db.js (SQLite schema: users, friend_requests, friends, activities)
- [x] Create server/middleware/auth.js (Firebase token verification)
- [x] Create server/routes/auth.js (login, set-username)
- [x] Create server/routes/users.js (profile, webhook update)
- [x] Create server/routes/activities.js (log XP activities)
- [x] Create server/routes/friends.js (friend system)
- [x] Create server/routes/leaderboard.js (global + friends leaderboard)
- [x] Update server/index.js (register new routes, firebase-admin init)

## Phase 2: Frontend Setup
- [x] Update client/package.json (add firebase)
- [x] Create client/.env.example (Firebase + API env vars)
- [x] Create client/src/firebase.js (Firebase config)
- [x] Create client/src/context/AuthContext.jsx (auth state provider)
- [x] Create client/src/components/Navbar.jsx (global nav)
- [x] Create client/src/components/ProtectedRoute.jsx

## Phase 3: New Pages
- [x] Create client/src/pages/Login.jsx (Google sign-in)
- [x] Create client/src/pages/SetUsername.jsx (username picker)
- [x] Create client/src/pages/Dashboard.jsx (XP activities + stats)
- [x] Create client/src/pages/Leaderboard.jsx (global + friends tabs)
- [x] Create client/src/pages/Friends.jsx (friend requests + list)
- [x] Create client/src/pages/Profile.jsx (profile + webhook settings)
- [x] Create client/src/pages/Tools.jsx (sustainability tools hub)

## Phase 4: Utilities & XP
- [x] Create client/src/utils/xp.js (XP calculation formulas)
- [x] Update client/src/utils/api.js (add auth headers + new endpoints)

## Phase 5: Wire Everything Together
- [x] Update client/src/App.jsx (new routes + AuthContext + ProtectedRoute)
- [ ] Install npm dependencies (server + client)

## Phase 6: Env Files
- [x] Create project/server/.env.example
- [x] Create project/client/.env.example

## Next Steps for User
- [ ] Copy server/.env.example → server/.env and fill in Firebase credentials
- [ ] Copy client/.env.example → client/.env and fill in Firebase config
- [ ] Run: cd project/server && npm install
- [ ] Run: cd project/client && npm install
