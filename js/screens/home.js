// Home landing screen with live algorithm city preview, shifts, and challenge banner.
// Uses content.js, copy.js, links.js, store.js, and ui/ components.
// Used by router.js when URL matches #/.

import { CITY, SHIFTS, CONCEPTS } from "../content.js";
import { runAlgorithm } from "../engine/algo.js";
import { decodeChallenge, formatMins } from "../links.js";
import { getBest } from "../store.js";
import { isReducedMotion, startLoop } from "../motion.js";
import { renderCitySvg } from "../ui/city.js";
import { getScooterSvg } from "../ui/icons.js";
import { renderCtaCard } from "../ui/cta.js";
import { t } from "../copy.js";

const RIDER_COLORS = ["var(--rider-1)", "var(--rider-2)", "var(--rider-3)", "var(--rider-4)"];

let stopHeroLoop = null;

export function mount(container, routeInfo = {}) {
  unmount();

  const query = routeInfo.query || {};
  const shiftIds = SHIFTS.map((s) => s.id);
  const challenge = decodeChallenge(query.shift, query.beat, shiftIds);
  const challengeShift = challenge ? SHIFTS.find((s) => s.id === challenge.shift) : null;

  const firstShift = SHIFTS[0];

  // 1. Shift Cards HTML
  const shiftsHtml = SHIFTS.map((s) => {
    const bestAvg = getBest(s.id);
    const bestHtml = bestAvg !== null ? `<span class="shift-card-best">${t("home.best", { avg: formatMins(bestAvg) })}</span>` : "";
    const levelName = s.id === "lunch" ? "The warm up" : s.id === "dinner" ? "Evening rush" : "Flooded bridges";

    return `
      <a href="#/play/${s.id}" class="shift-card" data-shift="${s.id}">
        <div class="shift-card-top">
          <span class="shift-card-level">${levelName}</span>
          <span class="text-muted num" style="font-size:0.75rem;">${s.orders.length} orders</span>
        </div>
        <div class="shift-card-thumb map-container" data-mood="${s.mood}">
          <div class="shift-thumb-svg">${renderCitySvg(s.mood, [])}</div>
        </div>
        <div class="shift-card-info">
          <h3 class="shift-card-title">${s.name}</h3>
          <p class="shift-card-tagline">${s.tagline}</p>
        </div>
        <div class="shift-card-footer">
          ${bestHtml}
          <span class="shift-card-btn font-bold">${t("home.play")} &rarr;</span>
        </div>
      </a>
    `;
  }).join("");

  // 2. How It Works Steps HTML
  const stepsHtml = [1, 2, 3].map((num) => {
    return `
      <div class="step-card">
        <div class="step-number-tag">${num}</div>
        <h3 class="step-title">${t(`home.step${num}.title`)}</h3>
        <p class="step-body">${t(`home.step${num}.body`)}</p>
      </div>
    `;
  }).join("");

  // 3. Concepts Cards HTML
  const conceptsHtml = CONCEPTS.map((c) => {
    return `
      <a href="#/think/${firstShift.id}" class="concept-home-card" data-concept="${c.id}">
        <span class="concept-name-tag">${c.name}</span>
        <span class="concept-question-tag">${c.question}</span>
      </a>
    `;
  }).join("");

  // 4. Challenge Banner HTML
  const bannerHtml = (challenge && challengeShift) ? `
    <aside class="challenge-banner-wrap" aria-label="Friend challenge">
      <div class="challenge-banner-inner">
        <span class="challenge-banner-text">${t("challenge.banner", { avg: formatMins(challenge.avg), shift: challengeShift.name })}</span>
        <a href="#/play/${challengeShift.id}" class="challenge-banner-btn">${t("home.play")}</a>
      </div>
    </aside>
  ` : "";

  container.innerHTML = `
    <div class="home-viewport">
      <div class="home-bg-grid" aria-hidden="true"></div>
      <div class="home-glow-1" aria-hidden="true"></div>
      <div class="home-glow-2" aria-hidden="true"></div>

      ${bannerHtml}

      <div class="home-container">
        <!-- Hero Section -->
        <section class="home-hero">
          <div class="hero-left">
            <span class="hero-eyebrow">${t("home.eyebrow")}</span>
            <h1 class="hero-title">${t("home.title")}</h1>
            <p class="hero-subtitle">${t("home.subtitle")}</p>
            <div class="hero-actions">
              <a href="#/play/${firstShift.id}" class="btn-hero-start">${t("home.start", { shift: firstShift.name })} &rarr;</a>
              <button type="button" class="btn-hero-how" id="btnScrollHow">${t("home.how")}</button>
            </div>
          </div>

          <div class="hero-right">
            <div class="hero-live-city-card map-container" data-mood="${firstShift.mood}">
              <div class="hero-city-layer" id="homeCityLayer">${renderCitySvg(firstShift.mood, [])}</div>
              <svg viewBox="0 0 520 520" class="hero-actors-svg">
                <g id="homeActorsGroup"></g>
              </svg>
              <div class="hero-live-badge">
                <span class="live-pulse-dot"></span>
                <span>LIVE</span>
              </div>
            </div>
            <p class="hero-live-line">${t("home.liveLine", { shift: firstShift.name })}</p>
          </div>
        </section>

        <!-- Shifts Section -->
        <section class="home-shifts-section" id="shiftsSection">
          <h2 class="section-heading">${t("home.shiftsTitle")}</h2>
          <div class="shifts-grid">${shiftsHtml}</div>
        </section>

        <!-- How It Works Section -->
        <section class="home-how-section" id="howSection">
          <h2 class="section-heading">${t("home.how")}</h2>
          <div class="steps-grid">${stepsHtml}</div>
        </section>

        <!-- What's Inside Section -->
        <section class="home-inside-section">
          <h2 class="section-heading">${t("home.insideTitle")}</h2>
          <div class="concepts-chips-grid">${conceptsHtml}</div>
        </section>

        <!-- CTA Section -->
        <section class="home-cta-wrap">
          ${renderCtaCard({ shift: firstShift, from: "home" })}
        </section>
      </div>
    </div>
  `;

  // Attach How It Works scroll
  const btnHow = container.querySelector("#btnScrollHow");
  if (btnHow) {
    btnHow.addEventListener("click", () => {
      const howSection = container.querySelector("#howSection");
      if (howSection) howSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Live Algorithm City Replay in Hero
  const algoRun = runAlgorithm(CITY, firstShift);
  const frames = algoRun.frames || [];
  const actorsGroup = container.querySelector("#homeActorsGroup");

  if (actorsGroup && frames.length > 0) {
    actorsGroup.innerHTML = "";
    const riderNodes = [];
    const riderCount = (firstShift.riders && firstShift.riders.length) || 3;

    for (let i = 0; i < riderCount; i++) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "rider-actor");
      g.style.willChange = "transform";
      g.innerHTML = getScooterSvg(RIDER_COLORS[i % RIDER_COLORS.length], i + 1, false, 1);
      actorsGroup.appendChild(g);
      const flipper = g.querySelector("g");
      riderNodes.push({ root: g, flipper, lastDir: 1, lastTransform: null });
    }

    // Set initial rider positions
    const firstFrame = frames[0];
    if (firstFrame && firstFrame.riders) {
      for (let i = 0; i < riderNodes.length; i++) {
        const rData = firstFrame.riders[i];
        const node = riderNodes[i];
        if (!rData || !node) continue;
        const pos = rData.pos || [0, 0];
        node.root.setAttribute("transform", `translate(${pos[0] * 40 + 20}, ${pos[1] * 40 + 20})`);
      }
    }

    if (!isReducedMotion()) {
      let frameIdx = 0;
      let progress = 0;
      const speed = 4; // 4x playback speed per Section 6B

      const startAnimation = () => {
        stopHeroLoop = startLoop((dtMs) => {
          progress += (dtMs / 300) * speed;
          if (progress >= 1) {
            progress = 0;
            frameIdx = (frameIdx + 1) % frames.length;
          }
          const curFrame = frames[frameIdx];
          if (curFrame && curFrame.riders) {
            for (let i = 0; i < riderNodes.length; i++) {
              const rData = curFrame.riders[i];
              const node = riderNodes[i];
              if (!rData || !node) continue;
              const pos = rData.pos || [0, 0];
              const cx = pos[0] * 40 + 20;
              const cy = pos[1] * 40 + 20;
              const tf = `translate(${cx}, ${cy})`;
              if (node.lastTransform !== tf) {
                node.lastTransform = tf;
                node.root.setAttribute("transform", tf);
              }
            }
          }
        });
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(startAnimation, { timeout: 1000 });
      } else {
        setTimeout(startAnimation, 300);
      }
    }
  }
}

export function unmount() {
  if (stopHeroLoop) {
    stopHeroLoop();
    stopHeroLoop = null;
  }
}
