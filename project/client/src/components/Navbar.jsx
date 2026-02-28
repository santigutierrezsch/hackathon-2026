import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/",            label: "🏪 Markets"     },
  { to: "/dashboard",   label: "⚡ Dashboard"   },
  { to: "/leaderboard", label: "🏆 Leaderboard" },
  { to: "/friends",     label: "👥 Friends"     },
  { to: "/tools",       label: "🛠️ Tools"       },
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
        height: 56,
        gap: 8,
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo" style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.4, color: "var(--brown)" }}>
            EcoTracker
          </span>
        </Link>

        {/* Nav links — hidden on small screens, shown on md+ */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {NAV_LINKS.map(({ to, label }) => {
            const active = location.pathname === to ||
              (to !== "/" && location.pathname.startsWith(to));
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
                  transition: "background .12s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* User area */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isLoggedIn && dbUser ? (
            <>
              <Link to="/profile" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: 14,
                  border: "2px solid var(--border)",
                  background: "var(--paper2)",
                  cursor: "pointer",
                }}>
                  {dbUser.photo_url ? (
                    <img
                      src={dbUser.photo_url}
                      alt="avatar"
                      style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "var(--blue)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900,
                    }}>
                      {(dbUser.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 900 }}>
                    {dbUser.username}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 900,
                    background: "var(--mint)",
                    padding: "2px 7px",
                    borderRadius: 999,
                    border: "1.5px solid var(--border)",
                  }}>
                    {dbUser.xp} XP
                  </span>
                </div>
              </Link>
              <button className="btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn primary" style={{ padding: "6px 14px", fontSize: 13 }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
