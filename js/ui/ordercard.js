// Order card component rendering food icon, due ring, dish, route, and urgency badges.
// Uses content.js, icons.js, and copy.js.
// Used by play screen orders column/strip and coach coordinator.

import { CITY } from "../content.js";
import { FOOD_ICONS } from "./icons.js";
import { t } from "../copy.js";

const shopMap = new Map(CITY.shops.map((s) => [s.id, s]));
const homeMap = new Map(CITY.homes.map((h) => [h.id, h]));

const RING_R = 19;
const RING_C = 2 * Math.PI * RING_R; // ~119.38

export function createOrderCard(order, onSelect, keyIndex = null) {
  const shop = shopMap.get(order.shop) || { name: "Shop", icon: "biryani" };
  const home = homeMap.get(order.home) || { name: "Customer" };
  const kindInfo = CITY.kinds[order.kind] || { badge: "" };
  const kindBadge = kindInfo.badge || "";
  const foodIcon = FOOD_ICONS[shop.icon] || FOOD_ICONS.dosa;

  const card = document.createElement("button");
  card.type = "button";
  card.className = "order-card";
  card.setAttribute("data-order-id", order.id);
  card.setAttribute("aria-label", `${order.dish} from ${shop.name} to ${home.name}`);

  // Keyboard shortcut badge for desktop
  const keyBadge = keyIndex !== null && keyIndex <= 9
    ? `<span class="order-key-hint" aria-hidden="true">${keyIndex}</span>`
    : "";

  // Urgent badge if melts or cools
  const urgencyBadge = kindBadge
    ? `<span class="order-kind-pill kind-${order.kind}">${kindBadge}</span>`
    : "";

  card.innerHTML = `
    ${keyBadge}
    <div class="order-icon-wrap">
      <svg class="due-ring-svg" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="${RING_R}" class="ring-bg"/>
        <circle cx="22" cy="22" r="${RING_R}" class="ring-fg" stroke-dasharray="${RING_C.toFixed(1)}" stroke-dashoffset="0"/>
      </svg>
      <div class="order-food-tile">
        <svg viewBox="0 0 30 30" width="28" height="28" aria-hidden="true">
          ${foodIcon}
        </svg>
      </div>
    </div>
    <div class="order-details">
      <div class="order-head-row">
        <span class="order-dish-title">${order.dish}</span>
        ${urgencyBadge}
      </div>
      <div class="order-route-text">${shop.name} &rarr; ${home.name}</div>
      <div class="order-timing-row">
        <span class="order-due-label">--</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    if (typeof onSelect === "function") {
      onSelect(order.id);
    }
  });

  return card;
}

export function updateOrderCard(cardEl, order, currentT, isSelected) {
  if (!cardEl) return;

  // Selected state
  if (isSelected) {
    cardEl.classList.add("is-selected");
    cardEl.setAttribute("aria-pressed", "true");
  } else {
    cardEl.classList.remove("is-selected");
    cardEl.setAttribute("aria-pressed", "false");
  }

  const ringFg = cardEl.querySelector(".ring-fg");
  const dueLabel = cardEl.querySelector(".order-due-label");

  const total = Math.max(1, order.dueAt - order.at);
  const remaining = order.dueAt - currentT;
  const fraction = Math.max(0, Math.min(1, remaining / total));
  const offset = RING_C * (1 - fraction);

  if (ringFg) {
    ringFg.style.strokeDashoffset = offset.toFixed(1);
    if (remaining <= 5 && remaining >= 0) {
      ringFg.classList.add("is-warn");
      ringFg.classList.remove("is-late");
    } else if (remaining < 0) {
      ringFg.classList.add("is-late");
      ringFg.classList.remove("is-warn");
    } else {
      ringFg.classList.remove("is-warn", "is-late");
    }
  }

  if (dueLabel) {
    if (remaining < 0) {
      dueLabel.innerHTML = `<span class="chip-late">${t("play.late")}</span>`;
    } else {
      dueLabel.textContent = t("play.dueIn", { n: remaining });
      if (remaining <= 5) {
        dueLabel.classList.add("text-warn");
      } else {
        dueLabel.classList.remove("text-warn");
      }
    }
  }
}
