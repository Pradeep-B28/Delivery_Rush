// Greedy choice timeline visualizer comparing all rider candidate delivery finishes.
// Uses copy.js, tokens.css, and content.js.
// Used by screens/think.js.

import { t } from "../copy.js";

const RIDER_COLORS = [
  "var(--rider-1)",
  "var(--rider-2)",
  "var(--rider-3)",
  "var(--rider-4)"
];

export function renderGreedyBars({ decision, shift }) {
  const tStart = decision.t;
  const candidates = decision.candidates || [];

  const nonFull = candidates.filter((c) => !c.full);
  const maxFinish = nonFull.length > 0 ? Math.max(...nonFull.map((c) => c.finish)) : tStart + 15;
  const totalSpan = Math.max(maxFinish - tStart, 10);

  const rowsHtml = shift.riders.map((rider, idx) => {
    const c = candidates.find((x) => x.rider === rider.id) || { full: true };
    const color = RIDER_COLORS[idx % RIDER_COLORS.length];
    const isChosen = rider.id === decision.rider;

    if (c.full) {
      return `
        <div class="greedy-row is-full">
          <div class="greedy-rider-meta">
            <span class="greedy-rider-dot" style="background:${color};"></span>
            <span class="greedy-rider-name font-bold">${rider.name}</span>
          </div>
          <div class="greedy-bar-container">
            <span class="greedy-full-badge">${t("play.full")}</span>
          </div>
        </div>
      `;
    }

    // 3 segments
    const busyMins = Math.max(0, c.freeAt - tStart);
    const shopMins = Math.max(0, c.pickupAt - c.freeAt);
    const homeMins = Math.max(0, c.toHome);

    const busyPct = Math.round((busyMins / totalSpan) * 100);
    const shopPct = Math.round((shopMins / totalSpan) * 100);
    const homePct = Math.round((homeMins / totalSpan) * 100);

    return `
      <div class="greedy-row ${isChosen ? "is-chosen" : ""}">
        <div class="greedy-rider-meta">
          <span class="greedy-rider-dot" style="background:${color};"></span>
          <span class="greedy-rider-name font-bold">${rider.name}</span>
          ${isChosen ? `<span class="greedy-chosen-tick" aria-label="Chosen">&#10003;</span>` : ""}
        </div>
        <div class="greedy-bar-container">
          <div class="greedy-bar-track">
            ${busyMins > 0 ? `<div class="greedy-seg seg-busy" style="width:${busyPct}%;" title="Busy until free: ${busyMins}m"></div>` : ""}
            ${shopMins > 0 ? `<div class="greedy-seg seg-shop" style="width:${shopPct}%; background:${color}; opacity:0.5;" title="To shop and prep: ${shopMins}m"></div>` : ""}
            ${homeMins > 0 ? `<div class="greedy-seg seg-home" style="width:${homePct}%; background:${color};" title="To customer: ${homeMins}m"></div>` : ""}
          </div>
          <span class="greedy-finish-label num font-bold">Min ${c.finish}</span>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="greedy-bars-wrap card">
      <div class="greedy-timeline-header">
        <span class="text-muted font-mono" style="font-size:0.75rem;">Time axis (minute ${tStart} to ${maxFinish})</span>
        <div class="greedy-legend">
          <span class="legend-item"><span class="legend-swatch swatch-busy"></span> Busy</span>
          <span class="legend-item"><span class="legend-swatch swatch-shop"></span> To shop</span>
          <span class="legend-item"><span class="legend-swatch swatch-home"></span> To customer</span>
        </div>
      </div>
      <div class="greedy-rows-list">${rowsHtml}</div>
    </div>
  `;
}
