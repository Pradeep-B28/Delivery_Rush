// Call-to-action card encouraging visitors to explore the Wrench Wise program.
// Uses content.js, copy.js, and links.js.
// Used by result screen and thinking screen.

import { CONFIG } from "../content.js";
import { t } from "../copy.js";
import { whatsAppLink, programLink } from "../links.js";

export function renderCtaCard({ shift, you, algo, from = "result" }) {
  const pLink = programLink(from);
  const waUrl = whatsAppLink({
    shift: shift ? shift.name : "Shift",
    you: you ? you.avg : 0,
    algo: algo ? algo.avg : 0,
    program: CONFIG.program.name
  });

  const title = t("cta.title");
  const body = t("cta.body", { program: CONFIG.program.name });

  let actionsHtml = "";
  if (waUrl) {
    actionsHtml = `
      <div class="cta-actions">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary cta-btn-wa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
          </svg>
          <span>${t("cta.whatsapp")}</span>
        </a>
        <a href="${pLink}" target="_blank" rel="noopener noreferrer" class="cta-link-secondary">${t("cta.program")} &rarr;</a>
      </div>
    `;
  } else {
    actionsHtml = `
      <div class="cta-actions">
        <a href="${pLink}" target="_blank" rel="noopener noreferrer" class="btn-primary cta-btn-program">${t("cta.program")} &rarr;</a>
      </div>
    `;
  }

  return `
    <section class="cta-section card" aria-label="${title}">
      <div class="cta-content">
        <h3 class="cta-title">${title}</h3>
        <p class="cta-body">${body}</p>
        ${actionsHtml}
      </div>
    </section>
  `;
}
