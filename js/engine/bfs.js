// The city grid and breadth-first search (BFS): the shortest route along open roads.
// Uses queue.js. Pure functions, no DOM. Neighbours are always tried North, East, South, West, so routes never vary.
// Used by js/engine/sim.js, js/engine/algo.js, the thinking screen and tools/verify-content.mjs.

import { Queue } from "./queue.js";

const ROAD = new Set([".", "="]);

// Builds the grid from content/city.js.
export function buildGrid(city) {
  const rows = city.map.length;
  const cols = city.map[0].length;
  const road = new Array(rows * cols).fill(false);
  city.map.forEach((line, r) => {
    [...line].forEach((ch, c) => {
      road[r * cols + c] = ROAD.has(ch);
    });
  });
  return { cols, rows, road, cache: new Map() };
}

export function cellId(grid, c, r) {
  return r * grid.cols + c;
}

export function cellXY(grid, id) {
  return { c: id % grid.cols, r: Math.floor(id / grid.cols) };
}

// Road cells next to a cell that are not closed, in the order N, E, S, W.
export function neighbours(grid, id, closed = new Set()) {
  const { c, r } = cellXY(grid, id);
  const out = [];
  const tryCell = (nc, nr) => {
    if (nc < 0 || nr < 0 || nc >= grid.cols || nr >= grid.rows) return;
    const n = cellId(grid, nc, nr);
    if (grid.road[n] && !closed.has(n)) out.push(n);
  };
  tryCell(c, r - 1);
  tryCell(c + 1, r);
  tryCell(c, r + 1);
  tryCell(c - 1, r);
  return out;
}

// The shortest route from start to goal.
// Returns { found, dist, path, visited, checked }.
//   path: the cells to walk, not including start.
//   visited: every cell the search took out of its queue, in order, as { cell, dist }. Used to draw the wave.
//   checked: visited.length.
// A closed start cell is allowed (a rider standing on a road that just flooded can still leave it).
export function bfs(grid, start, goal, closed = new Set()) {
  const queue = new Queue([start]);
  const cameFrom = new Map([[start, null]]);
  const distance = new Map([[start, 0]]);
  const visited = [];
  while (queue.size > 0) {
    const cell = queue.shift();
    visited.push({ cell, dist: distance.get(cell) });
    if (cell === goal) break;
    for (const next of neighbours(grid, cell, closed)) {
      if (cameFrom.has(next)) continue;
      cameFrom.set(next, cell);
      distance.set(next, distance.get(cell) + 1);
      queue.push(next);
    }
  }
  if (!cameFrom.has(goal)) return { found: false, dist: -1, path: [], visited, checked: visited.length };
  const path = [];
  for (let c = goal; c !== start; c = cameFrom.get(c)) path.unshift(c);
  return { found: true, dist: path.length, path, visited, checked: visited.length };
}

// Moves from start to goal, or -1 if there is no route. Results are remembered per set of closed roads.
export function distance(grid, start, goal, closed = new Set()) {
  const key = [...closed].sort((a, b) => a - b).join(",") + "|" + start;
  let all = grid.cache.get(key);
  if (!all) {
    all = new Map([[start, 0]]);
    const queue = new Queue([start]);
    while (queue.size > 0) {
      const cell = queue.shift();
      for (const next of neighbours(grid, cell, closed)) {
        if (all.has(next)) continue;
        all.set(next, all.get(cell) + 1);
        queue.push(next);
      }
    }
    grid.cache.set(key, all);
  }
  return all.has(goal) ? all.get(goal) : -1;
}
