import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Home          from "./pages/Home.jsx";
import Login         from "./pages/Login.jsx";
import SetUsername   from "./pages/SetUsername.jsx";
import Dashboard     from "./pages/Dashboard.jsx";
import Leaderboard   from "./pages/Leaderboard.jsx";
import Social        from "./pages/Social.jsx";
import Profile       from "./pages/Profile.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import Resources     from "./pages/Resources.jsx";
import Tools         from "./pages/Tools.jsx";
import Market        from "./pages/Market.jsx";
import EcoRoute      from "./pages/EcoRoute.jsx";
import NerdStats     from "./pages/NerdStats.jsx";

import "./App.css";

export default function App() {
  return (
    <AuthProvider>

      {/* Animated CSS Forest Background */}
      <div className="eco-background">
        <div className="css-tree tree-1"></div>
        <div className="css-tree tree-2"></div>
        <div className="css-tree tree-3"></div>
        <div className="css-tree tree-4"></div>
      </div>

      {/* App content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"             element={<Home />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/leaderboard"  element={<Leaderboard />} />
          <Route path="/markets"      element={<Resources />} />
          <Route path="/resources"    element={<Navigate to="/markets" replace />} />
          <Route path="/tools"        element={<Tools />} />
          <Route path="/market/:id"   element={<Market />} />
          <Route path="/nerd"         element={<NerdStats />} />

          {/* EcoRoute — standalone and with market pre-fill */}
          <Route path="/ecoroute"          element={<EcoRoute />} />
          <Route path="/ecoroute/:id"      element={<EcoRoute />} />
          {/* Legacy route kept working */}
          <Route path="/route/:id"         element={<EcoRoute />} />

          {/* Public profiles */}
          <Route path="/user/:username"    element={<PublicProfile />} />
          <Route path="/u/:username"       element={<PublicProfile />} />

          {/* Auth setup */}
          <Route path="/set-username"      element={<SetUsername />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/social" element={
            <ProtectedRoute><Social /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Backward compat: /friends → /social */}
          <Route path="/friends" element={<Navigate to="/social" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

    </AuthProvider>
  );
}
