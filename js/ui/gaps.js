// "Where the time went" breakdown of the top order delivery time losses.
// Uses content.js, icons.js, and copy.js.
// Used by screens/result.js.

import { CITY } from "../content.js";
import { FOOD_ICONS } from "./icons.js";
import { t } from "../copy.js";
import { formatMins } from "../links.js";

const shopMap = new Map(CITY.shops.map((s) => [s.id, s]));
const homeMap = new Map(CITY.homes.map((h) => [h.id, h]));

export function renderGapsBreakdown(shift, gaps, youLabel = "You") {
  const topGaps = (gaps || []).filter((g) => g.gap > 0).slice(0, 3);

  if (topGaps.length === 0) {
    return `
      <section class="gaps-card card" aria-label="${t("result.gapsTitle")}">
        <h3 class="gaps-title">${t("result.gapsTitle")}</h3>
        <p class="gaps-empty">${t("result.noGaps")}</p>
      </section>
    `;
  }

  // Max minutes across top gaps for proportionate bar sizing
  const maxMins = Math.max(
    ...topGaps.map((g) => Math.max(g.you || shift.missedMins, g.algo)),
    20
  );

  const rowsHtml = topGaps.map((g) => {
    const order = shift.orders.find((o) => o.id === g.id) || {};
    const shop = shopMap.get(order.shop) || { icon: "dosa" };
    const home = homeMap.get(order.home) || { name: "Customer" };
    const foodIcon = FOOD_ICONS[shop.icon] || FOOD_ICONS.dosa;

    const isMissed = g.you === null;
    const youValStr = isMissed ? t("result.missed") : `${g.you} mins`;
    const algoValStr = `${g.algo} mins`;

    const youWidthPct = Math.min(100, Math.max(8, Math.round(((g.you || shift.missedMins) / maxMins) * 100)));
    const algoWidthPct = Math.min(100, Math.max(8, Math.round((g.algo / maxMins) * 100)));

    return `
      <div class="gap-row">
        <div class="gap-icon-tile">
          <svg viewBox="0 0 30 30" width="28" height="28" aria-hidden="true">${foodIcon}</svg>
        </div>
        <div class="gap-details">
          <div class="gap-name-row">
            <span class="gap-dish font-bold">${order.dish || g.id}</span>
            <span class="gap-customer text-muted">&rarr; ${home.name}</span>
            <span class="gap-loss-pill num">+${formatMins(g.gap)}m</span>
          </div>

          <!-- Comparison bars -->
          <div class="gap-bars">
            <div class="gap-bar-line">
              <span class="gap-bar-tag">${youLabel}</span>
              <div class="gap-bar-track">
                <div class="gap-bar-fill fill-you ${isMissed ? "fill-missed" : ""}" style="width: ${youWidthPct}%;"></div>
              </div>
              <span class="gap-bar-num num ${isMissed ? "text-danger" : ""}">${youValStr}</span>
            </div>
            <div class="gap-bar-line">
              <span class="gap-bar-tag">${t("race.algo")}</span>
              <div class="gap-bar-track">
                <div class="gap-bar-fill fill-algo" style="width: ${algoWidthPct}%;"></div>
              </div>
              <span class="gap-bar-num num">${algoValStr}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="gaps-card card" aria-label="${t("result.gapsTitle")}">
      <h3 class="gaps-title">${t("result.gapsTitle")}</h3>
      <div class="gaps-list">
        ${rowsHtml}
      </div>
    </section>
  `;
}
