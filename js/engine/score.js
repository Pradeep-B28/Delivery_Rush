// Every number on the scoreboard comes from here, so no two screens can ever disagree.
// Uses nothing. Pure functions, no DOM.
// Used by the game, race and thinking screens, js/links.js, the self-test and tools/verify-content.mjs.

const tenth = (x) => Math.round(x * 10) / 10;

// The result of a finished shift.
// A delivered order counts its real minutes. A missed order counts shift.missedMins.
// Returns { count, delivered, late, missed, totalMins, avg, times } where times[orderId] is minutes or null if missed.
export function score(sim) {
  const times = {};
  let totalMins = 0;
  let delivered = 0;
  let late = 0;
  let missed = 0;
  for (const o of sim.orders) {
    if (o.status === "delivered") {
      const mins = o.deliveredAt - o.at;
      times[o.id] = mins;
      totalMins += mins;
      delivered += 1;
      if (o.deliveredAt > o.dueAt) late += 1;
    } else {
      times[o.id] = null;
      totalMins += sim.shift.missedMins;
      missed += 1;
    }
  }
  const count = sim.orders.length;
  return { count, delivered, late, missed, totalMins, avg: tenth(totalMins / count), times };
}

// The average of the orders delivered so far, or null before the first delivery. Used while a shift is running.
export function runningAvg(sim) {
  const done = sim.orders.filter((o) => o.status === "delivered");
  if (done.length === 0) return null;
  return tenth(done.reduce((s, o) => s + (o.deliveredAt - o.at), 0) / done.length);
}

// You against the algorithm, using the same rounded numbers the screen shows.
// kind is "win", "tie", "close" (up to 10 percent slower) or "behind".
// gapMins is always 0 or more. gapPercent is how much faster the winner was than the loser, rounded.
export function compare(you, algo) {
  const a = you.avg;
  const b = algo.avg;
  if (a === b) return { kind: "tie", gapMins: 0, gapPercent: 0 };
  const winner = Math.min(a, b);
  const loser = Math.max(a, b);
  const gapMins = tenth(loser - winner);
  const gapPercent = Math.round(((loser - winner) / loser) * 100);
  if (a < b) return { kind: "win", gapMins, gapPercent };
  return { kind: gapPercent <= 10 ? "close" : "behind", gapMins, gapPercent };
}

// Each order, with the minutes under you and the algorithm, biggest loss first.
// A missed order counts as missedMins here too. Ties keep the shift's order.
export function orderGaps(shift, you, algo) {
  const mins = (s, id) => (s.times[id] === null ? shift.missedMins : s.times[id]);
  return shift.orders
    .map((o, i) => ({ id: o.id, i, you: you.times[o.id], algo: algo.times[o.id], gap: mins(you, o.id) - mins(algo, o.id) }))
    .sort((p, q) => q.gap - p.gap || p.i - q.i)
    .map(({ id, you: y, algo: al, gap }) => ({ id, you: y, algo: al, gap }));
}

// 21.3 becomes "21.3" and 21 becomes "21.0".
export function formatMins(x) {
  return Number(x).toFixed(1);
}

// Challenge links carry a score as whole tenths: 21.3 becomes 213.
export function encodeBeat(avg) {
  return Math.round(avg * 10);
}

// Reads a challenge link's values. Anything unexpected gives null, and the site shows no challenge.
export function decodeChallenge(shiftId, beat, shiftIds) {
  if (!shiftIds.includes(shiftId)) return null;
  if (typeof beat !== "string" || !/^\d{2,4}$/.test(beat)) return null;
  const n = Number(beat);
  if (n < 10 || n > 2000) return null;
  return { shift: shiftId, avg: n / 10 };
}
