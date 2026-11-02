// Syntax-highlighted code viewer panel for algorithm concept snippets.
// Uses DOM text nodes, tokens.css, and copy.js.
// Used by screens/think.js.

import { t } from "../copy.js";

const KEYWORDS = new Set([
  "function", "const", "let", "var", "return", "if", "else", "while", "for", "of", "in",
  "break", "continue", "true", "false", "null", "Infinity", "class", "constructor", "this",
  "get", "set", "new", "throw", "try", "catch"
]);

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tokenizeLine(line) {
  // Check for whole-line or trailing comment
  const commentIdx = line.indexOf("//");
  if (commentIdx !== -1) {
    const codePart = line.slice(0, commentIdx);
    const commentPart = line.slice(commentIdx);
    return tokenizeCode(codePart) + `<span class="tok-comment">${escapeHtml(commentPart)}</span>`;
  }
  return tokenizeCode(line);
}

function tokenizeCode(code) {
  const tokenRegex = /(".*?"|'.*?'|\b\d+\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[()\[\]{},;]|=>|===|!==|==|!=|<=|>=|[+\-*\/%<>=!])/g;
  let out = "";
  let lastIdx = 0;
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIdx) {
      out += escapeHtml(code.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('"') || token.startsWith("'")) {
      out += `<span class="tok-string">${escapeHtml(token)}</span>`;
    } else if (/^\d+$/.test(token)) {
      out += `<span class="tok-number">${escapeHtml(token)}</span>`;
    } else if (KEYWORDS.has(token)) {
      out += `<span class="tok-keyword">${escapeHtml(token)}</span>`;
    } else if (/^[()\[\]{},;]$/.test(token) || /^[+\-*\/%<>=!]=?$/.test(token) || token === "=>") {
      out += `<span class="tok-punct">${escapeHtml(token)}</span>`;
    } else {
      out += escapeHtml(token);
    }
    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < code.length) {
    out += escapeHtml(code.slice(lastIdx));
  }
  return out;
}

export function renderCodeView({ file, codeLines = [] }) {
  const isPhone = typeof window !== "undefined" && window.innerWidth < 768;

  const linesHtml = codeLines.map((line, idx) => {
    const lineNum = idx + 1;
    const tokens = tokenizeLine(line);
    return `
      <div class="code-line">
        <span class="code-gutter-num" aria-hidden="true">${lineNum}</span>
        <span class="code-line-content">${tokens || "&nbsp;"}</span>
      </div>`;
  }).join("");

  return `
    <div class="code-panel-wrapper ${isPhone ? "is-collapsed-mobile" : ""}" id="codePanelWrapper">
      <div class="code-mobile-toggle">
        <button type="button" class="btn-toggle-code" id="btnToggleCode">
          <span class="toggle-text-show">${t("think.showCode")}</span>
          <span class="toggle-text-hide">${t("think.hideCode")}</span>
        </button>
      </div>
      <div class="code-panel">
        <header class="code-header">
          <span class="code-file-tag">${escapeHtml(file || "algo.js")}</span>
        </header>
        <pre class="code-body" tabindex="0"><code>${linesHtml}</code></pre>
      </div>
    </div>
  `;
}

export function attachCodeViewEvents(container) {
  const toggleBtn = container.querySelector("#btnToggleCode");
  const wrapper = container.querySelector("#codePanelWrapper");
  if (toggleBtn && wrapper) {
    toggleBtn.addEventListener("click", () => {
      wrapper.classList.toggle("is-open-mobile");
    });
  }
}
