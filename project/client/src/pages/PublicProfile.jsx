import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetUser } from "../utils/api.js";
import { getXPTier, formatDate } from "../utils/xp.js";
import { GardenReadOnly } from "../components/Garden.jsx";

export default function PublicProfile() {
  const { username } = useParams();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState("");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setErr("");
    setUser(null);

    apiGetUser(username)
      .then(data => setUser(data.user))
      .catch(e  => setErr(e.message || "User not found"))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card r1">
          <div className="meta">Loading profile…</div>
        </div>
      </div>
    );
  }

  if (err || !user) {
    return (
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card r1" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h2 className="h1" style={{ fontSize: 24 }}>User not found</h2>
          <p className="meta" style={{ textAlign: "center" }}>
            @{username} doesn't exist or hasn't set a username yet.
          </p>
          <div style={{ height: 16 }} />
          <Link to="/leaderboard" className="btn primary">View Leaderboard →</Link>
        </div>
      </div>
    );
  }

  const tier = getXPTier(user.xp || 0);

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="topbar">
        <div className="brand">
          <div>
            <h1 className="h1">Profile</h1>
            <p className="sub">@{user.username}'s public profile</p>
          </div>
        </div>
        <Link to="/leaderboard" className="btn" style={{ fontSize: 13 }}>
          ← Leaderboard
        </Link>
      </div>

      {/* Profile card */}
      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="tape tl" />
        <div className="tape tr" />

        <div className="space">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt="avatar"
                style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid var(--border)", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--blue)", border: "2px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 900,
              }}>
                {(user.username || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>@{user.username}</div>
              {user.display_name && (
                <div style={{ fontSize: 14, color: "rgba(122,90,58,0.65)", marginTop: 2 }}>
                  {user.display_name}
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 800, color: tier.color, marginTop: 4 }}>
                {tier.label}
              </div>
            </div>
          </div>

          {/* XP + Coins */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 1000, lineHeight: 1 }}>
              {(user.xp || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: "rgba(122,90,58,0.6)", fontWeight: 800, marginBottom: 8 }}>
              TOTAL XP
            </div>
            <div style={{
              background: "#FFD700", color: "#7a5a00",
              padding: "4px 12px", borderRadius: 999,
              fontWeight: 900, fontSize: 14,
              border: "2px solid rgba(122,90,58,0.18)",
              display: "inline-block",
            }}>
              {(user.coins || 0).toLocaleString()} 🪙
            </div>
          </div>
        </div>

        <div className="divider" />

        {user.created_at && (
          <div className="kv">
            <span className="k">Member since</span>
            <span className="v">{formatDate(user.created_at)}</span>
          </div>
        )}
      </div>

      {/* Garden */}
      <div className="sectionTitle">🪴 Garden</div>
      <div className="card r2" style={{ marginBottom: 16 }}>
        <div className="tape tl" />
        {(user.garden && user.garden.length > 0) ? (
          <GardenReadOnly
            garden={user.garden}
            garden_rows={user.garden_rows || 2}
            garden_cols={user.garden_cols || 2}
          />
        ) : (
          <div className="meta" style={{ textAlign: "center", padding: "20px 0" }}>
            🌱 This garden is empty — nothing planted yet.
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "rgba(122,90,58,0.55)", fontWeight: 800 }}>
            {user.garden_rows || 2}×{user.garden_cols || 2} grid
            {user.garden?.length > 0 && ` · ${user.garden.length} plant${user.garden.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* Back links */}
      <div className="row">
        <Link to="/leaderboard" className="btn">🏆 Leaderboard</Link>
        <Link to="/social" className="btn">👥 Social</Link>
      </div>
    </div>
  );
}
