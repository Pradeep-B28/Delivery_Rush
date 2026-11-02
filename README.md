# Delivery Rush

Delivery Rush is a web game by Wrench Wise for phone and laptop. Food orders arrive across Namma Nagar. You assign each order to a rider. When the shift ends, an algorithm plays the exact same shift with the same orders and riders. Both shifts play side by side on two maps. A live scoreboard compares your average delivery time with the algorithm's average time. Then you can inspect how the algorithm made each decision.

The site introduces the Certification Program in AI-Powered Software Engineering & DSA. The core takeaway: this is what DSA is for.

---

## 1. How to run

The site uses standard ES modules and runs in any modern web browser without a build step. It requires a local static web server.

1. Open your terminal in this folder.
2. Start a static server:
   ```bash
   npx --yes serve .
   ```
3. Open `http://localhost:3000/` in your browser.

To verify content and engine rules using Node.js:
```bash
node tools/verify-content.mjs
```

---

## 2. URL modes

The site supports dedicated URL modes for testing, presentations, and recording:

- **Self-Test (`?test=1`):**
  Runs all 15 verification checks in the browser using the actual application files. It tests content integrity, algorithm determinism, simulation clock logic, URL challenge decoding, blocked storage fallback, and text policy compliance.
  Example: `http://localhost:3000/?test=1`

- **Demo Mode (`?demo=1`):**
  Automates shift playback using the recorded sample lines. Shows visible tap rings on order cards one minute before assignment and on rider chips at the assignment minute. The timer crawl is disabled for consistent pacing. The player is labelled "Sample player", and WhatsApp contact buttons are hidden.
  Parameters:
  - `shift`: `lunch` (default), `dinner`, or `rain`
  - `theme`: `light` or `dark`
  - `part`: `play`, `race`, `think`, or `all` (runs shift, then race reveal, then cycles through all 4 thinking visualizers)
  - `speed`: `1` or `2`
  Example: `http://localhost:3000/?demo=1&shift=lunch&theme=dark&part=all`

- **Presenter Mode (`?present=1`):**
  Built for live classroom sessions. Opens directly to the algorithm thinking screen for Dinner Rush. Disables analytics, hides external links, and supports keyboard navigation (Left/Right arrows for decisions, Up/Down arrows for concept tabs).
  Example: `http://localhost:3000/?present=1`

- **Challenge Links:**
  Shared challenge links with prefilled friend targets.
  Example: `http://localhost:3000/?shift=lunch&beat=258`

---

## 3. Tech stack

- Plain HTML5, CSS3, and JavaScript (ES modules).
- No frontend frameworks, no build tools, no CSS libraries, and no external npm packages.
- Zero backend, database, accounts, or cookies.
- Scalable vector maps (SVG) drawn in code.
- Responsive design tailored for 360 x 640 mobile up to 1920 x 1080 desktop screens.
- Full light and dark theme support with safe local storage persistence.

---

## 4. File structure

```
delivery-rush/
  index.html            HTML shell and metadata
  config.js             Global configuration and feature flags
  manifest.json         PWA application manifest
  og-image.png          1200 x 630 social share card
  package.json          Node configuration for content check
  assets/               Logo and favicon
  content/              Data definitions (locked)
    city.js             City grid, shops, homes, roads, and bridges
    shifts/             Shift definitions (lunch, dinner, rain)
    lines.js            Sample and optimal benchmark lines
    concepts.js         DSA concept explanations and code
  tools/                Verification tools (locked)
    verify-content.mjs  Content verification test suite
    policies.mjs        Safety and wording validation
  styles/               CSS stylesheets
    tokens.css          Design tokens and CSS variables
    base.css            Reset, typography, shell, and header/footer
    map.css             City map rendering and visual styling
    play.css            Live shift screen layout, cards, and chips
    result.css          Side-by-side replay race and reveal scoreboard
    think.css           Algorithm decision visualizers and code viewer
    home.css            Home screen hero, shift cards, and loader
  js/                   JavaScript source modules
    main.js             Application bootstrap and URL mode handler
    router.js           Hash router and query parameter parser
    game.js             Shift game coordinator (sim + clock)
    clock.js            Game clock logic and speed scaling
    content.js          Central content access layer
    copy.js             User interface copy and string interpolation
    store.js            Safe local and session storage wrapper
    links.js            WhatsApp, program, and challenge link builders
    events.js           Global event bus
    analytics.js        GA4 and Meta Pixel event integration
    selftest.js         In-browser test runner (?test=1)
    run.js              In-memory run state coordinator
    motion.js           Animation loop and reduced motion detection
    screens/            Screen modules (mount / unmount)
      home.js           Landing page and challenge banner
      play.js           Live shift interactive gameplay
      result.js         Replay race and comparative reveal
      think.js          Algorithm thinking visualizer
    ui/                 Reusable UI components and visualizers
      city.js           Static city SVG renderer
      actors.js         Dynamic riders and delivery markers
      rain.js           Canvas rain animation for Rain Shift
      icons.js          SVG food, shop, scooter, and system icons
      loader.js         Introductory road sweep animation
      race.js           Dual-map replay animation coordinator
      scoreboard.js     Live scoreboard and final comparison table
      gaps.js           Where the time went top gaps breakdown
      heaptree.js       Binary heap visualizer
      bfswave.js        BFS wave search visualizer
      greedybars.js     Greedy choice timeline comparison bars
      queueslots.js     FIFO rider queue slot visualizer
      codeview.js       Syntax-highlighted code viewer
      ordercard.js      Interactive order cards
      riderchip.js      Interactive rider chips
      statusrow.js      Status announcements and alerts
      coach.js          First-order walkthrough coach
      dialog.js         Confirmation dialogs
      cta.js            Call to action card
      share.js          Web Share API integration
```

---

## 5. DSA Concepts Demonstrated

1. **Priority Queue (Min-Heap):**
   Determines which order needs attention first based on delivery promise deadlines.
2. **Breadth-First Search (BFS):**
   Finds the shortest road distance on the city grid, routing around flooded bridges during rain.
3. **Greedy Choice:**
   Calculates total completion time for every available rider and selects the earliest arrival.
4. **Queue (FIFO):**
   Manages rider order queues, dispatching the next pending delivery as earlier tasks finish.
