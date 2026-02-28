import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/dashboard",   label: "⚡ Dashboard"   },
  { to: "/leaderboard", label: "🏆 Leaderboard" },
  { to: "/social",      label: "👥 Social"      },
  { to: "/resources",   label: "🌿 Resources"   },
  { to: "/tools",       label: "🛠️ Tools"       },
];

export default function Navbar() {
  const { isLoggedIn, dbUser, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [dropOpen, setDropOpen] = useState(false);
  const dropRef   = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setDropOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

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
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{borderRadius: 10, flexShrink: 0, fontSize: "2em", padding: 0}}>🌱</div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.4, color: "var(--brown)" }}>
            EcoTracker
          </span>
        </Link>

        {/* Nav links */}
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

        {/* Auth area */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} ref={dropRef}>
          {isLoggedIn && dbUser ? (
            /* ── Signed-in dropdown ── */
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: 14,
                  border: "2px solid var(--border)",
                  background: dropOpen ? "var(--mint)" : "var(--paper2)",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 13,
                  color: "var(--brown)",
                }}
              >
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
                <span>{dbUser.username}</span>
                <span style={{
                  fontSize: 11, fontWeight: 900,
                  background: "var(--mint)",
                  padding: "2px 7px",
                  borderRadius: 999,
                  border: "1.5px solid var(--border)",
                }}>
                  {(dbUser.xp || 0).toLocaleString()} XP
                </span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>{dropOpen ? "▲" : "▼"}</span>
              </button>

              {/* Dropdown menu */}
              {dropOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--paper)",
                  border: "2px solid var(--border)",
                  borderRadius: 16,
                  boxShadow: "0 8px 0 rgba(122,90,58,0.12)",
                  minWidth: 160,
                  overflow: "hidden",
                  zIndex: 200,
                }}>
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      fontWeight: 900,
                      fontSize: 14,
                      textDecoration: "none",
                      color: "var(--brown)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 16px",
                      fontWeight: 900,
                      fontSize: 14,
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--brown)",
                    }}
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
          /* ── Signed-out dropdown ── */
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="btn primary"
                style={{ padding: "6px 14px", fontSize: 13, gap: 6 }}
              >
                Sign In {dropOpen ? "▲" : "▼"}
              </button>

              {dropOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--paper)",
                  border: "2px solid var(--border)",
                  borderRadius: 16,
                  boxShadow: "0 8px 0 rgba(122,90,58,0.12)",
                  minWidth: 140,
                  overflow: "hidden",
                  zIndex: 200,
                }}>
                  <Link
                    to="/login"
                    onClick={() => setDropOpen(false)}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      fontWeight: 900,
                      fontSize: 14,
                      textDecoration: "none",
                      color: "var(--brown)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    🔑 Sign In
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setDropOpen(false)}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      fontWeight: 900,
                      fontSize: 14,
                      textDecoration: "none",
                      color: "var(--brown)",
                    }}
                  >
                    ✨ Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
