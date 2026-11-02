// Content and engine check for Delivery Rush. Run from the project folder:  node tools/verify-content.mjs
//
// It checks, without a browser:
//   1. the city and every shift against content/SCHEMA.md
//   2. the heap, queue and BFS against slow, simple versions on many random cases
//   3. the simulation's rules, using small made-up shifts with known answers
//   4. the algorithm: repeatable, no peeking at future orders, its time estimates, and it plays by the same rules as the player
//   5. the game is fair: the algorithm beats simple play, and a saved plan beats the algorithm
//   6. every code snippet on the thinking screen, by running it and comparing with the engine
//   7. all player-facing text for long dashes, emojis, banned words and real brand names
//   8. the scoreboard numbers against fixed expected values (PROJECT_BRIEF.md Section 10)
//   9. js/copy.js, once it exists
// Prints PASS or FAIL lines and exits with code 1 if anything fails.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { CITY, SHIFTS, LINES, CONCEPTS, EXPLAIN, CONTENT_VERSION } from "../content/index.js";
import { CONFIG } from "../config.js";
import { MinHeap } from "../js/engine/heap.js";
import { Queue } from "../js/engine/queue.js";
import { bfs, buildGrid, cellId, cellXY, distance, neighbours } from "../js/engine/bfs.js";
import { createSim, assign, advance, estimate, riderFree, play, replay, closedAt, nothingToDecide, waitingOrders } from "../js/engine/sim.js";
import { runAlgorithm, createDriver, orderBefore, routeTrace } from "../js/engine/algo.js";
import { score, runningAvg, compare, orderGaps, formatMins, encodeBeat, decodeChallenge } from "../js/engine/score.js";
import { explainDecision } from "../js/engine/explain.js";
import { roundRobin, looksClosest, randomChoice, carefulPlayer } from "./policies.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const DASHES = /[\u2012\u2013\u2014\u2015]/; // figure dash, en dash, em dash, horizontal bar
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u; // the (c), (r) and TM signs are fine
const BANNED = [
  "guarantee", "placement", "salary", "lakh", "get hired", "seats left", "take your job", "replace you",
  "stupid", "dumb", "idiot", "noob", "loser", "useless", "pathetic", "terrible"
];
const BRANDS = [
  "swiggy", "zomato", "dunzo", "zepto", "blinkit", "bigbasket", "uber", "ola", "rapido", "instagram",
  "gpay", "google pay", "phonepe", "paytm", "amazon", "flipkart", "foodpanda", "domino", "kfc", "mcdonald"
];

let failures = 0;
let passes = 0;
function fail(where, msg) {
  failures++;
  console.log(`  FAIL  ${where}: ${msg}`);
}
function ok(cond, where, msg) {
  if (cond) passes++;
  else fail(where, msg);
}
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isInt = (v) => Number.isInteger(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function expect(label, actual, expected) {
  ok(same(actual, expected), label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function checkText(where, label, text, { max = 0, brands = BRANDS } = {}) {
  if (typeof text !== "string") return fail(where, `${label} is not text`);
  if (DASHES.test(text)) fail(where, `${label} has a long dash`);
  if (EMOJI.test(text)) fail(where, `${label} has an emoji`);
  const lower = text.toLowerCase();
  for (const b of BANNED) if (lower.includes(b)) fail(where, `${label} uses the banned word "${b}"`);
  for (const b of brands) if (new RegExp(`(^|[^a-z])${b.replace(" ", "\\s")}([^a-z]|$)`).test(lower)) fail(where, `${label} names a real brand ("${b}")`);
  if (max && text.length > max) fail(where, `${label} is ${text.length} characters (max ${max})`);
}
function section(name) {
  console.log(`\n${name}`);
}
function seeded(seed) {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}

const grid = buildGrid(CITY);
const isRoad = ([c, r]) => c >= 0 && r >= 0 && c < grid.cols && r < grid.rows && grid.road[cellId(grid, c, r)];

// ---------------------------------------------------------------- 1. City and shifts
section("1. City and shifts");
ok(isStr(CONTENT_VERSION), "content", "CONTENT_VERSION missing");
ok(CITY.map.length === 13 && CITY.map.every((l) => l.length === 13 && /^[.=#P~]+$/.test(l)), "city.map", "must be 13 rows of 13 letters from . = # P ~");
const placeCells = new Map();
for (const list of [CITY.shops, CITY.homes]) {
  for (const p of list) {
    const w = `place ${p.id}`;
    ok(isRoad(p.cell), w, "must be on a road");
    const id = cellId(grid, ...p.cell);
    ok(!placeCells.has(id), w, "shares a cell with another place");
    placeCells.set(id, p.id);
    checkText(w, "name", p.name, { max: 26 });
  }
}
const bridgeCells = new Set(CITY.bridges.map((b) => cellId(grid, ...b.cell)));
for (const b of CITY.bridges) {
  ok(CITY.map[b.cell[1]][b.cell[0]] === "=", `bridge ${b.id}`, "cell must be = on the map");
  ok(!placeCells.has(cellId(grid, ...b.cell)), `bridge ${b.id}`, "a place cannot sit on a bridge");
  checkText(`bridge ${b.id}`, "name", b.name, { max: 20 });
}
const ICONS = ["biryani", "dosa", "coffee", "curry", "grill", "icecream"];
for (const s of CITY.shops) {
  ok(ICONS.includes(s.icon), `shop ${s.id}`, "unknown icon");
  ok(CITY.dishes[s.id] && Object.keys(CITY.dishes[s.id]).length >= 3, `shop ${s.id}`, "needs at least 3 dishes");
  for (const [dish, kind] of Object.entries(CITY.dishes[s.id] || {})) {
    checkText(`shop ${s.id}`, dish, dish, { max: 24 });
    ok(kind in CITY.kinds, `shop ${s.id}`, `${dish} has unknown kind ${kind}`);
  }
}
for (const r of CITY.riders) checkText(`rider ${r.id}`, "name", r.name, { max: 10 });
for (const a of CITY.areas) checkText("area", a.name, a.name, { max: 16 });
for (const k of Object.values(CITY.kinds)) checkText("kind", "badge", k.badge, { max: 14 });

// With the river in place, every road cell can reach every other, on every set of closures.
function checkReach(where, closed) {
  const all = grid.road.map((v, i) => (v && !closed.has(i) ? i : -1)).filter((i) => i >= 0);
  const start = all[0];
  for (const id of all) ok(distance(grid, start, id, closed) >= 0, where, `road ${JSON.stringify(cellXY(grid, id))} cannot be reached`);
}
checkReach("city", new Set());

const shiftIds = new Set();
const checkReachSeen = new Set();
for (const sh of SHIFTS) {
  const w = `shift ${sh.id}`;
  ok(/^[a-z]{2,12}$/.test(sh.id) && !shiftIds.has(sh.id), w, "id must be 2 to 12 lowercase letters and unique");
  shiftIds.add(sh.id);
  checkText(w, "name", sh.name, { max: 16 });
  checkText(w, "level", sh.level, { max: 10 });
  checkText(w, "tagline", sh.tagline, { max: 60 });
  ok(["day", "evening", "rain"].includes(sh.mood), w, "mood must be day, evening or rain");
  ok(isInt(sh.maxJobs) && sh.maxJobs >= 1 && sh.maxJobs <= 4, w, "maxJobs must be 1 to 4");
  ok(isInt(sh.closeAt) && sh.closeAt > 0 && isInt(sh.missedMins) && sh.missedMins >= sh.closeAt / 2, w, "closeAt or missedMins is wrong");
  ok(sh.riders.length >= 2 && sh.riders.length <= CITY.riders.length, w, "needs 2 to 4 riders");
  ok(new Set(sh.riders.map((r) => r.id)).size === sh.riders.length, w, "a rider appears twice");
  for (const r of sh.riders) {
    ok(CITY.riders.some((x) => x.id === r.id), w, `unknown rider ${r.id}`);
    ok(isRoad(r.start) && !placeCells.has(cellId(grid, ...r.start)), w, `${r.id} must start on a road that is not a shop or home`);
  }
  let lastAt = 0;
  const seen = new Set();
  for (const o of sh.orders) {
    const wo = `order ${o.id}`;
    ok(/^[A-Z]\d{2}$/.test(o.id) && !seen.has(o.id), wo, "id must look like L01 and be unique");
    seen.add(o.id);
    ok(isInt(o.at) && o.at >= 1 && o.at >= lastAt, wo, "at must be 1 or more and in order");
    lastAt = o.at;
    const shop = CITY.shops.find((s) => s.id === o.shop);
    const home = CITY.homes.find((h) => h.id === o.home);
    ok(Boolean(shop), wo, `unknown shop ${o.shop}`);
    ok(Boolean(home), wo, `unknown home ${o.home}`);
    if (!shop || !home) continue;
    ok(CITY.dishes[o.shop][o.dish] === o.kind, wo, `"${o.dish}" is not a ${o.kind} dish of ${o.shop}`);
    ok(isInt(o.prep) && o.prep >= 1 && o.prep <= 10, wo, "prep must be 1 to 10");
    const d = distance(grid, cellId(grid, ...shop.cell), cellId(grid, ...home.cell));
    ok(isInt(o.promise) && o.promise >= o.prep + d + 2, wo, `promise ${o.promise} is too short: it needs at least prep + road distance + 2 = ${o.prep + d + 2}`);
  }
  ok(sh.orders.length >= 8 && sh.orders.length <= 24, w, "needs 8 to 24 orders");
  ok(lastAt < sh.closeAt - 30, w, "the last order must leave time to deliver");
  const kinds = sh.orders.filter((o) => o.kind !== "normal").length;
  ok(kinds >= 3, w, "needs at least 3 melts or cools orders, so the priority queue has something to do");
  for (const cl of sh.closures) {
    checkText(w, "closure name", cl.name, { max: 20 });
    ok(isInt(cl.from) && isInt(cl.to) && cl.from < cl.to, w, "a closure needs from before to");
    for (const cell of cl.cells) {
      ok(isRoad(cell), w, `closure cell ${cell} is not a road`);
      ok(!placeCells.has(cellId(grid, ...cell)), w, `closure cell ${cell} is a shop or home, which must stay open`);
      ok(!sh.riders.some((r) => same(r.start, cell)), w, `closure cell ${cell} is a rider's start`);
    }
  }
  for (let t = 0; t <= sh.closeAt; t++) {
    const closed = closedAt(grid, sh, t);
    if (closed.size) {
      const key = [...closed].join(",");
      if (!checkReachSeen.has(key)) {
        checkReachSeen.add(key);
        checkReach(`${w} at minute ${t}`, closed);
      }
    }
  }
}
ok(SHIFTS.some((s) => s.closures.length > 0), "shifts", "at least one shift must close roads");

// ---------------------------------------------------------------- 2. Data structures
section("2. Heap, queue and BFS against simple versions");
{
  const rand = seeded(11);
  for (let round = 0; round < 300; round++) {
    const heap = new MinHeap((a, b) => a - b);
    const plain = [];
    for (let step = 0; step < 60; step++) {
      if (plain.length === 0 || rand() < 0.6) {
        const v = Math.floor(rand() * 1000);
        heap.push(v);
        plain.push(v);
      } else {
        plain.sort((a, b) => a - b);
        const want = plain.shift();
        const got = heap.pop();
        if (got !== want) fail("heap", `popped ${got}, expected ${want}`);
      }
    }
    // The heap rule: every parent comes before its children.
    const a = heap.toArray();
    for (let i = 1; i < a.length; i++) if (a[(i - 1) >> 1] > a[i]) fail("heap", "a parent is larger than its child");
    passes++;
  }
  const q = new Queue();
  const plain = [];
  for (let step = 0; step < 5000; step++) {
    if (plain.length === 0 || rand() < 0.55) {
      q.push(step);
      plain.push(step);
    } else if (q.shift() !== plain.shift()) fail("queue", "came out in the wrong order");
    if (q.size !== plain.length) fail("queue", "size is wrong");
  }
  expect("queue contents", q.toArray(), plain);

  // Slow shortest paths: Bellman-Ford over the same roads, with a random closed set.
  const roads = grid.road.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  for (let round = 0; round < 120; round++) {
    const closed = new Set();
    const nClosed = Math.floor(rand() * 4);
    for (let i = 0; i < nClosed; i++) closed.add(roads[Math.floor(rand() * roads.length)]);
    const start = roads[Math.floor(rand() * roads.length)];
    const dist = new Map([[start, 0]]);
    for (let pass = 0; pass < roads.length; pass++) {
      let changed = false;
      for (const u of roads) {
        if (!dist.has(u)) continue;
        for (const v of neighbours(grid, u, closed)) {
          const nd = dist.get(u) + 1;
          if (!dist.has(v) || nd < dist.get(v)) {
            dist.set(v, nd);
            changed = true;
          }
        }
      }
      if (!changed) break;
    }
    const goal = roads[Math.floor(rand() * roads.length)];
    const res = bfs(grid, start, goal, closed);
    const want = dist.has(goal) ? dist.get(goal) : -1;
    ok(res.dist === want, "bfs", `distance ${res.dist}, expected ${want}`);
    ok(distance(grid, start, goal, closed) === want, "distance()", "does not match bfs");
    if (res.found) {
      let at = start;
      for (const step of res.path) {
        ok(neighbours(grid, at, closed).includes(step), "bfs", "the path uses a closed or missing road");
        at = step;
      }
      ok(at === goal || start === goal, "bfs", "the path does not end at the goal");
    }
  }
}

// ---------------------------------------------------------------- 3. Simulation rules
section("3. Simulation rules (small shifts with known answers)");
{
  const mini = (orders, extra = {}) => ({ id: "mini", maxJobs: 2, closeAt: 60, missedMins: 90, riders: [{ id: "r1", start: [0, 2] }], closures: [], orders, ...extra });
  // Home h8 is at [0,4], shop s2 at [2,2]. From [0,2]: 2 moves to the shop, then 4 to the home.
  const one = (over = {}) => ({ id: "T01", at: 1, shop: "s2", dish: "Pongal Vada", home: "h8", prep: 1, promise: 30, kind: "normal", ...over });

  // Arrives at minute 3 (assigned at 1), food ready, delivered at minute 7.
  let sim = createSim(CITY, mini([one()]));
  expect("no order before its minute", sim.byId.get("T01").status, "future");
  expect("assign before it arrives", assign(sim, "T01", "r1").reason, "not-waiting");
  advance(sim);
  expect("order arrives at its minute", sim.byId.get("T01").status, "waiting");
  expect("assign unknown rider", assign(sim, "T01", "r9").reason, "unknown-rider");
  expect("assign unknown order", assign(sim, "T99", "r1").reason, "not-waiting");
  const est = estimate(sim, sim.riders[0], sim.byId.get("T01"));
  expect("estimate", [est.toShop, est.pickupAt, est.toHome, est.finish], [2, 3, 4, 7]);
  expect("assign works", assign(sim, "T01", "r1"), { ok: true });
  expect("assign twice", assign(sim, "T01", "r1").reason, "not-waiting");
  expect("action is saved", sim.actions, [{ t: 1, order: "T01", rider: "r1" }]);
  while (!sim.ended) advance(sim);
  expect("delivered at the estimate", sim.byId.get("T01").deliveredAt, 7);
  expect("shift ends when all are delivered", [sim.endReason, sim.t], ["done", 7]);
  expect("score of one order", [score(sim).avg, score(sim).late], [6, 0]);

  // Long prep: the rider arrives at minute 3 and waits for minute 8.
  sim = createSim(CITY, mini([one({ prep: 7 })]));
  advance(sim);
  assign(sim, "T01", "r1");
  while (sim.t < 7) advance(sim);
  expect("rider waits at the shop", [sim.riders[0].phase, sim.byId.get("T01").status], ["waiting", "assigned"]);
  advance(sim);
  expect("picks up when the food is ready", [sim.byId.get("T01").pickedAt, sim.riders[0].phase], [8, "toHome"]);
  while (!sim.ended) advance(sim);
  expect("delivered after the wait", sim.byId.get("T01").deliveredAt, 12);

  // Late: due at minute 5 and delivered at minute 7.
  sim = createSim(CITY, mini([one({ promise: 4 })]));
  advance(sim);
  assign(sim, "T01", "r1");
  while (!sim.ended) advance(sim);
  expect("late counts", score(sim).late, 1);

  // Rider full, and jobs done first in, first out.
  const three = [one(), one({ id: "T02", home: "h12" }), one({ id: "T03", home: "h5" })];
  sim = createSim(CITY, mini(three));
  advance(sim);
  assign(sim, "T01", "r1");
  assign(sim, "T02", "r1");
  expect("rider full", assign(sim, "T03", "r1").reason, "rider-full");
  expect("rider queue order", sim.riders[0].jobs.toArray(), ["T01", "T02"]);
  expect("waiting list", waitingOrders(sim).map((o) => o.id), ["T03"]);
  const free = riderFree(sim, sim.riders[0]);
  while (sim.byId.get("T01").status !== "delivered") advance(sim);
  expect("first job finishes first", sim.byId.get("T02").status === "assigned" || sim.byId.get("T02").status === "picked", true);
  while (sim.byId.get("T02").status !== "delivered") advance(sim);
  expect("riderFree is exact", [cellId(grid, ...CITY.homes.find((h) => h.id === "h12").cell), sim.t], [free.cell, free.at]);

  // Missed: nothing assigned, the shift closes, and missed orders count missedMins.
  sim = createSim(CITY, mini([one()], { closeAt: 10 }));
  while (!sim.ended) advance(sim);
  expect("closes with a missed order", [sim.endReason, sim.t, sim.byId.get("T01").status], ["closed", 10, "missed"]);
  expect("missed counts in the average", [score(sim).missed, score(sim).avg, score(sim).times.T01], [1, 90, null]);
  expect("assign after the end", assign(sim, "T01", "r1").reason, "ended");

  // Flood: the West bridge closes at minute 2 while the rider is heading for it, so the rider turns for the East bridge.
  const southHome = { ...one({ home: "h10", shop: "s2", prep: 1, promise: 60 }) };
  const flood = mini([southHome], { closures: [{ name: "West bridge", from: 3, to: 50, cells: [[2, 6]] }], riders: [{ id: "r1", start: [2, 1] }] });
  sim = createSim(CITY, flood);
  advance(sim);
  assign(sim, "T01", "r1");
  const seenEvents = [];
  while (!sim.ended) seenEvents.push(...advance(sim));
  expect("flood event fires", seenEvents.filter((e) => e.type === "closure").map((e) => e.t), [3]);
  ok(sim.byId.get("T01").deliveredAt - sim.byId.get("T01").at > 9, "flood", "the rider should have taken the long way round");
  const dry = { ...flood, closures: [] };
  sim = createSim(CITY, dry);
  advance(sim);
  assign(sim, "T01", "r1");
  while (!sim.ended) advance(sim);
  expect("no flood takes the short way", sim.byId.get("T01").deliveredAt, 10);

  // A rider standing on a road when it floods can still leave.
  const onBridge = mini([one({ home: "h5", shop: "s2", promise: 40 })], { riders: [{ id: "r1", start: [2, 5] }], closures: [{ name: "West bridge", from: 2, to: 50, cells: [[2, 4]] }] });
  sim = createSim(CITY, onBridge);
  advance(sim);
  assign(sim, "T01", "r1");
  while (!sim.ended) advance(sim);
  expect("a flooded road only blocks entering", sim.endReason, "done");

  // nothingToDecide
  sim = createSim(CITY, mini([one()]));
  expect("future order means more to decide", nothingToDecide(sim), false);
  advance(sim);
  expect("waiting order means more to decide", nothingToDecide(sim), false);
  assign(sim, "T01", "r1");
  expect("all assigned means nothing to decide", nothingToDecide(sim), true);
}

// ---------------------------------------------------------------- 4. The algorithm
section("4. The algorithm");
for (const sh of SHIFTS) {
  const w = `algorithm on ${sh.id}`;
  const a = runAlgorithm(CITY, sh);
  const s = score(a.sim);
  const again = runAlgorithm(CITY, sh);
  ok(same(a.sim.actions, again.sim.actions), w, "two runs differ");
  ok(s.missed === 0 && a.sim.endReason === "done", w, "must deliver every order");
  ok(a.sim.t <= 100, w, `ends at minute ${a.sim.t}, too long for one play`);
  ok(a.decisions.length === sh.orders.length, w, "one decision per order");

  // Replaying its saved actions, through the player's own assign(), gives the same result. Same rules as the player.
  const r = replay(CITY, sh, a.sim.actions);
  ok(same(score(r.sim), s), w, "a replay of its actions gives a different score");
  ok(same(r.frames.map((f) => f.riders.map((x) => x.cell)), a.frames.map((f) => f.riders.map((x) => x.cell))), w, "a replay moves riders differently");

  // No peeking: a shift cut short at any minute gives the same decisions up to that minute.
  for (const cut of [5, 15, 25, 35, 45]) {
    const shorter = { ...sh, orders: sh.orders.filter((o) => o.at <= cut) };
    if (shorter.orders.length === 0) continue;
    const b = runAlgorithm(CITY, shorter);
    const upto = (list) => list.filter((d) => d.t <= cut).map((d) => [d.t, d.order, d.rider]);
    ok(same(upto(a.decisions), upto(b.decisions)), w, `its decisions up to minute ${cut} depend on later orders`);
  }

  // Priority: it always takes the order due first.
  for (const d of a.decisions) {
    const sorted = [...d.heapBefore].sort((p, q) => orderBefore({ dueAt: p.dueAt, at: 0, id: p.id }, { dueAt: q.dueAt, at: 0, id: q.id }));
    ok(d.heapBefore[0].dueAt === sorted[0].dueAt && d.order === d.heapBefore[0].id, w, `decision for ${d.order} did not take the top of the heap`);
    const best = Math.min(...d.candidates.filter((c) => !c.full).map((c) => c.finish));
    ok(d.finish === best, w, `decision for ${d.order} did not take the earliest finish`);
    expect(`route trace for ${d.order}`, routeTrace(grid, d, d.rider).dist, d.candidates.find((c) => c.rider === d.rider).toShop);
    const lines = explainDecision(d, sh, CITY, EXPLAIN);
    for (const [k, v] of Object.entries(lines)) checkText(`${w}, ${d.order}`, k, v, { max: 170 });
  }

  // The estimate is exact when no road closes after the decision.
  const lastChange = Math.max(0, ...sh.closures.flatMap((c) => [c.from, c.to]));
  for (const d of a.decisions) {
    if (d.t >= lastChange) ok(a.sim.byId.get(d.order).deliveredAt === d.finish, w, `estimate for ${d.order} was ${d.finish}, real ${a.sim.byId.get(d.order).deliveredAt}`);
  }

  // The priority queue must really matter: some decisions pick a later order over an earlier one.
  const idx = new Map(sh.orders.map((o, i) => [o.id, i]));
  const jumps = a.decisions.filter((d) => d.heapBefore.some((q) => idx.get(q.id) < idx.get(d.order))).length;
  ok(jumps >= 2, w, `the priority queue changed the order only ${jumps} times`);
}

// ---------------------------------------------------------------- 5. Fair game
section("5. Fair game: the algorithm beats simple play, and a saved plan beats the algorithm");
for (const sh of SHIFTS) {
  const w = `fair game on ${sh.id}`;
  const algo = score(runAlgorithm(CITY, sh).sim);
  const avgOf = (driver) => score(play(CITY, sh, driver).sim);
  for (const [name, driver, margin] of [
    ["round robin", roundRobin(2), 0.1],
    ["looks closest", looksClosest(2), 0.1],
    ["random", randomChoice(7), 0.1],
    ["careful player", carefulPlayer(2), 0.05]
  ]) {
    const v = avgOf(driver);
    ok((v.avg - algo.avg) / v.avg >= margin, w, `${name} scored ${v.avg}, algorithm ${algo.avg}: the gap is under ${margin * 100} percent`);
  }
  // The same rider rule without the priority queue must be worse, or the priority queue is only decoration.
  const noQueue = avgOf(carefulPlayer(0));
  ok(noQueue.avg > algo.avg && noQueue.late > algo.late, w, `without the priority queue: ${noQueue.avg} mins and ${noQueue.late} late. With it: ${algo.avg} and ${algo.late}`);

  const line = LINES[sh.id];
  ok(Boolean(line?.sample && line?.best), w, "lines.js needs sample and best");
  const sample = score(replay(CITY, sh, line.sample).sim);
  const best = score(replay(CITY, sh, line.best).sim);
  ok(compare(sample, algo).kind === "behind", w, "the sample line should lose clearly");
  ok(compare(best, algo).kind === "win" && best.avg <= algo.avg - 1, w, `the best line (${best.avg}) must beat the algorithm (${algo.avg}) by at least 1 minute`);
}

// ---------------------------------------------------------------- 6. Code on the thinking screen really works
section("6. Code snippets run and agree with the engine");
expect("concepts", CONCEPTS.map((c) => c.id), ["pq", "bfs", "greedy", "queue"]);
for (const c of CONCEPTS) {
  checkText(`concept ${c.id}`, "name", c.name, { max: 18 });
  checkText(`concept ${c.id}`, "question", c.question, { max: 34 });
  checkText(`concept ${c.id}`, "plain", c.plain, { max: 210 });
  checkText(`concept ${c.id}`, "why", c.why, { max: 110 });
  ok(/^[a-z]+\.js$/.test(c.file), `concept ${c.id}`, "file must look like heap.js");
  ok(c.code.length >= 6 && c.code.length <= 22, `concept ${c.id}`, "code needs 6 to 22 lines");
  for (const line of c.code) {
    ok(line.length <= 46, `concept ${c.id}`, `code line over 46 characters: ${line}`);
    ok(!DASHES.test(line) && !EMOJI.test(line), `concept ${c.id}`, `code line has a long dash or emoji: ${line}`);
  }
}
for (const [k, v] of Object.entries(EXPLAIN)) checkText("EXPLAIN", k, v, { max: 130 });
{
  const code = (id, name) => new Function(`${CONCEPTS.find((c) => c.id === id).code.join("\n")}\nreturn ${name};`)();
  // Priority queue
  const popNext = code("pq", "popNext");
  const rand = seeded(5);
  for (let round = 0; round < 100; round++) {
    const heap = new MinHeap((a, b) => a.due - b.due);
    const dues = [];
    for (let i = 0; i < 12; i++) {
      const due = 1 + i * 3 + Math.floor(rand() * 3);
      dues.push(due);
      heap.push({ due });
    }
    const arr = heap.toArray();
    const got = [];
    while (arr.length) got.push(popNext(arr).due);
    ok(same(got, [...dues].sort((a, b) => a - b)), "code pq", "popNext gave the wrong order");
  }
  // BFS
  const bfsCode = code("bfs", "bfs");
  const roads = grid.road.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  for (let round = 0; round < 200; round++) {
    const closed = new Set(rand() < 0.5 ? [cellId(grid, 2, 6)] : [cellId(grid, 8, 6)]);
    const a = roads[Math.floor(rand() * roads.length)];
    const b = roads[Math.floor(rand() * roads.length)];
    const shown = bfsCode(a, b, (cell) => neighbours(grid, cell, closed));
    const real = bfs(grid, a, b, closed);
    if (a === b) ok(same(shown, [a]), "code bfs", "start equals goal");
    else ok(real.found ? same(shown, [a, ...real.path]) : shown === null, "code bfs", "the shown code finds a different route from the engine");
  }
  // Greedy, against every real decision of every shift
  const pickRider = code("greedy", "pickRider");
  for (const sh of SHIFTS) {
    for (const d of runAlgorithm(CITY, sh).decisions) {
      const riders = d.candidates.map((c) => ({ id: c.rider, jobs: c.jobs, maxJobs: sh.maxJobs, finish: c.finish }));
      const chosen = pickRider(d.order, riders, (rider) => rider.finish);
      ok(chosen.id === d.rider, "code greedy", `for ${d.order} the shown code picks ${chosen.id}, the engine picks ${d.rider}`);
    }
  }
  // Queue
  const RiderQueue = code("queue", "RiderQueue");
  const shown = new RiderQueue();
  const real = new Queue();
  for (let i = 0; i < 500; i++) {
    if (real.size === 0 || rand() < 0.55) {
      shown.add(i);
      real.push(i);
    } else {
      ok(shown.next() === real.shift(), "code queue", "the shown code comes out in a different order");
    }
    if (shown.size !== real.size) fail("code queue", "sizes differ");
  }
}

// ---------------------------------------------------------------- 7. Settings text
section("7. Settings text");
checkText("config", "whatsAppText", CONFIG.whatsAppText, { brands: [] });
checkText("config", "program.name", CONFIG.program.name, { brands: [] });
for (const key of ["{shift}", "{you}", "{algo}", "{program}"]) ok(CONFIG.whatsAppText.includes(key), "config", `whatsAppText must use ${key}`);
ok(CONFIG.salesWhatsApp === "" || /^\d{11,15}$/.test(CONFIG.salesWhatsApp), "config", "salesWhatsApp must be empty or 11 to 15 digits");
ok(CONFIG.game.crawl > 0 && CONFIG.game.crawl <= 1, "config", "game.crawl must be above 0 and at most 1");

// ---------------------------------------------------------------- 8. Fixed expected values
section("8. Fixed expected values (PROJECT_BRIEF.md Section 10)");
const S = Object.fromEntries(SHIFTS.map((s) => [s.id, s]));
const R = Object.fromEntries(SHIFTS.map((s) => [s.id, runAlgorithm(CITY, s)]));
const A = Object.fromEntries(SHIFTS.map((s) => [s.id, score(R[s.id].sim)]));
const line = (id, kind) => score(replay(CITY, S[id], LINES[id][kind]).sim);
const row = (s) => [s.avg, s.totalMins, s.delivered, s.late, s.missed];

expect("shift ids", SHIFTS.map((s) => s.id), ["lunch", "dinner", "rain"]);
expect("orders per shift", SHIFTS.map((s) => s.orders.length), [12, 18, 12]);
expect("riders per shift", SHIFTS.map((s) => s.riders.length), [3, 4, 3]);
expect("algorithm lunch [avg, total, delivered, late, missed]", row(A.lunch), [18.8, 225, 12, 2, 0]);
expect("algorithm dinner", row(A.dinner), [18.2, 328, 18, 4, 0]);
expect("algorithm rain", row(A.rain), [22.8, 274, 12, 4, 0]);
expect("algorithm end minutes [lunch, dinner, rain]", SHIFTS.map((s) => R[s.id].sim.t), [63, 71, 83]);
expect("sample lunch", row(line("lunch", "sample")), [25.8, 309, 12, 7, 0]);
expect("sample dinner", row(line("dinner", "sample")), [28.1, 506, 18, 13, 0]);
expect("sample rain", row(line("rain", "sample")), [36.3, 435, 12, 10, 0]);
expect("best lunch", row(line("lunch", "best")), [17.3, 207, 12, 2, 0]);
expect("best dinner", row(line("dinner", "best")), [16, 288, 18, 3, 0]);
expect("best rain", row(line("rain", "best")), [19.9, 239, 12, 5, 0]);
expect("sample end minutes [lunch, dinner, rain]", SHIFTS.map((s) => replay(CITY, s, LINES[s.id].sample).sim.t), [74, 96, 95]);
expect("sample lunch frame at minute 30 [delivered, avg]", (() => { const f = replay(CITY, S.lunch, LINES.lunch.sample).frames[30]; return [f.delivered, f.avg]; })(), [3, 14.3]);
expect("algorithm lunch times", A.lunch.times, { L01: 14, L02: 8, L03: 18, L04: 21, L05: 20, L06: 14, L07: 17, L08: 28, L09: 25, L10: 23, L11: 17, L12: 20 });
expect("compare sample lunch", compare(line("lunch", "sample"), A.lunch), { kind: "behind", gapMins: 7, gapPercent: 27 });
expect("compare best rain", compare(line("rain", "best"), A.rain), { kind: "win", gapMins: 2.9, gapPercent: 13 });
expect("compare a tie", compare({ avg: 18.8 }, { avg: 18.8 }), { kind: "tie", gapMins: 0, gapPercent: 0 });
expect("compare close (10 percent)", compare({ avg: 20 }, { avg: 18 }), { kind: "close", gapMins: 2, gapPercent: 10 });
expect("compare just past close", compare({ avg: 20.2 }, { avg: 18 }), { kind: "behind", gapMins: 2.2, gapPercent: 11 });
expect("biggest gap, sample lunch", orderGaps(S.lunch, line("lunch", "sample"), A.lunch)[0], { id: "L02", you: 30, algo: 8, gap: 22 });
expect("formatMins", [formatMins(21), formatMins(21.3), formatMins(0)], ["21.0", "21.3", "0.0"]);
expect("encodeBeat", [encodeBeat(21.3), encodeBeat(18.8)], [213, 188]);
const ids = SHIFTS.map((s) => s.id);
expect("decodeChallenge good", decodeChallenge("lunch", "213", ids), { shift: "lunch", avg: 21.3 });
expect("decodeChallenge bad shift", decodeChallenge("brunch", "213", ids), null);
expect("decodeChallenge bad number", decodeChallenge("lunch", "21x", ids), null);
expect("decodeChallenge script", decodeChallenge("lunch", "<script>", ids), null);
expect("decodeChallenge too large", decodeChallenge("lunch", "9000", ids), null);
expect("decodeChallenge too small", decodeChallenge("lunch", "05", ids), null);
expect("decodeChallenge missing", decodeChallenge("lunch", null, ids), null);
const dLunch = R.lunch.decisions[0];
expect("lunch decision 1", [dLunch.t, dLunch.order, dLunch.rider, dLunch.finish, dLunch.position], [1, "L02", "r1", 9, 1]);
expect("lunch decision 1 finishes", dLunch.candidates.map((c) => c.finish), [9, 13, 15]);
expect("lunch decision 1 heap", dLunch.heapBefore, [{ id: "L02", dueAt: 23 }, { id: "L01", dueAt: 26 }]);
expect("lunch decision 1 BFS", [routeTrace(grid, dLunch, "r1").dist, routeTrace(grid, dLunch, "r1").checked], [2, 7]);
expect("lunch decision 1 words", explainDecision(dLunch, S.lunch, CITY, EXPLAIN), {
  pq: "2 orders are waiting. Masala Vada for Lakshmi is due first, at minute 23, so it comes out next.",
  bfs: "BFS spreads out from Arun and reaches Filter Kaapi Stop in 2 moves, after checking 7 road squares.",
  greedy: "Arun can deliver by minute 9. Selvi would need until minute 13. Greedy takes the earliest.",
  queue: "The order joins Arun's queue at position 1. Riders finish jobs in the order they got them."
});
expect("rain with no floods would be faster", score(runAlgorithm(CITY, { ...S.rain, closures: [] }).sim).avg, 18.5);
expect("frames: first and last minute, lunch", [R.lunch.frames[0].t, R.lunch.frames.at(-1).t], [0, 63]);
expect("frames: last average equals the score", R.lunch.frames.at(-1).avg, A.lunch.avg);
expect("runningAvg at the end equals the score", runningAvg(R.lunch.sim), A.lunch.avg);
expect("runningAvg before any delivery", runningAvg(createSim(CITY, S.lunch)), null);

// ---------------------------------------------------------------- 9. copy.js
section("9. js/copy.js");
const copyPath = join(ROOT, "js", "copy.js");
if (existsSync(copyPath)) {
  try {
    const copy = await import(pathToFileURL(copyPath).href);
    ok(typeof copy.t === "function" && copy.COPY && typeof copy.COPY === "object", "js/copy.js", "must export t() and COPY");
    for (const [k, v] of Object.entries(copy.COPY)) {
      if (typeof v !== "string") fail("js/copy.js", `${k} is not text`);
      else checkText("js/copy.js", k, v, { max: 240 });
    }
    console.log("  (js/copy.js found and checked)");
  } catch (e) {
    fail("js/copy.js", `could not load: ${e.message}`);
  }
} else {
  console.log("  (js/copy.js not built yet)");
}

// ---------------------------------------------------------------- Result
console.log(`\n${passes} checks passed, ${failures} failed.`);
console.log(failures ? `RESULT: ${failures} FAIL` : "RESULT: ALL PASS");
process.exit(failures ? 1 : 0);
