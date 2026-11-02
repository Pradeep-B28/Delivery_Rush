// Priority queue visualizer rendering orders in a binary heap tree.
// Uses content.js, icons.js, copy.js, and tokens.css.
// Used by screens/think.js.

import { CITY } from "../content.js";
import { FOOD_ICONS } from "./icons.js";
import { t } from "../copy.js";

const NODE_POSITIONS = [
  { x: 230, y: 38 },   // 0: Root
  { x: 120, y: 98 },   // 1
  { x: 340, y: 98 },   // 2
  { x: 65,  y: 158 },  // 3
  { x: 175, y: 158 },  // 4
  { x: 285, y: 158 },  // 5
  { x: 395, y: 158 },  // 6
  { x: 36,  y: 218 },  // 7
  { x: 94,  y: 218 },  // 8
  { x: 146, y: 218 },  // 9
  { x: 204, y: 218 },  // 10
  { x: 256, y: 218 },  // 11
  { x: 314, y: 218 },  // 12
  { x: 366, y: 218 },  // 13
  { x: 424, y: 218 }   // 14
];

const shopMap = new Map(CITY.shops.map((s) => [s.id, s]));

export function createHeapTree({ container, heapBefore = [], heapAfter = [], shift }) {
  const orderMap = new Map(shift.orders.map((o) => [o.id, o]));
  let isPopped = false;

  function renderTree(isAfter) {
    const list = isAfter ? heapAfter : heapBefore;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="heap-tree-wrap">
          <div class="heap-empty-state">
            <span class="heap-empty-badge font-bold">${t("think.heapEmpty")}</span>
          </div>
          <div class="heap-controls">
            <button type="button" class="think-btn" id="btnHeapReplay">${t("think.replay")}</button>
          </div>
        </div>
      `;
      const btn = container.querySelector("#btnHeapReplay");
      if (btn) btn.addEventListener("click", () => { isPopped = false; renderTree(false); });
      return;
    }

    // Generate connecting lines
    const linesSvg = list.map((item, idx) => {
      if (idx === 0) return "";
      const pIdx = Math.floor((idx - 1) / 2);
      const parentPos = NODE_POSITIONS[pIdx] || NODE_POSITIONS[0];
      const myPos = NODE_POSITIONS[idx] || NODE_POSITIONS[0];
      return `<line x1="${parentPos.x}" y1="${parentPos.y}" x2="${myPos.x}" y2="${myPos.y}" stroke="var(--border)" stroke-width="2" />`;
    }).join("");

    // Generate node circles
    const nodesSvg = list.slice(0, 15).map((item, idx) => {
      const pos = NODE_POSITIONS[idx] || NODE_POSITIONS[0];
      const order = orderMap.get(item.id) || {};
      const shop = shopMap.get(order.shop) || { icon: "dosa" };
      const iconGroup = FOOD_ICONS[shop.icon] || FOOD_ICONS.dosa;
      const isRoot = idx === 0 && !isAfter;

      return `
        <g class="heap-node ${isRoot ? "is-root" : ""}" transform="translate(${pos.x}, ${pos.y})" data-order-id="${item.id}">
          <circle cx="0" cy="0" r="22" class="heap-node-circle" />
          <g transform="translate(-11, -17) scale(0.72)">${iconGroup}</g>
          <text x="0" y="14" class="heap-node-due num" text-anchor="middle">due ${item.dueAt}</text>
        </g>
      `;
    }).join("");

    container.innerHTML = `
      <div class="heap-tree-wrap">
        <svg viewBox="0 0 460 255" class="heap-tree-svg" preserveAspectRatio="xMidYMid meet">
          <g class="heap-lines-layer">${linesSvg}</g>
          <g class="heap-nodes-layer">${nodesSvg}</g>
        </svg>
        <div class="heap-controls">
          <button type="button" class="think-btn ${isAfter ? "" : "btn-primary"}" id="btnHeapStep">
            ${isAfter ? t("think.replay") : t("think.next")}
          </button>
        </div>
      </div>
    `;

    const stepBtn = container.querySelector("#btnHeapStep");
    if (stepBtn) {
      stepBtn.addEventListener("click", () => {
        isPopped = !isPopped;
        renderTree(isPopped);
      });
    }
  }

  renderTree(false);

  return {
    reset() {
      isPopped = false;
      renderTree(false);
    }
  };
}
