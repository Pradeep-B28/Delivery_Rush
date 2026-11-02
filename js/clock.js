// Game clock logic, speed calculation, selection timeouts, and race timing.
// Uses simulation state and config settings with zero DOM dependencies.
// Used by game.js, race.js, and self-test.

export function getGameSpeed({ paused = false, hidden = false, isSelected = false, isIdle = false, config }) {
  if (paused || hidden) return 0;
  if (isSelected) return config.game.crawl;
  if (isIdle) return config.game.idleSpeed;
  return 1;
}

export function raceMinuteAt(elapsedMs, totalMs, endMinute) {
  if (totalMs <= 0 || endMinute <= 0) return 0;
  const raw = Math.floor((elapsedMs / totalMs) * endMinute);
  return Math.min(endMinute, Math.max(0, raw));
}

export function createClock(config) {
  let counter = 0;
  let selectTime = 0;
  let paused = false;

  return {
    get counter() {
      return counter;
    },
    get selectTime() {
      return selectTime;
    },
    get isPaused() {
      return paused;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    resetSelect() {
      selectTime = 0;
    },
    progress() {
      return counter / config.game.msPerMinute;
    },
    step(dtMs, { isSelected, isIdle, hidden = false, onTimeout, onAdvance }) {
      const speed = getGameSpeed({ paused, hidden, isSelected, isIdle, config });

      if (isSelected) {
        selectTime += dtMs;
        if (selectTime >= config.game.selectTimeoutMs) {
          selectTime = 0;
          if (typeof onTimeout === "function") {
            onTimeout();
          }
        }
      } else {
        selectTime = 0;
      }

      counter += dtMs * speed;
      let advances = 0;
      while (counter >= config.game.msPerMinute) {
        counter -= config.game.msPerMinute;
        advances++;
        if (typeof onAdvance === "function") {
          onAdvance();
        }
      }

      return { advances, speed, progress: counter / config.game.msPerMinute };
    }
  };
}
