// The algorithm that runs the same shift as the player.
// Priority queue: the order due first comes out first. Greedy: it goes to the rider who can deliver it soonest.
// Uses heap.js, sim.js and bfs.js. It sees an order only when the order arrives, exactly like the player.

import { MinHeap } from "./heap.js";
import { assign, estimate, play } from "./sim.js";
import { bfs } from "./bfs.js";

// Due first, then placed first, then by id.
export function orderBefore(a, b) {
  return a.dueAt - b.dueAt || a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

// Builds a driver for play(). Every decision it makes is added to the decisions list.
export function createDriver(decisions = []) {
  const heap = new MinHeap(orderBefore);
  const seen = new Set();
  return (sim) => {
    for (const o of sim.orders) {
      if (o.status === "waiting" && !seen.has(o.id)) {
        seen.add(o.id);
        heap.push(o);
      }
    }
    while (heap.size > 0) {
      const top = heap.peek();
      const candidates = sim.riders.map((r) => estimate(sim, r, top));
      let best = null;
      for (const c of candidates) {
        if (c.full) continue;
        if (!best || c.finish < best.finish) best = c;
      }
      if (!best) break; // every rider is full, so the order stays in the heap
      const heapBefore = heap.toArray().map((o) => ({ id: o.id, dueAt: o.dueAt }));
      heap.pop();
      assign(sim, top.id, best.rider);
      decisions.push({
        t: sim.t,
        order: top.id,
        rider: best.rider,
        heapBefore,
        heapAfter: heap.toArray().map((o) => ({ id: o.id, dueAt: o.dueAt })),
        candidates,
        position: best.jobs + 1,
        fromCell: best.fromCell,
        shopCell: top.shopCell,
        homeCell: top.homeCell,
        closed: [...sim.closed],
        finish: best.finish
      });
    }
  };
}

// Runs the algorithm on a whole shift. Returns { sim, frames, decisions }.
export function runAlgorithm(city, shift) {
  const decisions = [];
  const { sim, frames } = play(city, shift, createDriver(decisions));
  return { sim, frames, decisions };
}

// The BFS search behind one candidate of a decision: from where that rider will be free, to the shop.
// Returns the same shape as bfs(). Used to draw the wave on the thinking screen.
export function routeTrace(grid, decision, riderId) {
  const c = decision.candidates.find((x) => x.rider === riderId);
  return bfs(grid, c.fromCell, decision.shopCell, new Set(decision.closed));
}
