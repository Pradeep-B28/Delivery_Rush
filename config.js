// Every business setting for Delivery Rush. Change values here, never in other files.
// Keep this structure and these comments. See PROJECT_BRIEF.md Section 5.
// Used by almost every file through js/content.js and js/links.js.

export const CONFIG = {
  version: "1.0.0",

  // The live address. Set in Phase 7 (deploy). Used for share links and link previews.
  siteUrl: "",

  // Sales WhatsApp: digits only, country code first, 11 to 15 digits. Empty hides the WhatsApp button.
  salesWhatsApp: "91750077725",
  // Prefilled WhatsApp message. {shift} is the shift's name. {you} and {algo} are average minutes. {program} is program.name.
  whatsAppText: "Hi, I played Delivery Rush ({shift}). My average was {you} mins and the algorithm's was {algo} mins. I want to know more about the {program}.",

  // The program the CTA sells. Always use the full name. page is its page on wrench-wise.com, or "" for the main site.
  program: {
    name: "Certification Program in AI-Powered Software Engineering & DSA",
    page: ""
  },

  website: "https://wrench-wise.com",
  utm: { source: "delivery-rush", medium: "web-project", campaign: "delivery-rush" },

  // An empty ID switches that tracker off.
  analytics: {
    ga4Id: "",
    metaPixelId: "1504538090837971"
  },

  game: {
    msPerMinute: 800,      // real time for one game minute
    crawl: 0.25,           // clock speed while an order is selected
    selectTimeoutMs: 6000, // an order left selected this long is let go, and the clock speeds up again
    idleSpeed: 3,          // clock speed when every order has a rider and no more are coming
    countdownMs: 2400      // the 3, 2, 1 before a shift starts
  },

  race: {
    seconds: 20,           // how long the side by side race lasts
    speeds: [1, 2]         // speed buttons on the race screen
  },

  // Switches. false hides the feature completely, with no errors.
  features: {
    darkTheme: true,
    demoMode: true,
    presenterMode: true,
    thinking: true,
    challengeLinks: true,
    rainEffect: true,
    sound: true,
    shareImage: true
  }
};
