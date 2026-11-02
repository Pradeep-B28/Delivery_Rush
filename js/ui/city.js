// Static city SVG renderer with terrain, buildings, roads, river, park, and shops.
// Uses CITY content, icons.js, and CSS map tokens.
// Used by play screen, result screen, home screen, and self-test.

import { CITY } from "../content.js";
import { FOOD_ICONS } from "./icons.js";

export function renderCitySvg(mood = "day", closedBridges = []) {
  const isRain = mood === "rain";
  const isEvening = mood === "evening";
  const riverY = isRain ? 238 : 240;
  const riverH = isRain ? 44 : 40;

  // 1. Buildings generator
  const buildingsSvg = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      if (CITY.map[r][c] === "#") {
        const x = c * 40;
        const y = r * 40;
        const seed = (c * 17 + r * 31) % 5;
        buildingsSvg.push(renderBuildingBlock(x, y, seed, isEvening));
      }
    }
  }

  // 2. Continuous road network segments
  const roadPaths = [
    // Horizontal main roads
    "M 20 20 L 500 20",
    "M 20 180 L 500 180",
    "M 20 340 L 500 340",
    "M 20 500 L 500 500",
    // Park bypass horizontals
    "M 20 100 L 180 100",
    "M 340 100 L 500 100",
    // Southern horizontal roads
    "M 20 420 L 260 420",
    "M 340 420 L 500 420",
    // Vertical main roads
    "M 20 20 L 20 230", "M 20 290 L 20 500",
    "M 180 20 L 180 230", "M 180 290 L 180 500",
    "M 260 20 L 260 230", "M 260 290 L 260 500",
    "M 420 20 L 420 230", "M 420 290 L 420 500",
    "M 500 20 L 500 230", "M 500 290 L 500 500",
    // Bridge vertical roads
    "M 100 20 L 100 500",
    "M 340 20 L 340 500"
  ];
  const combinedRoadPath = roadPaths.join(" ");

  // 3. Bridges & flood status
  const westClosed = closedBridges.includes("west") || closedBridges.includes(80) || closedBridges.some((c) => Array.isArray(c) && c[0] === 2 && c[1] === 6);
  const eastClosed = closedBridges.includes("east") || closedBridges.includes(86) || closedBridges.some((c) => Array.isArray(c) && c[0] === 8 && c[1] === 6);

  // 4. Evening street lamps
  let eveningLamps = "";
  if (isEvening) {
    const lampCorners = [
      [20, 20], [180, 20], [340, 20], [500, 20],
      [100, 180], [260, 180], [420, 180],
      [100, 340], [260, 340], [420, 340],
      [20, 500], [180, 500], [340, 500], [500, 500]
    ];
    eveningLamps = lampCorners.map(([lx, ly]) => `
      <circle cx="${lx}" cy="${ly}" r="12" fill="#FDE68A" opacity="0.12"/>
      <circle cx="${lx}" cy="${ly}" r="6" fill="#FDE68A" opacity="0.25"/>
      <circle cx="${lx}" cy="${ly}" r="2" fill="#FEF08A"/>
    `).join("");
  }

  // 5. Shops
  const shopsSvg = CITY.shops.map((shop) => {
    const [c, r] = shop.cell;
    const cx = c * 40 + 20;
    const cy = r * 40 + 20;
    const foodIcon = FOOD_ICONS[shop.icon] || FOOD_ICONS.dosa;
    return `
      <g class="shop-node" data-shop-id="${shop.id}" transform="translate(${cx}, ${cy})">
        <ellipse cx="0" cy="12" rx="10" ry="3" fill="rgba(0,0,0,0.18)" class="shop-shadow"/>
        <line x1="0" y1="4" x2="0" y2="12" stroke="#64748B" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="0" cy="-2" r="17" class="shop-pulse-ring" fill="none" stroke="var(--brand)" stroke-width="2" opacity="0"/>
        <rect x="-15" y="-17" width="30" height="30" rx="9" fill="var(--surface)" stroke="var(--border)" stroke-width="1.5" class="shop-tile"/>
        <g transform="translate(-15, -17)">
          ${foodIcon}
        </g>
        <g class="shop-tooltip" transform="translate(0, -25)" opacity="0">
          <rect x="-42" y="-14" width="84" height="18" rx="9" fill="var(--text)" opacity="0.9"/>
          <text x="0" y="-2" fill="var(--bg)" font-size="9" font-weight="700" text-anchor="middle" font-family="sans-serif">${shop.name.split(" ")[0]}</text>
        </g>
      </g>`;
  }).join("");

  // 6. Area labels
  const areaLabelsSvg = CITY.areas.map((a) => {
    const [c, r] = a.cell;
    const cx = c * 40 + 20;
    const cy = r * 40 + 20;
    return `<text x="${cx}" y="${cy}" class="map-area-label" fill="var(--map-label)" font-size="10" font-weight="700" letter-spacing="0.04em" text-anchor="middle" font-family="sans-serif">${a.name}</text>`;
  }).join("");

  return `
    <svg viewBox="0 0 520 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="city-svg" data-mood="${mood}">
      <defs>
        <filter id="blockShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.14" />
        </filter>
        <pattern id="floodHazardStripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#EF4444" stroke-width="4"/>
          <line x1="4" y1="0" x2="4" y2="8" stroke="#FFFFFF" stroke-width="4"/>
        </pattern>
      </defs>

      <!-- 1. Land Base -->
      <rect width="520" height="520" rx="20" ry="20" fill="var(--map-land)"/>

      <!-- 2. River -->
      <rect x="0" y="${riverY}" width="520" height="${riverH}" fill="var(--map-water)" class="city-river"/>
      <path d="M 30 252 Q 60 248 90 252 T 150 252 M 210 266 Q 240 262 270 266 T 330 266 M 390 254 Q 420 250 450 254 T 500 254" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none" stroke-linecap="round"/>

      <!-- 3. Park -->
      <g class="city-park">
        <rect x="202" y="82" width="116" height="76" rx="14" ry="14" fill="var(--map-park)"/>
        <path d="M 212 120 Q 260 105 308 120" stroke="var(--map-land)" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.65"/>
        <!-- Trees -->
        ${renderTree(222, 100)}
        ${renderTree(248, 136)}
        ${renderTree(274, 98)}
        ${renderTree(298, 134)}
        ${renderTree(236, 112)}
        ${renderTree(284, 122)}
      </g>

      <!-- 4. Roads (Under-layer edge stroke + Main road surface + Dashed centre line) -->
      <path d="${combinedRoadPath}" stroke="var(--map-road-edge)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none" class="road-edge"/>
      <path d="${combinedRoadPath}" stroke="var(--map-road)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" class="road-surface"/>
      <path d="${combinedRoadPath}" stroke="var(--map-road-edge)" stroke-width="2" stroke-dasharray="6 8" stroke-linecap="round" fill="none" opacity="0.5" class="road-centerline"/>

      <!-- 5. Bridges (West at column 2, East at column 8) -->
      ${renderBridge(80, 240, westClosed, "west")}
      ${renderBridge(320, 240, eastClosed, "east")}

      <!-- 6. Buildings -->
      <g class="city-buildings">
        ${buildingsSvg.join("")}
      </g>

      <!-- 7. Evening Street Lamps -->
      ${eveningLamps}

      <!-- 8. Area Labels -->
      <g class="city-area-labels">
        ${areaLabelsSvg}
      </g>

      <!-- 9. Shops -->
      <g class="city-shops">
        ${shopsSvg}
      </g>
    </svg>`;
}

function renderTree(cx, cy) {
  return `
    <g class="park-tree">
      <ellipse cx="${cx}" cy="${cy + 5}" rx="7" ry="2.5" fill="rgba(0,0,0,0.18)"/>
      <circle cx="${cx}" cy="${cy}" r="7.5" fill="var(--map-tree)"/>
      <circle cx="${cx - 1.5}" cy="${cy - 2}" r="5" fill="var(--map-tree)" opacity="0.8"/>
    </g>`;
}

function renderBuildingBlock(x, y, seed, isEvening) {
  const windowFill = isEvening ? 'fill="var(--map-window)"' : 'fill="transparent"';
  if (seed === 0) {
    return `
      <g class="bldg-block" filter="url(#blockShadow)">
        <rect x="${x + 3}" y="${y + 3}" width="16" height="34" rx="3" fill="var(--map-block)"/>
        <rect x="${x + 21}" y="${y + 6}" width="16" height="31" rx="3" fill="var(--map-block-2)"/>
        ${isEvening ? `
          <rect x="${x + 6}" y="${y + 8}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 6}" y="${y + 16}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 24}" y="${y + 11}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 24}" y="${y + 19}" width="3" height="3" rx="0.5" ${windowFill}/>
        ` : ''}
      </g>`;
  } else if (seed === 1) {
    return `
      <g class="bldg-block" filter="url(#blockShadow)">
        <rect x="${x + 3}" y="${y + 4}" width="34" height="15" rx="3" fill="var(--map-block)"/>
        <rect x="${x + 6}" y="${y + 21}" width="28" height="16" rx="3" fill="var(--map-block-2)"/>
        ${isEvening ? `
          <rect x="${x + 8}" y="${y + 8}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 18}" y="${y + 8}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 28}" y="${y + 8}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 11}" y="${y + 25}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 22}" y="${y + 25}" width="3" height="3" rx="0.5" ${windowFill}/>
        ` : ''}
      </g>`;
  } else if (seed === 2) {
    return `
      <g class="bldg-block" filter="url(#blockShadow)">
        <rect x="${x + 3}" y="${y + 3}" width="15" height="16" rx="3" fill="var(--map-block-2)"/>
        <rect x="${x + 20}" y="${y + 3}" width="17" height="16" rx="3" fill="var(--map-block)"/>
        <rect x="${x + 5}" y="${y + 21}" width="30" height="16" rx="3" fill="var(--map-block)"/>
        ${isEvening ? `
          <rect x="${x + 8}" y="${y + 7}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 25}" y="${y + 7}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 10}" y="${y + 25}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 20}" y="${y + 25}" width="3" height="3" rx="0.5" ${windowFill}/>
        ` : ''}
      </g>`;
  } else if (seed === 3) {
    return `
      <g class="bldg-block" filter="url(#blockShadow)">
        <rect x="${x + 4}" y="${y + 4}" width="32" height="32" rx="4" fill="var(--map-block)"/>
        <rect x="${x + 8}" y="${y + 8}" width="24" height="24" rx="2" fill="var(--map-block-2)"/>
        ${isEvening ? `
          <rect x="${x + 12}" y="${y + 12}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 20}" y="${y + 12}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 12}" y="${y + 20}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 20}" y="${y + 20}" width="3" height="3" rx="0.5" ${windowFill}/>
        ` : ''}
      </g>`;
  } else {
    return `
      <g class="bldg-block" filter="url(#blockShadow)">
        <rect x="${x + 4}" y="${y + 5}" width="18" height="30" rx="3" fill="var(--map-block-2)"/>
        <rect x="${x + 24}" y="${y + 4}" width="13" height="31" rx="3" fill="var(--map-block)"/>
        ${isEvening ? `
          <rect x="${x + 8}" y="${y + 9}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 8}" y="${y + 17}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 26}" y="${y + 9}" width="3" height="3" rx="0.5" ${windowFill}/>
          <rect x="${x + 26}" y="${y + 17}" width="3" height="3" rx="0.5" ${windowFill}/>
        ` : ''}
      </g>`;
  }
}

function renderBridge(x, y, isClosed, id) {
  if (isClosed) {
    return `
      <g class="city-bridge bridge-flooded" data-bridge="${id}">
        <!-- River water flowing over submerged bridge -->
        <rect x="${x + 7}" y="${y}" width="26" height="40" fill="var(--map-water)" class="bridge-submerged"/>
        <!-- Side rails damaged / waterlogged -->
        <line x1="${x + 7}" y1="${y}" x2="${x + 7}" y2="${y + 40}" stroke="#334155" stroke-width="2.5" opacity="0.4"/>
        <line x1="${x + 33}" y1="${y}" x2="${x + 33}" y2="${y + 40}" stroke="#334155" stroke-width="2.5" opacity="0.4"/>
        <!-- North Barrier -->
        <g transform="translate(${x + 5}, ${y - 4})" class="flood-barrier-north">
          <line x1="2" y1="2" x2="2" y2="10" stroke="#1E293B" stroke-width="2"/>
          <line x1="28" y1="2" x2="28" y2="10" stroke="#1E293B" stroke-width="2"/>
          <rect x="0" y="2" width="30" height="6" rx="1" fill="url(#floodHazardStripes)" stroke="#B91C1C" stroke-width="0.8"/>
        </g>
        <!-- South Barrier -->
        <g transform="translate(${x + 5}, ${y + 34})" class="flood-barrier-south">
          <line x1="2" y1="2" x2="2" y2="10" stroke="#1E293B" stroke-width="2"/>
          <line x1="28" y1="2" x2="28" y2="10" stroke="#1E293B" stroke-width="2"/>
          <rect x="0" y="2" width="30" height="6" rx="1" fill="url(#floodHazardStripes)" stroke="#B91C1C" stroke-width="0.8"/>
        </g>
      </g>`;
  }

  return `
    <g class="city-bridge" data-bridge="${id}">
      <!-- Bridge Edge Deck -->
      <rect x="${x + 6}" y="${y}" width="28" height="40" fill="var(--map-road-edge)"/>
      <!-- Road Surface -->
      <rect x="${x + 9}" y="${y}" width="22" height="40" fill="var(--map-road)"/>
      <!-- Left & Right Rails -->
      <line x1="${x + 7}" y1="${y}" x2="${x + 7}" y2="${y + 40}" stroke="#334155" stroke-width="3" stroke-linecap="square"/>
      <line x1="${x + 33}" y1="${y}" x2="${x + 33}" y2="${y + 40}" stroke="#334155" stroke-width="3" stroke-linecap="square"/>
    </g>`;
}
