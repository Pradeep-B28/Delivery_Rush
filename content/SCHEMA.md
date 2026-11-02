# Content schema

Everything in `content/` is locked. Gemini reads it and never edits it. `node tools/verify-content.mjs` checks every rule below.

## city.js

`CITY`: the made-up city, Namma Nagar. A cell is `[column, row]`, counted from the top left, both starting at 0.

| Field | Meaning |
|---|---|
| `map` | 13 strings of 13 letters. `.` road, `=` bridge (also a road), `#` buildings, `P` park, `~` river |
| `areas` | 4 labels drawn faintly on the map, at `cell` |
| `bridges` | The 2 river crossings. `name` appears in flood messages |
| `shops` | `id`, `name`, `icon` (`biryani`, `dosa`, `coffee`, `curry`, `grill`, `icecream`), `cell` on a road |
| `homes` | `id`, `name` (the customer), `cell` on a road. No two places share a cell |
| `riders` | `id`, `name`. A shift picks which riders it uses |
| `kinds` | The badge on an order card: `normal` none, `melts` "Melts fast", `cools` "Best hot" |
| `dishes` | Dishes per shop, each with its `kind` |

## shifts/*.js

`SHIFT`: one shift. `SHIFTS` in `index.js` lists them in the order the home screen shows them.

| Field | Meaning |
|---|---|
| `id`, `name`, `level`, `tagline` | Shown on the shift card |
| `mood` | `day`, `evening` or `rain`. Changes the map's look (Section 6C of the brief) |
| `maxJobs` | The most jobs a rider can hold, counting the one in hand |
| `closeAt` | The shift's last minute. Anything not delivered by then is missed |
| `missedMins` | The minutes a missed order counts for in the average |
| `riders` | `id` and `start` cell. `start` is never a shop or a home |
| `closures` | `name`, `from`, `to`, `cells`. Roads are closed from minute `from` up to, not including, `to` |
| `orders` | In order of `at`, below |

Each order:

| Field | Meaning |
|---|---|
| `id` | Letter and 2 digits, `L01` |
| `at` | The minute it arrives |
| `shop`, `dish`, `home` | Where from, what, and who for |
| `prep` | Minutes until the food is ready. A rider who arrives early waits |
| `promise` | Minutes from `at` until it is due. The card's timer counts down to `at + promise` |
| `kind` | Must match the dish in `city.js` |

## lines.js

`LINES`: saved ways of playing each shift, as `{ t, order, rider }` actions.

- `sample`: a typical first-time player (oldest order first, rider who looks closest on the map, 2 minutes slow). Demo mode plays this.
- `best`: a plan that beats the algorithm, from a long search that knew every future order. It proves the game is not rigged. It is not shown to players.

## thinking.js

`CONCEPTS`: `pq`, `bfs`, `greedy`, `queue`, in that order. `id`, `name`, `question`, `plain`, `why`, `file`, `code`. Every code line is 46 characters or fewer, so code never scrolls sideways on a phone. The content check runs every snippet and compares it with the engine.

`EXPLAIN`: the templates `js/engine/explain.js` fills for one decision. Keys ending in `.one` are the single-choice versions.
