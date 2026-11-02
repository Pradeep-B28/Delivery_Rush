// UI text catalog and template interpolation function for Delivery Rush.
// Uses no external dependencies.
// Used by screens, components, links, and self-test.

export const COPY = {
  // Site
  "site.title": "Delivery Rush",
  "site.description": "Run a city's food deliveries, then watch an algorithm run the same shift, side by side.",

  // Home
  "home.eyebrow": "A Wrench Wise game",
  "home.title": "Can you deliver faster than an algorithm?",
  "home.subtitle": "Food orders keep coming. You assign the riders. Then an algorithm runs the exact same shift, side by side.",
  "home.start": "Start {shift}",
  "home.how": "How it works",
  "home.liveLine": "This is the algorithm playing {shift} right now.",
  "home.shiftsTitle": "Pick a shift",
  "home.best": "Your best: {avg} mins",
  "home.play": "Play",
  "home.step1.title": "Tap an order",
  "home.step1.body": "Orders pop up across the city. Ice cream will not wait as long as biryani.",
  "home.step2.title": "Tap a rider",
  "home.step2.body": "Each rider can hold 2 jobs. Watch the river: it has only 2 bridges.",
  "home.step3.title": "Race the algorithm",
  "home.step3.body": "It plays the same orders with the same riders. Lower average delivery time wins.",
  "home.insideTitle": "What's running under the hood",

  // Play
  "play.leave": "Leave",
  "play.leave.title": "Leave this shift?",
  "play.leave.body": "Your progress on this shift won't be saved.",
  "play.leave.yes": "Leave",
  "play.leave.no": "Keep playing",
  "play.pause": "Pause",
  "play.resume": "Resume",
  "play.paused": "Paused.",
  "play.minute": "Minute {n}",
  "play.avg": "Average so far",
  "play.delivered": "{n} of {total} delivered",
  "play.orders": "Orders",
  "play.riders": "Riders",
  "play.noOrders": "No orders waiting. Stay ready.",
  "play.tapOrder": "Tap an order.",
  "play.pickRider": "Now tap a rider for {dish}.",
  "play.tapOrderFirst": "Tap an order first.",
  "play.dueIn": "Due in {n} mins",
  "play.dueIn.one": "Due in {n} min",
  "play.late": "Late",
  "play.free": "Free",
  "play.freeIn": "Free in {n} mins",
  "play.freeIn.one": "Free in {n} min",
  "play.full": "Full",
  "play.speeding": "All orders have riders. Speeding up.",
  "play.over": "Shift over.",

  // Floods
  "flood.closed": "{bridge} is flooded. Riders will find another way.",
  "flood.open": "{bridge} is open again.",

  // Coach
  "coach.one": "Your first order. Tap it.",
  "coach.two": "Now tap a rider. The closest one is usually a good start.",
  "coach.three": "That's the whole game. Here comes the rush.",

  // Race
  "race.you": "You",
  "race.algo": "Algorithm",
  "race.done": "Done",
  "race.skip": "Skip to result",
  "race.deliveredOf": "{n} of {total} delivered",

  // Result
  "result.avg": "Average delivery",
  "result.delivered": "Delivered",
  "result.late": "Late",
  "result.missed": "Missed",
  "result.mins": "{n} mins",
  "result.win.title": "You beat the algorithm.",
  "result.win.body": "It picks the best move for each order right now. You planned further ahead.",
  "result.tie.title": "A dead heat.",
  "result.tie.body": "You matched the algorithm exactly. Very few people do.",
  "result.close.title": "So close. Only {gap} mins behind per order.",
  "result.close.body": "It saw each order only when you did. A better choice or two would turn this around.",
  "result.behind.title": "The algorithm was {gap} mins faster per order.",
  "result.behind.body": "It saw each order only when you did. See below for what it did differently.",
  "result.percent": "That is {n} percent faster.",
  "result.gapsTitle": "Where the time went",
  "result.noGaps": "You were as fast as the algorithm or faster on every order.",
  "result.think": "See how it thinks",
  "result.again": "Play again",
  "result.next": "Try {shift}",
  "result.challenge": "Challenge a friend",

  // Challenge
  "challenge.banner": "A friend averaged {avg} mins on {shift}. Can you beat that?",
  "challenge.won": "You beat your friend's {avg} mins.",
  "challenge.lost": "Your friend's {avg} mins still stands.",

  // Think
  "think.title": "How the algorithm thinks",
  "think.decision": "Decision {n} of {total}: {dish} for {customer}",
  "think.nextIdea": "Next idea",
  "think.back": "Back",
  "think.next": "Next",
  "think.replay": "Replay",
  "think.checked": "{n} squares checked",
  "think.jobAhead": "Job ahead",
  "think.thisOrder": "This order",
  "think.heapEmpty": "The queue is empty now.",
  "think.showCode": "Show the code",
  "think.hideCode": "Hide the code",
  "think.you": "You gave this order to {rider} at minute {at}. It took {you} mins. The algorithm took {algo} mins.",
  "think.youMissed": "This order was never delivered on your shift. The algorithm took {algo} mins.",
  "think.honest": "A fair fight: the algorithm sees each order only when you do. It does react instantly, and it never gets distracted. It is also not perfect. On this shift, a plan that knew every future order beat it by {gap} mins.",

  // CTA
  "cta.title": "That's what DSA is for.",
  "cta.body": "In the {program}, you'll learn to write logic like this yourself.",
  "cta.whatsapp": "Talk to us on WhatsApp",
  "cta.program": "See the program",

  // Share
  "share.text": "I averaged {avg} mins on {shift} in Delivery Rush. Can you beat me, or the algorithm?",
  "share.copied": "Link copied",

  // Theme
  "theme.toLight": "Switch to light theme",
  "theme.toDark": "Switch to dark theme",

  // Demo
  "demo.you": "Sample player",

  // Footer
  "footer.line": "Built by Wrench Wise to show what DSA does in real life.",
  "footer.legal": "© 2026 Wrench Wise Edutech Private Limited"
};

export function t(key, values) {
  let template = COPY[key];
  if (values && values.n === 1) {
    const oneKey = `${key}.one`;
    if (COPY[oneKey] !== undefined) {
      template = COPY[oneKey];
    }
  }
  if (template === undefined) {
    return key;
  }
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    return values[name] !== undefined ? values[name] : match;
  });
}
