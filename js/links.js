// URL builders for WhatsApp, program CTA, web share, and challenge links.
// Uses config.js and js/engine/score.js.
// Used by screens, CTA, share dialog, and self-test.

import { CONFIG } from "../config.js";
import { formatMins, encodeBeat, decodeChallenge } from "./engine/score.js";

export { formatMins, encodeBeat, decodeChallenge };

export function whatsAppLink(shiftName, youAvg, algoAvg, overridePhone) {
  const phone = overridePhone !== undefined ? overridePhone : CONFIG.salesWhatsApp;
  if (!phone || typeof phone !== "string") return null;
  const digitsOnly = phone.trim();
  if (!/^\d{11,15}$/.test(digitsOnly)) return null;

  const text = CONFIG.whatsAppText
    .replace("{shift}", shiftName || "")
    .replace("{you}", formatMins(youAvg))
    .replace("{algo}", formatMins(algoAvg))
    .replace("{program}", CONFIG.program.name);

  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}

export function programLink(utmContent = "home") {
  const base = CONFIG.website.replace(/\/+$/, "");
  const page = CONFIG.program.page ? `/${CONFIG.program.page.replace(/^\/+/, "")}` : "";
  const sep = (base + page).includes("?") ? "&" : "?";
  const utm = [
    `utm_source=${encodeURIComponent(CONFIG.utm.source)}`,
    `utm_medium=${encodeURIComponent(CONFIG.utm.medium)}`,
    `utm_campaign=${encodeURIComponent(CONFIG.utm.campaign)}`,
    `utm_content=${encodeURIComponent(utmContent)}`
  ].join("&");

  return `${base}${page}${sep}${utm}`;
}

export function challengeLink(shiftId, youAvg, customBase) {
  let base = customBase;
  if (!base) {
    if (CONFIG.siteUrl) {
      base = CONFIG.siteUrl;
    } else if (typeof window !== "undefined" && window.location) {
      base = `${window.location.origin}${window.location.pathname}`;
    } else {
      base = "";
    }
  }
  const sep = base.includes("?") ? "&" : "?";
  const beat = encodeBeat(youAvg);
  return `${base}${sep}shift=${encodeURIComponent(shiftId)}&beat=${beat}&utm_content=share`;
}
