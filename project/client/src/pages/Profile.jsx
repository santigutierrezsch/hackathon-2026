import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiCheckUsername, apiSetUsername } from "../utils/api.js";
import { formatDate } from "../utils/xp.js";
import Garden from "../components/Garden.jsx";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function Profile() {
  const { dbUser, getToken, refreshDbUser, logout } = useAuth();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!newUsername) return setStatus("idle");
    if (!USERNAME_RE.test(newUsername)) return setStatus("invalid");
    if (newUsername === dbUser?.username) return setStatus("idle");
    const t = setTimeout(async () => {
      try {
        setStatus("checking");
        const data = await apiCheckUsername(newUsername);
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [newUsername, dbUser?.username]);

  async function saveUsername() {
    if (status !== "available") return;
    try {
      setSaving(true);
      setMsg("");
      await apiSetUsername(newUsername, getToken);
      await refreshDbUser();
      setNewUsername("");
      setStatus("idle");
      setMsg("Username updated.");
    } catch (e) {
      setMsg(e.message || "Failed to update username");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function copyProfileLink() {
    const link = `${window.location.origin}/user/${dbUser?.username || ""}`;
    try {
      await navigator.clipboard.writeText(link);
      setMsg("Profile link copied.");
    } catch {
      setMsg(link);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Profile</h1>
            <p className="sub">Your account, progress, and garden.</p>
          </div>
        </div>
      </div>

      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="space">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {dbUser?.photo_url ? (
              <img src={dbUser.photo_url} alt="avatar" style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--border)" }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--blue)", border: "2px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900,
              }}>
                {(dbUser?.username || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>@{dbUser?.username}</div>
              <div className="meta">{dbUser?.display_name || dbUser?.email}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 1000 }}>{(dbUser?.xp || 0).toLocaleString()} XP</div>
            <div className="badge ok">{(dbUser?.coins || 0).toLocaleString()} Coins</div>
          </div>
        </div>
        <div className="divider" />
        <div className="kv">
          <span className="k">Member since</span>
          <span className="v">{dbUser?.created_at ? formatDate(dbUser.created_at) : "-"}</span>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" onClick={copyProfileLink}>
            Share Profile Link
          </button>
          <span className="smallNote">{`/user/${dbUser?.username || ""}`}</span>
        </div>
      </div>

      <Garden
        garden={dbUser?.garden || []}
        gardenRows={dbUser?.garden_rows || 3}
        gardenCols={dbUser?.garden_cols || 3}
        inventory={dbUser?.inventory || []}
        coins={dbUser?.coins || 0}
        editable
        getToken={getToken}
        onChanged={refreshDbUser}
      />

      <div className="card r3" style={{ marginTop: 16 }}>
        <div className="sectionTitle">Change username</div>
        <input
          className="input"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value.trim())}
          placeholder="New username"
          maxLength={20}
        />
        <div className="smallNote">
          {status === "available" && "Available"}
          {status === "taken" && "Already taken"}
          {status === "invalid" && "3-20 chars: letters, numbers, underscores"}
          {status === "checking" && "Checking..."}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary" onClick={saveUsername} disabled={status !== "available" || saving}>
            {saving ? "Saving..." : "Save username"}
          </button>
          <button className="btn" onClick={handleLogout}>Log out</button>
        </div>
        {msg && <div className="smallNote" style={{ color: msg.includes("updated") ? "#2d6a4f" : "#c0392b" }}>{msg}</div>}
      </div>
    </div>
  );
}
