// Lists all locked content. The site reads content only through js/content.js.
// Locked content. A new shift adds one import and one line in SHIFTS.
// Used by js/content.js and tools/verify-content.mjs.

import { CITY } from "./city.js";
import { SHIFT as LUNCH } from "./shifts/lunch.js";
import { SHIFT as DINNER } from "./shifts/dinner.js";
import { SHIFT as RAIN } from "./shifts/rain.js";
import { LINES } from "./lines.js";
import { CONCEPTS, EXPLAIN } from "./thinking.js";

export const CONTENT_VERSION = "1.0.0";

export const SHIFTS = [LUNCH, DINNER, RAIN];

export { CITY, LINES, CONCEPTS, EXPLAIN };
