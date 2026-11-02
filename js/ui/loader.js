// Introductory animated loader for first session visit.
// Uses motion.js, store.js, and CSS tokens.
// Used by screens/home.js and main.js.

import { isReducedMotion } from "../motion.js";
import { getScooterSvg } from "./icons.js";

export function runLoader(container, onComplete) {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const isBypassed = params && (params.get("demo") === "1" || params.get("test") === "1" || params.get("present") === "1");

  let seen = false;
  try {
    seen = typeof sessionStorage !== "undefined" && sessionStorage.getItem("dr-intro-seen") === "1";
  } catch (e) {
    seen = false;
  }

  if (isBypassed || seen) {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  try {
    sessionStorage.setItem("dr-intro-seen", "1");
  } catch (e) {}

  const reduced = isReducedMotion();

  const loaderEl = document.createElement("div");
  loaderEl.className = "dr-intro-loader" + (reduced ? " is-reduced" : "");
  loaderEl.setAttribute("aria-hidden", "true");

  loaderEl.innerHTML = `
    <div class="loader-content">
      <div class="loader-stage">
        <svg viewBox="0 0 400 120" class="loader-svg">
          <!-- Sweeping road path -->
          <path d="M 0 80 Q 200 40 400 80" stroke="var(--brand)" stroke-width="6" fill="none" stroke-linecap="round" class="loader-road" />
          <!-- Animated scooter rider -->
          <g class="loader-scooter-actor">
            ${getScooterSvg("var(--brand)", 1, true, 1)}
          </g>
        </svg>
        <div class="loader-logo-wrap">
          <span class="loader-logo-eyebrow">WRENCH WISE</span>
          <span class="loader-logo-title font-bold">Delivery Rush</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(loaderEl);

  const duration = reduced ? 150 : 250;

  setTimeout(() => {
    loaderEl.classList.add("fade-out");
    setTimeout(() => {
      if (loaderEl.parentNode) {
        loaderEl.parentNode.removeChild(loaderEl);
      }
      if (typeof onComplete === "function") onComplete();
    }, 100);
  }, duration);
}
