import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiGlobalLeaderboard, apiFriendsLeaderboard } from "../utils/api.js";
import { getXPTier } from "../utils/xp.js";

const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderboardRow({ entry, isMe }) {
  const tier = getXPTier(entry.xp || 0);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: "2px dotted rgba(122,90,58,0.14)",
      background: isMe ? "rgba(191,233,211,0.35)" : "transparent",
      borderRadius: isMe ? 10 : 0,
      paddingLeft: isMe ? 8 : 0,
      paddingRight: isMe ? 8 : 0,
    }}>
      <div style={{
        width: 36, textAlign: "center", flexShrink: 0,
        fontSize: entry.rank <= 3 ? 22 : 14, fontWeight: 900,
        color: entry.rank <= 3 ? undefined : "rgba(122,90,58,0.6)",
      }}>
        {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
      </div>

      <Link to={`/user/${entry.username}`} style={{ textDecoration: "none" }}>
        {entry.photo_url ? (
          <img src={entry.photo_url} alt="avatar"
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "var(--blue)", border: "2px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14,
          }}>
            {(entry.username || "?")[0].toUpperCase()}
          </div>
        )}
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
          <Link to={`/user/${entry.username}`} style={{ textDecoration: "none" }}>{entry.username}</Link>
          {isMe && <span className="badge ok" style={{ fontSize: 10, padding: "2px 7px" }}>YOU</span>}
        </div>
        <div style={{ fontSize: 12, color: tier.color, fontWeight: 800 }}>{tier.label}</div>
      </div>

      <div style={{ fontWeight: 1000, fontSize: 16, color: "var(--brown)", flexShrink: 0 }}>
        {(entry.xp || 0).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(122,90,58,0.6)" }}>XP</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { isLoggedIn, dbUser, getToken } = useAuth();
  const [tab, setTab] = useState("global");
  const [global, setGlobal] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingG, setLoadingG] = useState(true);
  const [loadingF, setLoadingF] = useState(false);
  const [errG, setErrG] = useState("");
  const [errF, setErrF] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoadingG(true);
        const data = await apiGlobalLeaderboard(50);
        setGlobal(data.leaderboard || []);
      } catch (e) {
        setErrG(e.message);
      } finally {
        setLoadingG(false);
      }
    })();
  }, []);

  const loadFriends = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingF(true);
      setErrF("");
      const data = await apiFriendsLeaderboard(getToken);
      setFriends(data.leaderboard || []);
    } catch (e) {
      setErrF(e.message);
    } finally {
      setLoadingF(false);
    }
  }, [isLoggedIn, getToken]);

  useEffect(() => {
    if (tab === "friends") loadFriends();
  }, [tab, loadFriends]);

  const myUsername = dbUser?.username;

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="h1">Leaderboard</h1>
            <p className="sub">See who is making the biggest eco impact.</p>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <button className={`btn ${tab === "global" ? "primary" : ""}`} onClick={() => setTab("global")}>Global</button>
        <button className={`btn ${tab === "friends" ? "primary" : ""}`} onClick={() => setTab("friends")} disabled={!isLoggedIn}>
          Social
        </button>
        {!isLoggedIn && <span className="badge" style={{ fontSize: 12 }}>Sign in for social tab</span>}
      </div>

      {tab === "global" && (
        <div className="card r1">
          <div className="sectionTitle">Top 50</div>
          {loadingG && <div className="meta">Loading...</div>}
          {errG && <div className="meta" style={{ color: "#c0392b" }}>{errG}</div>}
          {!loadingG && !errG && global.length === 0 && <div className="meta">No users yet.</div>}
          {!loadingG && global.map(entry => (
            <LeaderboardRow key={entry.username} entry={entry} isMe={entry.username === myUsername} />
          ))}
        </div>
      )}

      {tab === "friends" && (
        <div className="card r2">
          <div className="sectionTitle">Social + You</div>
          {loadingF && <div className="meta">Loading...</div>}
          {errF && <div className="meta" style={{ color: "#c0392b" }}>{errF}</div>}
          {!loadingF && !errF && friends.length === 0 && (
            <div className="meta">
              No connections yet. Open <Link to="/social" style={{ fontWeight: 900 }}>Social</Link> to add people.
            </div>
          )}
          {!loadingF && friends.map(entry => (
            <LeaderboardRow key={entry.username} entry={entry} isMe={entry.isMe} />
          ))}
        </div>
      )}
    </div>
  );
}
