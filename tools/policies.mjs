// Simple ways of playing a shift, used to prove the algorithm is good but not magic.
// Locked. Each function returns a driver for play() in js/engine/sim.js. Only tools/ uses this file.
// Run through tools/verify-content.mjs.

import { assign, estimate } from "../js/engine/sim.js";
import { cellXY } from "../js/engine/bfs.js";

const straightLine = (grid, a, b) => {
  const p = cellXY(grid, a);
  const q = cellXY(grid, b);
  return Math.abs(p.c - q.c) + Math.abs(p.r - q.r);
};

// Oldest waiting order first, after a reaction delay.
function ready(sim, delay) {
  return sim.orders.filter((o) => o.status === "waiting" && sim.t >= o.at + delay).sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
}

// Takes orders in the order they came and gives each to the next rider in turn.
export function roundRobin(delay = 0) {
  let next = 0;
  return (sim) => {
    for (const o of ready(sim, delay)) {
      for (let i = 0; i < sim.riders.length; i++) {
        const r = sim.riders[(next + i) % sim.riders.length];
        if (assign(sim, o.id, r.id).ok) {
          next = (next + i + 1) % sim.riders.length;
          break;
        }
      }
    }
  };
}

// A typical first-time player: oldest order first, to the rider who looks closest to the shop on the map.
// It ignores the river, and it ignores how busy the rider already is.
export function looksClosest(delay = 2) {
  return (sim) => {
    for (const o of ready(sim, delay)) {
      const byLook = [...sim.riders].sort((a, b) => straightLine(sim.grid, a.cell, o.shopCell) - straightLine(sim.grid, b.cell, o.shopCell));
      for (const r of byLook) if (assign(sim, o.id, r.id).ok) break;
    }
  };
}

// Random choices from a fixed seed.
export function randomChoice(seed = 1) {
  let x = seed;
  const rand = () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
  return (sim) => {
    for (const o of ready(sim, 0)) {
      const start = Math.floor(rand() * sim.riders.length);
      for (let i = 0; i < sim.riders.length; i++) {
        const r = sim.riders[(start + i) % sim.riders.length];
        if (assign(sim, o.id, r.id).ok) break;
      }
    }
  };
}

// A careful player: the same rider choice as the algorithm, but oldest order first and with a reaction delay.
export function carefulPlayer(delay = 2) {
  return (sim) => {
    for (const o of ready(sim, delay)) {
      const options = sim.riders.map((r) => estimate(sim, r, o)).filter((c) => !c.full);
      if (!options.length) continue;
      options.sort((a, b) => a.finish - b.finish);
      assign(sim, o.id, options[0].rider);
    }
  };
}
