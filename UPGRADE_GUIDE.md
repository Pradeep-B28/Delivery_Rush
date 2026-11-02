# Delivery Rush: Upgrade Guide

This guide explains how to maintain, configure, and expand Delivery Rush. The project is designed so that new content and business adjustments require editing only configuration and data files without modifying core application code.

---

## 1. Architectural principles (Section 3)

1. **One settings file:** All business settings live in `config.js`. Changing contact numbers, program names, analytics tracking, game speeds, or toggling features never requires editing any other file.
2. **One text file:** All user-facing strings live in `js/copy.js`. The translation function `t(key, values)` handles string interpolation and pluralization. A future language version requires creating a new copy module (such as `js/copy.ta.js`) without altering UI templates.
3. **Content as data:** Shifts live in `content/shifts/` and are registered in `content/index.js`. Screens never hardcode shift names or rider counts. The UI layout dynamically accommodates 2, 3, or 4 riders and varying order volumes.
4. **No DOM in game state:** Game simulation and timing logic exist independently in `js/game.js` and `js/engine/sim.js`. This decoupling allows automated tests to simulate entire shifts headless in Node.js and in-browser without touching the DOM.
5. **Screen modularity:** Every screen in `js/screens/` exports `mount(container, params)` and `unmount()`.
6. **Decoupled communication:** Features communicate through events on the global event bus (`js/events.js`). Analytics listens to events and never directly imports screen modules.
7. **Feature switches:** Optional capabilities are controlled by flags in `config.features`. If a feature switch is set to false, the feature is fully hidden and harmless.
8. **Test expansion:** Every new feature or rule must add corresponding assertions to `js/selftest.js` and `tools/verify-content.mjs`.

---

## 2. How to add a new shift

To add a new shift:

1. **Prepare shift data:** Ask Claude to prepare and test `content/shifts/<id>.js` and its sample and optimal lines for `content/lines.js`.
2. **Register the shift:**
   - Place the shift data file at `content/shifts/<id>.js`.
   - Add the lines to `content/lines.js`.
   - Export the shift in `content/index.js`.
3. **Verify:** Run the automated verification suite:
   ```bash
   node tools/verify-content.mjs
   ```
   Both the content verification and `?test=1` will automatically pick up the new shift. No UI or engine code needs modification.

---

## 3. How to tune difficulty

Shift pacing and difficulty are managed in `config.js` under the `game` object:

- `config.game.msPerMinute`: The duration of one in-game minute in real-world milliseconds (default is `800`). Increasing this value gives players more thinking time per minute. Decreasing it speeds up the shift.
- `config.game.crawl`: The speed multiplier applied while an order is selected (default is `0.25`). This slows down time while the player considers which rider to choose.
- `config.game.selectTimeoutMs`: The maximum time an order can remain selected before automatically deselecting (default is `6000`).
- `config.game.idleSpeed`: The clock multiplier applied when there are no waiting orders and all riders are busy (default is `3.0`).

---

## 4. How to update contact and analytics settings

All business details are located in `config.js`:

- **Sales WhatsApp number:**
  Update `config.contact.whatsapp`. Provide the full international format without plus signs or spaces (for example, `"91750077725"`). If set to an empty string, WhatsApp buttons are hidden and fall back to the program link.
- **Certification Program details:**
  Update `config.program.name` (must always be the full name: `"Certification Program in AI-Powered Software Engineering & DSA"`) and `config.program.url`.
- **Analytics IDs:**
  Update `config.analytics.ga4Id` with your Google Analytics Measurement ID (such as `"G-XXXXXXXXXX"`).
  Update `config.analytics.metaPixelId` with your Meta Pixel ID.
  If an ID is left blank, that tracker is disabled.

---

## 5. How to read analytics and balance gameplay

In Google Analytics 4, monitor two key funnel metrics:

1. **Completion rate:**
   Compare the total count of `shift_start` events against `shift_end` events.
   - If a large percentage of visitors leave before completing the shift (high `shift_leave` count), the pacing may be too rushed or the shift too long. Increase `config.game.msPerMinute` or decrease `crawl`.
2. **Win rate:**
   Examine `shift_end` events broken down by the `verdict` parameter (`win`, `tie`, `close`, `behind`).
   - If nearly everyone wins, the algorithm may feel unchallenging.
   - If nearly everyone loses by a wide margin, players may feel discouraged.
   - The ideal balance sees players narrowly lose on their first try (`close` or `behind`), motivating them to inspect the thinking screen and replay.

---

## 6. How to run future upgrades with Antigravity

When prompting Antigravity for an upgrade, paste the following prompt template:

> Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/, package.json or js/engine/ unless I ask. Keep the self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".

---

## 7. Upgrades this structure is prepared for

The existing codebase and schema are prepared for the following extensions:

- **Additional shifts:** New contexts such as a festival night with rapid short orders or a cricket final with severe localized delivery surges.
- **Multi-order carrying capacity:** Increasing `maxJobs` or configuring riders who can carry up to 2 simultaneous deliveries on a route.
- **A\* Pathfinding Visualizer:** Presenting an A\* heuristic search alongside the existing BFS visualizer on the thinking screen to contrast explored nodes.
- **Lookahead Algorithm Mode:** An optional "Smarter Algorithm" comparison that plans two orders ahead.
- **Tamil language edition:** Creating `js/copy.ta.js` with matching keys and switching copy based on user locale or a language selector.
- **Shared community leaderboard:** Adding a lightweight backend API to store and rank public player averages.
