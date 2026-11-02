// Lunch Rush: one locked shift. Times are in game minutes. A rider moves one road square per minute.
// Locked content. Fields are explained in content/SCHEMA.md.
// Used by content/index.js, the engine and tools/verify-content.mjs.

export const SHIFT = {
  id: "lunch",
  name: "Lunch Rush",
  level: "Warm up",
  tagline: "3 riders. 12 orders. A busy afternoon.",
  mood: "day",
  maxJobs: 2,
  closeAt: 130,
  missedMins: 90,
  riders: [
    { id: "r1", start: [4, 4] },
    { id: "r2", start: [8, 8] },
    { id: "r3", start: [2, 8] }
  ],
  closures: [],
  orders: [
    { id: "L01", at: 1, shop: "s1", dish: "Chicken Dum Biryani", home: "h6", prep: 5, promise: 25, kind: "normal" },
    { id: "L02", at: 1, shop: "s3", dish: "Masala Vada", home: "h9", prep: 2, promise: 22, kind: "normal" },
    { id: "L03", at: 6, shop: "s3", dish: "Masala Vada", home: "h10", prep: 2, promise: 26, kind: "normal" },
    { id: "L04", at: 11, shop: "s4", dish: "Pepper Chicken", home: "h2", prep: 5, promise: 23, kind: "normal" },
    { id: "L05", at: 11, shop: "s6", dish: "Brownie Sundae", home: "h1", prep: 2, promise: 19, kind: "melts" },
    { id: "L06", at: 17, shop: "s2", dish: "Mini Idli Sambar", home: "h10", prep: 3, promise: 25, kind: "normal" },
    { id: "L07", at: 23, shop: "s4", dish: "Kothu Parotta", home: "h11", prep: 5, promise: 20, kind: "cools" },
    { id: "L08", at: 23, shop: "s6", dish: "Coconut Ice Cream", home: "h12", prep: 2, promise: 19, kind: "melts" },
    { id: "L09", at: 30, shop: "s1", dish: "Veg Biryani", home: "h11", prep: 5, promise: 26, kind: "normal" },
    { id: "L10", at: 36, shop: "s4", dish: "Mutton Chukka", home: "h2", prep: 5, promise: 23, kind: "normal" },
    { id: "L11", at: 36, shop: "s1", dish: "Chicken 65", home: "h6", prep: 5, promise: 21, kind: "cools" },
    { id: "L12", at: 43, shop: "s1", dish: "Chicken Dum Biryani", home: "h7", prep: 5, promise: 23, kind: "normal" }
  ]
};
