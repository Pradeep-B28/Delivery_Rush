// Application entry point reading URL modes, initializing routing, and running self-test.
// Uses js/router.js, js/selftest.js, and js/store.js.
// Bootstrapped by index.html script module.

import { renderSelfTest } from "./selftest.js";
import { initRouter } from "./router.js";
import { getTheme, setTheme } from "./store.js";

function setupTheme() {
  const current = getTheme();
  if (current) {
    document.documentElement.setAttribute("data-theme", current);
  }
}

export function init() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const isTest = params.get("test") === "1";

  if (isTest) {
    const appEl = document.getElementById("app");
    if (appEl) {
      renderSelfTest(appEl);
    }
    return;
  }

  setupTheme();

  initRouter((routeInfo) => {
    // Phase 1 router placeholder: routes will be wired in Phase 3, 4, 5, 6
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
