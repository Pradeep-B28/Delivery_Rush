// Rider chip component rendering rider badge, job dots, status, and assignment targets.
// Uses copy.js, sim.js, and CSS rider tokens.
// Used by play screen riders column/row and coach coordinator.

import { t } from "../copy.js";
import { riderFree } from "../engine/sim.js";

const RIDER_KEY_HINTS = ["Q", "W", "E", "R"];

export function createRiderChip(rider, riderIndex, maxJobs, onPick, onInspect) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "rider-chip";
  chip.setAttribute("data-rider-id", rider.id);
  chip.setAttribute("data-rider-index", riderIndex);
  chip.setAttribute("aria-label", `Rider ${rider.name}`);

  const keyHint = riderIndex < RIDER_KEY_HINTS.length ? RIDER_KEY_HINTS[riderIndex] : "";

  chip.innerHTML = `
    <div class="rider-chip-badge" style="--chip-color: var(--rider-${riderIndex + 1});">
      <span class="rider-badge-num">${riderIndex + 1}</span>
    </div>
    <div class="rider-chip-info">
      <div class="rider-name-row">
        <span class="rider-name">${rider.name}</span>
        ${keyHint ? `<span class="rider-key-hint" aria-hidden="true">${keyHint}</span>` : ""}
      </div>
      <div class="rider-status-row">
        <span class="rider-status-text">--</span>
      </div>
    </div>
    <div class="rider-job-dots" aria-hidden="true">
      <!-- Dots injected per maxJobs -->
    </div>
  `;

  chip.addEventListener("click", () => {
    if (chip.classList.contains("can-pick")) {
      if (typeof onPick === "function") {
        onPick(rider.id);
      }
    } else if (chip.classList.contains("is-full")) {
      // Full rider, cannot pick
    } else {
      // No order selected, inspect route
      if (typeof onInspect === "function") {
        onInspect(rider.id);
      }
    }
  });

  return chip;
}

export function updateRiderChip(chipEl, rider, riderIndex, maxJobs, sim, hasSelectedOrder) {
  if (!chipEl || !rider) return;

  const freeInfo = riderFree(sim, rider);
  const jobsHeld = rider.jobs.size !== undefined ? rider.jobs.size : (rider.jobs.length || 0);
  const isFull = jobsHeld >= maxJobs;
  const isFree = jobsHeld === 0;

  // Status label
  const statusEl = chipEl.querySelector(".rider-status-text");
  if (statusEl) {
    if (isFull) {
      statusEl.textContent = t("play.full");
      statusEl.className = "rider-status-text text-muted";
    } else if (isFree) {
      statusEl.textContent = t("play.free");
      statusEl.className = "rider-status-text text-brand";
    } else {
      const wait = Math.max(0, freeInfo.at - sim.t);
      statusEl.textContent = t("play.freeIn", { n: wait });
      statusEl.className = "rider-status-text";
    }
  }

  // Dots
  const dotsEl = chipEl.querySelector(".rider-job-dots");
  if (dotsEl) {
    let dotsHtml = "";
    for (let i = 0; i < maxJobs; i++) {
      const filled = i < jobsHeld;
      dotsHtml += `<span class="job-dot ${filled ? "is-filled" : ""}"></span>`;
    }
    dotsEl.innerHTML = dotsHtml;
  }

  // Pickable / Full states when order is selected
  if (hasSelectedOrder) {
    if (isFull) {
      chipEl.classList.add("is-full");
      chipEl.classList.remove("can-pick");
      chipEl.setAttribute("aria-disabled", "true");
    } else {
      chipEl.classList.remove("is-full");
      chipEl.classList.add("can-pick");
      chipEl.setAttribute("aria-disabled", "false");
    }
  } else {
    chipEl.classList.remove("can-pick", "is-full");
    chipEl.removeAttribute("aria-disabled");
  }
}
