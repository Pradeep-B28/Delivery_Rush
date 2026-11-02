// Interactive BFS wave visualizer animating breadth-first search on the city map.
// Uses city.js, icons.js, copy.js, algo.js, and bfs.js.
// Used by screens/think.js.

import { buildGrid } from "../engine/bfs.js";
import { routeTrace } from "../engine/algo.js";
import { renderCitySvg } from "./city.js";
import { getScooterSvg, getBarrierSvg, FOOD_ICONS } from "./icons.js";
import { isReducedMotion } from "../motion.js";
import { t } from "../copy.js";

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
  } else {
    c = 0;
    r = 0;
  }
  return { x: c * 40 + 20, y: r * 40 + 20 };
}

export function createBfsWave({ container, decision, city, shift }) {
  const grid = buildGrid(city);
  let activeRiderId = decision.rider;
  let animTimer = null;

  function render() {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }

    const riderCandidates = decision.candidates || [];
    const activeCandidate = riderCandidates.find((c) => c.rider === activeRiderId) || riderCandidates[0] || {};
    const riderIdx = shift.riders.findIndex((r) => r.id === activeRiderId);
    const riderColor = RIDER_COLORS[(riderIdx >= 0 ? riderIdx : 0) % RIDER_COLORS.length];

    // Compute BFS trace
    const trace = routeTrace(grid, decision, activeRiderId);
    const visited = trace.visited || [];
    const path = trace.path || [];

    // Group visited by distance
    const waves = [];
    for (const v of visited) {
      if (!waves[v.dist]) waves[v.dist] = [];
      waves[v.dist].push(v.cell);
    }

    const fromPos = cellCenter(activeCandidate.fromCell);
    const shopPos = cellCenter(decision.shopCell);

    // Rider chips selector HTML
    const chipsHtml = shift.riders.map((r, i) => {
      const isSel = r.id === activeRiderId;
      const cColor = RIDER_COLORS[i % RIDER_COLORS.length];
      return `
        <button type="button" class="think-rider-chip ${isSel ? "is-active" : ""}" data-rider="${r.id}" style="--chip-color: ${cColor};">
          <span class="chip-dot" style="background:${cColor};"></span>
          <span>${r.name}</span>
        </button>
      `;
    }).join("");

    container.innerHTML = `
      <div class="bfs-wave-wrap">
        <div class="bfs-top-bar">
          <div class="bfs-rider-chips">${chipsHtml}</div>
          <div class="bfs-status-box">
            <span class="bfs-checked-count num" id="bfsCheckedCount">${t("think.checked", { n: 0 })}</span>
            <button type="button" class="think-btn btn-sm" id="btnBfsReplay">${t("think.replay")}</button>
          </div>
        </div>

        <div class="bfs-map-container map-container" data-mood="${shift.mood}">
          <div class="bfs-city-layer">${renderCitySvg(shift.mood, decision.closed)}</div>
          <svg viewBox="0 0 520 520" class="bfs-overlay-svg">
            <!-- Waves group -->
            <g class="bfs-waves-group" id="bfsWavesGroup"></g>
            <!-- Shortest path line -->
            <path class="bfs-path-line" id="bfsPathLine" fill="none" stroke="${riderColor}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="" opacity="0"></path>
            <!-- Shop target marker -->
            <g class="bfs-target-marker" transform="translate(${shopPos.x - 16}, ${shopPos.y - 16})">
              <rect width="32" height="32" rx="6" fill="var(--surface)" stroke="var(--warn)" stroke-width="2.5" />
              <g transform="translate(1, 1)">${FOOD_ICONS.biryani || ""}</g>
            </g>
            <!-- Start rider scooter -->
            <g class="bfs-start-scooter" transform="translate(${fromPos.x - 17}, ${fromPos.y - 17})">
              ${getScooterSvg(riderColor, (riderIdx >= 0 ? riderIdx : 0) + 1, false, 1)}
            </g>
          </svg>
        </div>
      </div>
    `;

    const wavesGroup = container.querySelector("#bfsWavesGroup");
    const pathLine = container.querySelector("#bfsPathLine");
    const countEl = container.querySelector("#bfsCheckedCount");
    const replayBtn = container.querySelector("#btnBfsReplay");

    // Rider chips event
    const chipBtns = container.querySelectorAll(".think-rider-chip");
    chipBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeRiderId = btn.dataset.rider;
        render();
      });
    });

    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        render();
      });
    }

    // Path geometry
    const pathPoints = [fromPos, ...path.map((c) => cellCenter(c))];
    const pathD = pathPoints.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");

    // Animate wave
    if (isReducedMotion()) {
      // Show full wave and path instantly
      let allWaveSvg = "";
      for (const v of visited) {
        const pt = cellCenter(v.cell);
        allWaveSvg += `<rect x="${pt.x - 19}" y="${pt.y - 19}" width="38" height="38" rx="4" fill="var(--accent)" opacity="0.3" />`;
      }
      wavesGroup.innerHTML = allWaveSvg;
      pathLine.setAttribute("d", pathD);
      pathLine.style.opacity = "1";
      countEl.textContent = t("think.checked", { n: trace.checked });
      return;
    }

    let currentWaveIdx = 0;
    let checkedAccum = 0;
    const waveDelay = 120; // 120 ms per wave per Section 6F

    animTimer = setInterval(() => {
      if (currentWaveIdx >= waves.length) {
        clearInterval(animTimer);
        animTimer = null;
        pathLine.setAttribute("d", pathD);
        pathLine.style.opacity = "1";
        pathLine.classList.add("path-draw-anim");
        return;
      }

      const waveCells = waves[currentWaveIdx] || [];
      checkedAccum += waveCells.length;
      countEl.textContent = t("think.checked", { n: checkedAccum });

      for (const cell of waveCells) {
        const pt = cellCenter(cell);
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(pt.x - 19));
        rect.setAttribute("y", String(pt.y - 19));
        rect.setAttribute("width", "38");
        rect.setAttribute("height", "38");
        rect.setAttribute("rx", "4");
        rect.setAttribute("fill", "var(--accent)");
        rect.setAttribute("class", "bfs-wave-cell");
        wavesGroup.appendChild(rect);
      }

      currentWaveIdx++;
    }, waveDelay);
  }

  render();

  return {
    destroy() {
      if (animTimer) {
        clearInterval(animTimer);
        animTimer = null;
      }
    }
  };
}
