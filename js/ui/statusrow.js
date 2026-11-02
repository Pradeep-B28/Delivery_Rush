// Single reserved status line coordinating guidance and alerts.
// Uses DOM element and aria-live announcements.
// Used by play screen and coach coordinator.

export function createStatusRow(container) {
  if (!container) return null;

  container.className = "play-status-row";
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");

  const messageSpan = document.createElement("span");
  messageSpan.className = "status-text";
  container.appendChild(messageSpan);

  let currentText = "";
  let currentKind = "normal";

  function setMessage(text, kind = "normal") {
    if (currentText === text && currentKind === kind) return;
    currentText = text;
    currentKind = kind;
    messageSpan.textContent = text;
    container.setAttribute("data-status-kind", kind);
  }

  function clear() {
    setMessage("");
  }

  return {
    setMessage,
    clear,
    getText() {
      return currentText;
    }
  };
}
