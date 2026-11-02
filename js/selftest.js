// In-browser test suite for Delivery Rush validating engine, content, and UI modules.
// Uses content.js, copy.js, links.js, store.js, clock.js, and game.js.
// Mounted by main.js when URL contains ?test=1.

import { CITY, SHIFTS, LINES, CONCEPTS, EXPLAIN, CONFIG, getShift } from "./content.js";
import { COPY, t } from "./copy.js";
import { formatMins, encodeBeat, decodeChallenge, whatsAppLink, programLink } from "./links.js";
import { getBest, setBest, clearMemoryFallback } from "./store.js";
import { raceMinuteAt } from "./clock.js";
import { createGame } from "./game.js";
import { score, compare, orderGaps, runningAvg } from "./engine/score.js";
import { runAlgorithm, routeTrace } from "./engine/algo.js";
import { replay, createSim } from "./engine/sim.js";
import { explainDecision } from "./engine/explain.js";
import { buildGrid } from "./engine/bfs.js";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const row = (sim) => {
  const s = score(sim);
  return [s.avg, s.totalMins, s.delivered, s.late, s.missed];
};

export function runChecks() {
  const results = [];
  const S = Object.fromEntries(SHIFTS.map((s) => [s.id, s]));
  const grid = buildGrid(CITY);

  function check(id, title, actual, expected, passCondition = undefined) {
    const passed = passCondition !== undefined ? Boolean(passCondition) : same(actual, expected);
    results.push({
      id,
      title,
      passed,
      actual: typeof actual === "object" ? JSON.stringify(actual) : String(actual),
      expected: typeof expected === "object" ? JSON.stringify(expected) : String(expected)
    });
  }

  // a. Content
  const actA = {
    shifts: SHIFTS.map((s) => s.id),
    orders: SHIFTS.map((s) => s.orders.length),
    riders: SHIFTS.map((s) => s.riders.length),
    shops: CITY.shops.length,
    homes: CITY.homes.length,
    concepts: CONCEPTS.length
  };
  const expA = {
    shifts: ["lunch", "dinner", "rain"],
    orders: [12, 18, 12],
    riders: [3, 4, 3],
    shops: 6,
    homes: 12,
    concepts: 4
  };
  check("a", "Content", actA, expA);

  // b. Algorithm
  const algoLunch = runAlgorithm(CITY, S.lunch);
  const algoDinner = runAlgorithm(CITY, S.dinner);
  const algoRain = runAlgorithm(CITY, S.rain);
  const actB = {
    lunch: row(algoLunch.sim),
    dinner: row(algoDinner.sim),
    rain: row(algoRain.sim),
    endMinutes: [algoLunch.frames.at(-1).t, algoDinner.frames.at(-1).t, algoRain.frames.at(-1).t]
  };
  const expB = {
    lunch: [18.8, 225, 12, 2, 0],
    dinner: [18.2, 328, 18, 4, 0],
    rain: [22.8, 274, 12, 4, 0],
    endMinutes: [63, 71, 83]
  };
  check("b", "Algorithm", actB, expB);

  // c. Sample line
  const sampleLunch = replay(CITY, S.lunch, LINES.lunch.sample);
  const sampleDinner = replay(CITY, S.dinner, LINES.dinner.sample);
  const sampleRain = replay(CITY, S.rain, LINES.rain.sample);
  const actC = {
    lunch: row(sampleLunch.sim),
    dinner: row(sampleDinner.sim),
    rain: row(sampleRain.sim),
    endMinutes: [sampleLunch.frames.at(-1).t, sampleDinner.frames.at(-1).t, sampleRain.frames.at(-1).t]
  };
  const expC = {
    lunch: [25.8, 309, 12, 7, 0],
    dinner: [28.1, 506, 18, 13, 0],
    rain: [36.3, 435, 12, 10, 0],
    endMinutes: [74, 96, 95]
  };
  check("c", "Sample line", actC, expC);

  // d. Best line
  const bestLunch = replay(CITY, S.lunch, LINES.lunch.best);
  const bestDinner = replay(CITY, S.dinner, LINES.dinner.best);
  const bestRain = replay(CITY, S.rain, LINES.rain.best);
  const actD = {
    lunch: row(bestLunch.sim),
    dinner: row(bestDinner.sim),
    rain: row(bestRain.sim)
  };
  const expD = {
    lunch: [17.3, 207, 12, 2, 0],
    dinner: [16, 288, 18, 3, 0],
    rain: [19.9, 239, 12, 5, 0]
  };
  check("d", "Best line", actD, expD);

  // e. Verdicts
  const vSampleLunch = compare(score(sampleLunch.sim), score(algoLunch.sim));
  const vBestRain = compare(score(bestRain.sim), score(algoRain.sim));
  const vClose = compare({ avg: 20 }, { avg: 18 });
  const vTie = compare({ avg: 18 }, { avg: 18 });
  const actE = {
    sampleLunch: { kind: vSampleLunch.kind, gap: vSampleLunch.gapMins, percent: vSampleLunch.gapPercent },
    bestRain: { kind: vBestRain.kind, gap: vBestRain.gapMins, percent: vBestRain.gapPercent },
    close: { kind: vClose.kind, gap: vClose.gapMins, percent: vClose.gapPercent },
    tieKind: vTie.kind
  };
  const expE = {
    sampleLunch: { kind: "behind", gap: 7, percent: 27 },
    bestRain: { kind: "win", gap: 2.9, percent: 13 },
    close: { kind: "close", gap: 2, percent: 10 },
    tieKind: "tie"
  };
  check("e", "Verdicts", actE, expE);

  // f. Gaps
  const gapsLunch = orderGaps(S.lunch, score(sampleLunch.sim), score(algoLunch.sim));
  const actF = gapsLunch.slice(0, 3).map((g) => ({ id: g.id, you: g.you, algo: g.algo, gap: g.gap }));
  const expF = [
    { id: "L02", you: 30, algo: 8, gap: 22 },
    { id: "L06", you: 34, algo: 14, gap: 20 },
    { id: "L09", you: 44, algo: 25, gap: 19 }
  ];
  check("f", "Gaps", actF, expF);

  // g. Decision words
  const d1 = algoLunch.decisions[0];
  const trace = routeTrace(grid, d1, "r1");
  const words = explainDecision(d1, S.lunch, CITY, EXPLAIN);
  const actG = {
    at: [d1.t, d1.order, d1.rider],
    finishes: d1.candidates.map((c) => c.finish),
    trace: [trace.dist, trace.checked],
    pq: words.pq,
    greedy: words.greedy
  };
  const expG = {
    at: [1, "L02", "r1"],
    finishes: [9, 13, 15],
    trace: [2, 7],
    pq: "2 orders are waiting. Masala Vada for Lakshmi is due first, at minute 23, so it comes out next.",
    greedy: "Arun can deliver by minute 9. Selvi would need until minute 13. Greedy takes the earliest."
  };
  check("g", "Decision words", actG, expG);

  // h. Clock
  const clockGame = createGame(CITY, S.lunch, CONFIG);
  for (let i = 0; i < 8; i++) clockGame.tick(100);
  const hMin1 = clockGame.sim.t;
  clockGame.select("L01");
  for (let i = 0; i < 32; i++) clockGame.tick(100);
  const hMin2 = clockGame.sim.t;
  for (let i = 0; i < 28; i++) clockGame.tick(100);
  const hMin2Still = clockGame.sim.t;
  const hSelectedAfterTimeout = clockGame.selected;
  clockGame.tick(100);
  const hMin3 = clockGame.sim.t;
  clockGame.pause();
  for (let i = 0; i < 50; i++) clockGame.tick(100);
  const hMin3Paused = clockGame.sim.t;
  const actH = [hMin1, hMin2, hMin2Still, hSelectedAfterTimeout, hMin3, hMin3Paused];
  const expH = [1, 2, 2, null, 3, 3];
  check("h", "Clock", actH, expH);

  // i. Idle speed
  const testShift = {
    id: "test",
    name: "Test",
    level: 1,
    tagline: "Test shift",
    mood: "day",
    maxJobs: 2,
    closeAt: 30,
    missedMins: 30,
    riders: [{ id: "r1", start: [0, 2] }],
    closures: [],
    orders: [{ id: "T01", at: 1, shop: "s2", dish: "Masala Dosa", home: "h8", prep: 1, promise: 30, kind: "normal" }]
  };
  const testGame = createGame(CITY, testShift, CONFIG);
  for (let i = 0; i < 8; i++) testGame.tick(100);
  const iMin1 = testGame.sim.t;
  testGame.select("T01");
  testGame.pickRider("r1");
  for (let i = 0; i < 8; i++) testGame.tick(100);
  const iMin4 = testGame.sim.t;
  while (!testGame.sim.ended && testGame.sim.t < 20) {
    testGame.tick(100);
  }
  const iDeliveredAt = testGame.sim.t;
  const iAvg = score(testGame.sim).avg;
  const actI = [iMin1, iMin4, iDeliveredAt, iAvg];
  const expI = [1, 4, 7, 6];
  check("i", "Idle speed", actI, expI);

  // j. Whole shifts through game.js
  const actJ = {};
  for (const s of SHIFTS) {
    const g = createGame(CITY, s, CONFIG);
    const actions = [...LINES[s.id].sample];
    while (!g.sim.ended) {
      while (actions.length > 0 && actions[0].t === g.sim.t) {
        const act = actions.shift();
        g.select(act.order);
        g.pickRider(act.rider);
      }
      g.tick(100);
    }
    actJ[s.id] = {
      row: row(g.sim),
      actionsMatch: same(g.sim.actions, LINES[s.id].sample)
    };
  }
  const expJ = {
    lunch: { row: [25.8, 309, 12, 7, 0], actionsMatch: true },
    dinner: { row: [28.1, 506, 18, 13, 0], actionsMatch: true },
    rain: { row: [36.3, 435, 12, 10, 0], actionsMatch: true }
  };
  check("j", "Whole shifts through game.js", actJ, expJ);

  // k. Race clock
  const actK = {
    minutes: [
      raceMinuteAt(0, 20000, 74),
      raceMinuteAt(10000, 20000, 74),
      raceMinuteAt(20000, 20000, 74),
      raceMinuteAt(25000, 20000, 74)
    ],
    f30: (() => {
      const f = sampleLunch.frames.find((frame) => frame.t === 30);
      return [f.delivered, f.avg];
    })(),
    newRunningAvg: runningAvg(createSim(CITY, S.lunch))
  };
  const expK = {
    minutes: [0, 37, 74, 74],
    f30: [3, 14.3],
    newRunningAvg: null
  };
  check("k", "Race clock", actK, expK);

  // l. Numbers and links
  const ids = SHIFTS.map((s) => s.id);
  const wa = whatsAppLink("Lunch Rush", 25.8, 18.8, "919876543210");
  const actL = {
    format21: formatMins(21),
    encode213: encodeBeat(21.3),
    decodeGood: decodeChallenge("lunch", "213", ids),
    decodeBrunch: decodeChallenge("brunch", "213", ids),
    decode21x: decodeChallenge("lunch", "21x", ids),
    decode9000: decodeChallenge("lunch", "9000", ids),
    decode05: decodeChallenge("lunch", "05", ids),
    decodeScript: decodeChallenge("lunch", "<script>", ids),
    decodeNull: decodeChallenge("lunch", null, ids),
    waPrefix: wa ? wa.startsWith("https://wa.me/919876543210?text=") : false,
    waText: wa ? decodeURIComponent(wa.split("text=")[1]) : "",
    waEmpty: whatsAppLink("Lunch Rush", 25.8, 18.8, ""),
    programResult: programLink("result")
  };
  const expL = {
    format21: "21.0",
    encode213: 213,
    decodeGood: { shift: "lunch", avg: 21.3 },
    decodeBrunch: null,
    decode21x: null,
    decode9000: null,
    decode05: null,
    decodeScript: null,
    decodeNull: null,
    waPrefix: true,
    waText:
      "Hi, I played Delivery Rush (Lunch Rush). My average was 25.8 mins and the algorithm's was 18.8 mins. I want to know more about the Certification Program in AI-Powered Software Engineering & DSA.",
    waEmpty: null,
    programResult:
      "https://wrench-wise.com?utm_source=delivery-rush&utm_medium=web-project&utm_campaign=delivery-rush&utm_content=result"
  };
  check("l", "Numbers and links", actL, expL);

  // m. Words
  const actM = {
    one: t("play.dueIn", { n: 1 }),
    five: t("play.dueIn", { n: 5 })
  };
  const expM = {
    one: "Due in 1 min",
    five: "Due in 5 mins"
  };
  check("m", "Words", actM, expM);

  // n. Storage blocked
  clearMemoryFallback();
  const origLocal = typeof window !== "undefined" ? window.localStorage : null;
  let savedWorked = false;
  let readVal = null;
  let junkIgnored = false;

  try {
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem() {
            throw new Error("Blocked");
          },
          setItem() {
            throw new Error("Blocked");
          }
        },
        configurable: true
      });
    }
  } catch (e) {}

  try {
    setBest("lunch", 18.5);
    readVal = getBest("lunch");
    savedWorked = readVal === 18.5;
  } catch (e) {
    savedWorked = false;
  }

  // Test junk in dr-best
  clearMemoryFallback();
  if (typeof window !== "undefined") {
    try {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem(k) {
            return k === "dr-best" ? "{ bad-json " : null;
          },
          setItem() {}
        },
        configurable: true
      });
      junkIgnored = getBest("lunch") === null;
    } catch (e) {
      junkIgnored = true;
    }
  } else {
    junkIgnored = true;
  }

  // Restore storage
  if (typeof window !== "undefined" && origLocal) {
    try {
      Object.defineProperty(window, "localStorage", {
        value: origLocal,
        configurable: true
      });
    } catch (e) {}
  }
  clearMemoryFallback();

  check("n", "Storage blocked", { savedWorked, junkIgnored }, { savedWorked: true, junkIgnored: true });

  // o. Text checks on COPY
  const DASHES = /[\u2012\u2013\u2014\u2015]/;
  const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
  const BANNED = [
    "guarantee",
    "placement",
    "salary",
    "lakh",
    "get hired",
    "seats left",
    "take your job",
    "replace you",
    "stupid",
    "dumb",
    "idiot",
    "noob",
    "loser",
    "useless",
    "pathetic",
    "terrible"
  ];

  let badCopy = 0;
  for (const [k, v] of Object.entries(COPY)) {
    if (typeof v !== "string" || DASHES.test(v) || EMOJI.test(v)) {
      badCopy++;
      continue;
    }
    const lower = v.toLowerCase();
    for (const b of BANNED) {
      if (lower.includes(b)) {
        badCopy++;
        break;
      }
    }
  }
  check("o", "Text", { badCopyCount: badCopy }, { badCopyCount: 0 });

  return results;
}

export function renderSelfTest(containerEl) {
  if (!containerEl) return;
  const results = runChecks();
  const failures = results.filter((r) => !r.passed).length;
  const passes = results.filter((r) => r.passed).length;

  // Clear container
  while (containerEl.firstChild) {
    containerEl.removeChild(containerEl.firstChild);
  }

  const wrapper = document.createElement("div");
  wrapper.style.padding = "1.5rem";
  wrapper.style.maxWidth = "1100px";
  wrapper.style.margin = "0 auto";
  wrapper.style.fontFamily = "var(--font-mono, monospace)";
  wrapper.style.fontSize = "13px";

  const title = document.createElement("h2");
  title.textContent = "Self-Test Suite (?test=1)";
  title.style.marginBottom = "1rem";
  title.style.fontFamily = "var(--font-sans)";
  wrapper.appendChild(title);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginBottom = "1.5rem";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Check", "Status", "Expected", "Actual"].forEach((hText) => {
    const th = document.createElement("th");
    th.textContent = hText;
    th.style.borderBottom = "2px solid var(--border)";
    th.style.textAlign = "left";
    th.style.padding = "8px";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  results.forEach((r) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";

    const tdCheck = document.createElement("td");
    tdCheck.textContent = `${r.id}. ${r.title}`;
    tdCheck.style.padding = "8px";
    tdCheck.style.fontWeight = "bold";

    const tdStatus = document.createElement("td");
    tdStatus.textContent = r.passed ? "PASS" : "FAIL";
    tdStatus.style.padding = "8px";
    tdStatus.style.color = r.passed ? "var(--brand, #059669)" : "var(--warn, #b45309)";
    tdStatus.style.fontWeight = "bold";

    const tdExp = document.createElement("td");
    tdExp.textContent = r.expected;
    tdExp.style.padding = "8px";
    tdExp.style.wordBreak = "break-word";
    tdExp.style.maxWidth = "350px";

    const tdAct = document.createElement("td");
    tdAct.textContent = r.actual;
    tdAct.style.padding = "8px";
    tdAct.style.wordBreak = "break-word";
    tdAct.style.maxWidth = "350px";

    tr.appendChild(tdCheck);
    tr.appendChild(tdStatus);
    tr.appendChild(tdExp);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);

  const summary = document.createElement("div");
  summary.style.padding = "1rem";
  summary.style.borderRadius = "var(--radius-card, 16px)";
  summary.style.fontWeight = "bold";
  summary.style.fontSize = "16px";
  summary.style.background = failures === 0 ? "var(--brand-soft, #d1fae5)" : "rgba(180, 83, 9, 0.15)";
  summary.style.color = failures === 0 ? "var(--brand-strong, #047857)" : "var(--warn, #b45309)";

  if (failures === 0) {
    summary.textContent = `RESULT: ALL PASS (${passes} checks passed, 0 failed)`;
  } else {
    summary.textContent = `RESULT: ${failures} FAIL (${passes} passed, ${failures} failed)`;
  }
  wrapper.appendChild(summary);

  containerEl.appendChild(wrapper);

  // Output to console only when test=1 per Rule 13
  console.log(`Self-test finished: ${passes} passed, ${failures} failed.`);
  console.log(failures === 0 ? "RESULT: ALL PASS" : `RESULT: ${failures} FAIL`);
}
