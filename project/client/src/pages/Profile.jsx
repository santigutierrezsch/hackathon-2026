import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiUpdateMe, apiSetUsername, apiCheckUsername } from "../utils/api.js";
import { getXPTier, formatDate } from "../utils/xp.js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function Profile() {
  const { dbUser, getToken, refreshDbUser, logout } = useAuth();
  const navigate = useNavigate();

  // ── Webhook state ─────────────────────────────────────────────────────────
  const [webhook,     setWebhook]     = useState(dbUser?.webhook_url || "");
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookMsg,  setWebhookMsg]  = useState("");

  // ── Username change state ─────────────────────────────────────────────────
  const [newUsername,   setNewUsername]   = useState("");
  const [unameStatus,   setUnameStatus]   = useState("idle"); // idle|checking|available|taken|invalid
  const [unameSaving,   setUnameSaving]   = useState(false);
  const [unameMsg,      setUnameMsg]      = useState("");
  const [showUnameForm, setShowUnameForm] = useState(false);

  const tier = getXPTier(dbUser?.xp || 0);

  // ── Debounced username check ──────────────────────────────────────────────
  let unameTimer = null;
  function handleUnameChange(val) {
    setNewUsername(val);
    setUnameMsg("");
    clearTimeout(unameTimer);
    if (!val) { setUnameStatus("idle"); return; }
    if (!USERNAME_RE.test(val)) { setUnameStatus("invalid"); return; }
    if (val === dbUser?.username) { setUnameStatus("idle"); return; }
    setUnameStatus("checking");
    unameTimer = setTimeout(async () => {
      try {
        const data = await apiCheckUsername(val);
        setUnameStatus(data.available ? "available" : "taken");
      } catch { setUnameStatus("idle"); }
    }, 400);
  }

  async function handleSaveUsername() {
    if (unameStatus !== "available") return;
    setUnameSaving(true);
    setUnameMsg("");
    try {
      await apiSetUsername(newUsername, getToken);
      await refreshDbUser();
      setNewUsername("");
      setUnameStatus("idle");
      setShowUnameForm(false);
      setUnameMsg("Username updated! Friends have been notified via webhook.");
    } catch (e) {
      setUnameMsg(e.message || "Failed to update username");
    } finally {
      setUnameSaving(false);
    }
  }

  // ── Save webhook ──────────────────────────────────────────────────────────
  async function handleSaveWebhook() {
    setWebhookSaving(true);
    setWebhookMsg("");
    try {
      await apiUpdateMe({ webhook_url: webhook }, getToken);
      await refreshDbUser();
      setWebhookMsg("Webhook URL saved!");
    } catch (e) {
      setWebhookMsg(e.message || "Failed to save webhook");
    } finally {
      setWebhookSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const statusColor = { available: "#2d6a4f", taken: "#c0392b", invalid: "#c0392b", checking: "rgba(122,90,58,0.6)", idle: "transparent" }[unameStatus];
  const statusMsg   = { available: "✓ Available!", taken: "✗ Already taken", invalid: "✗ 3–20 chars: letters, numbers, underscores", checking: "Checking…", idle: "" }[unameStatus];

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Profile</h1>
            <p className="sub">Manage your account and settings.</p>
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="tape tl" />
        <div className="tape tr" />

        <div className="space">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {dbUser?.photo_url ? (
              <img src={dbUser.photo_url} alt="avatar"
                style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--border)" }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--blue)", border: "2px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 900,
              }}>
                {(dbUser?.username || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>@{dbUser?.username}</div>
              <div style={{ fontSize: 13, color: "rgba(122,90,58,0.7)" }}>{dbUser?.email}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: tier.color, marginTop: 2 }}>{tier.label}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 1000 }}>{(dbUser?.xp || 0).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "rgba(122,90,58,0.6)", fontWeight: 800 }}>TOTAL XP</div>
          </div>
        </div>

        <div className="divider" />

        <div className="kv">
          <span className="k">Member since</span>
          <span className="v">{dbUser?.created_at ? formatDate(dbUser.created_at) : "—"}</span>
        </div>
        <div className="kv">
          <span className="k">Display name</span>
          <span className="v">{dbUser?.display_name || "—"}</span>
        </div>
      </div>

      {/* Change username */}
      <div className="card r2" style={{ marginBottom: 16 }}>
        <div className="tape tl" />
        <div className="sectionTitle">Change username</div>

        {!showUnameForm ? (
          <div>
            <div className="meta">Current: <b>@{dbUser?.username}</b></div>
            <div style={{ height: 10 }} />
            <button className="btn" onClick={() => setShowUnameForm(true)}>
              Change username
            </button>
            {unameMsg && (
              <div className="smallNote" style={{ color: "#2d6a4f", marginTop: 8 }}>{unameMsg}</div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="input"
              placeholder="New username…"
              value={newUsername}
              onChange={e => handleUnameChange(e.target.value.trim())}
              maxLength={20}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            <div style={{ fontSize: 13, fontWeight: 800, color: statusColor, minHeight: 18 }}>
              {statusMsg}
            </div>
            <div className="row">
              <button className="btn primary"
                onClick={handleSaveUsername}
                disabled={unameStatus !== "available" || unameSaving}>
                {unameSaving ? "Saving…" : "Save username"}
              </button>
              <button className="btn" onClick={() => { setShowUnameForm(false); setNewUsername(""); setUnameStatus("idle"); }}>
                Cancel
              </button>
            </div>
            {unameMsg && (
              <div className="smallNote" style={{ color: "#c0392b" }}>{unameMsg}</div>
            )}
            <div className="smallNote">
              ⚠️ Changing your username will fire a webhook notification to all your friends.
            </div>
          </div>
        )}
      </div>

      {/* Webhook settings */}
      <div className="card r3" style={{ marginBottom: 16 }}>
        <div className="tape tr" />
        <div className="sectionTitle">Webhook URL</div>
        <div className="meta" style={{ marginBottom: 10 }}>
          When a friend changes their username, a <b>POST</b> request will be sent to your webhook URL with the old and new username.
        </div>

        <div className="bigStat" style={{ marginBottom: 12 }}>
          <div className="headline" style={{ fontSize: 13 }}>Payload example</div>
          <pre className="code" style={{ marginTop: 8 }}>{JSON.stringify({
            event: "username_changed",
            old_username: "old_name",
            new_username: "new_name",
            timestamp: "2025-01-01T00:00:00.000Z"
          }, null, 2)}</pre>
        </div>

        <input
          className="input"
          type="url"
          placeholder="https://your-server.com/webhook"
          value={webhook}
          onChange={e => { setWebhook(e.target.value); setWebhookMsg(""); }}
        />

        <div style={{ height: 10 }} />
        <div className="row">
          <button className="btn primary" onClick={handleSaveWebhook} disabled={webhookSaving}>
            {webhookSaving ? "Saving…" : "Save webhook URL"}
          </button>
          {webhook && (
            <button className="btn" onClick={() => { setWebhook(""); setWebhookMsg(""); }}>
              Clear
            </button>
          )}
        </div>
        {webhookMsg && (
          <div className="smallNote" style={{ color: webhookMsg.includes("saved") ? "#2d6a4f" : "#c0392b", marginTop: 8 }}>
            {webhookMsg}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="card r4">
        <div className="sectionTitle">Account</div>
        <button className="btn" onClick={handleLogout} style={{ marginTop: 4 }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
