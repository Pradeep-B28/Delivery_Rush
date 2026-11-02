// Side-by-side replay race screen and final comparative scoreboard reveal.
// Uses run.js, content.js, motion.js, router.js, copy.js, and ui/ components.
// Used by router.js when URL matches #/result.

import { SHIFTS, CONFIG } from "../content.js";
import { t } from "../copy.js";
import { getLastRun, hasLastRun } from "../run.js";
import { startLoop, isReducedMotion } from "../motion.js";
import { navigate } from "../router.js";
import { createRaceCoordinator } from "../ui/race.js";
import { createLiveScoreboard, renderFinalScoreboard } from "../ui/scoreboard.js";
import { renderGapsBreakdown } from "../ui/gaps.js";
import { renderCtaCard } from "../ui/cta.js";
import { shareChallenge } from "../ui/share.js";

let stopAnimation = null;

export function mount(container, params = {}) {
  unmount();

  if (!hasLastRun()) {
    navigate("#/");
    return;
  }

  const runData = getLastRun();
  const { shift, you, algoRun, algo, verdict, yourRun, gaps } = runData;
  const isDemo = params.query && params.query.demo === "1";
  const demoSpeed = isDemo && params.query.speed === "2" ? 2 : 1;
  const demoPart = (params.query && params.query.part) || "all";
  const youLabel = isDemo ? t("demo.you") : t("race.you");

  const shiftOrder = ["lunch", "dinner", "rain"];
  const curIdx = shiftOrder.indexOf(shift.id);
  const nextShiftId = shiftOrder[(curIdx + 1) % shiftOrder.length];
  const nextShift = SHIFTS.find((s) => s.id === nextShiftId) || SHIFTS[0];

  const logoHtml = isDemo ? `<img src="assets/logo.png" alt="Wrench Wise" class="demo-logo" height="20">` : "";

  container.innerHTML = `
    <div class="result-viewport" data-mood="${shift.mood}">
      <header class="race-topbar" id="raceTopbar">
        <div class="race-topbar-left" style="display:flex; align-items:center;">
          ${logoHtml}
          <span class="race-shift-title">${shift.name}</span>
        </div>
        <div class="race-topbar-actions">
          <button type="button" class="race-btn speed-btn ${demoSpeed === 1 ? "is-active" : ""}" id="btn-speed-1">1x</button>
          <button type="button" class="race-btn speed-btn ${demoSpeed === 2 ? "is-active" : ""}" id="btn-speed-2">2x</button>
          <button type="button" class="race-btn skip-btn" id="btn-skip">${t("race.skip")}</button>
        </div>
      </header>

      <div id="liveScoreboardContainer"></div>

      <div class="race-maps-stage" id="raceMapsStage">
        <div class="race-map-pane" id="pane-you">
          <div class="race-map-header">${youLabel}</div>
          <div class="race-map-wrapper map-container" data-mood="${shift.mood}">
            <div class="race-city-layer" style="width:100%; height:100%;"></div>
            <svg viewBox="0 0 520 520" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;"><g class="race-actors-group"></g></svg>
            <div class="race-done-chip" hidden>${t("race.done")}</div>
          </div>
        </div>

        <div class="race-map-pane" id="pane-algo">
          <div class="race-map-header">${t("race.algo")}</div>
          <div class="race-map-wrapper map-container" data-mood="${shift.mood}">
            <div class="race-city-layer" style="width:100%; height:100%;"></div>
            <svg viewBox="0 0 520 520" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;"><g class="race-actors-group"></g></svg>
            <div class="race-done-chip" hidden>${t("race.done")}</div>
          </div>
        </div>
      </div>

      <div id="revealContainer" class="reveal-content-container" hidden></div>
    </div>
  `;

  const topbar = document.getElementById("raceTopbar");
  const liveScoreEl = document.getElementById("liveScoreboardContainer");
  const raceMapsStage = document.getElementById("raceMapsStage");
  const revealContainer = document.getElementById("revealContainer");
  const btnSpeed1 = document.getElementById("btn-speed-1");
  const btnSpeed2 = document.getElementById("btn-speed-2");
  const btnSkip = document.getElementById("btn-skip");

  const liveScoreboard = createLiveScoreboard(liveScoreEl, {
    youLabel,
    algoLabel: t("race.algo"),
    totalOrders: shift.orders.length
  });

  let revealed = false;

  function doReveal() {
    if (revealed) return;
    revealed = true;
    if (stopAnimation) {
      stopAnimation();
      stopAnimation = null;
    }

    topbar.style.display = "none";
    liveScoreEl.style.display = "none";
    raceMapsStage.classList.add("is-revealed");
    revealContainer.removeAttribute("hidden");

    revealContainer.innerHTML = `
      ${renderFinalScoreboard({ you, algo, verdict, shift, youLabel })}
      ${renderGapsBreakdown(shift, gaps, youLabel)}
      <div class="result-actions">
        <a href="#/think/${shift.id}" class="result-btn btn-primary" id="btn-think">${t("result.think")} &rarr;</a>
        <a href="#/play/${shift.id}" class="result-btn" id="btn-again">${t("result.again")}</a>
        <a href="#/play/${nextShift.id}" class="result-btn" id="btn-next">${t("result.next", { shift: nextShift.name })}</a>
        <button type="button" class="result-btn" id="btn-challenge">${t("result.challenge")}</button>
      </div>
      ${renderCtaCard({ shift, you, algo, from: "result", hideWhatsApp: isDemo })}
    `;

    const challengeBtn = revealContainer.querySelector("#btn-challenge");
    if (challengeBtn) {
      challengeBtn.addEventListener("click", () => {
        shareChallenge({
          shiftId: shift.id,
          shiftName: shift.name,
          avg: you.avg
        });
      });
    }

    if (isDemo && demoPart === "all") {
      setTimeout(() => {
        navigate(`#/think/${shift.id}?demo=1&part=all&speed=${demoSpeed}`);
      }, 5000);
    }
  }

  // Check reduced motion
  if (isReducedMotion()) {
    doReveal();
    return;
  }

  const race = createRaceCoordinator({
    youContainer: document.getElementById("pane-you"),
    algoContainer: document.getElementById("pane-algo"),
    shift,
    yourFrames: yourRun.frames,
    algoFrames: algoRun.frames,
    onTick: (state) => {
      liveScoreboard.update(state);
    },
    onFinish: () => {
      doReveal();
    }
  });

  if (demoSpeed === 2) {
    race.setSpeed(2);
  }

  btnSpeed1.addEventListener("click", () => {
    btnSpeed1.classList.add("is-active");
    btnSpeed2.classList.remove("is-active");
    race.setSpeed(1);
  });

  btnSpeed2.addEventListener("click", () => {
    btnSpeed2.classList.add("is-active");
    btnSpeed1.classList.remove("is-active");
    race.setSpeed(2);
  });

  btnSkip.addEventListener("click", () => {
    race.skip();
  });

  stopAnimation = startLoop((dtMs) => {
    race.tick(dtMs);
  });
}

export function unmount() {
  if (stopAnimation) {
    stopAnimation();
    stopAnimation = null;
  }
}
