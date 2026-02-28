# Implementation TODO

## Backend
- [x] db.js — Add coins, garden_rows, garden_cols, garden, inventory fields; addCoins/spendCoins/updateGarden/setGardenSize methods; migrate existing users
- [x] server/routes/garden.js — New garden API (GET, PUT, buy-row, buy-col, buy-plant, public view)
- [x] server/routes/users.js — Include coins, garden fields in public profile
- [x] server/index.js — Register /api/garden route
- [x] server/routes/activities.js — XP earned = coins earned (via addXP in db.js)

## Frontend - Utils
- [x] client/src/utils/api.js — Added garden API functions

## Frontend - Components
- [x] client/src/components/Garden.jsx — Full rewrite: removed Firebase, uses backend API, isometric 3D, 2x2 start, 8x8 max, buy row/col/plant, plant/delete, normalized plant keys
- [x] client/src/components/Navbar.jsx — Restructured: Dashboard|Leaderboard|Social|Resources + auth dropdown

## Frontend - Pages
- [x] client/src/pages/Home.jsx — Full landing page: hero, Sign In + Get Started CTAs (→ /login), 6-feature grid, stats row, how-it-works (3 steps), final CTA, footer
- [x] client/src/pages/Resources.jsx — New: Markets list + tools cards + EcoRoute links
- [x] client/src/pages/Social.jsx — New: renamed Friends with clickable user cards → /user/:username
- [x] client/src/pages/PublicProfile.jsx — New: /user/:username public view (PFP, username, XP, coins, garden)
- [x] client/src/pages/Profile.jsx — Removed webhook, added share link, shows coins, shows garden
- [x] client/src/pages/Leaderboard.jsx — Clickable username/avatar → /user/:username; friends link → /social
- [x] client/src/pages/Dashboard.jsx — Shows coins balance
- [x] client/src/pages/EcoRoute.jsx — Standalone + market mode, all 4 modes comparison with bar chart

## Frontend - Navigation
- [x] client/src/App.jsx — Added routes: /social, /resources, /user/:username, /u/:username, /ecoroute, /ecoroute/:id; /friends → /social redirect

## Build
- [x] npm run build — PASSES (716 modules, no errors)
