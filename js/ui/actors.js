// Dynamic map overlay rendering riders, routes, active homes, and arrival moments.
// Uses icons.js, cell coordinates, and simulation frame state.
// Used by play screen, race screen, home live preview, and self-test.

import { getHouseSvg, getScooterSvg } from "./icons.js";

const RIDER_COLORS = [
  "var(--rider-1)",
  "var(--rider-2)",
  "var(--rider-3)",
  "var(--rider-4)"
];

function cellCenter(cell, cols = 13) {
  let c, r;
  if (Array.isArray(cell)) {
    [c, r] = cell;
  } else if (typeof cell === "number") {
    c = cell % cols;
    r = Math.floor(cell / cols);
  } else if (cell && typeof cell === "object") {
    c = cell.c !== undefined ? cell.c : 0;
    r = cell.r !== undefined ? cell.r : 0;
  } else {
    c = 0;
    r = 0;
  }
  return { x: c * 40 + 20, y: r * 40 + 20 };
}

export function renderActorsSvg(state) {
  const {
    riders = [],
    orders = [],
    progress = 0,
    riderScale = 1.0,
    moments = []
  } = state;

  // 1. Routes
  const routesSvg = riders.map((rider, idx) => {
    if (!rider || !rider.route || rider.route.length === 0) return "";
    const color = RIDER_COLORS[idx % RIDER_COLORS.length];
    const prevPos = cellCenter(rider.prevCell !== undefined ? rider.prevCell : rider.cell);
    const curPos = cellCenter(rider.cell);
    const startX = prevPos.x + (curPos.x - prevPos.x) * progress;
    const startY = prevPos.y + (curPos.y - prevPos.y) * progress;

    const points = [[startX, startY]];
    for (const step of rider.route) {
      const p = cellCenter(step);
      points.push([p.x, p.y]);
    }

    const d = points.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
    const isToShop = rider.phase === "toShop";
    const dashArray = isToShop ? 'stroke-dasharray="4 4"' : "";

    return `<path d="${d}" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" ${dashArray} class="rider-route-line" opacity="0.85"/>`;
  }).join("");

  // 2. Homes for live orders
  const homesSvg = orders.map((order) => {
    if (!order || (order.status !== "waiting" && order.status !== "assigned")) return "";
    const pos = cellCenter(order.homeCell || order.home);
    const isAssigned = order.status === "assigned" && order.rider;
    let color = "var(--warn)";
    if (isAssigned) {
      const rIdx = parseInt(String(order.rider).replace(/\D/g, ""), 10) - 1;
      color = RIDER_COLORS[(rIdx >= 0 ? rIdx : 0) % RIDER_COLORS.length];
    }
    const svgIcon = getHouseSvg(color, 24);
    return `
      <g class="home-marker" transform="translate(${pos.x - 12}, ${pos.y - 12})" data-order-id="${order.id}">
        ${svgIcon}
      </g>`;
  }).join("");

  // 3. Riders (smooth interpolation + scale)
  const ridersSvg = riders.map((rider, idx) => {
    if (!rider) return "";
    const color = RIDER_COLORS[idx % RIDER_COLORS.length];
    const prev = cellCenter(rider.prevCell !== undefined ? rider.prevCell : rider.cell);
    const cur = cellCenter(rider.cell);
    const x = prev.x + (cur.x - prev.x) * progress;
    const y = prev.y + (cur.y - prev.y) * progress;

    const dir = cur.x < prev.x ? -1 : 1;
    const hasFood = rider.phase === "toHome" || (rider.jobs && (rider.jobs.length > 0 || (typeof rider.jobs.size === "number" && rider.jobs.size > 0)));
    const badgeNum = idx + 1;
    const scooter = getScooterSvg(color, badgeNum, hasFood, dir);

    const scaleTransform = riderScale !== 1.0 ? `scale(${riderScale})` : "";
    return `
      <g class="rider-actor" transform="translate(${x - 17}, ${y - 17}) ${scaleTransform}" data-rider-id="${rider.id || idx + 1}">
        ${scooter}
      </g>`;
  }).join("");

  // 4. Moments (delivery rings, rising chip)
  const momentsSvg = moments.map((m) => {
    const pos = cellCenter(m.cell);
    const isLate = m.late;
    const chipBg = isLate ? "var(--warn)" : "var(--brand)";
    return `
      <g class="delivery-moment" transform="translate(${pos.x}, ${pos.y})">
        <circle cx="0" cy="0" r="22" fill="none" stroke="${chipBg}" stroke-width="2.5" class="moment-ring"/>
        <g transform="translate(0, -22)" class="moment-chip">
          <rect x="-24" y="-12" width="48" height="18" rx="9" fill="${chipBg}"/>
          <text x="0" y="0" fill="#FFFFFF" font-size="9" font-weight="800" text-anchor="middle" font-family="sans-serif">${m.mins} mins</text>
        </g>
      </g>`;
  }).join("");

  return `
    <g class="actors-overlay">
      <!-- Active Delivery Routes -->
      <g class="actors-routes">${routesSvg}</g>
      <!-- Active Customer Homes -->
      <g class="actors-homes">${homesSvg}</g>
      <!-- Riders -->
      <g class="actors-riders">${ridersSvg}</g>
      <!-- Delivery Arrival Moments -->
      <g class="actors-moments">${momentsSvg}</g>
    </g>`;
}
