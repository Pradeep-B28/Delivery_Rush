// Live race scoreboard and final comparison table for You vs Algorithm.
// Uses copy.js, links.js, and tokens.css.
// Used by screens/result.js and race coordinator.

import { t } from "../copy.js";
import { formatMins } from "../links.js";

export function createLiveScoreboard(container, { youLabel = "You", algoLabel = "Algorithm", totalOrders = 12 }) {
  container.className = "race-live-scoreboard";
  container.innerHTML = `
    <div class="live-score-card card-you">
      <div class="score-side-label">${youLabel}</div>
      <div class="score-big-avg num" id="live-you-avg">--</div>
      <div class="score-progress-wrap">
        <div class="score-progress-bar"><div class="score-bar-fill fill-you" id="live-you-bar" style="width:0%"></div></div>
        <span class="score-count-text num" id="live-you-count">0 of ${totalOrders}</span>
      </div>
    </div>
    <div class="live-score-vs">VS</div>
    <div class="live-score-card card-algo">
      <div class="score-side-label">${algoLabel}</div>
      <div class="score-big-avg num" id="live-algo-avg">--</div>
      <div class="score-progress-wrap">
        <div class="score-progress-bar"><div class="score-bar-fill fill-algo" id="live-algo-bar" style="width:0%"></div></div>
        <span class="score-count-text num" id="live-algo-count">0 of ${totalOrders}</span>
      </div>
    </div>
  `;

  const elYouAvg = container.querySelector("#live-you-avg");
  const elAlgoAvg = container.querySelector("#live-algo-avg");
  const elYouBar = container.querySelector("#live-you-bar");
  const elAlgoBar = container.querySelector("#live-algo-bar");
  const elYouCount = container.querySelector("#live-you-count");
  const elAlgoCount = container.querySelector("#live-algo-count");

  let lastYouAvg = "--";
  let lastAlgoAvg = "--";
  let lastYouDelivered = -1;
  let lastAlgoDelivered = -1;

  return {
    update({ youAvg, algoAvg, youDelivered, algoDelivered }) {
      const yAvgStr = youAvg !== null && youAvg !== undefined ? formatMins(youAvg) : "--";
      const aAvgStr = algoAvg !== null && algoAvg !== undefined ? formatMins(algoAvg) : "--";

      if (yAvgStr !== lastYouAvg) {
        lastYouAvg = yAvgStr;
        elYouAvg.textContent = yAvgStr;
        if (elYouAvg.animate) {
          elYouAvg.animate(
            [{ transform: "scale(1.15)" }, { transform: "scale(1)" }],
            { duration: 180, easing: "ease-out" }
          );
        }
      }
      if (aAvgStr !== lastAlgoAvg) {
        lastAlgoAvg = aAvgStr;
        elAlgoAvg.textContent = aAvgStr;
        if (elAlgoAvg.animate) {
          elAlgoAvg.animate(
            [{ transform: "scale(1.15)" }, { transform: "scale(1)" }],
            { duration: 180, easing: "ease-out" }
          );
        }
      }

      if (youDelivered !== lastYouDelivered) {
        lastYouDelivered = youDelivered;
        const yPct = Math.min(100, Math.round((youDelivered / totalOrders) * 100));
        elYouBar.style.width = `${yPct}%`;
        elYouCount.textContent = `${youDelivered} of ${totalOrders}`;
      }

      if (algoDelivered !== lastAlgoDelivered) {
        lastAlgoDelivered = algoDelivered;
        const aPct = Math.min(100, Math.round((algoDelivered / totalOrders) * 100));
        elAlgoBar.style.width = `${aPct}%`;
        elAlgoCount.textContent = `${algoDelivered} of ${totalOrders}`;
      }
    }
  };
}

export function renderFinalScoreboard({ you, algo, verdict, shift, youLabel = "You" }) {
  const kind = verdict.kind; // win, tie, close, behind
  const verdictTitle = t(`result.${kind}.title`, { gap: formatMins(verdict.gapMins) });
  const verdictBody = t(`result.${kind}.body`, { gap: formatMins(verdict.gapMins) });
  const percentText = verdict.gapPercent > 0
    ? `<span class="verdict-percent">${t("result.percent", { n: verdict.gapPercent })}</span>`
    : "";

  return `
    <div class="final-scoreboard-wrap card">
      <div class="verdict-banner verdict-${kind}">
        <h2 class="verdict-title">${verdictTitle}</h2>
        <p class="verdict-body">${verdictBody} ${percentText}</p>
      </div>

      <div class="comparison-grid">
        <div class="grid-header-row">
          <span class="grid-col-metric"></span>
          <span class="grid-col-you">${youLabel}</span>
          <span class="grid-col-algo">${t("race.algo")}</span>
        </div>

        <div class="grid-row row-primary">
          <span class="row-label">${t("result.avg")}</span>
          <span class="row-val val-you num font-bold">${formatMins(you.avg)} mins</span>
          <span class="row-val val-algo num font-bold">${formatMins(algo.avg)} mins</span>
        </div>

        <div class="grid-row">
          <span class="row-label">${t("result.delivered")}</span>
          <span class="row-val val-you num">${you.delivered} of ${shift.orders.length}</span>
          <span class="row-val val-algo num">${algo.delivered} of ${shift.orders.length}</span>
        </div>

        <div class="grid-row">
          <span class="row-label">${t("result.late")}</span>
          <span class="row-val val-you num ${you.late > 0 ? "text-warn" : ""}">${you.late}</span>
          <span class="row-val val-algo num ${algo.late > 0 ? "text-warn" : ""}">${algo.late}</span>
        </div>

        <div class="grid-row">
          <span class="row-label">${t("result.missed")}</span>
          <span class="row-val val-you num ${you.missed > 0 ? "text-danger" : ""}">${you.missed}</span>
          <span class="row-val val-algo num ${algo.missed > 0 ? "text-danger" : ""}">${algo.missed}</span>
        </div>
      </div>
    </div>
  `;
}
