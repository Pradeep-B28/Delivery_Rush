// The 4 DSA ideas shown on the thinking screen, with real code and plain English.
// Locked content. tools/verify-content.mjs runs every code snippet below and compares it with the engine.
// Used by content/index.js, js/engine/explain.js and the thinking screen.

export const CONCEPTS = [
  {
    id: "pq",
    name: "Priority queue",
    question: "Which order goes first?",
    plain: "Waiting orders sit in a heap, a small tree that always keeps the order due soonest on top. Ice cream can jump ahead of a biryani that came earlier.",
    why: "Taking the top order needs only a few swaps, even with thousands of orders waiting.",
    file: "heap.js",
    code: [
      "function popNext(heap) {",
      "  const sooner = (a, b) => a && a.due < b.due;",
      "  const top = heap[0];",
      "  const last = heap.pop();",
      "  if (heap.length === 0) return top;",
      "  heap[0] = last;",
      "  let i = 0;",
      "  while (true) {",
      "    const l = 2 * i + 1;",
      "    const r = 2 * i + 2;",
      "    let pick = i;",
      "    if (sooner(heap[l], heap[pick])) pick = l;",
      "    if (sooner(heap[r], heap[pick])) pick = r;",
      "    if (pick === i) return top;",
      "    const held = heap[i];",
      "    heap[i] = heap[pick];",
      "    heap[pick] = held;",
      "    i = pick;",
      "  }",
      "}"
    ]
  },
  {
    id: "bfs",
    name: "BFS",
    question: "Which road?",
    plain: "Breadth-first search spreads out from the rider one road square at a time, like water. The first time it touches the shop, that route is the shortest. A flooded bridge is simply skipped.",
    why: "Every road square is one minute here, so the first route found is always a shortest one.",
    file: "bfs.js",
    code: [
      "function bfs(start, goal, roads) {",
      "  const queue = [start];",
      "  const cameFrom = new Map([[start, null]]);",
      "  while (queue.length > 0) {",
      "    const cell = queue.shift();",
      "    if (cell === goal) break;",
      "    for (const next of roads(cell)) {",
      "      if (cameFrom.has(next)) continue;",
      "      cameFrom.set(next, cell);",
      "      queue.push(next);",
      "    }",
      "  }",
      "  if (!cameFrom.has(goal)) return null;",
      "  const path = [];",
      "  let step = goal;",
      "  while (step !== null) {",
      "    path.unshift(step);",
      "    step = cameFrom.get(step);",
      "  }",
      "  return path;",
      "}"
    ]
  },
  {
    id: "greedy",
    name: "Greedy choice",
    question: "Which rider?",
    plain: "For each order, it checks every rider with space and takes the one who can deliver soonest. It never looks ahead, which is why a clever plan can still beat it.",
    why: "A greedy choice is fast and usually good, but it is not always the best possible.",
    file: "algo.js",
    code: [
      "function pickRider(order, riders, finish) {",
      "  let best = null;",
      "  let bestTime = Infinity;",
      "  for (const rider of riders) {",
      "    if (rider.jobs >= rider.maxJobs) continue;",
      "    const time = finish(rider, order);",
      "    if (time < bestTime) {",
      "      best = rider;",
      "      bestTime = time;",
      "    }",
      "  }",
      "  return best;",
      "}"
    ]
  },
  {
    id: "queue",
    name: "Queue",
    question: "What does the rider do next?",
    plain: "Each rider keeps jobs in a queue: first in, first out. New jobs join at the back. The rider always takes the job at the front.",
    why: "Adding and removing both take one step, however long the queue gets.",
    file: "queue.js",
    code: [
      "class RiderQueue {",
      "  constructor() {",
      "    this.jobs = [];",
      "    this.head = 0;",
      "  }",
      "  add(job) {",
      "    this.jobs.push(job);",
      "  }",
      "  next() {",
      "    return this.jobs[this.head++];",
      "  }",
      "  get size() {",
      "    return this.jobs.length - this.head;",
      "  }",
      "}"
    ]
  }
];

// The lines that explain one decision. {names} are filled by js/engine/explain.js.
export const EXPLAIN = {
  pq: "{n} orders are waiting. {dish} for {customer} is due first, at minute {due}, so it comes out next.",
  "pq.one": "Only {dish} for {customer} is waiting, so it comes out next.",
  bfs: "BFS spreads out from {rider} and reaches {shop} in {dist} moves, after checking {checked} road squares.",
  greedy: "{rider} can deliver by minute {finish}. {other} would need until minute {otherFinish}. Greedy takes the earliest.",
  "greedy.one": "{rider} is the only rider with space, so {rider} gets it.",
  queue: "The order joins {rider}'s queue at position {pos}. Riders finish jobs in the order they got them."
};
