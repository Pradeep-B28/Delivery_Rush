// The shift simulation. One minute at a time, it opens orders, closes roads, moves riders and delivers food.
// Uses bfs.js and queue.js. Pure logic, no DOM and no timers: the same shift and the same actions always give the same result.
// Used by the game screen, js/engine/algo.js, js/engine/score.js and tools/verify-content.mjs.

import { bfs, buildGrid, cellId, distance } from "./bfs.js";
import { Queue } from "./queue.js";
import { runningAvg } from "./score.js";

// Starts a shift at minute 0.
export function createSim(city, shift) {
  const grid = buildGrid(city);
  const shopById = new Map(city.shops.map((s) => [s.id, s]));
  const homeById = new Map(city.homes.map((h) => [h.id, h]));
  const riderById = new Map(city.riders.map((r) => [r.id, r]));
  const orders = shift.orders.map((o) => ({
    id: o.id,
    at: o.at,
    shop: o.shop,
    home: o.home,
    dish: o.dish,
    kind: o.kind,
    shopCell: cellId(grid, ...shopById.get(o.shop).cell),
    homeCell: cellId(grid, ...homeById.get(o.home).cell),
    readyAt: o.at + o.prep,
    dueAt: o.at + o.promise,
    status: "future", // future, waiting, assigned, picked, delivered, missed
    rider: null,
    assignedAt: null,
    pickedAt: null,
    deliveredAt: null
  }));
  const sim = {
    city,
    shift,
    grid,
    t: 0,
    ended: false,
    endReason: null,
    closed: new Set(),
    orders,
    byId: new Map(orders.map((o) => [o.id, o])),
    riders: shift.riders.map((r) => {
      const cell = cellId(grid, ...r.start);
      return { id: r.id, name: riderById.get(r.id).name, cell, prevCell: cell, jobs: new Queue(), phase: null, route: [] };
    }),
    actions: []
  };
  openMinute(sim);
  return sim;
}

// Road changes and new orders for the current minute. Returns events.
function openMinute(sim) {
  const events = [];
  const next = closedAt(sim.grid, sim.shift, sim.t);
  const changed = next.size !== sim.closed.size || [...next].some((c) => !sim.closed.has(c));
  if (changed) {
    for (const cl of sim.shift.closures) {
      if (cl.from === sim.t) events.push({ type: "closure", name: cl.name, t: sim.t });
      if (cl.to === sim.t) events.push({ type: "reopen", name: cl.name, t: sim.t });
    }
    sim.closed = next;
    for (const r of sim.riders) if (r.phase) routeRider(sim, r);
  }
  for (const o of sim.orders) {
    if (o.at === sim.t) {
      o.status = "waiting";
      events.push({ type: "order", id: o.id, t: sim.t });
    }
  }
  return events;
}

// The set of closed road cells at a minute. A closure is active from "from" up to, not including, "to".
export function closedAt(grid, shift, t) {
  const closed = new Set();
  for (const cl of shift.closures) {
    if (t >= cl.from && t < cl.to) for (const [c, r] of cl.cells) closed.add(cellId(grid, c, r));
  }
  return closed;
}

function currentOrder(sim, r) {
  return r.jobs.size ? sim.byId.get(r.jobs.peek()) : null;
}

function routeRider(sim, r) {
  const o = currentOrder(sim, r);
  if (!o) return;
  const target = r.phase === "toHome" ? o.homeCell : o.shopCell;
  r.route = bfs(sim.grid, r.cell, target, sim.closed).path;
}

function startNextJob(sim, r) {
  if (r.jobs.size === 0) {
    r.phase = null;
    r.route = [];
    return;
  }
  r.phase = "toShop";
  routeRider(sim, r);
}

// Gives a waiting order to a rider. The rider's queue holds the job in hand plus the jobs after it.
// Returns { ok: true } or { ok: false, reason } where reason is "ended", "not-waiting", "unknown-rider" or "rider-full".
export function assign(sim, orderId, riderId) {
  if (sim.ended) return { ok: false, reason: "ended" };
  const o = sim.byId.get(orderId);
  if (!o || o.status !== "waiting") return { ok: false, reason: "not-waiting" };
  const r = sim.riders.find((x) => x.id === riderId);
  if (!r) return { ok: false, reason: "unknown-rider" };
  if (r.jobs.size >= sim.shift.maxJobs) return { ok: false, reason: "rider-full" };
  o.status = "assigned";
  o.rider = r.id;
  o.assignedAt = sim.t;
  r.jobs.push(o.id);
  if (!r.phase) startNextJob(sim, r);
  sim.actions.push({ t: sim.t, order: orderId, rider: riderId });
  return { ok: true };
}

function stepRider(sim, r, events) {
  r.prevCell = r.cell;
  const o = currentOrder(sim, r);
  if (!o) return;
  const target = r.phase === "toHome" ? o.homeCell : o.shopCell;
  if (r.cell !== target) {
    if (r.route.length === 0) routeRider(sim, r);
    if (r.route.length > 0) r.cell = r.route.shift();
  }
  if (r.cell !== target) return;
  if (r.phase === "toHome") {
    o.status = "delivered";
    o.deliveredAt = sim.t;
    r.jobs.shift();
    events.push({ type: "delivered", id: o.id, rider: r.id, mins: sim.t - o.at, late: sim.t > o.dueAt, t: sim.t });
    startNextJob(sim, r);
    return;
  }
  if (sim.t >= o.readyAt) {
    o.status = "picked";
    o.pickedAt = sim.t;
    r.phase = "toHome";
    routeRider(sim, r);
    events.push({ type: "pickup", id: o.id, rider: r.id, t: sim.t });
  } else {
    r.phase = "waiting";
  }
}

// Moves the shift forward by one minute. Returns the events of that minute, oldest first.
export function advance(sim) {
  if (sim.ended) return [];
  sim.t += 1;
  const events = openMinute(sim);
  for (const r of sim.riders) stepRider(sim, r, events);
  if (sim.orders.every((o) => o.status === "delivered")) {
    sim.ended = true;
    sim.endReason = "done";
    events.push({ type: "end", reason: "done", t: sim.t });
  } else if (sim.t >= sim.shift.closeAt) {
    for (const o of sim.orders) if (o.status !== "delivered") o.status = "missed";
    sim.ended = true;
    sim.endReason = "closed";
    events.push({ type: "end", reason: "closed", t: sim.t });
  }
  return events;
}

// Where and when a rider becomes free, if nothing else changes. Returns { cell, at }.
export function riderFree(sim, r) {
  let cell = r.cell;
  let at = sim.t;
  r.jobs.toArray().forEach((id, i) => {
    const o = sim.byId.get(id);
    const picked = i === 0 && r.phase === "toHome";
    if (!picked) {
      const d = distance(sim.grid, cell, o.shopCell, sim.closed);
      at = Math.max(at + Math.max(d, 1), o.readyAt);
      cell = o.shopCell;
    }
    at += distance(sim.grid, cell, o.homeCell, sim.closed);
    cell = o.homeCell;
  });
  return { cell, at };
}

// When a rider could deliver an order if it were added to the end of their queue.
// Returns { rider, full, jobs, fromCell, freeAt, toShop, pickupAt, toHome, finish }.
export function estimate(sim, r, o) {
  const free = riderFree(sim, r);
  const toShop = distance(sim.grid, free.cell, o.shopCell, sim.closed);
  const toHome = distance(sim.grid, o.shopCell, o.homeCell, sim.closed);
  const pickupAt = Math.max(free.at + Math.max(toShop, 1), o.readyAt);
  return {
    rider: r.id,
    full: r.jobs.size >= sim.shift.maxJobs,
    jobs: r.jobs.size,
    fromCell: free.cell,
    freeAt: free.at,
    toShop,
    pickupAt,
    toHome,
    finish: pickupAt + toHome
  };
}

export function waitingOrders(sim) {
  return sim.orders.filter((o) => o.status === "waiting");
}

// True when every order has arrived and none is waiting for a rider. The clock can speed up.
export function nothingToDecide(sim) {
  return sim.orders.every((o) => o.status !== "future" && o.status !== "waiting");
}

// Plays a whole shift. driver(sim) runs once per minute before the clock moves.
// Returns { sim, frames }. A frame is what the race screen draws for one minute.
export function play(city, shift, driver) {
  const sim = createSim(city, shift);
  const frames = [];
  while (true) {
    driver(sim);
    frames.push(frame(sim));
    if (sim.ended) break;
    advance(sim);
  }
  return { sim, frames };
}

function frame(sim) {
  const delivered = sim.orders.filter((o) => o.status === "delivered");
  return {
    t: sim.t,
    riders: sim.riders.map((r) => ({ id: r.id, cell: r.cell, phase: r.phase, jobs: r.jobs.size })),
    closed: [...sim.closed],
    delivered: delivered.length,
    late: delivered.filter((o) => o.deliveredAt > o.dueAt).length,
    avg: runningAvg(sim),
    active: sim.orders.filter((o) => o.status === "assigned" || o.status === "picked").map((o) => o.id)
  };
}

// Replays a saved list of actions: [{ t, order, rider }].
export function replay(city, shift, actions) {
  return play(city, shift, (sim) => {
    for (const a of actions) {
      if (a.t === sim.t) {
        const res = assign(sim, a.order, a.rider);
        if (!res.ok) throw new Error(`Bad action at minute ${a.t}: ${a.order} to ${a.rider}: ${res.reason}`);
      }
    }
  });
}
