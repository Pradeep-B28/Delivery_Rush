// Application entry point reading URL modes, initializing routing, and running self-test.
// Uses js/router.js, js/selftest.js, js/store.js, and js/screens.
// Bootstrapped by index.html script module.

import { renderSelfTest } from "./selftest.js";
import { initRouter } from "./router.js";
import { getTheme, setTheme } from "./store.js";
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

  const appEl = document.getElementById("app");

  initRouter((routeInfo) => {
    if (activeScreenUnmount) {
      activeScreenUnmount();
      activeScreenUnmount = null;
    }

    if (routeInfo.route === "play") {
      mountPlay(appEl, routeInfo.params);
      activeScreenUnmount = unmountPlay;
    } else if (routeInfo.route === "result") {
      mountResult(appEl, routeInfo);
      activeScreenUnmount = unmountResult;
    } else if (routeInfo.route === "think") {
      mountThink(appEl, routeInfo);
      activeScreenUnmount = unmountThink;
    }
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
