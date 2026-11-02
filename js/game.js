// Shift game coordinator encapsulating simulation, selection, and clock.
// Uses js/engine/sim.js and js/clock.js with zero DOM dependencies.
// Used by play screen, demo mode, and self-test.

import { createSim, advance, assign, nothingToDecide } from "./engine/sim.js";
import { getGameSpeed } from "./clock.js";

export function createGame(city, shift, config) {
  const sim = createSim(city, shift);
  let selected = null;
  let paused = false;
  let counter = 0;
  let selectTimer = 0;

  return {
    sim,
    get selected() {
      return selected;
    },
    get isPaused() {
      return paused;
    },
    select(orderId) {
      selected = orderId;
      selectTimer = 0;
    },
    deselect() {
      selected = null;
      selectTimer = 0;
    },
    pickRider(riderId) {
      if (!selected) {
        return { ok: false, reason: "no-selection" };
      }
      const targetOrder = selected;
      const res = assign(sim, targetOrder, riderId);
      selected = null;
      selectTimer = 0;
      return res;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    progress() {
      return counter / config.game.msPerMinute;
    },
    speed() {
      const isHidden = typeof document !== "undefined" && document.hidden;
      const isIdle = nothingToDecide(sim);
      return getGameSpeed({
        paused,
        hidden: isHidden,
        isSelected: selected !== null,
        isIdle,
        config
      });
    },
    tick(dtMs) {
      const isHidden = typeof document !== "undefined" && document.hidden;
      const isIdle = nothingToDecide(sim);
      const curSpeed = getGameSpeed({
        paused,
        hidden: isHidden,
        isSelected: selected !== null,
        isIdle,
        config
      });

      if (selected !== null) {
        selectTimer += dtMs;
        if (selectTimer >= config.game.selectTimeoutMs) {
          selected = null;
          selectTimer = 0;
        }
      } else {
        selectTimer = 0;
      }

      counter += dtMs * curSpeed;
      const events = [];

      while (counter >= config.game.msPerMinute && !sim.ended) {
        counter -= config.game.msPerMinute;
        const evs = advance(sim);
        if (evs && evs.length) {
          events.push(...evs);
        }
      }

      return events;
    }
  };
}
