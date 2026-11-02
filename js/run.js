// In-memory store for the last finished shift run.
// Uses no external dependencies.
// Used by play screen, result screen, think screen, and self-test.

let currentRun = null;

export function getLastRun() {
  return currentRun;
}

export function setLastRun(runData) {
  currentRun = runData;
}

export function hasLastRun() {
  return currentRun !== null;
}

export function clearLastRun() {
  currentRun = null;
}
