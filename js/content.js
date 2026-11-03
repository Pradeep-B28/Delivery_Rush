// Central content access layer and query functions for Delivery Rush.
// Uses content/index.js and config.js.
// Used by screens, components, game, and self-test.

import { CITY, SHIFTS, LINES, CONCEPTS, EXPLAIN, CONTENT_VERSION } from "../content/index.js";
import { CONFIG } from "../config.js";

export { CITY, SHIFTS, LINES, CONCEPTS, EXPLAIN, CONTENT_VERSION, CONFIG };

export function getShifts() {
  return SHIFTS;
}

export function getShift(id) {
  return SHIFTS.find((s) => s.id === id) || null;
}

export function getNextShift(currentId) {
  const index = SHIFTS.findIndex((s) => s.id === currentId);
  if (index === -1) return SHIFTS[0] || null;
  return SHIFTS[(index + 1) % SHIFTS.length];
}

export function getShop(id) {
  return CITY.shops.find((s) => s.id === id) || null;
}

export function getHome(id) {
  return CITY.homes.find((h) => h.id === id) || null;
}

export function getRider(id) {
  return CITY.riders.find((r) => r.id === id) || null;
}

export function getRiderDisplayName(riderOrId, idx = null) {
  let index = idx;
  if (index === null || index === undefined || index < 0) {
    const id = typeof riderOrId === "object" && riderOrId ? riderOrId.id : riderOrId;
    if (typeof id === "string" && id.startsWith("r")) {
      const num = parseInt(id.slice(1), 10);
      if (!isNaN(num) && num >= 1) index = num - 1;
    } else {
      index = CITY.riders.findIndex((r) => r.id === id);
    }
  }
  if (index !== null && index !== undefined && index >= 0) {
    return `Rider ${String.fromCharCode(65 + index)}`;
  }
  return "Rider";
}

export function getDish(shopId, dishName) {
  const list = CITY.dishes[shopId];
  if (!list) return null;
  return list.find((d) => d.name === dishName) || null;
}

export function getConcept(id) {
  return CONCEPTS.find((c) => c.id === id) || null;
}

export function getExplain() {
  return EXPLAIN;
}
