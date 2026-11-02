# Delivery Rush: Project Brief

Read this whole file before you write any code. Then read `content/SCHEMA.md`. Work in the phases in Section 11, and stop after each one with a Phase Report.

I am not from a tech background. Explain things in plain words.

---

## 1. What we are building

**Delivery Rush** is a game website by Wrench Wise, for phone and laptop. Food orders pop up across a drawn city called Namma Nagar. The player taps an order, then taps a rider. When the shift ends, an algorithm plays the **exact same shift**, and both play out side by side on two maps. A live scoreboard compares the player's average delivery time with the algorithm's. Then the player can step through how the algorithm thought.

It sells the **Certification Program in AI-Powered Software Engineering & DSA**. The message: "This is what DSA is for."

**DSA inside:** priority queue (which order first), BFS (which road), greedy choice (which rider), queue (what the rider does next).

**Version 1** has 3 shifts:

| Shift | Riders | Orders | Twist |
|---|---|---|---|
| Lunch Rush | 3 | 12 | The warm up |
| Dinner Rush | 4 | 18 | Orders arrive in bursts, at evening on the map |
| Rain Shift | 3 | 12 | The two bridges flood in turn, and riders must re-route |

**Who uses it:** people who see our reels (mostly on phones), people at our free live sessions, and leads our sales team sends it to. Many have never written code.

**Already done and tested for you:** the city, the 3 shifts, the simulation, the algorithm and the scoring. Your job is everything the visitor sees and touches.

When there is a trade-off, follow this order:
1. The game feels fast, clear and fair on a phone.
2. The race and scoreboard look premium. This is the moment people screenshot.
3. Every number is exactly right (Section 10).
4. It runs smoothly on a mid-range Android phone.
5. The thinking screen teaches clearly.
6. The WhatsApp and share buttons work in one tap.
7. It is easy to upgrade (Section 3).
8. Everything else.

---

## 2. Hard rules

1. **Code.** Plain HTML, CSS and JavaScript (ES modules) only. No frameworks, libraries, CDNs, npm packages or web fonts. No animation libraries. The only image files are the logo, the link preview image and app icons. Draw everything else in code (the city, food icons, scooters).
2. **Front-end only.** No backend, database, API keys, AI calls or accounts.
3. **Locked files.** Never edit anything in `content/`, `js/engine/`, `tools/` or `package.json`. At the start of every phase, run `node tools/verify-content.mjs`. It must end with `RESULT: ALL PASS`. If you think content or an engine rule is wrong, stop and tell me. Do not fix it yourself.
4. **One engine, one source for every number.** Only the engine moves riders, finds routes, works out times and scores. Every number on any screen comes straight from `score()`, `runningAvg()`, `compare()`, `orderGaps()`, `estimate()` or a frame, and is shown with `formatMins()`. Never recalculate one anywhere else. (In an earlier project, a total worked out in the UI disagreed with the engine's total on the same screen.)
5. **Storage.** `localStorage` may hold only `dr-theme`, `dr-best` (best average per shift), `dr-coach` (the first-time tip was seen) and `dr-sound`. `sessionStorage` may hold only `dr-intro-seen`. Wrap every read and write in try and catch, check values on read, and make the site work fine when storage is blocked.
6. **No personal data.** The site never asks for a name, phone number or email. Nothing is gated. No forms.
7. **External scripts.** Only GA4 and the Meta Pixel, and only when their IDs are set in `config.js`. Never load them with `?test=1`, `?demo=1` or `?present=1`.
8. **Tone.** Calm, warm and clear. Losing to the algorithm must never feel like an insult. Never promise a job, an interview or a result. Never use these anywhere a user can see them: stupid, dumb, idiot, noob, loser, useless, pathetic, terrible, "take your job", "replace you", guarantee, placement, salary, lakh, "get hired", "seats left", or any countdown to buy.
9. **Program names.** Always the full name from `config.js`. Never shorten it.
10. **Writing style.** All UI text and docs are in plain English with short sentences. No emojis. No em dashes (the long dash).
11. **Safety.** Never use `innerHTML` or `insertAdjacentHTML` with changing values. Values from a link are shown only after `decodeChallenge()` accepts them.
12. **Hidden means hidden.** `base.css` must include `[hidden] { display: none !important; }`. (In an earlier project, a CSS rule kept a "hidden" debug panel visible on the live site.)
13. **No debug output live.** No debug panels, test overlays or `console.log` in the live site. Test output appears only with `?test=1`.
14. **Nothing overlaps. Nothing is cramped.** No element may ever sit on top of another, cover a button, or be cut off, at any size from 360 x 640 to 1920 x 1080. Messages have their own reserved row. They never float over the map or the cards. There is no sideways scrolling anywhere. Text is at least 13px on phones, except map labels. (An earlier project was rejected for overlapping layers, tiny labels and a crowded panel.)
15. **It must not look like a placeholder.** No big letters standing in for pictures, no flat grey squares, no plain dots for riders. If the art looks unfinished, it is not done. (An earlier project was rejected for fake-looking images. Another was called "simple" because of flat squares and muted colours.)
16. **Same screen, every check.** Check every screen at 360 x 640, 390 x 844, 844 x 390, 1440 x 900 and in both themes before a Phase Report. Check the screenshots yourself, looking for rule 14 and rule 15 problems, before you send them.
17. **File size.** One job per file, under about 350 lines. Start every JS file with a 3-line comment: what it does, what it uses, what uses it.
18. **Phases.** At the end of every phase, stop and give a Phase Report (Section 12). Do not start the next phase until I say so.
19. **Stubborn bugs.** If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
20. **My actions.** When you need me to do something (click, log in, approve), give numbered click-by-click steps.
21. **Commands.** Before running a terminal command, tell me in one line what it does.
22. **Branding.** Wrench Wise only. Namma Nagar, the shops, riders and customers are made up and stay exactly as written in `content/`. No real delivery company's name, logo or colours anywhere, including the docs. The footer says this is a made-up city (Section 8).

---

## 3. Built to upgrade

We have rebuilt earlier apps to add features. This one must be easy to grow. **A new shift should be a new data file, not new code.**

1. **One settings file.** `config.js` holds every business setting. Changing the WhatsApp number, the program, analytics IDs, game speed or features must never need a code change anywhere else.
2. **One text file.** `js/copy.js` exports `COPY` (every word the visitor sees, except content) and `t(key, values)`. Group keys by screen. `t()` fills `{name}` values. When a value named `n` is 1 and a key ending in `.one` exists, `t()` uses that key. A Tamil version later is a new `copy.ta.js`, not a rewrite. The content check reads `copy.js` once it exists.
3. **Content as data.** Shifts live in `content/shifts/` and are listed in `content/index.js`. The site reads them only through `js/content.js`. No screen may mention a shift by name in code. Riders, orders per shift and moods all come from the data, so the layout must work for 2, 3 or 4 riders.
4. **The game has no DOM.** `js/game.js` holds one shift in play: the sim, the clock, the selected order. Screens only draw it. This is why the self-test can play whole shifts without a browser window being touched.
5. **Screens are modules.** Each file in `js/screens/` exports `mount` and `unmount`.
6. **Events, not imports, between features.** Features talk through `js/events.js` (`on`, `off`, `emit`). Analytics listens to events and never reaches into other files.
7. **Feature switches.** Every optional feature checks its switch in `config.features`. Off means fully hidden, with no errors.
8. **Self-test grows.** Every new feature adds its checks to `selftest.js`.
9. **Versions.** `CHANGELOG.md` gets an entry for every release. `config.version` matches it.

**A new shift later** will be: `content/shifts/<id>.js` and its lines in `content/lines.js` (I prepare and test these with Claude first, then lock them), plus one line in `content/index.js`. No other file changes.

---

## 4. Tech setup and file structure

- ES modules need a local server. Use `npx --yes serve .` from the project folder (it only runs the folder, nothing is added to the project), or Antigravity's built-in preview.
- `package.json` exists only so Node reads the content check correctly. Nothing is installed. Vercel needs no build command.

```
delivery-rush/
  index.html
  config.js                 given. Section 5
  package.json              given. LOCKED
  manifest.json
  og-image.png              made in Phase 6
  .gitignore                node_modules/, .DS_Store, Thumbs.db
  assets/
    logo.png                I add this
    icons/                  app icons
  content/                  LOCKED. SCHEMA.md explains every field
  tools/                    LOCKED. verify-content.mjs, policies.mjs
  js/
    engine/                 LOCKED
      bfs.js                buildGrid, cellId, cellXY, neighbours, bfs, distance
      queue.js  heap.js     the data structures
      sim.js                createSim, advance, assign, estimate, riderFree, waitingOrders, nothingToDecide, closedAt, play, replay
      algo.js               runAlgorithm, routeTrace
      score.js              score, runningAvg, compare, orderGaps, formatMins, encodeBeat, decodeChallenge
      explain.js            explainDecision
    main.js                 starts everything, reads the URL modes
    events.js               on, off, emit
    copy.js                 COPY and t(). Section 8
    content.js              the only file that imports content/
    store.js                safe localStorage and sessionStorage
    links.js                WhatsApp, program, share and challenge links with UTM
    analytics.js            Section 9
    selftest.js             ?test=1. Section 10
    router.js               #/, #/play/<id>, #/result, #/think/<id>
    motion.js               the one animation loop and the reduced motion check
    clock.js                the game clock rules. No DOM. Section 6D
    game.js                 one shift in play. No DOM. Section 6D
    run.js                  the last finished run, in memory only
    screens/
      home.js  play.js  result.js  think.js
    ui/
      icons.js              food, scooter, house, barrier and UI icons as inline SVG
      city.js               draws the static city for a mood
      actors.js             pins, routes and riders on top of the city
      rain.js               the rain effect
      ordercard.js  riderchip.js  statusrow.js  coach.js
      race.js  scoreboard.js  gaps.js
      heaptree.js  bfswave.js  greedybars.js  queueslots.js  codeview.js
      loader.js  cta.js  share.js  toast.js  dialog.js  sound.js
  styles/
    tokens.css  base.css  site.css  map.css  play.css  result.css  think.css
```

**Using the engine**

```js
// Playing
const sim = createSim(CITY, shift);          // starts at minute 0
const events = advance(sim);                 // moves one minute, returns what happened
assign(sim, orderId, riderId);               // { ok: true } or { ok: false, reason }
// reason: "ended", "not-waiting", "unknown-rider", "rider-full"

// After the shift
const you = score(sim);                      // { count, delivered, late, missed, totalMins, avg, times }
const algoRun = runAlgorithm(CITY, shift);   // { sim, frames, decisions }
const algo = score(algoRun.sim);
const verdict = compare(you, algo);          // { kind, gapMins, gapPercent }. kind: win, tie, close, behind
const yourRun = replay(CITY, shift, sim.actions);  // { sim, frames }
const gaps = orderGaps(shift, you, algo);    // biggest loss first
```

- **Event types from `advance()`:** `order` (`id`), `pickup` (`id`, `rider`), `delivered` (`id`, `rider`, `mins`, `late`), `closure` (`name`), `reopen` (`name`), `end` (`reason`: `done` or `closed`).
- **An order** has: `id`, `at`, `shop`, `home`, `dish`, `kind`, `shopCell`, `homeCell`, `readyAt`, `dueAt`, `status` (`future`, `waiting`, `assigned`, `picked`, `delivered`, `missed`), `rider`, `assignedAt`, `pickedAt`, `deliveredAt`.
- **A rider** has: `id`, `name`, `cell`, `prevCell`, `jobs` (a queue, with `toArray()` and `size`), `phase` (null, `toShop`, `waiting`, `toHome`), `route` (cells still to walk).
- **A frame** (one per minute) has: `t`, `riders` (`id`, `cell`, `phase`, `jobs`), `closed`, `delivered`, `late`, `avg` (null until the first delivery), `active` (order ids being delivered).
- **A decision** has: `t`, `order`, `rider`, `heapBefore`, `heapAfter`, `candidates` (`rider`, `full`, `jobs`, `fromCell`, `freeAt`, `toShop`, `pickupAt`, `toHome`, `finish`), `position`, `fromCell`, `shopCell`, `homeCell`, `closed`, `finish`.
- Cells are numbers. `cellXY(grid, id)` gives `{ c, r }`.

**One animation loop** using `requestAnimationFrame`, with delta time capped at 100 ms. Pause it when the tab is hidden. A hidden tab also pauses the game.

---

## 5. config.js

`config.js` is already in the folder. Keep its structure and comments. You may change only:
- `salesWhatsApp`, when I give you the number
- `siteUrl`, in Phase 7

What each setting does:
- `salesWhatsApp`: digits only, country code first, 11 to 15 digits. If empty or not in that format, hide the WhatsApp button and make "See the program" the main button.
- `whatsAppText`: the prefilled message. `{shift}` is the shift's name. `{you}` and `{algo}` come through `formatMins()`. `{program}` is `program.name`.
- `program`: the full name and its page on wrench-wise.com (`""` means the main site).
- `website` and `utm`: build every link to wrench-wise.com, adding `utm_content` (`home`, `result`, `think`, `footer` or `share`).
- `analytics`: an empty ID switches that tracker off.
- `game`: the clock rules (6D). I will tune these after real people play, so nothing else may contain these numbers.
- `race`: the race length and speed buttons.
- `features`: switches.

---

## 6. Features

### Must have

**A. Loader**
- First visit of a session only (`dr-intro-seen`), never in demo or test mode.
- A small drawn road sweeps across, a scooter rides it, and the Wrench Wise logo fades in behind it. Then it fades out. Under 1.2 seconds in total, and never holds the page longer.
- Reduced motion: a 150 ms fade.

**B. Home screen** (`#/`)
- **Background:** `--bg-grad`, a very faint 24px grid (`--brand` at 5% opacity) and two large soft glows (`--accent` at 8%) drifting slowly.
- **Header:** Wrench Wise logo, theme button.
- **Hero, left:** eyebrow chip, title, subtitle, buttons `home.start` for the first shift (primary, `--brand-grad`) and `home.how` (scrolls down).
- **Hero, right:** the real city, alive. It plays the algorithm's run of the first shift on a loop at 4 times speed using `runAlgorithm` frames, with riders moving and small pins pulsing. Under it, one line: `home.liveLine`. On phone it sits below the buttons, full width.
- **Shift cards:** one per shift from content: a small drawn map thumbnail in that shift's mood, name, level chip, tagline, the viewer's best average if there is one (`dr-best`), and "Play". The whole card is the tap target.
- **How it works:** 3 numbered steps from Section 8, each with a small drawn picture.
- **What's inside:** 4 chips with the concept `name` and `question` from `CONCEPTS`, in plain words.
- **Challenge banner:** if the URL has a valid challenge (`?shift=lunch&beat=213`, checked by `decodeChallenge()`), a banner above the hero shows `challenge.banner` and its "Play" button starts that shift. An invalid link shows no banner and no error.
- **Footer:** Section 8 keys `footer.*`, and a link to wrench-wise.com with `utm_content=footer`.

**C. The city** (`ui/city.js`, `ui/actors.js`)

This must look like a small, charming drawn city, not a grid. Draw it as one SVG with a `viewBox` of 520 x 520 (each cell is 40). Scale the SVG, never redraw it for size.

From bottom to top:
1. **Land** fills the map, with 20px rounded corners on the whole map.
2. **Buildings:** each `#` cell is a block of 2 or 3 rounded building shapes with slightly different heights and roof tones, picked by a fixed sum from the cell's position so they never change. A soft shadow below each gives depth. Small lit windows on the `evening` mood.
3. **Park:** the `P` cells join into one rounded green shape, with round trees and a small path.
4. **River:** the `~` cells join into one continuous band with soft banks and a few slow, thin wave lines. No gaps between cells.
5. **Roads:** `.` cells are drawn as joined strokes (not squares): width 22, round joins, with an edge stroke under them and a thin dashed centre line on the longer stretches.
6. **Bridges:** a road over the river, with two rail lines. When flooded (`closed` includes its cell): the road turns to water, a striped barrier sits on each end, and it pulses gently once.
7. **Area labels:** `areas` in small, faint text (`--map-label`). Hide them under 300px map width.
8. **Shops:** a rounded 30 x 30 tile on a small stem, with the shop's drawn food icon. It lifts and shows its name when its order is selected. A shop with a live order has a soft ring.
9. **Homes:** drawn only for orders that are waiting or on the way. Waiting: a small house in `--warn`. Assigned: a small house in the rider's colour.
10. **Routes:** one line per rider from the rider along `route` to the target, in the rider's colour. Dashed when going to the shop, solid when carrying food. Round caps. After a flood, the new route draws itself in 300 ms.
11. **Riders:** a drawn scooter with a delivery box, 34 x 34, in the rider's colour, with a white outline and a small number badge (1 to 4), so colour is never the only clue. It faces left or right by its direction of travel. It carries a small shadow. When carrying food, the box shows a small steam mark. Riders move smoothly from `prevCell` to `cell` using the minute's progress from the clock.
12. **Small moments:** on `delivered`, a ring pulses from the home, the house fades out, and a chip rises showing `{mins} mins` (in `--warn` if late). On `pickup`, the shop tile does a small bounce.

**Moods** come from the shift's `mood`. Map tokens are in Section 7.
- `day`: follows the site's light or dark theme.
- `evening`: dusk colours in both themes, with lit windows and small glowing street lamps at some road corners.
- `rain`: grey blue colours in both themes. `ui/rain.js` draws thin diagonal rain on a canvas layered over the map (pointer events off, at most 80 drops, off under reduced motion, and off with `features.rainEffect` false). The river band is wider by 4px.

**D. Playing a shift** (`#/play/<id>`)

**Clock rules** (`js/clock.js`). The clock never touches the DOM. Speed, in this order of priority:
1. Paused or tab hidden: 0
2. An order is selected: `config.game.crawl`
3. `nothingToDecide(sim)` is true: `config.game.idleSpeed`, and the status row shows `play.speeding`
4. Otherwise: 1

Each `tick(dtMs)` adds `dtMs * speed` to a counter. Every time the counter reaches `config.game.msPerMinute`, take that amount off and call `advance(sim)`. An order selected for `config.game.selectTimeoutMs` of real time is let go automatically. Progress for smooth rider movement is `counter / msPerMinute`.

**`js/game.js`** exports `createGame(city, shift, config)`. It returns an object with `sim`, `selected`, `select(orderId)`, `deselect()`, `pickRider(riderId)`, `pause()`, `resume()`, `tick(dtMs)` (returns the events that happened) and `progress()`. `pickRider` calls `assign`, then deselects. No DOM.

**Start:** the map appears, a 3, 2, 1 counts down inside the status row (`config.game.countdownMs`), then the clock starts. First-time players get the coach instead (below).

**Layout, laptop (900px and wider):**

```
+----------------------------------------------------------------------------+
| [Leave]   Lunch Rush   Minute 24     Avg so far 14.3     6 of 12   [Pause] |
| Status row: messages live here, one line, never over the map               |
+-------------------+--------------------------------------+-----------------+
| ORDERS            |                                      | RIDERS          |
| [order card]      |                                      | [rider chip]    |
| [order card]      |            THE CITY (square)         | [rider chip]    |
| [order card]      |                                      | [rider chip]    |
|                   |                                      |                 |
+-------------------+--------------------------------------+-----------------+
```

Left column 320px, right column 280px, the map takes the rest and stays square, as tall as the window allows. The whole page fits the window with no page scrolling. The orders list scrolls by itself if it must.

**Layout, phone (under 900px):**

```
+--------------------------------------+
| [x] Lunch Rush   Min 24   Avg 14.3   |
| Status row (one line)                |
+--------------------------------------+
|                                      |
|           THE CITY (square)          |
|                                      |
+--------------------------------------+
| [rider 1]  [rider 2]  [rider 3]      |
+--------------------------------------+
| [order] [order] [order]  scroll -->  |
+--------------------------------------+
```

CSS grid rows: `auto auto minmax(0, 1fr) auto auto`, height `100dvh`. The map is square and shrinks to fit the row, centred. Rider chips share the width equally (2 to 4). Order cards scroll sideways inside their own strip only, with snap. Riders sit above orders so a thumb moves up from order to rider. Landscape phones use the laptop layout with narrower columns (220px and 180px).

**Order card** (`ordercard.js`), at least 150 x 104 on phone:
- The shop's food icon on a soft tinted tile, the dish name (bold), "{shop} to {customer}" (2 lines at most).
- A due ring around the icon that empties from `at` to `dueAt`, with `play.dueIn` under the dish. In the last 5 minutes it turns `--warn`. Past due it shows a small `play.late` chip. Calm, no flashing.
- The `kinds` badge if the kind has one ("Melts fast", "Best hot").
- It slides in on arrival with a small sound if sound is on.
- **Selected:** a 2px `--accent` border, a soft lift, and the shop and home light up on the map, joined by a faint dotted line. The status row shows `play.pickRider`.
- Keep waiting orders sorted by arrival, oldest first. The player works out what is urgent. That is the game.

**Rider chip** (`riderchip.js`), at least 44px tall:
- Number badge in the rider's colour, name, and job dots (`maxJobs` dots, filled per job held).
- Status: `play.free` when idle, else `play.freeIn` using `riderFree(sim, rider).at - sim.t`.
- With an order selected, chips with space glow softly and are the only tappable targets. A full rider is greyed with `play.full`. Tapping a rider on the map works too.
- No order selected and a chip tapped: its route brightens for 1 second, and the status row shows `play.tapOrderFirst`.

**Status row** (`statusrow.js`): one reserved line, always the same height. It shows, newest first, one at a time: countdown, `play.tapOrder`, `play.pickRider`, `flood.closed`, `flood.open`, `play.speeding`.

**Top bar:** Leave (a dialog asks first; leaving saves nothing), shift name, minute, average so far (`runningAvg(sim)` through `formatMins`, shown as `--` while it is null), delivered count, Pause (shows a small `play.paused` card in the status row and stops the clock). The map stays visible while paused.

**Coach (first time only, `dr-coach`):** the clock waits at the first order. The status row says `coach.one`, with a tap ring on the first order card. After the tap: `coach.two`, with a tap ring on the chip of the rider with the lowest `estimate().finish`. After the assign, `coach.three` shows for 2 seconds and the clock starts. Coach text lives in the status row, never over content.

**Keyboard (laptop):** keys 1 to 9 select the matching order card, Q, W, E, R pick riders 1 to 4, Esc lets go, Space pauses.

**End:** on the `end` event, the status row shows `play.over`, the map dims for 600 ms, the run goes into `run.js`, and `dr-best` is updated if it is lower. Then the site moves to `#/result`.

**E. The race and scoreboard** (`#/result`). This is the awe moment.

Without a finished run in memory (a reload, a direct link), go to `#/`.

**The race:**
- Two copies of the city, side by side and the same size, always. "You" on the left, "Algorithm" on the right. Labels above each map.
- Both replay from frames: `replay(CITY, shift, sim.actions).frames` and `runAlgorithm(...).frames`. The clock runs from minute 0 to the larger of the two end minutes in `config.race.seconds` (or half that at 2x). Minute at time `x` is `Math.min(end, Math.floor(x / total * end))`. A map whose frames run out shows its last frame with a `race.done` chip. Riders move smoothly between frames.
- Between or above the maps, the live scoreboard: for each side, a big average (from the frame's `avg`, using `formatMins`, `--` until the first delivery) and "{n} of {count} delivered" with a thin progress bar, using `--you` and `--brand`. The numbers change on every delivery with a small tick animation.
- Controls: speed buttons from `config.race.speeds` and "Skip to result".

**The reveal,** when the race ends:
1. The two maps shrink and slide up (500 ms).
2. The final scoreboard fades in: the big numbers count up to the final `avg` from `score()` in 800 ms.
3. A row per line, You against Algorithm: Average delivery, Delivered, Late, Missed.
4. The verdict: `result.<kind>.title` and `result.<kind>.body`, with `result.percent` when there is a gap.
5. **Challenge result** if they came from a challenge link: `challenge.won` or `challenge.lost`.
6. **Where the time went** (`gaps.js`): the top 3 from `orderGaps` with a gap above 0. Each row: food icon, dish, customer, your minutes, the algorithm's minutes, and a small two-bar comparison. A missed order shows `result.missed`. If there is no gap above 0, show `result.noGaps` instead.
7. **Buttons:** "See how it thinks" (primary, opens `#/think/<id>`), `cta.whatsapp`, "Play again", the next shift, "Challenge a friend".
8. **CTA card** at the end: Section 6G.

**Layout, laptop:** the two maps sit side by side and the scoreboard sits above them, all fitting the window during the race. After the reveal, the page may scroll.

**Layout, phone (390 x 844):**

```
+--------------------------------+
| Lunch Rush         [2x] [Skip] |
+---------------+----------------+
|  You          |  Algorithm     |
|  25.8 mins    |  18.8 mins     |
|  ===----      |  =======       |
+---------------+----------------+
| [ map ]       | [ map ]        |
+---------------+----------------+
```

Each map is half the width, and the page does not scroll during the race. At that size, hide area labels, shop tile details and route dashes (solid thin lines only), and draw riders at 1.3 times their normal size in the `viewBox`, so they stay easy to see.

**Reduced motion:** no race. Show the final scoreboard straight away, with the final frame on both maps.

**F. How it thinks** (`#/think/<id>`, `features.thinking`). Works with or without a finished run.
- **Picking a decision:** a row with Back, "Decision {n} of {total}: {dish} for {customer}", Next. It opens on the decision for your biggest gap. With no run, it opens on the first decision whose `heapBefore` has 2 or more orders.
- **4 tabs,** from `CONCEPTS`: Priority queue, BFS, Greedy choice, Queue. Each tab shows its `question`. A "Next idea" button moves through them.
- **For each tab:** the visual, then the line from `explainDecision()`, then the concept's `plain` and `why`, then its code.
- **Priority queue** (`heaptree.js`): draw `heapBefore` as a real tree of circles joined by lines, up to 15 nodes. Each node has the food icon and "due {minute}". The root glows. On play, the root lifts out, and nodes move to their `heapAfter` positions by id. When the heap is empty after, show `think.heapEmpty`.
- **BFS** (`bfswave.js`): one map. The rider's scooter sits at the candidate's `fromCell`, with the shop's tile. Using `routeTrace(grid, decision, riderId)`, light up `visited` wave by wave (group by `dist`, 120 ms per wave, in `--accent` fading to 30%), with a live "{n} squares checked" counter. Then the `path` draws in the rider's colour. Flooded roads show the barrier. Rider chips above the map let them see the search from any rider. A Replay button.
- **Greedy choice** (`greedybars.js`): one horizontal bar per candidate, on one shared time axis starting at the decision's minute. 3 segments: busy until free (`freeAt - t`, grey), to the shop and waiting (`pickupAt - freeAt`, the rider's colour at 50%), to the customer (`toHome`, the rider's colour). The finish minute is at the end. The chosen one has a tick. A `full` rider shows `play.full` and no bar. Bars grow from the left in 500 ms.
- **Queue** (`queueslots.js`): the chosen rider's card with `maxJobs` slots. Slots before `position` are shown as `think.jobAhead`. The new order slides into slot `position` from the right. An arrow shows jobs leaving from the front.
- **Code** (`codeview.js`): a dark panel with the `file` name on top, line numbers and syntax highlighting using text nodes only (keywords, strings, numbers, comments, punctuation). Lines are at most 46 characters, so at 12px it fits a phone with no sideways scrolling. On phones it starts closed behind a "Show the code" button.
- **Your choice:** with a run, a card shows `think.you`: who you gave this order to, when, and the minutes against the algorithm's. If you missed it, `think.youMissed`.
- **The honest note,** always at the bottom of the page: `think.honest`, where `{gap}` is `formatMins(algo.avg - best.avg)` and `best` is the score of `replay(CITY, shift, LINES[id].best)`.
- **Layout, laptop:** visual on the left (the larger part), words and code on the right. Both fit without crowding. **Phone:** one column, in the order above, and the page scrolls.

**G. CTA and sharing**
- **CTA card** (`cta.js`), on the result and thinking screens: `cta.title`, `cta.body`, WhatsApp button (or "See the program" when there is no number), "See the program" as a text link.
- **WhatsApp text** fills in the shift's name and both averages from `score()`.
- **Share:** "Challenge a friend" uses the Web Share API with `share.text` and the site link plus `?shift=<id>&beat=<encodeBeat(you.avg)>&utm_content=share`. If not available, copy the link and show `share.copied`.
- **Link preview tags:** title, description, `og:image` (`og-image.png`, 1200 x 630: the two maps side by side, with the title and the Wrench Wise logo), `og:url`, `twitter:card`.

**H. Demo mode** (`?demo=1`, `features.demoMode`), for recording reels
- Parameters: `shift` (default `lunch`), `theme` (`light` or `dark`), `part` (`all`, `play`, `race` or `think`), `speed` (1 or 2).
- No loader, no coach, no analytics, nothing saved. A small Wrench Wise logo in the top left corner.
- **Plays `LINES[shift].sample`:** a visible tap ring on the order card one minute before each action, a visible tap ring on the rider chip at the action's minute, then `pickRider`. The crawl does not apply in demo mode, so the timing is the same every time.
- The left side is labelled `demo.you` ("Sample player"), never "You", because nobody really played it. The WhatsApp button is hidden.
- `part=all` runs the shift, then the race and reveal, then the thinking screen, stepping through the 4 tabs at about 5 seconds each.
- Everything is the same every run. Write the exact seconds of each moment in `REEL_SCRIPT.md`.

**I. Themes, motion and access**
- Light and dark theme (Section 7).
- Every rule in Section 7's motion and reduced motion lists.
- Keyboard use everywhere, visible focus rings (2px `--accent`), tap targets at least 44px, contrast at least 4.5 to 1 for text. `aria-live="polite"` on the status row. The game must never depend on colour alone.

**J. Analytics:** Section 9.

### Nice to have (only if time allows, in this order)
1. **Sound** (`features.sound`): small sounds made with the Web Audio API (new order, delivered, reveal). Off by default, with a small toggle in the top bar. Saved in `dr-sound`.
2. **Presenter mode** (`?present=1`, `features.presenterMode`), for our free live sessions: opens straight on the thinking screen for Dinner Rush, code and words at 18px or more, arrow keys move between decisions and tabs, no analytics, nothing saved, no WhatsApp button.
3. **Share image** (`features.shareImage`): a 1080 x 1920 PNG drawn on a canvas: both averages, the shift's name, the site address and the logo. Shared with the Web Share API as a file, or downloaded.
4. **Installable app:** `manifest.json` with app icons.

---

## 7. Visual style: matched to wrench-wise.com

These values were measured from the live wrench-wise.com site: emerald as the main brand colour, teal and cyan as accents, gray text, white cards and soft emerald-to-cyan gradients. The map, rider and code colours are added for this project.

**Colours.** Every colour is a CSS variable in `styles/tokens.css`. The first visit follows the device's light or dark setting. The theme button switches it and saves `dr-theme`.

**Site tokens**

| Token | Light (default) | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0F172A` |
| `--bg-grad` | `linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 45%, #ECFEFF 100%)` | `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` |
| `--surface` | `#FFFFFF` | `#1E293B` |
| `--surface-2` | `#F3F4F6` | `#334155` |
| `--border` | `#E5E7EB` | `#334155` |
| `--text` | `#111827` | `#F1F5F9` |
| `--text-2` | `#374151` | `#CBD5E1` |
| `--muted` | `#6B7280` | `#94A3B8` |
| `--brand` | `#059669` | `#10B981` |
| `--brand-strong` | `#047857` | `#34D399` |
| `--brand-soft` | `#D1FAE5` | `rgba(16,185,129,0.15)` |
| `--accent` | `#0891B2` | `#22D3EE` |
| `--warn` | `#B45309` | `#FBBF24` |
| `--you` | `#0891B2` | `#22D3EE` |

**Brand gradient:** `--brand-grad: linear-gradient(90deg, #059669, #0D9488, #06B6D4)`. Use it for the primary buttons, the bar under the header and the CTA card's top edge.

**Rider tokens**

| Token | Light | Dark |
|---|---|---|
| `--rider-1` | `#059669` | `#34D399` |
| `--rider-2` | `#7C3AED` | `#A78BFA` |
| `--rider-3` | `#EA580C` | `#FB923C` |
| `--rider-4` | `#DB2777` | `#F472B6` |

**Map tokens** (set on the map element by mood)

| Token | Day, light | Day, dark | Evening | Rain |
|---|---|---|---|---|
| `--map-land` | `#EEF2EA` | `#16202F` | `#1B1F3A` | `#27323F` |
| `--map-block` | `#D8DEE3` | `#24324A` | `#2A2F52` | `#36434F` |
| `--map-block-2` | `#C7D0D8` | `#2C3B55` | `#343A63` | `#3F4E5B` |
| `--map-road` | `#FFFFFF` | `#33415A` | `#454B73` | `#55636F` |
| `--map-road-edge` | `#CBD5DB` | `#1E293B` | `#14172E` | `#1F2933` |
| `--map-park` | `#BBF7D0` | `#14532D` | `#1E4D3B` | `#2C5446` |
| `--map-tree` | `#4ADE80` | `#22C55E` | `#2F9E6F` | `#3F8F6F` |
| `--map-water` | `#A5F3FC` | `#155E75` | `#1E3A66` | `#3B6E8C` |
| `--map-label` | `#64748B` | `#94A3B8` | `#A5B4FC` | `#B6C4CF` |
| `--map-window` | not used | not used | `#FDE68A` | not used |

**Code tokens** (the code panel is dark in both themes)

| Token | Value |
|---|---|
| `--code-bg` | `#0B1220` (dark theme `#050A14`) |
| `--code-gutter` | `#64748B` |
| `--code-text` | `#E2E8F0` |
| `--tok-comment` | `#64748B` |
| `--tok-keyword` | `#67E8F9` |
| `--tok-string` | `#FDE68A` |
| `--tok-number` | `#FCA5A5` |
| `--tok-punct` | `#94A3B8` |

**Fonts**
- Text: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Headings weight 800, letter spacing -0.01em. Body 400 to 500.
- Code: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace`.
- All numbers use `font-variant-numeric: tabular-nums`, so scores do not jump around.
- The race's big averages are at least 44px on laptop and 32px on phone, weight 800.

**Shapes:** buttons, pills and chips fully rounded (999px). Cards 16px. The map 20px. Code panel 12px.

**Shadows** (light; in dark use the same shapes with `rgba(0,0,0,0.40)`)
- `--shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`
- `--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`
- `--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)`

**Meta:** `theme-color` `#FFFFFF` (light) and `#0F172A` (dark) using media queries. In `manifest.json`: `theme_color` `#059669`, `background_color` `#FFFFFF`.

**Micro-interactions**
- Buttons: hover lifts 2px with `--shadow-md`, press scales to 0.97, 150 to 200 ms.
- Cards: hover lifts 3px with a stronger shadow.
- Order assigned: the card flies toward the rider's chip and shrinks into a job dot (300 ms).

**Motion rules**
- Animate only `transform`, `opacity` and `clip-path`. On SVG, move riders with `transform` only. Never rebuild the city each frame.
- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` and `--ease: cubic-bezier(0.4, 0, 0.2, 1)`. Durations 150, 200, 300 and 500 ms.
- Professional and calm. Small distances. Nothing bounces more than once. Riders move at a steady speed.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no drifting glows, no rain, no flying cards, no count-up, no race (6E). Riders still move in play, because the game needs it, but with no extras. The BFS wave shows all at once. Screens cross-fade in 150 ms.
- **Performance:** no `backdrop-filter` anywhere. The race draws 2 maps at once and must stay smooth. `will-change: transform` only on riders.

---

## 8. Words (copy.js)

Use exactly these. Values in braces are filled by `t()`. Keys ending in `.one` are used when `n` is 1. Add any small labels you need in the same plain style, and list them in your Phase 1 report.

| Key | Text |
|---|---|
| `site.title` | Delivery Rush |
| `site.description` | Run a city's food deliveries, then watch an algorithm run the same shift, side by side. |
| `home.eyebrow` | A Wrench Wise game |
| `home.title` | Can you deliver faster than an algorithm? |
| `home.subtitle` | Food orders keep coming. You assign the riders. Then an algorithm runs the exact same shift, side by side. |
| `home.start` | Start {shift} |
| `home.how` | How it works |
| `home.liveLine` | This is the algorithm playing {shift} right now. |
| `home.shiftsTitle` | Pick a shift |
| `home.best` | Your best: {avg} mins |
| `home.play` | Play |
| `home.step1.title` | Tap an order |
| `home.step1.body` | Orders pop up across the city. Ice cream will not wait as long as biryani. |
| `home.step2.title` | Tap a rider |
| `home.step2.body` | Each rider can hold 2 jobs. Watch the river: it has only 2 bridges. |
| `home.step3.title` | Race the algorithm |
| `home.step3.body` | It plays the same orders with the same riders. Lower average delivery time wins. |
| `home.insideTitle` | What's running under the hood |
| `play.leave` | Leave |
| `play.leave.title` | Leave this shift? |
| `play.leave.body` | Your progress on this shift won't be saved. |
| `play.leave.yes` | Leave |
| `play.leave.no` | Keep playing |
| `play.pause` | Pause |
| `play.resume` | Resume |
| `play.paused` | Paused. |
| `play.minute` | Minute {n} |
| `play.avg` | Average so far |
| `play.delivered` | {n} of {total} delivered |
| `play.orders` | Orders |
| `play.riders` | Riders |
| `play.noOrders` | No orders waiting. Stay ready. |
| `play.tapOrder` | Tap an order. |
| `play.pickRider` | Now tap a rider for {dish}. |
| `play.tapOrderFirst` | Tap an order first. |
| `play.dueIn` | Due in {n} mins |
| `play.dueIn.one` | Due in {n} min |
| `play.late` | Late |
| `play.free` | Free |
| `play.freeIn` | Free in {n} mins |
| `play.freeIn.one` | Free in {n} min |
| `play.full` | Full |
| `play.speeding` | All orders have riders. Speeding up. |
| `play.over` | Shift over. |
| `flood.closed` | {bridge} is flooded. Riders will find another way. |
| `flood.open` | {bridge} is open again. |
| `coach.one` | Your first order. Tap it. |
| `coach.two` | Now tap a rider. The closest one is usually a good start. |
| `coach.three` | That's the whole game. Here comes the rush. |
| `race.you` | You |
| `race.algo` | Algorithm |
| `race.done` | Done |
| `race.skip` | Skip to result |
| `race.deliveredOf` | {n} of {total} delivered |
| `result.avg` | Average delivery |
| `result.delivered` | Delivered |
| `result.late` | Late |
| `result.missed` | Missed |
| `result.mins` | {n} mins |
| `result.win.title` | You beat the algorithm. |
| `result.win.body` | It picks the best move for each order right now. You planned further ahead. |
| `result.tie.title` | A dead heat. |
| `result.tie.body` | You matched the algorithm exactly. Very few people do. |
| `result.close.title` | So close. Only {gap} mins behind per order. |
| `result.close.body` | It saw each order only when you did. A better choice or two would turn this around. |
| `result.behind.title` | The algorithm was {gap} mins faster per order. |
| `result.behind.body` | It saw each order only when you did. See below for what it did differently. |
| `result.percent` | That is {n} percent faster. |
| `result.gapsTitle` | Where the time went |
| `result.noGaps` | You were as fast as the algorithm or faster on every order. |
| `result.think` | See how it thinks |
| `result.again` | Play again |
| `result.next` | Try {shift} |
| `result.challenge` | Challenge a friend |
| `challenge.banner` | A friend averaged {avg} mins on {shift}. Can you beat that? |
| `challenge.won` | You beat your friend's {avg} mins. |
| `challenge.lost` | Your friend's {avg} mins still stands. |
| `think.title` | How the algorithm thinks |
| `think.decision` | Decision {n} of {total}: {dish} for {customer} |
| `think.nextIdea` | Next idea |
| `think.back` | Back |
| `think.next` | Next |
| `think.replay` | Replay |
| `think.checked` | {n} squares checked |
| `think.jobAhead` | Job ahead |
| `think.thisOrder` | This order |
| `think.heapEmpty` | The queue is empty now. |
| `think.showCode` | Show the code |
| `think.hideCode` | Hide the code |
| `think.you` | You gave this order to {rider} at minute {at}. It took {you} mins. The algorithm took {algo} mins. |
| `think.youMissed` | This order was never delivered on your shift. The algorithm took {algo} mins. |
| `think.honest` | A fair fight: the algorithm sees each order only when you do. It does react instantly, and it never gets distracted. It is also not perfect. On this shift, a plan that knew every future order beat it by {gap} mins. |
| `cta.title` | That's what DSA is for. |
| `cta.body` | In the {program}, you'll learn to write logic like this yourself. |
| `cta.whatsapp` | Talk to us on WhatsApp |
| `cta.program` | See the program |
| `share.text` | I averaged {avg} mins on {shift} in Delivery Rush. Can you beat me, or the algorithm? |
| `share.copied` | Link copied |
| `theme.toLight` | Switch to light theme |
| `theme.toDark` | Switch to dark theme |
| `demo.you` | Sample player |
| `footer.line` | Built by Wrench Wise to show what DSA does in real life. |
| `footer.disclaimer` | Namma Nagar and its shops, riders and customers are made up for learning. |
| `footer.legal` | © 2026 Wrench Wise Edutech Private Limited |

---

## 9. Analytics

Load only when the ID is set, and never in test, demo or presenter mode.

- **GA4** (`config.analytics.ga4Id`): `page_view` on load. `shift_start` (`shift`), `shift_end` (`shift`, `you`, `algo`, `verdict`), `shift_leave` (`shift`, `minute`), `race_skip` (`shift`), `think_open` (`shift`), `cta_whatsapp` (`shift`), `cta_program` (`from`), `share` (`method`: `native` or `copy`), `challenge_open` (`shift`).
- **Meta Pixel** (`config.analytics.metaPixelId`): `PageView` on load. The standard `Lead` event on the WhatsApp click. Custom event `ShiftFinished` (`shift`, `verdict`).
- Send nothing else.
- `shift_start` against `shift_end` shows how many finish a shift. `shift_end` shows how many beat the algorithm. See `UPGRADE_GUIDE.md`.

---

## 10. Self-test (`?test=1`)

`?test=1` runs every check below in the browser, through the site's own files (`content.js`, `copy.js`, `links.js`, `store.js`, `clock.js`, `game.js`), and shows a table of PASS or FAIL with expected and actual values, then `RESULT: ALL PASS` or the number of failures. Nothing is saved and no analytics load. Every value must match exactly. `node tools/verify-content.mjs` checks the same engine values and must also pass.

"Row" means [average, total minutes, delivered, late, missed], from `score()`.

| Check | Expected |
|---|---|
| **a. Content** | Shifts lunch, dinner, rain. Orders [12, 18, 12]. Riders [3, 4, 3]. 6 shops, 12 homes, 4 concepts |
| **b. Algorithm** | Row, lunch: [18.8, 225, 12, 2, 0]. Dinner: [18.2, 328, 18, 4, 0]. Rain: [22.8, 274, 12, 4, 0]. End minutes [63, 71, 83] |
| **c. Sample line** (`LINES[id].sample` through `replay`) | Lunch: [25.8, 309, 12, 7, 0]. Dinner: [28.1, 506, 18, 13, 0]. Rain: [36.3, 435, 12, 10, 0]. End minutes [74, 96, 95] |
| **d. Best line** (`LINES[id].best` through `replay`) | Lunch: [17.3, 207, 12, 2, 0]. Dinner: [16, 288, 18, 3, 0]. Rain: [19.9, 239, 12, 5, 0] |
| **e. Verdicts** | Sample lunch against the algorithm: kind `behind`, gap 7, 27 percent. Best rain: kind `win`, gap 2.9, 13 percent. { avg: 20 } against { avg: 18 }: kind `close`, gap 2, 10 percent. Equal averages: kind `tie` |
| **f. Gaps** | Biggest gap, sample lunch: L02, you 30, algorithm 8, gap 22. Then L06 (34, 14, 20), then L09 (44, 25, 19) |
| **g. Decision words** | Lunch decision 1 is at minute 1, order L02, rider r1. Finishes [9, 13, 15]. `routeTrace` to r1: dist 2, checked 7. `explainDecision` gives the pq line `2 orders are waiting. Masala Vada for Lakshmi is due first, at minute 23, so it comes out next.` and the greedy line `Arun can deliver by minute 9. Selvi would need until minute 13. Greedy takes the earliest.` |
| **h. Clock** (new Lunch game, steps of 100 ms) | 800 ms: minute 1. Select L01, then 3200 ms: minute 2. 2800 ms more (6000 ms selected): still minute 2 and nothing selected. 100 ms more: minute 3. Pause, then 5000 ms: still minute 3 |
| **i. Idle speed** (a one-order test shift, shop s2, home h8, prep 1, promise 30, one rider starting at [0, 2], `maxJobs` 2) | 800 ms: minute 1. Assign, then 800 ms: minute 4. The order is delivered at minute 7, with an average of 6 |
| **j. Whole shifts through game.js** | Using `createGame` in steps of 100 ms, doing each `LINES[id].sample` action with `select` then `pickRider` at its minute, `score(game.sim)` must equal check c for all 3 shifts, and `game.sim.actions` must equal the line |
| **k. Race clock** | With total 20000 ms and end 74: at 0 ms minute 0, at 10000 ms minute 37, at 20000 ms minute 74, at 25000 ms minute 74. Sample lunch frame at minute 30: delivered 3, average 14.3. `runningAvg` of a new game is null |
| **l. Numbers and links** | `formatMins(21)` is `21.0`. `encodeBeat(21.3)` is `213`. `decodeChallenge("lunch", "213", ids)` gives shift lunch, average 21.3. `decodeChallenge` gives null for "brunch" with "213", and for "lunch" with "21x", "9000", "05", `<script>` or nothing. With test number `919876543210`, shift Lunch Rush, you 25.8 and algorithm 18.8, the WhatsApp link starts with `https://wa.me/919876543210?text=` and its decoded text is `Hi, I played Delivery Rush (Lunch Rush). My average was 25.8 mins and the algorithm's was 18.8 mins. I want to know more about the Certification Program in AI-Powered Software Engineering & DSA.` With an empty number the WhatsApp link is null. The program link for `result` is `https://wrench-wise.com/?utm_source=delivery-rush&utm_medium=web-project&utm_campaign=delivery-rush&utm_content=result` |
| **m. Words** | `t("play.dueIn", { n: 1 })` is `Due in 1 min`. `t("play.dueIn", { n: 5 })` is `Due in 5 mins` |
| **n. Storage blocked** | With storage that throws on every call, saving a best score still works for the visit and nothing crashes. A `dr-best` holding junk is ignored |
| **o. Text** | Every `COPY` value has no long dash, no emoji (the © sign is fine) and none of the banned words |

---

## 11. Phases

Total target is about 10 hours. Take the time needed to get each phase right.

### Phase 0: Setup and checks (target 20 min)
- Run `node --version`, then `node tools/verify-content.mjs`.
- `git init`, add `.gitignore`.
- Create the folders from Section 4, `styles/tokens.css` with every token from Section 7, `styles/base.css`, and an `index.html` shell with the header and footer.
- Start the local server.
- **Report:** the Node version, the last 3 lines of the content check, and a screenshot of the shell page in both themes.

### Phase 1: Wiring and self-test (target 60 min)
- **Build:** `events.js`, `copy.js`, `content.js`, `store.js`, `links.js`, `motion.js`, `clock.js`, `game.js`, `run.js`, `router.js` and `selftest.js` with checks a to o. Run `node tools/verify-content.mjs` again: it now checks `copy.js` too.
- **Report:** the full self-test table and the content check result. Every value must match Section 10. Do not continue with a mismatch. Explain it in plain words instead.

### Phase 2: The city (target 90 min)
This is where the game earns its first impression. Take care.
- **Build:** `ui/icons.js`, `ui/city.js`, `ui/actors.js`, `ui/rain.js`, `styles/map.css`. For testing, add a temporary page that plays the algorithm's run on the city in each mood, with riders, routes, pins and floods. Remove it before Phase 6.
- **Report:** screenshots of the city in all 3 moods and both themes at 340px and 700px wide. A short screen recording of riders moving if you can. Frame rate with Chrome's CPU slowed down 4 times (it must stay above 50 fps). Say honestly: does it look like a charming little city, or a grid? If it looks like a grid, improve it before reporting.

### Phase 3: Playing a shift (target 120 min)
- **Build:** `screens/play.js`, `ui/ordercard.js`, `ui/riderchip.js`, `ui/statusrow.js`, `ui/coach.js`, `ui/toast.js`, `ui/dialog.js`, `styles/play.css`. Everything in 6D.
- **Report:** screenshots mid-shift at the 5 sizes in rule 16. Click steps for me to play a whole shift on my phone. Confirm that with 4 riders (Dinner Rush) and 6 waiting orders nothing overlaps. Say what your own play of each shift scored against the algorithm.

### Phase 4: The race and scoreboard (target 90 min)
- **Build:** `screens/result.js`, `ui/race.js`, `ui/scoreboard.js`, `ui/gaps.js`, `styles/result.css`. Everything in 6E.
- **Report:** screenshots of the race and the reveal at the 5 sizes. A screen recording if you can. Frame rate during the race with the CPU slowed down 4 times (it must stay above 50 fps). Confirm the scoreboard's final numbers match `score()`, by playing a saved line and comparing with Section 10 check c.

### Phase 5: How it thinks (target 90 min)
- **Build:** `screens/think.js`, `ui/heaptree.js`, `ui/bfswave.js`, `ui/greedybars.js`, `ui/queueslots.js`, `ui/codeview.js`, `styles/think.css`. Everything in 6F.
- **Report:** screenshots of all 4 tabs on laptop and phone, for a Rain Shift decision with a flooded bridge. Confirm the code never scrolls sideways at 360px.

### Phase 6: Home, CTA, sharing, demo mode and polish (target 90 min)
- **Build:** `ui/loader.js`, `screens/home.js`, `ui/cta.js`, `ui/share.js`, `analytics.js`, link preview tags and `og-image.png`, demo mode, then the Nice to Have items in order if time allows. Remove the temporary test page from Phase 2.
- **Final checks** (report each one):
  1. `node tools/verify-content.mjs` and `?test=1` both show ALL PASS.
  2. All 3 shifts play through to the result and the thinking screen, in both themes, at the 5 sizes in rule 16.
  3. With Chrome's CPU slowed down 4 times, play and the race stay above 50 fps.
  4. Reduced motion follows every rule in Section 7.
  5. With site data blocked in the browser, everything still works.
  6. No errors and no `console.log` in the console.
  7. The link `?shift=lunch&beat=<img src=x onerror=alert(1)>` shows no banner and runs nothing.
  8. The WhatsApp button opens with the prefilled text, and every wrench-wise.com link has its UTM tags.
  9. Lighthouse on phone: Performance 85 or more, Accessibility 95 or more.
  10. `?demo=1&shift=lunch&theme=dark&part=all` plays the same way twice in a row.
  11. A challenge link opened in a private window shows the banner and starts the right shift.
- **Report:** screenshots of the home screen on phone and laptop, the Lighthouse scores, and the 11 checks.

### Phase 7: Docs and deploy (target 45 min)
- **README.md:** what the site is, how to run it, the URL modes (`?demo=1`, `?test=1`, `?present=1`), and a short file map.
- **UPGRADE_GUIDE.md:**
  1. The rules from Section 3 in plain words
  2. How to add a new shift, starting with "Ask Claude to prepare and test `content/shifts/<id>.js` and its lines"
  3. How to tune difficulty: `config.game.msPerMinute`, `crawl` and `selectTimeoutMs`
  4. How to change the WhatsApp number, the program and the analytics IDs
  5. How to read GA4: `shift_start` against `shift_end`, and the share of `shift_end` where `verdict` is `win`. If nearly everyone wins or nearly everyone gives up, tune the clock
  6. How to run any future upgrade with Antigravity, including this ready-to-paste prompt:
     > Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/, package.json or js/engine/ unless I ask. Keep the self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
  7. Upgrades this structure is ready for: more shifts (festival night, cricket final), a rider who can carry 2 orders at once, A* next to BFS on the thinking screen, an "Ask a smarter algorithm" mode that looks ahead, a Tamil version (`copy.ta.js`), and a shared leaderboard (which needs a backend)
- **CHANGELOG.md:** a "1.0.0" entry listing what v1 includes.
- **STUDENT_EXPLAINER.md:** for students:
  - Each of the 4 ideas in plain words, with one example from the game, and where it shows up in real software
  - Why a greedy choice is not always the best, with the numbers: on each shift, a plan that knows the future beats it (Section 10 check d)
  - How the game is built, honestly: the algorithm and the player use the same `assign()` rules, and the content check proves the algorithm cannot see future orders. It does react instantly. The 3 shifts were picked from thousands of random shifts because the priority queue clearly matters on them. On some random shifts it barely matters
  - 3 extension tasks: try a different priority (shortest trip first) and compare the averages, write A* and compare the squares checked against BFS, and let a rider carry 2 orders on one trip
- **REEL_SCRIPT.md:** three scripts, each with a hook as on-screen text in the first 2 seconds, a shot list matched to demo mode timing, captions, optional voiceover lines and a closing line with Wrench Wise:
  - Vertical, 30 seconds (`?demo=1&shift=lunch&part=race&speed=2`): "We gave an algorithm the same lunch rush."
  - Horizontal, 60 seconds (`?demo=1&shift=rain&part=all&theme=dark&speed=2`): "Two bridges. Both flood. Watch what BFS does."
  - Comment bait: freeze on Rain Shift at minute 44 of the sample line, when 3 orders are waiting, "Which order would you send first? Comment 1, 2 or 3."
  - The city is made up and the player in demo mode is a sample line. Captions say "sample player", never "I" or "me".
  - No emojis, no em dashes, none of the banned words
- **Deploy:**
  1. Help me push the folder to GitHub. I will give you my empty repository URL.
  2. Deploy it on Vercel as a static site, with no build command.
  3. Set `config.siteUrl`, `og:url` and `og:image` to the live address, then redeploy.
  4. Give click-by-click steps for anything I must do myself.
  5. Confirm the live site works on a phone-sized screen and that `?test=1` passes live.
  6. Tag the release `v1.0.0` and push the tag.
  7. Give me the live link and the demo links from `REEL_SCRIPT.md`.

---

## 12. Phase Report format

- **What I built** (3 to 5 bullets)
- **How to check it** (click steps)
- **Screenshots** (phone and laptop, where relevant)
- **Not working or cut,** explained in plain words
- **Time used** against the target

---

## 13. If something keeps breaking

- If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
- If I say "Park it", move that feature to a "Parked" list in the Phase Report and continue with the next phase.
- If I want to ship sooner, park in this order:
  1. Presenter mode, the share image and sound
  2. The evening mood's lamps and windows, and the rain drops (keep the colours)
  3. The live city in the home hero (use a still picture of the city)
  4. The heap's moving nodes (cross-fade instead)
  5. The flying order card

**Never park:**
- All 3 shifts, the clock rules and the coach
- The drawn city, riders, routes and floods
- The race, the final scoreboard and "Where the time went"
- All 4 tabs of the thinking screen, including the BFS wave and the honest note
- The CTA, the WhatsApp button and challenge links
- The content check, the self-test and every value in Section 10
- Every rule in Section 3
- The tone, privacy and branding rules
- Rule 14 (nothing overlaps) and rule 15 (no placeholder look)
- Light and dark theme
- Demo mode
- Reduced motion rules
- Deployment
