export async function fetchMarkets() {
  const res = await fetch("/api/markets");
  if (!res.ok) throw new Error("Failed to fetch markets");
  return await res.json(); // already an array
}