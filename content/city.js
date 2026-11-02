// Namma Nagar: the made-up city every shift is played in. A cell is [column, row], counted from the top left.
// Locked content. Map letters: . road, = bridge, # buildings, P park, ~ river.
// Used by content/index.js, the map, the engine and tools/verify-content.mjs.

export const CITY = {
  id: "namma-nagar",
  name: "Namma Nagar",
  map: [
    ".............",
    ".#.#.#.#.#.#.",
    ".....PPP.....",
    ".#.#.PPP.#.#.",
    ".............",
    ".#.#.#.#.#.#.",
    "~~=~~~~~=~~~~",
    ".#.#.#.#.#.#.",
    ".............",
    ".#.#.###.#.#.",
    ".......#.....",
    ".#.#.###.#.#.",
    "............."
  ],
  areas: [
    { name: "Kovil Nagar", cell: [2, 1] },
    { name: "Beach Side", cell: [10, 1] },
    { name: "Lake View", cell: [2, 11] },
    { name: "Market Side", cell: [10, 11] }
  ],
  bridges: [
    { id: "west", name: "West bridge", cell: [2, 6] },
    { id: "east", name: "East bridge", cell: [8, 6] }
  ],
  shops: [
    { id: "s1", name: "Marina Biryani Co.", icon: "biryani", cell: [10, 2] },
    { id: "s2", name: "Anna Nagar Tiffin House", icon: "dosa", cell: [2, 2] },
    { id: "s3", name: "Filter Kaapi Stop", icon: "coffee", cell: [6, 4] },
    { id: "s4", name: "Pepper Lane Chettinad", icon: "curry", cell: [4, 8] },
    { id: "s5", name: "Beach Road Grills", icon: "grill", cell: [12, 10] },
    { id: "s6", name: "Kolam Creamery", icon: "icecream", cell: [8, 10] }
  ],
  homes: [
    { id: "h1", name: "Priya", cell: [0, 12] },
    { id: "h2", name: "Rahul", cell: [4, 12] },
    { id: "h3", name: "Meena", cell: [10, 12] },
    { id: "h4", name: "Farhan", cell: [12, 7] },
    { id: "h5", name: "Divya", cell: [0, 0] },
    { id: "h6", name: "Karthik", cell: [6, 0] },
    { id: "h7", name: "Anjali", cell: [12, 0] },
    { id: "h8", name: "Suresh", cell: [0, 4] },
    { id: "h9", name: "Lakshmi", cell: [12, 4] },
    { id: "h10", name: "Joseph", cell: [2, 10] },
    { id: "h11", name: "Nisha", cell: [8, 7] },
    { id: "h12", name: "Vignesh", cell: [0, 8] }
  ],
  riders: [
    { id: "r1", name: "Arun" },
    { id: "r2", name: "Selvi" },
    { id: "r3", name: "Imran" },
    { id: "r4", name: "Kavya" }
  ],
  // What each kind of order shows on its card. Normal orders show no badge.
  kinds: {
    normal: { badge: "" },
    melts: { badge: "Melts fast" },
    cools: { badge: "Best hot" }
  },
  // Dishes each shop sells, with the kind of order each one makes.
  dishes: {
    s1: { "Chicken Dum Biryani": "normal", "Mutton Biryani": "normal", "Veg Biryani": "normal", "Chicken 65": "cools" },
    s2: { "Ghee Roast Dosa": "cools", "Mini Idli Sambar": "normal", "Pongal Vada": "normal" },
    s3: { "Filter Kaapi": "cools", "Masala Vada": "normal", "Onion Bajji": "normal" },
    s4: { "Pepper Chicken": "normal", "Kothu Parotta": "cools", "Mutton Chukka": "normal" },
    s5: { "Shawarma Roll": "normal", "Grilled Chicken Half": "normal", "Falafel Wrap": "normal" },
    s6: { "Jigarthanda": "melts", "Coconut Ice Cream": "melts", "Brownie Sundae": "melts" }
  }
};
