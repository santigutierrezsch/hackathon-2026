// ── Base helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}, getToken = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (getToken) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.hint
      ? `${data.error || "Request failed"}: ${data.hint}`
      : (data?.error || `Request failed (${res.status})`);
    throw new Error(msg);
  }
  return data;
}

// ── Markets (existing) ────────────────────────────────────────────────────────

export async function fetchMarkets() {
  const res = await fetch("/api/markets");
  if (!res.ok) throw new Error("Failed to fetch markets");
  return await res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(getToken) {
  return apiFetch("/api/auth/login", { method: "POST" }, getToken);
}

export async function apiSetUsername(username, getToken) {
  return apiFetch("/api/auth/set-username", {
    method: "POST",
    body: JSON.stringify({ username })
  }, getToken);
}

export async function apiCheckUsername(username) {
  return apiFetch("/api/auth/check-username", {
    method: "POST",
    body: JSON.stringify({ username })
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function apiGetMe(getToken) {
  return apiFetch("/api/users/me", {}, getToken);
}

export async function apiUpdateMe(updates, getToken) {
  return apiFetch("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(updates)
  }, getToken);
}

export async function apiGetUser(username) {
  return apiFetch(`/api/users/${username}`);
}

// ── Activities ────────────────────────────────────────────────────────────────

export async function apiLogActivity(type, details, getToken) {
  return apiFetch("/api/activities", {
    method: "POST",
    body: JSON.stringify({ type, details })
  }, getToken);
}

export async function apiGetMyActivities(getToken, limit = 20, offset = 0) {
  return apiFetch(`/api/activities/me?limit=${limit}&offset=${offset}`, {}, getToken);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function apiGlobalLeaderboard(limit = 50) {
  return apiFetch(`/api/leaderboard/global?limit=${limit}`);
}

export async function apiFriendsLeaderboard(getToken) {
  return apiFetch("/api/leaderboard/friends", {}, getToken);
}

// ── Garden ────────────────────────────────────────────────────────────────────

export async function apiGetGarden(getToken) {
  return apiFetch("/api/garden", {}, getToken);
}

export async function apiUpdateGarden(garden, getToken) {
  return apiFetch("/api/garden", {
    method: "PUT",
    body: JSON.stringify({ garden })
  }, getToken);
}

export async function apiBuyGardenRow(getToken) {
  return apiFetch("/api/garden/buy-row", { method: "POST" }, getToken);
}

export async function apiBuyGardenCol(getToken) {
  return apiFetch("/api/garden/buy-col", { method: "POST" }, getToken);
}

export async function apiBuyGardenPlant(plant, cost, getToken) {
  return apiFetch("/api/garden/buy-plant", {
    method: "POST",
    body: JSON.stringify({ plant, cost })
  }, getToken);
}

export async function apiGetPublicGarden(username) {
  return apiFetch(`/api/garden/${username}`);
}

// ── Friends ───────────────────────────────────────────────────────────────────

export async function apiGetFriends(getToken) {
  return apiFetch("/api/friends", {}, getToken);
}

export async function apiGetFriendRequests(getToken) {
  return apiFetch("/api/friends/requests", {}, getToken);
}

export async function apiSendFriendRequest(username, getToken) {
  return apiFetch("/api/friends/request", {
    method: "POST",
    body: JSON.stringify({ username })
  }, getToken);
}

export async function apiAcceptFriendRequest(id, getToken) {
  return apiFetch(`/api/friends/accept/${id}`, { method: "POST" }, getToken);
}

export async function apiDeclineFriendRequest(id, getToken) {
  return apiFetch(`/api/friends/decline/${id}`, { method: "POST" }, getToken);
}

export async function apiCancelFriendRequest(id, getToken) {
  return apiFetch(`/api/friends/cancel/${id}`, { method: "DELETE" }, getToken);
}

export async function apiRemoveFriend(username, getToken) {
  return apiFetch(`/api/friends/${username}`, { method: "DELETE" }, getToken);
}
