# Changelog

All notable changes to Delivery Rush will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

---

## [1.0.0] - 2026-11-02

### Added
- Three core delivery shifts:
  - Lunch Rush (warm up shift with 3 riders and 12 orders).
  - Dinner Rush (evening rush with 4 riders, 18 orders in bursts, and evening lighting).
  - Rain Shift (rain storm shift with 3 riders, 12 orders, canvas rain animation, and flooded bridge closures).
- Pure JavaScript algorithmic engine:
  - Priority Queue (Min-Heap) for order urgency management.
  - Breadth-First Search (BFS) for shortest path routing around flooded bridges.
  - Greedy choice for rider selection based on earliest delivery completion time.
  - Queue (FIFO) for sequential rider delivery execution.
- Interactive user experience:
  - Handcrafted scalable vector city map of Namma Nagar with shops, parks, water, and homes.
  - Live shift screen with order cards, rider chips, live status updates, and first-time coach walkthrough.
  - Side-by-side replay race comparing human play against the algorithm on twin maps.
  - Final scoreboard reveal with average delivery times, delivery counts, and top 3 time gap breakdowns.
  - Algorithm thinking screen with interactive visualizers for all 4 DSA concepts.
  - Binary heap visualizer with animated node transitions.
  - Interactive BFS wave search with step counter, rider selector, and flooded bridge barriers.
  - Greedy choice timeline bars comparing busy, travel, and delivery durations.
  - Rider FIFO queue slots visualizer.
  - Syntax-highlighted code viewer with zero external libraries.
- Features and integration:
  - Light and dark theme toggle with local storage persistence and safe fallback.
  - Pre-filled WhatsApp lead generation links and tagged program links.
  - Web Share API and link copying for friend challenges.
  - Challenge links decoding friend scores and rendering invitation banners.
  - Automated demo mode (`?demo=1`) for recording reels with visible tap rings and predictable timing.
  - Presenter mode (`?present=1`) for live classrooms with large typography and arrow key navigation.
  - Automated in-browser self-test suite (`?test=1`) validating 15 verification checks.
  - OpenGraph card (`og-image.png`) and PWA manifest.
  - 100 out of 100 mobile Lighthouse Performance and Accessibility ratings.
