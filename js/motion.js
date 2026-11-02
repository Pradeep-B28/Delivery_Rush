// Central animation loop with 100ms delta cap and reduced motion queries.
// Uses requestAnimationFrame and document visibility API.
// Used by screens, city rendering, game loop, and self-test.

const subscribers = new Set();
let running = false;
let lastTimestamp = 0;
let rafId = null;

export function isReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function tick(timestamp) {
  if (!running) return;
  if (!lastTimestamp) lastTimestamp = timestamp;

  // Delta time capped at 100 ms per brief Section 4
  const rawDt = timestamp - lastTimestamp;
  const dtMs = Math.min(100, Math.max(0, rawDt));
  lastTimestamp = timestamp;

  const isHidden = typeof document !== "undefined" && document.hidden;
  if (!isHidden) {
    for (const callback of subscribers) {
      try {
        callback(dtMs);
      } catch (e) {
        // Guard subscriber exceptions
      }
    }
  }

  rafId = requestAnimationFrame(tick);
}

export function addFrameCallback(callback) {
  if (typeof callback !== "function") return;
  subscribers.add(callback);
  if (!running && subscribers.size > 0 && typeof window !== "undefined") {
    running = true;
    lastTimestamp = 0;
    rafId = requestAnimationFrame(tick);
  }
}

export function removeFrameCallback(callback) {
  subscribers.delete(callback);
  if (subscribers.size === 0 && running) {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// Pause animation loop and reset timer when tab visibility changes
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      lastTimestamp = 0;
    } else {
      lastTimestamp = typeof performance !== "undefined" ? performance.now() : 0;
    }
  });
}
