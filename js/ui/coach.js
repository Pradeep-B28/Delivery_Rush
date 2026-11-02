// First-time player walkthrough guiding order selection and rider assignment.
// Uses store.js, copy.js, and statusrow.js.
// Used by play screen when dr-coach is unvisited.

import { getCoachSeen, setCoachSeen } from "../store.js";
import { t } from "../copy.js";
import { estimate } from "../engine/sim.js";

export function createCoach({ sim, statusRow, onComplete }) {
  const isSeen = getCoachSeen();
  if (isSeen) {
    return {
      active: false,
      step: null,
      onOrderSelected() {},
      onRiderAssigned() {}
    };
  }

  let step = 1; // 1: tap order, 2: pick rider, 3: rush notice

  function highlightElement(el) {
    document.querySelectorAll(".coach-tap-ring").forEach((r) => r.remove());
    if (!el) return;
    const ring = document.createElement("div");
    ring.className = "coach-tap-ring";
    ring.setAttribute("aria-hidden", "true");
    el.style.position = "relative";
    el.appendChild(ring);
  }

  function clearHighlight() {
    document.querySelectorAll(".coach-tap-ring").forEach((r) => r.remove());
  }

  // Step 1: Initialize
  statusRow.setMessage(t("coach.one"), "coach");
  const firstCard = document.querySelector(".order-card");
  if (firstCard) {
    highlightElement(firstCard);
  }

  return {
    active: true,
    get step() {
      return step;
    },
    onOrderSelected(orderId) {
      if (step !== 1) return;
      step = 2;
      clearHighlight();

      const order = sim.orders.find((o) => o.id === orderId);
      let bestRiderId = null;
      if (order) {
        let bestFinish = Infinity;
        for (const r of sim.riders) {
          const est = estimate(sim, r, order);
          if (est && est.finish < bestFinish) {
            bestFinish = est.finish;
            bestRiderId = r.id;
          }
        }
      }

      statusRow.setMessage(t("coach.two"), "coach");
      const targetChip = document.querySelector(`.rider-chip[data-rider-id="${bestRiderId || sim.riders[0].id}"]`);
      if (targetChip) {
        highlightElement(targetChip);
      }
    },
    onRiderAssigned() {
      if (step !== 2) return;
      step = 3;
      clearHighlight();
      setCoachSeen(true);

      statusRow.setMessage(t("coach.three"), "coach");
      setTimeout(() => {
        if (typeof onComplete === "function") {
          onComplete();
        }
      }, 2000);
    }
  };
}
