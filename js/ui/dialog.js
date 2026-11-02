// Accessible modal confirmation dialogs for user actions.
// Uses document DOM and keyboard event listeners.
// Used by play screen leave action and future user prompts.

export function showConfirmDialog({
  title,
  body,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) {
  const existing = document.getElementById("dr-confirm-dialog-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "dr-confirm-dialog-overlay";
  overlay.className = "dialog-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "dialog-title");
  overlay.setAttribute("aria-describedby", "dialog-body");

  const card = document.createElement("div");
  card.className = "dialog-card card";

  const titleEl = document.createElement("h3");
  titleEl.id = "dialog-title";
  titleEl.className = "dialog-title";
  titleEl.textContent = title;

  const bodyEl = document.createElement("p");
  bodyEl.id = "dialog-body";
  bodyEl.className = "dialog-body";
  bodyEl.textContent = body;

  const actions = document.createElement("div");
  actions.className = "dialog-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn-secondary dialog-btn";
  cancelBtn.textContent = cancelText;

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "btn-warn dialog-btn";
  confirmBtn.textContent = confirmText;

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);

  card.appendChild(titleEl);
  card.appendChild(bodyEl);
  card.appendChild(actions);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const prevActive = document.activeElement;
  cancelBtn.focus();

  function cleanup() {
    overlay.remove();
    document.removeEventListener("keydown", onKeyDown);
    if (prevActive && typeof prevActive.focus === "function") {
      prevActive.focus();
    }
  }

  function handleCancel() {
    cleanup();
    if (typeof onCancel === "function") onCancel();
  }

  function handleConfirm() {
    cleanup();
    if (typeof onConfirm === "function") onConfirm();
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Tab") {
      const focusables = [cancelBtn, confirmBtn];
      const idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey && idx === 0) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!e.shiftKey && idx === focusables.length - 1) {
        e.preventDefault();
        focusables[0].focus();
      }
    }
  }

  cancelBtn.addEventListener("click", handleCancel);
  confirmBtn.addEventListener("click", handleConfirm);
  document.addEventListener("keydown", onKeyDown);

  return {
    close: cleanup
  };
}
