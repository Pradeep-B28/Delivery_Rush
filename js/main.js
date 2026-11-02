// Application entry point reading URL modes, initializing routing, loader, and analytics.
// Uses js/router.js, js/selftest.js, js/store.js, js/analytics.js, js/ui/loader.js, and js/screens.
// Bootstrapped by index.html script module.

import { renderSelfTest } from "./selftest.js";
import { initRouter } from "./router.js";
import { getTheme, setTheme } from "./store.js";
import { initAnalytics } from "./analytics.js";
import { runLoader } from "./ui/loader.js";
import { CITY, getShift, LINES, CONFIG } from "./content.js";
import { replay } from "./engine/sim.js";
import { runAlgorithm } from "./engine/algo.js";
import { score, compare, orderGaps } from "./engine/score.js";
import { setLastRun } from "./run.js";

import { mount as mountHome, unmount as unmountHome } from "./screens/home.js";
import { mount as mountPlay, unmount as unmountPlay } from "./screens/play.js";
import { mount as mountResult, unmount as unmountResult } from "./screens/result.js";
import { mount as mountThink, unmount as unmountThink } from "./screens/think.js";

let activeScreenUnmount = null;

function setupTheme() {
  const current = getTheme();
  if (current) {
    document.documentElement.setAttribute("data-theme", current);
  }
}

function prepopulateRun(shiftId) {
  const shiftObj = getShift(shiftId) || getShift("lunch");
  const sampleActions = LINES[shiftObj.id]?.sample || [];
  const yourRun = replay(CITY, shiftObj, sampleActions);
  const algoRun = runAlgorithm(CITY, shiftObj);
  const you = score(yourRun.sim);
  const algo = score(algoRun.sim);
  const verdict = compare(you, algo);
  const gaps = orderGaps(shiftObj, you, algo);
  setLastRun({ shift: shiftObj, you, algoRun, algo, verdict, yourRun, gaps, actions: sampleActions });
  return shiftObj;
}

export function init() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const isTest = params.get("test") === "1";
  const isDemo = params.get("demo") === "1";
  const isPresent = params.get("present") === "1";

  if (isTest) {
    const appEl = document.getElementById("app");
    if (appEl) {
      renderSelfTest(appEl);
    }
    return;
  }

  // Theme setup
  const themeParam = params.get("theme");
  if (themeParam === "dark" || themeParam === "light") {
    document.documentElement.setAttribute("data-theme", themeParam);
  } else {
    setupTheme();
  }

  // Demo mode routing and state prep
  if (isDemo) {
    const shiftParam = params.get("shift") || "lunch";
    const part = params.get("part") || "all";
    const shiftObj = getShift(shiftParam) || getShift("lunch");

    if (part === "race" || part === "think") {
      prepopulateRun(shiftObj.id);
    }

    const curHash = window.location.hash;
    if (!curHash || curHash === "#/" || curHash === "#") {
      if (part === "race") {
        window.location.hash = "#/result";
      } else if (part === "think") {
        window.location.hash = `#/think/${shiftObj.id}`;
      } else {
        window.location.hash = `#/play/${shiftObj.id}`;
      }
    }
  } else if (isPresent) {
    prepopulateRun("dinner");
    const curHash = window.location.hash;
    if (!curHash || curHash === "#/" || curHash === "#") {
      window.location.hash = "#/think/dinner";
    }
  } else {
    initAnalytics();
    runLoader(document.body, () => {});
  }

  const appEl = document.getElementById("app");

  initRouter((routeInfo) => {
    if (activeScreenUnmount) {
      activeScreenUnmount();
      activeScreenUnmount = null;
    }

    if (routeInfo.route === "play") {
      mountPlay(appEl, { ...routeInfo.params, query: routeInfo.query });
      activeScreenUnmount = unmountPlay;
    } else if (routeInfo.route === "result") {
      mountResult(appEl, routeInfo);
      activeScreenUnmount = unmountResult;
    } else if (routeInfo.route === "think") {
      mountThink(appEl, routeInfo);
      activeScreenUnmount = unmountThink;
    } else {
      mountHome(appEl, routeInfo);
      activeScreenUnmount = unmountHome;
    }

    const siteFooter = document.getElementById("siteFooter");
    if (siteFooter) siteFooter.removeAttribute("hidden");
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
