// Screen displaying algorithm decision logic, visualizers, and code explanations.
// Uses content.js, copy.js, links.js, run.js, and ui/ visualizer components.
// Used by router.js when URL matches #/think/:id.

import { CITY, SHIFTS, getShift, CONCEPTS, EXPLAIN, LINES, getRiderDisplayName } from "../content.js";
import { runAlgorithm } from "../engine/algo.js";
import { explainDecision } from "../engine/explain.js";
import { score } from "../engine/score.js";
import { replay } from "../engine/sim.js";
import { getLastRun, hasLastRun } from "../run.js";
import { formatMins } from "../links.js";
import { t } from "../copy.js";
import { createHeapTree } from "../ui/heaptree.js";
import { createBfsWave } from "../ui/bfswave.js";
import { renderGreedyBars } from "../ui/greedybars.js";
import { renderQueueSlots } from "../ui/queueslots.js";
import { renderCodeView, attachCodeViewEvents } from "../ui/codeview.js";
import { renderCtaCard } from "../ui/cta.js";

let activeCleanup = null;
let activeCycleTimer = null;
let activeKeyHandler = null;

const homeMap = new Map(CITY.homes.map((h) => [h.id, h]));
const shopMap = new Map(CITY.shops.map((s) => [s.id, s]));
const riderMap = new Map(CITY.riders.map((r) => [r.id, r]));

export function mount(container, routeInfo = {}) {
  unmount();

  const isDemo = routeInfo.query && routeInfo.query.demo === "1";
  const isPresent = routeInfo.query && routeInfo.query.present === "1";
  const hideWhatsApp = isDemo || isPresent;

  const runData = hasLastRun() ? getLastRun() : null;
  const shiftId = (routeInfo.params && routeInfo.params.id) || (runData && runData.shift.id) || (isPresent ? "dinner" : "lunch");
  const shift = getShift(shiftId) || SHIFTS[0];

  const logoHtml = isDemo ? `<img src="assets/logo.png" alt="Wrench Wise" class="demo-logo" height="20">` : "";

  // Run algorithm to get decisions
  const algoRun = (runData && runData.shift.id === shift.id && runData.algoRun)
    ? runData.algoRun
    : runAlgorithm(CITY, shift);

  const decisions = algoRun.decisions || [];
  const totalDecisions = decisions.length;

  // Initial decision index: biggest gap if run exists, else first heapBefore.length >= 2
  let currentDecisionIdx = 0;
  if (runData && runData.gaps && runData.gaps.length > 0) {
    const topGapId = runData.gaps[0].id;
    const foundIdx = decisions.findIndex((d) => d.order === topGapId);
    if (foundIdx !== -1) currentDecisionIdx = foundIdx;
  } else {
    const multiIdx = decisions.findIndex((d) => d.heapBefore && d.heapBefore.length >= 2);
    if (multiIdx !== -1) currentDecisionIdx = multiIdx;
  }
  if (currentDecisionIdx < 0 || currentDecisionIdx >= totalDecisions) {
    currentDecisionIdx = 0;
  }

  // Active concept tab (pq, bfs, greedy, queue)
  let activeConceptId = "pq";

  // Precompute honest note gap: algo.avg - best.avg
  const algoScore = (runData && runData.algo) ? runData.algo : score(algoRun.sim);
  const bestRun = replay(CITY, shift, LINES[shift.id].best);
  const bestScore = score(bestRun.sim);
  const honestGapStr = formatMins(Math.max(0, algoScore.avg - bestScore.avg));

  function render() {
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }

    const decision = decisions[currentDecisionIdx] || decisions[0];
    const order = shift.orders.find((o) => o.id === decision.order) || {};
    const home = homeMap.get(order.home) || { name: "Customer" };
    const currentConcept = CONCEPTS.find((c) => c.id === activeConceptId) || CONCEPTS[0];

    // Explanations for this decision
    const explanations = explainDecision(decision, shift, CITY, EXPLAIN);
    const conceptLine = explanations[activeConceptId] || "";

    // Concept tabs HTML
    const tabsHtml = CONCEPTS.map((c) => {
      const isActive = c.id === activeConceptId;
      return `
        <button type="button" class="think-tab-btn ${isActive ? "is-active" : ""}" data-concept="${c.id}">
          <span>${c.name}</span>
        </button>
      `;
    }).join("");

    // Your choice card HTML (if run in memory)
    let yourChoiceHtml = "";
    if (runData && runData.actions) {
      const yourAction = runData.actions.find((a) => a.order === decision.order);
      if (yourAction && runData.you && runData.you.times && runData.you.times[decision.order] !== undefined) {
        const rIdx = shift.riders.findIndex((r) => r.id === yourAction.rider);
        const rName = getRiderDisplayName(yourAction.rider, rIdx);
        const youMins = runData.you.times[decision.order];
        const algoMins = (runData.algo && runData.algo.times) ? runData.algo.times[decision.order] : 0;
        yourChoiceHtml = `
          <div class="think-your-choice-card">
            <span class="think-your-choice-title">${t("race.you")}</span>
            <p class="think-your-choice-body">${t("think.you", { rider: rName, at: yourAction.t, you: youMins, algo: algoMins })}</p>
          </div>
        `;
      } else {
        const algoMins = (runData.algo && runData.algo.times) ? runData.algo.times[decision.order] : 0;
        yourChoiceHtml = `
          <div class="think-your-choice-card">
            <span class="think-your-choice-title">${t("race.you")}</span>
            <p class="think-your-choice-body">${t("think.youMissed", { algo: algoMins })}</p>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="think-viewport">
        <!-- 1. Decision Nav -->
        <header class="think-nav-bar">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            ${logoHtml}
            <button type="button" class="think-nav-btn" id="btnDecBack" ${currentDecisionIdx <= 0 ? "disabled" : ""}>
              &larr; ${t("think.back")}
            </button>
          </div>
          <span class="think-decision-heading">
            ${t("think.decision", { n: currentDecisionIdx + 1, total: totalDecisions, dish: order.dish || decision.order, customer: home.name })}
          </span>
          <button type="button" class="think-nav-btn" id="btnDecNext" ${currentDecisionIdx >= totalDecisions - 1 ? "disabled" : ""}>
            ${t("think.next")} &rarr;
          </button>
        </header>

        <!-- 2. Tabs Strip -->
        <nav class="think-tabs-strip" aria-label="Algorithms concepts">${tabsHtml}</nav>

        <!-- 3. Main Stage: Split on Laptop -->
        <main class="think-main-stage">
          <!-- Left: Visual Column -->
          <section class="think-visual-column">
            <div class="visual-stage-card" id="visualStageCard"></div>
          </section>

          <!-- Right: Concept Content Column -->
          <section class="think-content-column">
            <div class="think-concept-header">
              <h2 class="think-concept-question">${currentConcept.question}</h2>
              <div class="think-decision-line-card">${conceptLine}</div>
            </div>

            <div class="think-explain-card">
              <p class="think-plain-text">${currentConcept.plain}</p>
              <p class="think-why-text">${currentConcept.why}</p>
            </div>

            <div class="think-next-idea-bar">
              <button type="button" class="btn-next-idea" id="btnNextIdea">
                <span>${t("think.nextIdea")}</span> &rarr;
              </button>
            </div>

            <!-- Code Panel -->
            ${renderCodeView({ file: currentConcept.file, codeLines: currentConcept.code })}
          </section>
        </main>

        <!-- 4. Bottom Cards -->
        <section class="think-bottom-section">
          ${yourChoiceHtml}

          <!-- Honest Note -->
          <div class="think-honest-card">
            <svg class="honest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p class="honest-text">${t("think.honest", { gap: honestGapStr })}</p>
          </div>

          <!-- CTA Card -->
          ${renderCtaCard({ shift, you: runData?.you, algo: algoScore, from: "think", hideWhatsApp })}
        </section>
      </div>
    `;

    // Attach Code View Toggle
    attachCodeViewEvents(container);

    // Mount Active Visualizer
    const visualStage = container.querySelector("#visualStageCard");
    if (activeConceptId === "pq") {
      const heap = createHeapTree({
        container: visualStage,
        heapBefore: decision.heapBefore,
        heapAfter: decision.heapAfter,
        shift
      });
      activeCleanup = heap.reset;
    } else if (activeConceptId === "bfs") {
      const bfs = createBfsWave({
        container: visualStage,
        decision,
        city: CITY,
        shift
      });
      activeCleanup = bfs.destroy;
    } else if (activeConceptId === "greedy") {
      visualStage.innerHTML = renderGreedyBars({ decision, shift });
    } else if (activeConceptId === "queue") {
      visualStage.innerHTML = renderQueueSlots({ decision, shift });
    }

    // Attach Navigation Events
    const btnBack = container.querySelector("#btnDecBack");
    const btnNext = container.querySelector("#btnDecNext");
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        if (currentDecisionIdx > 0) {
          currentDecisionIdx--;
          render();
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (currentDecisionIdx < totalDecisions - 1) {
          currentDecisionIdx++;
          render();
        }
      });
    }

    // Attach Concept Tab Events
    const tabBtns = container.querySelectorAll(".think-tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeConceptId = btn.dataset.concept;
        render();
      });
    });

    // Attach Next Idea Button
    const btnNextIdea = container.querySelector("#btnNextIdea");
    if (btnNextIdea) {
      btnNextIdea.addEventListener("click", () => {
        const conceptIds = CONCEPTS.map((c) => c.id);
        const curIdx = conceptIds.indexOf(activeConceptId);
        activeConceptId = conceptIds[(curIdx + 1) % conceptIds.length];
        render();
      });
    }
  }

  // Presenter mode keyboard navigation
  if (isPresent) {
    container.classList.add("is-presenter");
    activeKeyHandler = (e) => {
      if (e.key === "ArrowLeft" && currentDecisionIdx > 0) {
        currentDecisionIdx--;
        render();
      } else if (e.key === "ArrowRight" && currentDecisionIdx < totalDecisions - 1) {
        currentDecisionIdx++;
        render();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const conceptIds = CONCEPTS.map((c) => c.id);
        const curIdx = conceptIds.indexOf(activeConceptId);
        const nextIdx = e.key === "ArrowDown"
          ? (curIdx + 1) % conceptIds.length
          : (curIdx - 1 + conceptIds.length) % conceptIds.length;
        activeConceptId = conceptIds[nextIdx];
        render();
      }
    };
    document.addEventListener("keydown", activeKeyHandler);
  }

  // Demo mode part=all tab cycling
  if (isDemo && routeInfo.query && routeInfo.query.part === "all") {
    const tabKeys = ["pq", "bfs", "greedy", "queue"];
    let tabCycleIdx = tabKeys.indexOf(activeConceptId);
    if (tabCycleIdx === -1) tabCycleIdx = 0;
    activeCycleTimer = setInterval(() => {
      tabCycleIdx = (tabCycleIdx + 1) % tabKeys.length;
      activeConceptId = tabKeys[tabCycleIdx];
      render();
    }, 5000);
  }

  render();
}

export function unmount() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
  if (activeCycleTimer) {
    clearInterval(activeCycleTimer);
    activeCycleTimer = null;
  }
  if (activeKeyHandler) {
    document.removeEventListener("keydown", activeKeyHandler);
    activeKeyHandler = null;
  }
}
