// Dinner Rush: one locked shift. Times are in game minutes. A rider moves one road square per minute.
// Locked content. Fields are explained in content/SCHEMA.md.
// Used by content/index.js, the engine and tools/verify-content.mjs.

export const SHIFT = {
  id: "dinner",
  name: "Dinner Rush",
  level: "Busy",
  tagline: "4 riders. 18 orders. Everyone is hungry at once.",
  mood: "evening",
  maxJobs: 2,
  closeAt: 130,
  missedMins: 90,
  riders: [
    { id: "r1", start: [4, 4] },
    { id: "r2", start: [8, 8] },
    { id: "r3", start: [2, 8] },
    { id: "r4", start: [10, 4] }
  ],
  closures: [],
  orders: [
    { id: "D01", at: 1, shop: "s5", dish: "Shawarma Roll", home: "h2", prep: 4, promise: 28, kind: "normal" },
    { id: "D02", at: 1, shop: "s3", dish: "Onion Bajji", home: "h6", prep: 2, promise: 24, kind: "normal" },
    { id: "D03", at: 1, shop: "s6", dish: "Jigarthanda", home: "h2", prep: 2, promise: 15, kind: "melts" },
    { id: "D04", at: 6, shop: "s3", dish: "Filter Kaapi", home: "h4", prep: 2, promise: 23, kind: "cools" },
    { id: "D05", at: 10, shop: "s2", dish: "Pongal Vada", home: "h8", prep: 3, promise: 21, kind: "normal" },
    { id: "D06", at: 10, shop: "s4", dish: "Kothu Parotta", home: "h10", prep: 5, promise: 19, kind: "cools" },
    { id: "D07", at: 15, shop: "s2", dish: "Pongal Vada", home: "h8", prep: 3, promise: 21, kind: "normal" },
    { id: "D08", at: 19, shop: "s4", dish: "Pepper Chicken", home: "h1", prep: 5, promise: 27, kind: "normal" },
    { id: "D09", at: 19, shop: "s3", dish: "Masala Vada", home: "h10", prep: 2, promise: 26, kind: "normal" },
    { id: "D10", at: 19, shop: "s6", dish: "Jigarthanda", home: "h9", prep: 2, promise: 19, kind: "melts" },
    { id: "D11", at: 25, shop: "s6", dish: "Coconut Ice Cream", home: "h12", prep: 2, promise: 19, kind: "melts" },
    { id: "D12", at: 29, shop: "s6", dish: "Coconut Ice Cream", home: "h3", prep: 2, promise: 13, kind: "melts" },
    { id: "D13", at: 29, shop: "s3", dish: "Filter Kaapi", home: "h11", prep: 2, promise: 17, kind: "cools" },
    { id: "D14", at: 35, shop: "s3", dish: "Masala Vada", home: "h7", prep: 2, promise: 26, kind: "normal" },
    { id: "D15", at: 40, shop: "s3", dish: "Onion Bajji", home: "h5", prep: 2, promise: 26, kind: "normal" },
    { id: "D16", at: 40, shop: "s4", dish: "Pepper Chicken", home: "h11", prep: 5, promise: 24, kind: "normal" },
    { id: "D17", at: 45, shop: "s1", dish: "Veg Biryani", home: "h7", prep: 5, promise: 23, kind: "normal" },
    { id: "D18", at: 50, shop: "s5", dish: "Grilled Chicken Half", home: "h3", prep: 4, promise: 22, kind: "normal" }
  ]
};
