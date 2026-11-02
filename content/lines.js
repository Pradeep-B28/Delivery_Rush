// Saved ways of playing each shift. Each action is { t: minute, order, rider }.
// Locked content. sample: a typical first-time player, used by demo mode. best: a plan that beats the algorithm, found by a long search that knew every future order. It proves the game is not rigged.
// Used by content/index.js, demo mode and tools/verify-content.mjs.

export const LINES = {
  lunch: {
    sample: [
      { t: 3, order: "L01", rider: "r1" },
      { t: 3, order: "L02", rider: "r1" },
      { t: 8, order: "L03", rider: "r2" },
      { t: 13, order: "L04", rider: "r3" },
      { t: 13, order: "L05", rider: "r2" },
      { t: 19, order: "L06", rider: "r1" },
      { t: 25, order: "L07", rider: "r2" },
      { t: 25, order: "L08", rider: "r3" },
      { t: 32, order: "L09", rider: "r1" },
      { t: 38, order: "L10", rider: "r3" },
      { t: 41, order: "L11", rider: "r3" },
      { t: 45, order: "L12", rider: "r2" }
    ],
    best: [
      { t: 1, order: "L02", rider: "r3" },
      { t: 3, order: "L01", rider: "r3" },
      { t: 6, order: "L03", rider: "r1" },
      { t: 11, order: "L05", rider: "r2" },
      { t: 12, order: "L04", rider: "r1" },
      { t: 23, order: "L08", rider: "r2" },
      { t: 25, order: "L06", rider: "r3" },
      { t: 26, order: "L07", rider: "r1" },
      { t: 31, order: "L09", rider: "r1" },
      { t: 39, order: "L11", rider: "r3" },
      { t: 42, order: "L10", rider: "r2" },
      { t: 49, order: "L12", rider: "r1" }
    ]
  },
  dinner: {
    sample: [
      { t: 3, order: "D01", rider: "r2" },
      { t: 3, order: "D02", rider: "r1" },
      { t: 3, order: "D03", rider: "r2" },
      { t: 8, order: "D04", rider: "r1" },
      { t: 12, order: "D05", rider: "r3" },
      { t: 12, order: "D06", rider: "r3" },
      { t: 17, order: "D07", rider: "r1" },
      { t: 21, order: "D08", rider: "r2" },
      { t: 21, order: "D09", rider: "r4" },
      { t: 21, order: "D10", rider: "r4" },
      { t: 27, order: "D11", rider: "r3" },
      { t: 31, order: "D12", rider: "r2" },
      { t: 32, order: "D13", rider: "r1" },
      { t: 37, order: "D14", rider: "r3" },
      { t: 42, order: "D15", rider: "r4" },
      { t: 43, order: "D16", rider: "r2" },
      { t: 53, order: "D17", rider: "r1" },
      { t: 54, order: "D18", rider: "r3" }
    ],
    best: [
      { t: 1, order: "D01", rider: "r3" },
      { t: 1, order: "D02", rider: "r1" },
      { t: 1, order: "D03", rider: "r2" },
      { t: 6, order: "D04", rider: "r4" },
      { t: 10, order: "D05", rider: "r1" },
      { t: 10, order: "D06", rider: "r2" },
      { t: 15, order: "D07", rider: "r1" },
      { t: 19, order: "D08", rider: "r2" },
      { t: 19, order: "D10", rider: "r4" },
      { t: 25, order: "D11", rider: "r3" },
      { t: 26, order: "D09", rider: "r1" },
      { t: 29, order: "D12", rider: "r2" },
      { t: 30, order: "D13", rider: "r4" },
      { t: 41, order: "D16", rider: "r3" },
      { t: 43, order: "D14", rider: "r4" },
      { t: 44, order: "D15", rider: "r1" },
      { t: 45, order: "D17", rider: "r3" },
      { t: 50, order: "D18", rider: "r2" }
    ]
  },
  rain: {
    sample: [
      { t: 3, order: "R01", rider: "r1" },
      { t: 3, order: "R02", rider: "r2" },
      { t: 9, order: "R03", rider: "r2" },
      { t: 14, order: "R04", rider: "r2" },
      { t: 14, order: "R05", rider: "r3" },
      { t: 20, order: "R06", rider: "r3" },
      { t: 26, order: "R07", rider: "r1" },
      { t: 27, order: "R08", rider: "r1" },
      { t: 33, order: "R09", rider: "r2" },
      { t: 45, order: "R10", rider: "r3" },
      { t: 47, order: "R11", rider: "r1" },
      { t: 57, order: "R12", rider: "r2" }
    ],
    best: [
      { t: 1, order: "R01", rider: "r1" },
      { t: 1, order: "R02", rider: "r2" },
      { t: 7, order: "R03", rider: "r3" },
      { t: 12, order: "R04", rider: "r1" },
      { t: 13, order: "R05", rider: "r1" },
      { t: 19, order: "R06", rider: "r2" },
      { t: 25, order: "R08", rider: "r3" },
      { t: 30, order: "R07", rider: "r2" },
      { t: 31, order: "R09", rider: "r3" },
      { t: 45, order: "R12", rider: "r1" },
      { t: 49, order: "R11", rider: "r3" },
      { t: 50, order: "R10", rider: "r2" }
    ]
  }
};
