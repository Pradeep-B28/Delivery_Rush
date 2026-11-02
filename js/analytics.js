// Analytics tracker integrating GA4 and Meta Pixel via event bus.
// Uses config.js and events.js.
// Used by main.js.

import { CONFIG } from "./content.js";
import { on } from "./events.js";

export function initAnalytics() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const isBypassed = params.get("test") === "1" || params.get("demo") === "1" || params.get("present") === "1";
  if (isBypassed) return;

  const ga4Id = CONFIG.analytics && CONFIG.analytics.ga4Id ? String(CONFIG.analytics.ga4Id).trim() : "";
  const pixelId = CONFIG.analytics && CONFIG.analytics.metaPixelId ? String(CONFIG.analytics.metaPixelId).trim() : "";

  // Helper tracking calls
  function trackGa(name, data) {
    if (ga4Id && typeof window.gtag === "function") {
      window.gtag("event", name, data);
    }
  }

  function trackPixel(name, data, isCustom = false) {
    if (pixelId && typeof window.fbq === "function") {
      if (isCustom) window.fbq("trackCustom", name, data);
      else window.fbq("track", name, data);
    }
  }

  function loadExternalScripts() {
    // 1. Google Analytics 4
    if (ga4Id) {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", ga4Id);
      gtag("event", "page_view");
    }

    // 2. Meta Pixel
    if (pixelId) {
      (function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = [];
        t = b.createElement(e); t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      if (window.fbq) {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
      }
    }
  }

  if (typeof window !== "undefined") {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadExternalScripts, { timeout: 2000 });
    } else {
      setTimeout(loadExternalScripts, 600);
    }
  }

  // 3. Listen to Event Bus
  on("shift_start", ({ shift }) => {
    trackGa("shift_start", { shift });
  });

  on("shift_end", ({ shift, you, algo, verdict }) => {
    trackGa("shift_end", { shift, you, algo, verdict });
    trackPixel("ShiftFinished", { shift, verdict }, true);
  });

  on("shift_leave", ({ shift, minute }) => {
    trackGa("shift_leave", { shift, minute });
  });

  on("race_skip", ({ shift }) => {
    trackGa("race_skip", { shift });
  });

  on("think_open", ({ shift }) => {
    trackGa("think_open", { shift });
  });

  on("cta_whatsapp", ({ shift }) => {
    trackGa("cta_whatsapp", { shift });
    trackPixel("Lead", {});
  });

  on("cta_program", ({ from }) => {
    trackGa("cta_program", { from });
  });

  on("share", ({ method }) => {
    trackGa("share", { method });
  });

  on("challenge_open", ({ shift }) => {
    trackGa("challenge_open", { shift });
  });
}
