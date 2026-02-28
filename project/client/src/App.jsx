import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Existing pages
import Home      from "./pages/Home.jsx";
import Market    from "./pages/Market.jsx";
import EcoRoute  from "./pages/EcoRoute.jsx";
import NerdStats from "./pages/NerdStats.jsx";

// New pages
import Login       from "./pages/Login.jsx";
import SetUsername from "./pages/SetUsername.jsx";
import Dashboard   from "./pages/Dashboard.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Friends     from "./pages/Friends.jsx";
import Profile     from "./pages/Profile.jsx";
import Tools       from "./pages/Tools.jsx";

// 👉 Make sure your CSS file is imported here! (Adjust path if needed)
import "./App.css"; 

export default function App() {
  return (
    <AuthProvider>
      
      {/* 🌲 1. The Animated CSS Forest Background */}
      <div className="eco-background">
        <div className="css-tree tree-1"></div>
        <div className="css-tree tree-2"></div>
        <div className="css-tree tree-3"></div>
        <div className="css-tree tree-4"></div>
      </div>

      {/* 🚀 2. Wrap your app content to keep it in front of the background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login"        element={<Login />} />
          <Route path="/leaderboard"  element={<Leaderboard />} />
          <Route path="/tools"        element={<Tools />} />
          <Route path="/"             element={<Home />} />
          <Route path="/market/:id"   element={<Market />} />
          <Route path="/route/:id"    element={<EcoRoute />} />
          <Route path="/nerd"         element={<NerdStats />} />

          {/* Auth-only: set username (no username required yet) */}
          <Route path="/set-username" element={<SetUsername />} />

          {/* Protected routes (require login + username) */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute><Friends /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

    </AuthProvider>
  );
}