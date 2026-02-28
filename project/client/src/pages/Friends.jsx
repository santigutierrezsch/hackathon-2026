import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  apiGetFriends,
  apiGetFriendRequests,
  apiSendFriendRequest,
  apiAcceptFriendRequest,
  apiDeclineFriendRequest,
  apiCancelFriendRequest,
  apiRemoveFriend,
} from "../utils/api.js";
import { getXPTier } from "../utils/xp.js";

function UserCard({ username, display_name, photo_url, xp, badge, badgeClass, actions }) {
  const tier = getXPTier(xp || 0);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", borderBottom: "2px dotted rgba(122,90,58,0.14)",
    }}>
      {photo_url ? (
        <img src={photo_url} alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover",
            border: "2px solid var(--border)", flexShrink: 0 }} />
      ) : (
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: "var(--blue)", border: "2px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 16,
        }}>
          {(username || "?")[0].toUpperCase()}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15 }}>{username}</div>
        <div style={{ fontSize: 12, color: tier.color, fontWeight: 800 }}>{tier.label}</div>
        <div style={{ fontSize: 12, color: "rgba(122,90,58,0.6)" }}>{(xp || 0).toLocaleString()} XP</div>
      </div>
      {badge && <span className={`badge ${badgeClass || ""}`}>{badge}</span>}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  );
}

export default function Friends() {
  const { getToken, dbUser } = useAuth();

  const [friends,  setFriends]  = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState("");

  const [searchVal, setSearchVal] = useState("");
  const [sendErr,   setSendErr]   = useState("");
  const [sendOk,    setSendOk]    = useState("");
  const [sending,   setSending]   = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const [fData, rData] = await Promise.all([
        apiGetFriends(getToken),
        apiGetFriendRequests(getToken),
      ]);
      setFriends(fData.friends   || []);
      setIncoming(rData.incoming || []);
      setOutgoing(rData.outgoing || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  async function handleSendRequest(e) {
    e.preventDefault();
    const target = searchVal.trim().replace(/^@+/, "");
    if (!target) return;
    setSendErr(""); setSendOk(""); setSending(true);
    try {
      await apiSendFriendRequest(target, getToken);
      setSendOk(`Friend request sent to @${target}!`);
      setSearchVal("");
      await load();
    } catch (e) {
      setSendErr(e.message);
    } finally {
      setSending(false);
    }
  }

  async function handleAccept(id) {
    try { await apiAcceptFriendRequest(id, getToken); await load(); }
    catch (e) { alert(e.message); }
  }

  async function handleDecline(id) {
    try { await apiDeclineFriendRequest(id, getToken); await load(); }
    catch (e) { alert(e.message); }
  }

  async function handleCancel(id) {
    try { await apiCancelFriendRequest(id, getToken); await load(); }
    catch (e) { alert(e.message); }
  }

  async function handleRemove(username) {
    if (!confirm(`Remove @${username} as a friend?`)) return;
    try { await apiRemoveFriend(username, getToken); await load(); }
    catch (e) { alert(e.message); }
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Friends</h1>
            <p className="sub">Connect with others and compare your eco impact.</p>
          </div>
        </div>
      </div>

      {err && <div className="card" style={{ color: "#c0392b", marginBottom: 12 }}>{err}</div>}

      {/* Send friend request */}
      <div className="card r1" style={{ marginBottom: 16 }}>
        <div className="tape tl" />
        <div className="sectionTitle">Add a friend</div>
        <form onSubmit={handleSendRequest} style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Enter username…"
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setSendErr(""); setSendOk(""); }}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="btn primary" type="submit" disabled={sending || !searchVal.trim()}
            style={{ flexShrink: 0 }}>
            {sending ? "Sending…" : "Send Request"}
          </button>
        </form>
        {sendErr && <div className="smallNote" style={{ color: "#c0392b", marginTop: 6 }}>{sendErr}</div>}
        {sendOk  && <div className="smallNote" style={{ color: "#2d6a4f", marginTop: 6 }}>{sendOk}</div>}
      </div>

      <div className="grid">
        {/* Incoming requests */}
        <div className="card r2">
          <div className="tape tl" />
          <div className="sectionTitle">
            Incoming requests
            {incoming.length > 0 && (
              <span className="badge ok" style={{ marginLeft: 8, fontSize: 11 }}>{incoming.length}</span>
            )}
          </div>

          {loading && <div className="meta">Loading…</div>}
          {!loading && incoming.length === 0 && (
            <div className="meta">No pending requests.</div>
          )}
          {!loading && incoming.map(r => (
            <UserCard
              key={r.id}
              username={r.from_user}
              display_name={r.display_name}
              photo_url={r.photo_url}
              xp={r.xp}
              actions={[
                <button key="a" className="btn primary" style={{ padding: "6px 10px", fontSize: 12 }}
                  onClick={() => handleAccept(r.id)}>Accept</button>,
                <button key="d" className="btn" style={{ padding: "6px 10px", fontSize: 12 }}
                  onClick={() => handleDecline(r.id)}>Decline</button>,
              ]}
            />
          ))}
        </div>

        {/* Outgoing requests */}
        <div className="card r3">
          <div className="tape tr" />
          <div className="sectionTitle">Sent requests</div>

          {loading && <div className="meta">Loading…</div>}
          {!loading && outgoing.length === 0 && (
            <div className="meta">No outgoing requests.</div>
          )}
          {!loading && outgoing.map(r => (
            <UserCard
              key={r.id}
              username={r.to_user}
              display_name={r.display_name}
              photo_url={r.photo_url}
              xp={r.xp}
              badge="Pending"
              actions={[
                <button key="c" className="btn" style={{ padding: "6px 10px", fontSize: 12 }}
                  onClick={() => handleCancel(r.id)}>Cancel</button>,
              ]}
            />
          ))}
        </div>
      </div>

      {/* Friends list */}
      <div className="sectionTitle" style={{ marginTop: 16 }}>
        Your friends ({friends.length})
      </div>
      <div className="card r4">
        <div className="tape tl" />
        <div className="tape tr" />

        {loading && <div className="meta">Loading…</div>}
        {!loading && friends.length === 0 && (
          <div className="meta">
            No friends yet. Send a request above to get started! 🌱
          </div>
        )}
        {!loading && friends.map(f => (
          <UserCard
            key={f.username}
            username={f.username}
            display_name={f.display_name}
            photo_url={f.photo_url}
            xp={f.xp}
            actions={[
              <button key="r" className="btn" style={{ padding: "6px 10px", fontSize: 12 }}
                onClick={() => handleRemove(f.username)}>Remove</button>,
            ]}
          />
        ))}
      </div>
    </div>
  );
}
