// Queue visualizer showing the chosen rider's job queue slots and FIFO arrival.
// Uses content.js, icons.js, copy.js, and tokens.css.
// Used by screens/think.js.

import { CITY } from "../content.js";
import { FOOD_ICONS } from "./icons.js";
import { t } from "../copy.js";

const RIDER_COLORS = [
  "var(--rider-1)",
  "var(--rider-2)",
  "var(--rider-3)",
  "var(--rider-4)"
];

const shopMap = new Map(CITY.shops.map((s) => [s.id, s]));
const homeMap = new Map(CITY.homes.map((h) => [h.id, h]));

export function renderQueueSlots({ decision, shift }) {
  const riderIdx = shift.riders.findIndex((r) => r.id === decision.rider);
  const rider = shift.riders[riderIdx >= 0 ? riderIdx : 0] || { name: "Rider" };
  const riderColor = RIDER_COLORS[(riderIdx >= 0 ? riderIdx : 0) % RIDER_COLORS.length];

  const maxJobs = shift.maxJobs || 2;
  const order = shift.orders.find((o) => o.id === decision.order) || {};
  const shop = shopMap.get(order.shop) || { icon: "dosa" };
  const home = homeMap.get(order.home) || { name: "Customer" };
  const foodIcon = FOOD_ICONS[shop.icon] || FOOD_ICONS.dosa;

  // decision.position is 1-based (1 or 2)
  const targetSlotIdx = Math.max(0, decision.position - 1);

  const slotsHtml = Array.from({ length: maxJobs }).map((_, idx) => {
    if (idx < targetSlotIdx) {
      // Preceding job
      return `
        <div class="queue-slot slot-ahead">
          <div class="slot-badge-tag">${t("think.jobAhead")}</div>
          <div class="slot-ahead-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <span class="slot-text text-muted">Job #${idx + 1}</span>
        </div>
      `;
    }

    if (idx === targetSlotIdx) {
      // New arriving order
      return `
        <div class="queue-slot slot-current slide-in-right">
          <div class="slot-badge-tag tag-new">${t("think.thisOrder")}</div>
          <div class="slot-food-icon">
            <svg viewBox="0 0 30 30" width="30" height="30" aria-hidden="true">${foodIcon}</svg>
          </div>
          <span class="slot-dish font-bold">${order.dish || decision.order}</span>
          <span class="slot-customer text-muted">&rarr; ${home.name}</span>
        </div>
      `;
    }

    // Empty slot
    return `
      <div class="queue-slot slot-empty">
        <span class="slot-empty-label text-muted">Empty slot ${idx + 1}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="queue-slots-wrap card">
      <header class="queue-rider-header">
        <span class="queue-rider-badge font-bold" style="background:${riderColor};">${(riderIdx >= 0 ? riderIdx : 0) + 1}</span>
        <div class="queue-rider-info">
          <span class="queue-rider-name font-bold">${rider.name}</span>
          <span class="queue-rider-sub text-muted">FIFO Queue (${maxJobs} slots)</span>
        </div>
      </header>

      <div class="queue-flow-container">
        <div class="queue-exit-indicator">
          <span class="queue-exit-arrow">&larr;</span>
          <span class="queue-exit-label">Front (Delivered first)</span>
        </div>
        <div class="queue-slots-grid">${slotsHtml}</div>
        <div class="queue-enter-indicator">
          <span class="queue-enter-label">Back (New joins here)</span>
          <span class="queue-enter-arrow">&larr;</span>
        </div>
      </div>
    </div>
  `;
}
