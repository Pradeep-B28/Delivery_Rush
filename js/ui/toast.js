// Non-blocking toast notification banner for user feedback.
// Uses document DOM and CSS transitions.
// Used by screens for alerts and copy confirmations.

let activeToast = null;
let toastTimer = null;

export function showToast(message, durationMs = 2400) {
  if (activeToast) {
    activeToast.remove();
    clearTimeout(toastTimer);
    activeToast = null;
  }

  const toast = document.createElement("div");
  toast.className = "toast-pill";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;

  document.body.appendChild(toast);
  activeToast = toast;

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
  });

  toastTimer = setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => {
      if (activeToast === toast) {
        toast.remove();
        activeToast = null;
      }
    }, 300);
  }, durationMs);
}
