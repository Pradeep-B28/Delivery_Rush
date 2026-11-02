// Pub-sub event emitter for decoupled communication between modules.
// Uses no external dependencies.
// Used by screens, analytics, and game controller.

const listeners = new Map();

export function on(eventName, handler) {
  if (typeof handler !== "function") return;
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(handler);
}

export function off(eventName, handler) {
  if (!listeners.has(eventName)) return;
  listeners.get(eventName).delete(handler);
  if (listeners.get(eventName).size === 0) {
    listeners.delete(eventName);
  }
}

export function emit(eventName, data) {
  if (!listeners.has(eventName)) return;
  const handlers = Array.from(listeners.get(eventName));
  for (const handler of handlers) {
    try {
      handler(data);
    } catch (err) {
      // Prevent listener errors from breaking the event loop
    }
  }
}

export function clearEvents() {
  listeners.clear();
}
