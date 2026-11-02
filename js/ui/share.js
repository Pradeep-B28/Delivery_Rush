// Social share and challenge link generator with native share and clipboard fallback.
// Uses links.js, copy.js, and toast.js.
// Used by screens/result.js and home screen.

import { encodeBeat } from "../links.js";
import { t } from "../copy.js";
import { showToast } from "./toast.js";

export async function shareChallenge({ shiftId, shiftName, avg }) {
  const beat = encodeBeat(avg);
  const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  const shareUrl = `${base}?shift=${encodeURIComponent(shiftId)}&beat=${beat}&utm_content=share`;
  const shareText = t("share.text", { avg: Number(avg).toFixed(1), shift: shiftName });

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: "Delivery Rush",
        text: shareText,
        url: shareUrl
      });
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }

  // Fallback to clipboard
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      showToast(t("share.copied"));
      return;
    } catch (e) {}
  }

  // Prompt fallback
  if (typeof window !== "undefined") {
    window.prompt(t("share.copied") + ":", shareUrl);
  }
}
