/**
 * Client-side XP calculation formulas.
 * These mirror the server-side logic in server/routes/activities.js
 * so the user sees a live preview before submitting.
 */

export const ACTIVITY_LABELS = {
  farmers_market: "🌽 Farmers Market Visit",
  carpool:        "🚗 Carpooling",
  recycling:      "♻️ Recycling",
  uber_ev:        "⚡ Uber / Rideshare EV",
  ev_miles:       "🔋 EV / Hybrid Miles Driven",
};

export const ACTIVITY_DESCRIPTIONS = {
  farmers_market: "Visit a local farmers market and support sustainable agriculture.",
  carpool:        "Share a ride with others to reduce per-person emissions.",
  recycling:      "Recycle plastic, paper, or metal to divert waste from landfills.",
  uber_ev:        "Take an electric rideshare instead of a gas-powered vehicle.",
  ev_miles:       "Drive your electric or hybrid vehicle instead of a gas car.",
};

/**
 * Calculate XP for a given activity type and details object.
 * Returns { xp, breakdown } where breakdown is a human-readable string.
 */
export function calcXP(type, details = {}) {
  switch (type) {
    case "farmers_market": {
      return { xp: 50, breakdown: "Flat reward: 50 XP for visiting a farmers market" };
    }

    case "carpool": {
      const distance = Math.max(0, Number(details.distance) || 0);
      const people   = Math.max(2, Math.round(Number(details.people) || 2));
      const xp       = Math.max(5, Math.round(distance * (people - 1) * 5));
      return {
        xp,
        breakdown: `${distance} mi × ${people - 1} extra riders × 5 = ${xp} XP`
      };
    }

    case "recycling": {
      const plastic = Math.max(0, Number(details.plastic_lbs) || 0);
      const paper   = Math.max(0, Number(details.paper_lbs)   || 0);
      const metal   = Math.max(0, Number(details.metal_lbs)   || 0);
      const xp      = Math.max(1, Math.round(plastic * 20 + paper * 10 + metal * 25));
      return {
        xp,
        breakdown: `Plastic: ${plastic}lb×20 + Paper: ${paper}lb×10 + Metal: ${metal}lb×25 = ${xp} XP`
      };
    }

    case "uber_ev": {
      const distance = Math.max(0, Number(details.distance) || 0);
      const xp       = Math.max(1, Math.round(distance * 8));
      return {
        xp,
        breakdown: `${distance} mi × 8 = ${xp} XP`
      };
    }

    case "ev_miles": {
      const distance  = Math.max(0, Number(details.distance) || 0);
      const isEV      = details.vehicle_type === "ev";
      const factor    = isEV ? 10 : 5;
      const xp        = Math.max(1, Math.round(distance * factor));
      return {
        xp,
        breakdown: `${distance} mi × ${factor} (${isEV ? "EV" : "Hybrid"}) = ${xp} XP`
      };
    }

    default:
      return { xp: 0, breakdown: "Unknown activity" };
  }
}

/**
 * Format a unix timestamp (seconds) to a readable date string.
 */
export function formatDate(unixSec) {
  return new Date(unixSec * 1000).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
}

/**
 * Returns the XP tier label for a given XP value.
 */
export function getXPTier(xp) {
  if (xp >= 5000) return { label: "🌳 Forest Guardian", color: "#2d6a4f" };
  if (xp >= 2000) return { label: "🌿 Eco Champion",    color: "#40916c" };
  if (xp >= 1000) return { label: "🍃 Green Advocate",  color: "#52b788" };
  if (xp >= 500)  return { label: "🌱 Eco Starter",     color: "#74c69d" };
  if (xp >= 100)  return { label: "🌾 Seedling",        color: "#95d5b2" };
  return               { label: "🪴 Sprout",            color: "#b7e4c7" };
}
