import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/social", label: "Social" },
  { to: "/resources", label: "Resources" },
];

export default function Navbar() {
  const { isLoggedIn, dbUser, logout } = useAuth();
  const location = useLocation();

  return (
    <nav style={{
      background: "var(--paper)",
      borderBottom: "2px solid var(--border)",
      boxShadow: "0 4px 0 rgba(122,90,58,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1060,
        margin: "0 auto",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 58,
        gap: 10,
      }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo" style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.4, color: "var(--brown)" }}>EcoTracker</span>
        </Link>

        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {NAV_LINKS.map(({ to, label }) => {
            const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: "6px 12px",
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: "none",
                  color: "var(--brown)",
                  background: active ? "var(--mint)" : "transparent",
                  border: active ? "2px solid var(--border)" : "2px solid transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <details style={{ position: "relative" }}>
          <summary className="btn primary" style={{ listStyle: "none", cursor: "pointer", padding: "6px 12px", fontSize: 13 }}>
            {isLoggedIn ? `@${dbUser?.username || "Profile"}` : "Sign In"}
          </summary>
          <div className="card" style={{
            position: "absolute",
            right: 0,
            top: 42,
            minWidth: 180,
            padding: 10,
            zIndex: 200,
          }}>
            {!isLoggedIn ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/login" className="btn primary">Sign In</Link>
                <Link to="/login" className="btn">Sign Up</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/profile" className="btn primary">Profile</Link>
                <button type="button" className="btn" onClick={logout}>Log out</button>
              </div>
            )}
          </div>
        </details>
      </div>
    </nav>
  );
}
