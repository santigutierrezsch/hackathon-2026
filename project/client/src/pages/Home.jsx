import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  {
    icon: "⚡",
    title: "Earn XP & Coins",
    desc: "Log eco-friendly activities — carpooling, recycling, EV rides, farmers market visits — and earn XP and coins that grow with every action.",
    rot: "r1",
  },
  {
    icon: "🪴",
    title: "Isometric Garden",
    desc: "Spend your coins to expand your personal isometric 3D garden. Plant trees, flowers, mushrooms, and more on an 8×8 grid.",
    rot: "r2",
  },
  {
    icon: "🏆",
    title: "Leaderboard",
    desc: "Compete globally or just among friends. See who's making the biggest eco impact and climb the ranks.",
    rot: "r3",
  },
  {
    icon: "👥",
    title: "Social",
    desc: "Add friends, send requests, and view each other's public profiles and gardens. Sustainability is better together.",
    rot: "r4",
  },
  {
    icon: "🗺️",
    title: "EcoRoute Calculator",
    desc: "Calculate the CO₂ impact of your journey. Compare car, bus, bike, and walking emissions side-by-side for any destination.",
    rot: "r1",
  },
  {
    icon: "🌿",
    title: "Local Markets",
    desc: "Discover local farmers markets near you. See live open/closed status, hours, and get an EcoRoute to any market instantly.",
    rot: "r2",
  },
];

const STEPS = [
  { num: "1", title: "Sign in with Google", desc: "One click — no passwords, no hassle." },
  { num: "2", title: "Log your eco actions", desc: "Carpool, recycle, ride EV, visit markets — every action earns XP." },
  { num: "3", title: "Grow your garden", desc: "Spend coins to expand your isometric garden and climb the leaderboard." },
];

export default function Home() {
  const { isLoggedIn, loading } = useAuth();

  if (!loading && isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "72px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>🌱</div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 1000,
          lineHeight: 1.1,
          color: "var(--brown)",
          letterSpacing: -1.5,
          margin: "0 0 20px",
        }}>
          Track your eco impact.<br />
          <span style={{ color: "#2d6a4f" }}>Grow your world.</span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2.5vw, 20px)",
          color: "rgba(122,90,58,0.75)",
          maxWidth: 560,
          margin: "0 auto 36px",
          lineHeight: 1.6,
          fontWeight: 600,
        }}>
          EcoTracker is a gamified sustainability platform. Log eco-friendly activities,
          earn XP and coins, grow an isometric garden, and compete with friends on the leaderboard.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/login"
            className="btn primary"
            style={{ padding: "14px 32px", fontSize: 16, borderRadius: 20 }}
          >
            🔑 Sign In
          </Link>
          <Link
            to="/login"
            className="btn"
            style={{ padding: "14px 32px", fontSize: 16, borderRadius: 20 }}
          >
            ✨ Get Started
          </Link>
        </div>

        {/* Feature strip */}
        <div style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 40,
        }}>
          {[
            ["🌍", "Carbon tracking"],
            ["🪙", "Coins & XP system"],
            ["🏆", "Global leaderboard"],
            ["🪴", "Isometric garden"],
          ].map(([icon, label]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 800, color: "rgba(122,90,58,0.65)",
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="sectionTitle" style={{ fontSize: 11, letterSpacing: 2 }}>WHAT YOU GET</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--brown)", margin: "6px 0 0" }}>
            Everything you need to go green 🌿
          </h2>
        </div>

        <div className="grid">
          {FEATURES.map(({ icon, title, desc, rot }) => (
            <div key={title} className={`card ${rot}`}>
              <div className="tape tl" />
              <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
              <h3 className="title" style={{ marginBottom: 8 }}>{title}</h3>
              <p className="meta" style={{ lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          margin: "40px 0",
        }}>
          {[
            { value: "5",   unit: "Activity types",  icon: "⚡" },
            { value: "8×8", unit: "Max garden size",  icon: "🪴" },
            { value: "4",   unit: "Transport modes",  icon: "🗺️" },
            { value: "∞",   unit: "XP to earn",       icon: "🏆" },
          ].map(({ value, unit, icon }) => (
            <div key={unit} className="card r3" style={{
              textAlign: "center",
              minWidth: 130,
              flex: "1 1 130px",
              padding: "20px 16px",
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 32, fontWeight: 1000, color: "var(--brown)", lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(122,90,58,0.6)", marginTop: 4 }}>
                {unit}
              </div>
            </div>
          ))}
        </div>

        {/* ── How It Works ───────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="sectionTitle" style={{ fontSize: 11, letterSpacing: 2 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--brown)", margin: "6px 0 0" }}>
            Get started in 3 steps
          </h2>
        </div>

        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 48,
        }}>
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="card r1" style={{
              flex: "1 1 220px",
              maxWidth: 280,
              textAlign: "center",
              padding: "28px 20px",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--mint)", border: "2px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 1000, color: "var(--brown)",
                margin: "0 auto 14px",
              }}>
                {num}
              </div>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>{title}</div>
              <div className="meta" style={{ lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* ── Final CTA ──────────────────────────────────────────────────── */}
        <div className="card r2" style={{
          textAlign: "center",
          padding: "48px 32px",
          marginBottom: 48,
        }}>
          <div className="tape tl" />
          <div className="tape tr" />
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--brown)", marginBottom: 10 }}>
            Ready to make a difference?
          </h2>
          <p className="meta" style={{ maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Join EcoTracker today. Every action counts — from recycling a can to carpooling to work.
            Start earning XP and watch your garden grow.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/login"
              className="btn primary"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 18 }}
            >
              🔑 Sign In
            </Link>
            <Link
              to="/login"
              className="btn"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 18 }}
            >
              ✨ Get Started Free
            </Link>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer style={{
          borderTop: "2px solid var(--border)",
          paddingTop: 28,
          paddingBottom: 40,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 900, fontSize: 16, color: "var(--brown)" }}>EcoTracker</span>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { to: "/leaderboard", label: "Leaderboard" },
              { to: "/markets",     label: "Markets"     },
              { to: "/tools",       label: "Tools"       },
              { to: "/login",       label: "Sign In"     },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: 13, fontWeight: 800,
                  color: "rgba(122,90,58,0.65)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "rgba(122,90,58,0.45)", fontWeight: 700 }}>
            © 2026 EcoTracker · Built for a greener planet 🌱
          </div>
        </footer>
      </div>
    </div>
  );
}
