// Rain Shift: one locked shift. Times are in game minutes. A rider moves one road square per minute.
// Locked content. Fields are explained in content/SCHEMA.md.
// Used by content/index.js, the engine and tools/verify-content.mjs.

export const SHIFT = {
  id: "rain",
  name: "Rain Shift",
  level: "Tough",
  tagline: "3 riders. 12 orders. The bridges keep flooding.",
  mood: "rain",
  maxJobs: 2,
  closeAt: 130,
  missedMins: 90,
  riders: [
    { id: "r1", start: [4, 4] },
    { id: "r2", start: [8, 8] },
    { id: "r3", start: [2, 8] }
  ],
  closures: [
    { name: "West bridge", from: 10, to: 32, cells: [[2, 6]] },
    { name: "East bridge", from: 32, to: 58, cells: [[8, 6]] }
  ],
  orders: [
    { id: "R01", at: 1, shop: "s2", dish: "Mini Idli Sambar", home: "h10", prep: 3, promise: 25, kind: "normal" },
    { id: "R02", at: 1, shop: "s6", dish: "Brownie Sundae", home: "h4", prep: 2, promise: 16, kind: "melts" },
    { id: "R03", at: 7, shop: "s6", dish: "Coconut Ice Cream", home: "h9", prep: 2, promise: 19, kind: "melts" },
    { id: "R04", at: 12, shop: "s6", dish: "Jigarthanda", home: "h2", prep: 2, promise: 15, kind: "melts" },
    { id: "R05", at: 12, shop: "s2", dish: "Ghee Roast Dosa", home: "h11", prep: 3, promise: 24, kind: "cools" },
    { id: "R06", at: 18, shop: "s5", dish: "Falafel Wrap", home: "h2", prep: 4, promise: 28, kind: "normal" },
    { id: "R07", at: 24, shop: "s2", dish: "Pongal Vada", home: "h12", prep: 3, promise: 25, kind: "normal" },
    { id: "R08", at: 24, shop: "s1", dish: "Veg Biryani", home: "h7", prep: 5, promise: 23, kind: "normal" },
    { id: "R09", at: 31, shop: "s3", dish: "Onion Bajji", home: "h8", prep: 2, promise: 22, kind: "normal" },
    { id: "R10", at: 37, shop: "s1", dish: "Veg Biryani", home: "h9", prep: 5, promise: 23, kind: "normal" },
    { id: "R11", at: 37, shop: "s2", dish: "Mini Idli Sambar", home: "h5", prep: 3, promise: 21, kind: "normal" },
    { id: "R12", at: 44, shop: "s6", dish: "Coconut Ice Cream", home: "h3", prep: 2, promise: 13, kind: "melts" }
  ]
};
