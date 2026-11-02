// Safe storage wrapper with memory fallback and whitelist enforcement.
// Uses browser localStorage and sessionStorage with try-catch guards.
// Used by main, screens, header, and self-test.

const memoryLocal = new Map();
const memorySession = new Map();

const ALLOWED_LOCAL = new Set(["dr-theme", "dr-best", "dr-coach", "dr-sound"]);
const ALLOWED_SESSION = new Set(["dr-intro-seen"]);

function safeGet(storage, memory, key) {
  try {
    if (typeof window !== "undefined" && window[storage]) {
      const val = window[storage].getItem(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch (e) {
    // Storage blocked or threw
  }
  return memory.has(key) ? memory.get(key) : null;
}

function safeSet(storage, memory, key, val) {
  const strVal = String(val);
  memory.set(key, strVal);
  try {
    if (typeof window !== "undefined" && window[storage]) {
      window[storage].setItem(key, strVal);
    }
  } catch (e) {
    // Storage blocked or threw: fallback memory keeps it for the visit
  }
}

export function getTheme() {
  const v = safeGet("localStorage", memoryLocal, "dr-theme");
  return v === "light" || v === "dark" ? v : null;
}

export function setTheme(theme) {
  if (theme !== "light" && theme !== "dark") return;
  safeSet("localStorage", memoryLocal, "dr-theme", theme);
}

export function getBest(shiftId) {
  const raw = safeGet("localStorage", memoryLocal, "dr-best");
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const val = data[shiftId];
      if (typeof val === "number" && !isNaN(val)) return val;
    }
  } catch (e) {
    // Junk in storage: ignored
  }
  return null;
}

export function setBest(shiftId, avg) {
  if (typeof avg !== "number" || isNaN(avg)) return;
  let current = {};
  const raw = safeGet("localStorage", memoryLocal, "dr-best");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        current = parsed;
      }
    } catch (e) {}
  }
  current[shiftId] = avg;
  safeSet("localStorage", memoryLocal, "dr-best", JSON.stringify(current));
}

export function getCoachSeen() {
  const v = safeGet("localStorage", memoryLocal, "dr-coach");
  return v === "1" || v === "true";
}

export function setCoachSeen(seen = true) {
  safeSet("localStorage", memoryLocal, "dr-coach", seen ? "1" : "0");
}

export function getSound() {
  const v = safeGet("localStorage", memoryLocal, "dr-sound");
  return v === "1" || v === "true";
}

export function setSound(on = true) {
  safeSet("localStorage", memoryLocal, "dr-sound", on ? "1" : "0");
}

export function getIntroSeen() {
  const v = safeGet("sessionStorage", memorySession, "dr-intro-seen");
  return v === "1" || v === "true";
}

export function setIntroSeen(seen = true) {
  safeSet("sessionStorage", memorySession, "dr-intro-seen", seen ? "1" : "0");
}

export function clearMemoryFallback() {
  memoryLocal.clear();
  memorySession.clear();
}
