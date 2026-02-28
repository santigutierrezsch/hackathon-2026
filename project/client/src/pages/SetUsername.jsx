import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiSetUsername, apiCheckUsername } from "../utils/api.js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function SetUsername() {
  const { firebaseUser, dbUser, loading, getToken, refreshDbUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername]     = useState("");
  const [status,   setStatus]       = useState("idle"); // idle | checking | available | taken | invalid
  const [err,      setErr]          = useState("");
  const [busy,     setBusy]         = useState(false);

  // Redirect if already has username
  useEffect(() => {
    if (!loading && (!firebaseUser || (dbUser && dbUser.username))) {
      navigate(dbUser?.username ? "/dashboard" : "/login", { replace: true });
    }
  }, [loading, firebaseUser, dbUser, navigate]);

  // Debounced availability check
  useEffect(() => {
    if (!username) { setStatus("idle"); return; }
    if (!USERNAME_RE.test(username)) { setStatus("invalid"); return; }

    setStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const data = await apiCheckUsername(username);
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status !== "available") return;

    setBusy(true);
    setErr("");
    try {
      await apiSetUsername(username, getToken);
      await refreshDbUser();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr(e.message || "Failed to set username");
    } finally {
      setBusy(false);
    }
  }

  const statusColor = {
    available: "#2d6a4f",
    taken:     "#c0392b",
    invalid:   "#c0392b",
    checking:  "rgba(122,90,58,0.6)",
    idle:      "transparent",
  }[status];

  const statusMsg = {
    available: "✓ Username available!",
    taken:     "✗ Username already taken",
    invalid:   "✗ 3–20 chars: letters, numbers, underscores only",
    checking:  "Checking…",
    idle:      "",
  }[status];

  if (loading) return null;

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 60 }}>
      <div className="card r2" style={{ padding: "40px 32px" }}>
        <div className="tape tl" />
        <div className="tape tr" />

        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🪴</div>
        <h1 className="h1" style={{ fontSize: 26, textAlign: "center", marginBottom: 6 }}>
          Pick your username
        </h1>
        <p className="sub" style={{ textAlign: "center", marginBottom: 28 }}>
          This is how other users will find and recognise you on the leaderboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="sectionTitle">Username</div>
          <input
            className="input"
            type="text"
            placeholder="e.g. eco_warrior_42"
            value={username}
            onChange={e => setUsername(e.target.value.trim())}
            maxLength={20}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />

          {/* Status indicator */}
          <div style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 800,
            color: statusColor,
            minHeight: 20,
          }}>
            {statusMsg}
          </div>

          {err && (
            <div className="smallNote" style={{ color: "#c0392b" }}>{err}</div>
          )}

          <div style={{ height: 16 }} />

          <button
            className="btn primary"
            type="submit"
            disabled={status !== "available" || busy}
            style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 15 }}
          >
            {busy ? "Saving…" : "Set username & continue →"}
          </button>
        </form>

        <div className="smallNote" style={{ marginTop: 16 }}>
          You can change your username later from your profile. Friends will be notified via webhook.
        </div>
      </div>
    </div>
  );
}
