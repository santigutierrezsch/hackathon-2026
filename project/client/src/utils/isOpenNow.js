export function isOpenNow(market) {
  if (!market?.daysOpen?.length || !market?.hours?.open || !market?.hours?.close)
    return false;

  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });

  if (!market.daysOpen.includes(todayName)) return false;

  const [openH, openM] = market.hours.open.split(":").map(Number);
  const [closeH, closeM] = market.hours.close.split(":").map(Number);

  const open = new Date(now);
  open.setHours(openH, openM, 0, 0);

  const close = new Date(now);
  close.setHours(closeH, closeM, 0, 0);

  return now >= open && now <= close;
}