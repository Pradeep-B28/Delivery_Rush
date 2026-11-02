// Dual-map race replay coordinator synchronizing Player and Algorithm frames.
// Uses motion.js, clock.js, city.js, icons.js, and copy.js.
// Used by screens/result.js.

import { CONFIG } from "../content.js";
import { t } from "../copy.js";
import { raceMinuteAt } from "../clock.js";
import { renderCitySvg } from "./city.js";
import { getScooterSvg } from "./icons.js";

const RIDER_COLORS = [
  "var(--rider-1)",
  "var(--rider-2)",
  "var(--rider-3)",
  "var(--rider-4)"
];

// Precomputed cell centers for the 13x13 grid
const CELL_CENTERS = new Array(169);
for (let i = 0; i < 169; i++) {
  CELL_CENTERS[i] = { x: (i % 13) * 40 + 20, y: Math.floor(i / 13) * 40 + 20 };
}

function getCellCenter(cell) {
  if (Array.isArray(cell)) {
    return CELL_CENTERS[cell[1] * 13 + cell[0]] || { x: cell[0] * 40 + 20, y: cell[1] * 40 + 20 };
  }
  if (typeof cell === "number") {
    return CELL_CENTERS[cell] || { x: (cell % 13) * 40 + 20, y: Math.floor(cell / 13) * 40 + 20 };
  }
  if (cell && typeof cell === "object") {
    const c = cell.c !== undefined ? cell.c : 0;
    const r = cell.r !== undefined ? cell.r : 0;
    return CELL_CENTERS[r * 13 + c] || { x: c * 40 + 20, y: r * 40 + 20 };
  }
  return CELL_CENTERS[0];
}

function buildFramesLookup(frames, maxT) {
  const lookup = new Array(maxT + 1);
  let curFrame = frames[0] || null;
  let fIdx = 0;
  for (let t = 0; t <= maxT; t++) {
    while (fIdx + 1 < frames.length && frames[fIdx + 1].t <= t) {
      fIdx++;
      curFrame = frames[fIdx];
    }
    lookup[t] = curFrame;
  }
  return lookup;
}

function initActorNodes(group, ridersCount) {
  group.innerHTML = "";
  const routes = [];
  const riders = [];

  const routesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  routesGroup.setAttribute("class", "race-routes-layer");
  group.appendChild(routesGroup);

  const ridersGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  ridersGroup.setAttribute("class", "race-riders-layer");
  group.appendChild(ridersGroup);

  for (let i = 0; i < ridersCount; i++) {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const color = RIDER_COLORS[i % RIDER_COLORS.length];
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", "4");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    p.setAttribute("fill", "none");
    p.setAttribute("opacity", "0.85");
    p.setAttribute("class", "rider-route-line");
    routesGroup.appendChild(p);
    routes.push({ el: p, lastD: null, lastDash: null });

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "rider-actor");
    g.style.willChange = "transform";
    g.innerHTML = getScooterSvg(color, i + 1, false, 1);
    ridersGroup.appendChild(g);

    const flipper = g.querySelector("g");
    riders.push({ root: g, flipper, lastDir: 1, lastTransform: null });
  }

  return { routes, riders };
}

export function createRaceCoordinator({
  youContainer,
  algoContainer,
  shift,
  yourFrames,
  algoFrames,
  onTick,
  onFinish
}) {
  const endMinute = Math.max(yourFrames.at(-1).t, algoFrames.at(-1).t);
  let speedMultiplier = 1;
  let elapsedMs = 0;
  let finished = false;

  const youCityLayer = youContainer.querySelector(".race-city-layer");
  const algoCityLayer = algoContainer.querySelector(".race-city-layer");
  const youActorsGroup = youContainer.querySelector(".race-actors-group");
  const algoActorsGroup = algoContainer.querySelector(".race-actors-group");
  const youDoneChip = youContainer.querySelector(".race-done-chip");
  const algoDoneChip = algoContainer.querySelector(".race-done-chip");

  function updateCity(layer, closed, lastRef) {
    const key = (closed && closed.length ? closed[0] : "") + ":" + shift.mood;
    if (lastRef.val === key && layer.innerHTML) return;
    lastRef.val = key;
    layer.innerHTML = renderCitySvg(shift.mood, closed);
  }

  const youRef = { val: null };
  const algoRef = { val: null };
  updateCity(youCityLayer, [], youRef);
  updateCity(algoCityLayer, [], algoRef);

  const ridersCount = shift.riders.length;
  const youNodes = initActorNodes(youActorsGroup, ridersCount);
  const algoNodes = initActorNodes(algoActorsGroup, ridersCount);

  const yourLookup = buildFramesLookup(yourFrames, endMinute);
  const algoLookup = buildFramesLookup(algoFrames, endMinute);

  function updateActors(nodes, frame, progress, isDone, riderScale) {
    if (!frame) return;
    const riders = frame.riders || [];
    const scaleTransform = riderScale !== 1.0 ? ` scale(${riderScale})` : "";

    for (let i = 0; i < ridersCount; i++) {
      const rider = riders[i];
      const rNode = nodes.riders[i];
      const pNode = nodes.routes[i];
      if (!rider || !rNode) continue;

      const prev = getCellCenter(rider.prevCell !== undefined ? rider.prevCell : rider.cell);
      const cur = getCellCenter(rider.cell);
      const prog = isDone ? 1 : progress;
      const x = Math.round((prev.x + (cur.x - prev.x) * prog) * 10) / 10;
      const y = Math.round((prev.y + (cur.y - prev.y) * prog) * 10) / 10;

      const transformStr = `translate(${x - 17}, ${y - 17})${scaleTransform}`;
      if (transformStr !== rNode.lastTransform) {
        rNode.lastTransform = transformStr;
        rNode.root.setAttribute("transform", transformStr);
      }

      // Direction flip
      const dir = cur.x < prev.x ? -1 : 1;
      if (dir !== rNode.lastDir && rNode.flipper) {
        rNode.lastDir = dir;
        if (dir < 0) {
          rNode.flipper.setAttribute("transform", "scale(-1, 1) translate(-34, 0)");
        } else {
          rNode.flipper.removeAttribute("transform");
        }
      }

      // Route line (update geometry only when rider cell or route changes)
      if (isDone || !rider.route || rider.route.length === 0) {
        if (pNode.lastRouteKey !== "") {
          pNode.lastRouteKey = "";
          pNode.el.setAttribute("d", "");
        }
      } else {
        const routeKey = rider.cell + ":" + (rider.route.length > 0 ? rider.route[0] : "");
        if (routeKey !== pNode.lastRouteKey) {
          pNode.lastRouteKey = routeKey;
          const startPt = cur;
          let dStr = `M ${startPt.x} ${startPt.y}`;
          for (const step of rider.route) {
            const pt = getCellCenter(step);
            dStr += ` L ${pt.x} ${pt.y}`;
          }
          pNode.el.setAttribute("d", dStr);

          const isDash = rider.phase === "toShop";
          if (isDash !== pNode.lastDash) {
            pNode.lastDash = isDash;
            if (isDash) {
              pNode.el.setAttribute("stroke-dasharray", "4 4");
            } else {
              pNode.el.removeAttribute("stroke-dasharray");
            }
          }
        }
      }
    }
  }

  function renderAtMinute(t, progress) {
    const isSmall = window.innerWidth < 900;
    const riderScale = isSmall ? 1.3 : 1.0;

    const yFrame = yourLookup[t];
    const aFrame = algoLookup[t];

    const yDone = t >= yourFrames.at(-1).t;
    const aDone = t >= algoFrames.at(-1).t;

    if (youDoneChip) youDoneChip.hidden = !yDone;
    if (algoDoneChip) algoDoneChip.hidden = !aDone;

    if (yFrame) {
      updateCity(youCityLayer, yFrame.closed || [], youRef);
      updateActors(youNodes, yFrame, progress, yDone, riderScale);
    }

    if (aFrame) {
      updateCity(algoCityLayer, aFrame.closed || [], algoRef);
      updateActors(algoNodes, aFrame, progress, aDone, riderScale);
    }

    if (typeof onTick === "function") {
      onTick({
        t,
        youAvg: yFrame ? yFrame.avg : null,
        algoAvg: aFrame ? aFrame.avg : null,
        youDelivered: yFrame ? yFrame.delivered : 0,
        algoDelivered: aFrame ? aFrame.delivered : 0
      });
    }
  }

  return {
    setSpeed(speed) {
      speedMultiplier = speed;
    },
    tick(dtMs) {
      if (finished) return;
      const baseTotalMs = CONFIG.race.seconds * 1000;
      elapsedMs += dtMs * speedMultiplier;

      const currentT = raceMinuteAt(elapsedMs, baseTotalMs, endMinute);
      const minuteDuration = baseTotalMs / endMinute;
      const progress = (elapsedMs % minuteDuration) / minuteDuration;

      renderAtMinute(currentT, progress);

      if (elapsedMs >= baseTotalMs) {
        finished = true;
        renderAtMinute(endMinute, 1.0);
        if (typeof onFinish === "function") {
          onFinish();
        }
      }
    },
    skip() {
      if (finished) return;
      finished = true;
      renderAtMinute(endMinute, 1.0);
      if (typeof onFinish === "function") {
        onFinish();
      }
    }
  };
}
