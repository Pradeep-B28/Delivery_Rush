// Live shift screen coordinating clock, map rendering, order cards, and rider chips.
// Uses content.js, game.js, motion.js, router.js, score.js, algo.js, copy.js, and ui/ components.
// Used by router.js when URL matches #/play/:id.

import { CITY, getShift, CONFIG, LINES } from "../content.js";
import { COPY, t } from "../copy.js";
import { formatMins } from "../links.js";
import { setBest } from "../store.js";
import { createGame } from "../game.js";
import { startLoop } from "../motion.js";
import { navigate } from "../router.js";
import { setLastRun } from "../run.js";
import { score, runningAvg, compare, orderGaps } from "../engine/score.js";
import { runAlgorithm } from "../engine/algo.js";
import { replay, nothingToDecide } from "../engine/sim.js";
import { renderCitySvg } from "../ui/city.js";
import { renderActorsSvg } from "../ui/actors.js";
import { createRainOverlay } from "../ui/rain.js";
import { createStatusRow } from "../ui/statusrow.js";
import { createOrderCard, updateOrderCard } from "../ui/ordercard.js";
import { createRiderChip, updateRiderChip } from "../ui/riderchip.js";
import { showConfirmDialog } from "../ui/dialog.js";
import { createCoach } from "../ui/coach.js";

let stopAnimation = null;
let activeKeyHandler = null;

export function mount(container, params = {}) {
  unmount();

  const isDemo = params.query && params.query.demo === "1";
  const demoSpeed = isDemo && params.query.speed === "2" ? 2 : 1;
  const demoPart = (params.query && params.query.part) || "all";

  const shift = getShift(params.id || "lunch") || getShift("lunch");
  const playConfig = isDemo
    ? {
        ...CONFIG,
        game: {
          ...CONFIG.game,
          crawl: 1.0,
          msPerMinute: CONFIG.game.msPerMinute / demoSpeed
        }
      }
    : CONFIG;

  const game = createGame(CITY, shift, playConfig);
  const sim = game.sim;
  document.body.classList.add("in-game");

  const logoHtml = isDemo ? `<img src="assets/logo.png" alt="Wrench Wise" class="demo-logo" height="20">` : "";

  container.innerHTML = `
    <div class="play-viewport" data-mood="${shift.mood}">
      <header class="play-topbar">
        <div class="topbar-left">
          ${logoHtml}
          <button type="button" class="topbar-btn leave-btn" id="btn-leave" aria-label="${t("play.leave.title")}">&larr; <span class="leave-label">${t("play.leave.yes")}</span></button>
          <span class="topbar-shift-title">${shift.name}</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-stat minute-stat"><span class="stat-val" id="stat-minute">Min 0</span></span>
          <span class="topbar-stat avg-stat"><span class="avg-label">Avg: </span><span class="stat-val num" id="stat-avg">--</span></span>
          <span class="topbar-stat delivered-stat"><span class="stat-val num" id="stat-delivered">0 of ${shift.orders.length}</span></span>
        </div>
        <div class="topbar-right"><button type="button" class="topbar-btn pause-btn" id="btn-pause">${t("play.pause")}</button></div>
      </header>
      <div id="play-status-container"></div>
      <main class="play-stage">
        <section class="stage-orders-col" aria-label="${t("play.orders")}">
          <div class="col-heading">${t("play.orders")}</div>
          <div class="orders-list-scroll" id="orders-list"></div>
        </section>
        <section class="stage-map-col" aria-label="City Map">
          <div class="map-wrapper">
            <div class="map-container" id="playMapContainer" data-mood="${shift.mood}">
              <div id="playCityLayer" style="width:100%; height:100%;"></div>
              <svg viewBox="0 0 520 520" id="playActorsSvg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;"><g id="playActorsGroup"></g></svg>
              <canvas class="map-rain-canvas" id="playRainCanvas" width="520" height="520"></canvas>
            </div>
          </div>
        </section>
        <section class="stage-riders-col" aria-label="${t("play.riders")}">
          <div class="col-heading">${t("play.riders")}</div>
          <div class="riders-list-scroll" id="riders-list"></div>
        </section>
      </main>
    </div>
  `;

  const statusRow = createStatusRow(document.getElementById("play-status-container"));
  const cityLayer = document.getElementById("playCityLayer");
  const actorsGroup = document.getElementById("playActorsGroup");
  const rainCanvas = document.getElementById("playRainCanvas");
  const ordersList = document.getElementById("orders-list");
  const ridersList = document.getElementById("riders-list");
  const statMinute = document.getElementById("stat-minute");
  const statAvg = document.getElementById("stat-avg");
  const statDelivered = document.getElementById("stat-delivered");
  const btnPause = document.getElementById("btn-pause");
  const btnLeave = document.getElementById("btn-leave");

  const rain = createRainOverlay(rainCanvas);
  if (shift.mood === "rain") rain.start();

  let lastClosed = null;
  function updateStaticCity(closed = []) {
    const key = JSON.stringify(closed) + ":" + shift.mood;
    if (lastClosed === key && cityLayer.innerHTML) return;
    lastClosed = key;
    cityLayer.innerHTML = renderCitySvg(shift.mood, closed);
  }
  updateStaticCity([]);

  const moments = [];
  const orderCards = new Map();

  function refreshOrdersDom() {
    const waiting = sim.orders.filter((o) => o.status === "waiting")
      .sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));

    if (waiting.length === 0) {
      if (!ordersList.querySelector(".no-orders-banner")) {
        ordersList.innerHTML = `<div class="no-orders-banner">${t("play.noOrders")}</div>`;
      }
      for (const [id, card] of orderCards.entries()) {
        card.remove();
        orderCards.delete(id);
      }
      return;
    }
    const banner = ordersList.querySelector(".no-orders-banner");
    if (banner) banner.remove();

    waiting.forEach((order, idx) => {
      let card = orderCards.get(order.id);
      if (!card) {
        card = createOrderCard(order, (id) => handleOrderSelect(id), idx + 1);
        orderCards.set(order.id, card);
        ordersList.appendChild(card);
      }
      updateOrderCard(card, order, sim.t, game.selected === order.id);
    });

    for (const [id, card] of orderCards.entries()) {
      const o = sim.byId.get(id);
      if (!o || o.status !== "waiting") {
        card.remove();
        orderCards.delete(id);
      }
    }
  }

  const riderChips = new Map();
  sim.riders.forEach((rider, idx) => {
    const chip = createRiderChip(rider, idx, shift.maxJobs, (id) => handleRiderPick(id), () => statusRow.setMessage(t("play.tapOrderFirst")));
    riderChips.set(rider.id, chip);
    ridersList.appendChild(chip);
  });

  function refreshRidersDom() {
    sim.riders.forEach((r, idx) => {
      const chip = riderChips.get(r.id);
      if (chip) updateRiderChip(chip, r, idx, shift.maxJobs, sim, game.selected !== null);
    });
  }

  function handleOrderSelect(orderId) {
    if (game.selected === orderId) {
      game.deselect();
      statusRow.setMessage(t("play.tapOrder"));
    } else {
      game.select(orderId);
      const o = sim.byId.get(orderId);
      statusRow.setMessage(t("play.pickRider", { dish: o ? o.dish : "order" }));
      if (coach && coach.active) coach.onOrderSelected(orderId);
    }
    refreshOrdersDom();
    refreshRidersDom();
  }

  function handleRiderPick(riderId) {
    if (!game.selected) return;
    const res = game.pickRider(riderId);
    if (res && res.ok) {
      statusRow.setMessage(t("play.tapOrder"));
      if (coach && coach.active) coach.onRiderAssigned();
    }
    refreshOrdersDom();
    refreshRidersDom();
  }

  // Initial DOM synchronization for minute 0
  refreshOrdersDom();
  refreshRidersDom();

  let isCountingDown = false;
  let countdownTimer = null;
  const coach = isDemo ? null : createCoach({ sim, statusRow, onComplete: () => statusRow.setMessage(t("play.tapOrder")) });

  if (!isDemo && !coach.active) {
    isCountingDown = true;
    let count = 3;
    statusRow.setMessage(`${count}...`);
    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        statusRow.setMessage(`${count}...`);
      } else {
        clearInterval(countdownTimer);
        isCountingDown = false;
        statusRow.setMessage(t("play.tapOrder"));
      }
    }, CONFIG.game.countdownMs / 3);
  }

  const sampleActions = isDemo ? (LINES[shift.id]?.sample || []) : [];
  const selectedDemoActions = new Set();
  const executedDemoActions = new Set();

  btnPause.addEventListener("click", () => {
    if (game.isPaused) {
      game.resume();
      btnPause.textContent = t("play.pause");
      statusRow.setMessage(t("play.tapOrder"));
    } else {
      game.pause();
      btnPause.textContent = t("play.resume");
      statusRow.setMessage(t("play.paused"), "warn");
    }
  });

  btnLeave.addEventListener("click", () => {
    game.pause();
    showConfirmDialog({
      title: t("play.leave.title"),
      body: t("play.leave.body"),
      confirmText: t("play.leave.yes"),
      cancelText: t("play.leave.no"),
      onConfirm: () => { unmount(); navigate("#/"); },
      onCancel: () => { game.resume(); btnPause.textContent = t("play.pause"); }
    });
  });

  activeKeyHandler = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === " ") { e.preventDefault(); btnPause.click(); }
    else if (e.key === "Escape") { game.deselect(); refreshOrdersDom(); refreshRidersDom(); statusRow.setMessage(t("play.tapOrder")); }
    else if (e.key >= "1" && e.key <= "9") {
      const idx = parseInt(e.key, 10) - 1;
      const waiting = sim.orders.filter((o) => o.status === "waiting");
      if (idx < waiting.length) handleOrderSelect(waiting[idx].id);
    } else {
      const riderIdx = ["Q", "W", "E", "R"].indexOf(e.key.toUpperCase());
      if (riderIdx >= 0 && riderIdx < sim.riders.length) handleRiderPick(sim.riders[riderIdx].id);
    }
  };
  document.addEventListener("keydown", activeKeyHandler);

  let lastShiftMinute = sim.t;
  stopAnimation = startLoop((dtMs) => {
    if (isCountingDown || (coach && coach.active && coach.step >= 1 && coach.step < 3)) {
      // Clock waits for countdown/coach
    } else {
      const events = game.tick(dtMs);
      for (const ev of events) {
        if (ev.type === "delivered") moments.push({ cell: ev.cell, mins: ev.mins, late: ev.late, created: performance.now() });
        else if (ev.type === "closure") statusRow.setMessage(t("flood.closed", { bridge: ev.name }), "warn");
        else if (ev.type === "reopen") statusRow.setMessage(t("flood.open", { bridge: ev.name }));
        else if (ev.type === "end") { handleShiftEnd(); return; }
      }
    }

    const now = performance.now();
    for (let i = moments.length - 1; i >= 0; i--) {
      if (now - moments[i].created > 2000) moments.splice(i, 1);
    }

    if (nothingToDecide(sim) && !game.isPaused && !game.selected && !isCountingDown) {
      statusRow.setMessage(t("play.speeding"));
    }

    updateStaticCity([...sim.closed]);

    const waitingOrAssigned = sim.orders.filter((o) => o.status === "waiting" || o.status === "assigned");
    actorsGroup.innerHTML = renderActorsSvg({
      riders: sim.riders,
      orders: waitingOrAssigned,
      progress: game.progress(),
      riderScale: window.innerWidth < 900 ? 1.15 : 1.0,
      moments,
      selectedOrder: game.selected ? sim.byId.get(game.selected) : null
    });

    if (isDemo && !game.isPaused) {
      for (let i = 0; i < sampleActions.length; i++) {
        const act = sampleActions[i];
        if (sim.t >= act.at - 1 && !selectedDemoActions.has(i) && !executedDemoActions.has(i)) {
          selectedDemoActions.add(i);
          handleOrderSelect(act.order);
          const card = orderCards.get(act.order);
          if (card) {
            const ring = document.createElement("div");
            ring.className = "demo-tap-ring";
            card.appendChild(ring);
            setTimeout(() => { if (ring.parentNode) ring.remove(); }, 800);
          }
        }
        if (sim.t >= act.at && !executedDemoActions.has(i)) {
          executedDemoActions.add(i);
          const chip = riderChips.get(act.rider);
          if (chip) {
            const ring = document.createElement("div");
            ring.className = "demo-tap-ring";
            chip.appendChild(ring);
            setTimeout(() => { if (ring.parentNode) ring.remove(); }, 800);
          }
          handleRiderPick(act.rider);
        }
      }
    }

    if (sim.t !== lastShiftMinute) {
      lastShiftMinute = sim.t;
      statMinute.textContent = `Min ${sim.t}`;
      const curAvg = runningAvg(sim);
      statAvg.textContent = curAvg !== null ? formatMins(curAvg) : "--";
      const delCount = sim.orders.filter((o) => o.status === "delivered").length;
      statDelivered.textContent = `${delCount} of ${shift.orders.length}`;
      refreshOrdersDom();
      refreshRidersDom();
      if (coach && coach.active && coach.step === 0) {
        coach.checkFirstOrder();
      }
    }
  });

  function handleShiftEnd() {
    unmount();
    statusRow.setMessage(t("play.over"));
    const you = score(sim);
    const algoRun = runAlgorithm(CITY, shift);
    const algo = score(algoRun.sim);
    const verdict = compare(you, algo);
    const yourRun = replay(CITY, shift, sim.actions);
    const gaps = orderGaps(shift, you, algo);

    setLastRun({ shift, you, algoRun, algo, verdict, yourRun, gaps, actions: sim.actions });
    if (!isDemo) {
      setBest(shift.id, you.avg);
      setTimeout(() => { navigate("#/result"); }, 600);
    } else {
      setTimeout(() => { navigate(`#/result?demo=1&part=${demoPart}&speed=${demoSpeed}`); }, 600);
    }
  }
}

export function unmount() {
  if (stopAnimation) { stopAnimation(); stopAnimation = null; }
  if (activeKeyHandler) { document.removeEventListener("keydown", activeKeyHandler); activeKeyHandler = null; }
  document.body.classList.remove("in-game");
}
