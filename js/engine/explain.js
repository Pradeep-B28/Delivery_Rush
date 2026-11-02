// Turns one algorithm decision into the plain English lines on the thinking screen.
// Uses bfs.js and algo.js. Pure functions, no DOM. Templates come from content/thinking.js.
// Used by the thinking screen, the self-test and tools/verify-content.mjs.

import { buildGrid } from "./bfs.js";
import { routeTrace } from "./algo.js";

function fill(text, values) {
  return text.replace(/\{([a-zA-Z]+)\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Missing value for {${key}}`);
    return String(values[key]);
  });
}

// Returns { pq, bfs, greedy, queue }, one line per idea.
export function explainDecision(decision, shift, city, templates) {
  const order = shift.orders.find((o) => o.id === decision.order);
  const name = (list, id) => list.find((x) => x.id === id).name;
  const riderName = (id) => name(city.riders, id);
  const rider = riderName(decision.rider);
  const shop = name(city.shops, order.shop);
  const customer = name(city.homes, order.home);
  const n = decision.heapBefore.length;

  const pq = n === 1
    ? fill(templates["pq.one"], { dish: order.dish, customer })
    : fill(templates.pq, { n, dish: order.dish, customer, due: order.at + order.promise });

  const trace = routeTrace(buildGrid(city), decision, decision.rider);
  const bfs = fill(templates.bfs, { rider, shop, dist: trace.dist, checked: trace.checked });

  const others = decision.candidates
    .filter((c) => !c.full && c.rider !== decision.rider)
    .sort((a, b) => a.finish - b.finish);
  const greedy = others.length === 0
    ? fill(templates["greedy.one"], { rider })
    : fill(templates.greedy, { rider, finish: decision.finish, other: riderName(others[0].rider), otherFinish: others[0].finish });

  const queue = fill(templates.queue, { rider, pos: decision.position });
  return { pq, bfs, greedy, queue };
}
