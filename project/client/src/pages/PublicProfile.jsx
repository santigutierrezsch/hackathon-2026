import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Garden from "../components/Garden.jsx";
import { apiGetUser } from "../utils/api.js";

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiGetUser(username);
        setUser(data.user);
      } catch (e) {
        setErr(e.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Profile</h1>
            <p className="sub">Public user profile</p>
          </div>
        </div>
      </div>

      {loading && <div className="card">Loading...</div>}
      {err && <div className="card" style={{ color: "#c0392b" }}>{err}</div>}

      {!loading && user && (
        <>
          <div className="card r1" style={{ marginBottom: 16 }}>
            <div className="space">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {user.photo_url ? (
                  <img src={user.photo_url} alt="avatar" style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--border)" }} />
                ) : (
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "var(--blue)", border: "2px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900,
                  }}>
                    {(user.username || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 900, fontSize: 24 }}>@{user.username}</div>
                  {user.display_name && <div className="meta">{user.display_name}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{(user.xp || 0).toLocaleString()} XP</div>
                <div className="meta">{(user.coins || 0).toLocaleString()} Coins</div>
              </div>
            </div>
          </div>

          <Garden
            garden={user.garden || []}
            gardenRows={user.garden_rows || 3}
            gardenCols={user.garden_cols || 3}
            inventory={[]}
            coins={user.coins || 0}
            editable={false}
          />
        </>
      )}
    </div>
  );
}
