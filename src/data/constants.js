export const PASSWORD = "PAYMORE2025";

// =================== CORE GAME VALUES ===================
export const STARTING_CASH = 1_000_000;
export const MAX_MONTHS = 10;
export const CORPORATE_OVERHEAD_BASE = 15_000;
export const CORPORATE_OVERHEAD_PER_STORE = 2_000;

// =================== FINANCIAL MODEL (from real PayMore proforma) ===================
// Contribution Margin = what's left after ALL variable costs (COGS, royalties, variable labor, etc.)
// Profit = Revenue × CM - Fixed Costs - Lease
export const BASE_FIXED_COSTS = 20_000; // fixed operating costs per store per month

export const CM_CATEGORIES = [
  { label: "Elite",     rate: 0.45 },   // Best-in-class ops
  { label: "Strong",    rate: 0.40 },   // Well-run store
  { label: "Healthy",   rate: 0.35 },   // Target/average
  { label: "Thin",      rate: 0.28 },   // Squeezed margins
  { label: "Razor",     rate: 0.22 },   // Barely covering variable costs
  { label: "Bleeding",  rate: 0.15 },   // Losing money on every sale practically
];

export const LEASE_RATE_MIN = 2_500;
export const LEASE_RATE_MAX = 7_000;

// =================== CARD TIERS ===================
// Each month: 6 cards (3 acquisitions + 3 builds), spread best → worst
export const CARD_TIER_DISTRIBUTION = ["great", "good", "ok", "mediocre", "bad", "terrible"];

// Monthly profit targets per tier — 6 tiers on a spectrum from best to worst
// Profit = Revenue × CM - BASE_FIXED_COSTS - lease
export const CARD_TIERS = {
  great:     { profitMin: 15_000,  profitMax: 25_000  },  // Clear winner
  good:      { profitMin: 7_000,   profitMax: 14_000  },  // Solid pick
  ok:        { profitMin: 1_000,   profitMax: 6_000   },  // Decent
  mediocre:  { profitMin: -4_000,  profitMax: 1_000   },  // Meh
  bad:       { profitMin: -10_000, profitMax: -4_000  },  // Losing money
  terrible:  { profitMin: -20_000, profitMax: -10_000 },  // Dumpster fire
};

// Revenue ranges by tier (monthly) — target store is $100k/mo ($1.2M/yr)
export const REVENUE_RANGES = {
  great:     { min: 90_000,  max: 140_000 },
  good:      { min: 80_000,  max: 120_000 },
  ok:        { min: 70_000,  max: 110_000 },
  mediocre:  { min: 55_000,  max: 90_000  },
  bad:       { min: 45_000,  max: 80_000  },
  terrible:  { min: 35_000,  max: 70_000  },
};

// =================== CARD SIGNAL ATTRIBUTES ===================
export const POPULATION_BRACKETS = {
  great: { min: 250_000, max: 350_000 },
  ok:    { min: 150_000, max: 250_000 },
  bad:   { min: 60_000,  max: 150_000 },
};

export const LOCATION_TYPES = [
  { id: "highway",   label: "Highway Corridor", rentBias: "low",  quality: "great" },
  { id: "downtown",  label: "Downtown",         rentBias: "mid",  quality: "great" },
  { id: "strip",     label: "Strip Mall",       rentBias: "mid",  quality: "ok"    },
  { id: "suburban",  label: "Suburban",          rentBias: "mid",  quality: "ok"    },
  { id: "rural",     label: "Rural",             rentBias: "low",  quality: "bad"   },
];

export const COMPETITION_LEVELS = [
  { label: "None within 30 min", quality: "great" },
  { label: "1 Competitor nearby", quality: "ok"   },
  { label: "2+ Competitors",     quality: "bad"   },
];

// Store age brackets (acquisitions only) — older = more predictable revenue
export const STORE_AGE_BRACKETS = {
  established: { min: 5, max: 12, revenueVariance: 0.05, label: "Established" },
  mature:      { min: 2, max: 5,  revenueVariance: 0.15, label: "Mature" },
  young:       { min: 0, max: 2,  revenueVariance: 0.30, label: "Young" },
};

// =================== ACQUISITION PRICING ===================
export const ACQ_DOWN_PAYMENT_PCT_MIN = 0.10;
export const ACQ_DOWN_PAYMENT_PCT_MAX = 0.60;
export const ACQ_VALUATION_MULTIPLE_MIN = 3;
export const ACQ_VALUATION_MULTIPLE_MAX = 5;
export const ACQ_LOSER_DISCOUNT = 0.40; // losers sell at 40% of nominal

// =================== BUILD COSTS ===================
export const BUILD_COST_MIN = 150_000;
export const BUILD_COST_MAX = 300_000;

// =================== DEBT ===================
export const DEBT_INTEREST_RATE = 0.015;         // 1.5%/mo normal
export const DEBT_INTEREST_RATE_DOWNTURN = 0.025; // 2.5%/mo downturn

// =================== STORE CLOSURES ===================
export const CLOSURE_STREAK = 3; // 3 consecutive losing months
export const CLOSURE_COST = 200_000;
export const CLOSURE_MESSAGES = [
  "🔒 STORE CLOSED: {city}. Three straight months of losses. The landlord changed the locks. $200k gone.",
  "🔒 {city} IS DONE. Three losing months. $200k closure fee. That hurts.",
  "🔒 CLOSURE: {city}. Three months of red ink was the limit. $200k termination fee.",
];

// =================== MARKET DOWNTURN ===================
export const DOWNTURN_EARLIEST = 4;
export const DOWNTURN_LATEST = 7;
export const DOWNTURN_DURATION_MIN = 2;
export const DOWNTURN_DURATION_MAX = 3;
export const DOWNTURN_REVENUE_MULTIPLIER = 0.75;  // revenue -25%
export const DOWNTURN_PRICE_MULTIPLIER = 0.65;    // acquisition prices -35%

// =================== DESPERATE MEASURES ===================
export const DAN_WHEEL_SEGMENTS = [
  { label: "GENEROUS",        amount: 500_000,  weight: 10, color: "#00ff88" },
  { label: "FEELING OK",      amount: 250_000,  weight: 15, color: "#00c8ff" },
  { label: "MEH",             amount: 100_000,  weight: 20, color: "#ffdd00" },
  { label: "ASK ME LATER",    amount: 0,         weight: 25, color: "#ff6b00" },
  { label: "ABSOLUTELY NOT",  amount: 0,         weight: 20, color: "#ff3344" },
  { label: "HOW DARE YOU",    amount: -50_000,   weight: 10, color: "#990000" },
];
export const DAN_COOLDOWN_MONTHS = 4;

export const BLACKJACK_WIN_CHANCE = 0.45;
export const BLACKJACK_STAKES = [0.25, 0.50, 1.00]; // % of cash

export const LOTTERY_COST = 50_000;
export const LOTTERY_WIN_CHANCE = 0.02;
export const LOTTERY_WIN_AMOUNT = 2_000_000;

export const LIQUIDATE_RECOVERY_RATE = 0.50; // get 50% of purchase price back

// =================== STORE INITIATIVES (click losing stores to gamble on fixing them) ===================
export const INITIATIVE_COST = 30_000;
export const INITIATIVE_SUCCESS_CHANCE = 0.45; // 45% chance it works
export const INITIATIVE_GOOD_OUTCOMES = [
  { label: "Hired a rockstar GM — completely turned the team around", profitDelta: 12_000 },
  { label: "Ran a killer local marketing campaign — foot traffic doubled", profitDelta: 10_000 },
  { label: "Renegotiated the supplier contract — margins way up", profitDelta: 8_000 },
  { label: "Launched a loyalty program — repeat customers through the roof", profitDelta: 9_000 },
  { label: "Renovated the storefront — customers actually come inside now", profitDelta: 11_000 },
  { label: "Partnered with a local business — cross-promotion is printing money", profitDelta: 7_000 },
];
export const INITIATIVE_BAD_OUTCOMES = [
  { label: "The new manager you hired was worse. Way worse.", profitDelta: -6_000 },
  { label: "Marketing campaign went viral for the wrong reasons", profitDelta: -8_000 },
  { label: "Renovations took 3x longer and cost 2x more", profitDelta: -7_000 },
  { label: "Tried a rebrand. Customers are confused and angry.", profitDelta: -5_000 },
  { label: "Invested in new tech. It crashes every day.", profitDelta: -9_000 },
  { label: "Hired a consultant. They billed $30k and suggested 'trying harder'", profitDelta: -4_000 },
];

// =================== CANT AFFORD MESSAGES ===================
export const CANT_AFFORD_MESSAGES = [
  "BROKE. MOVING ON.",
  "YOUR WALLET SAYS NO.",
  "INSUFFICIENT FUNDS (AND DIGNITY).",
  "MAYBE NEXT MONTH, CHAMP.",
  "YOUR BANK ACCOUNT JUST LAUGHED.",
  "THE MATH ISN'T MATHING.",
  "YOUR CFO SAID ABSOLUTELY NOT.",
];

// =================== RANDOM EVENTS ===================
export const POSITIVE_EVENTS = [
  { text: "A local influencer called your store 'lowkey fire.' Sales through the roof.", cashFlow: 20000, duration: 2 },
  { text: "New gaming console dropped. Your stores are basically a mosh pit right now.", cashFlow: 25000, duration: 1 },
  { text: "A competitor went under. Moment of silence. Now take their customers.", cashFlow: 14000, duration: 3 },
  { text: "PayMore got mentioned in a Reddit thread. Somehow positive.", cashFlow: 12000, duration: 2 },
  { text: "A celebrity was spotted carrying a PayMore bag. Nobody knows why. Sales up.", cashFlow: 18000, duration: 2 },
  { text: "Back-to-school season hit different this year. Cha-ching.", cashFlow: 15000, duration: 2 },
];

export const NEGATIVE_EVENTS = [
  { text: "An employee microwaved fish in the break room. Three stores affected.", cashFlow: -15000, duration: 2 },
  { text: "Road construction outside 2 locations. The cones are winning.", cashFlow: -18000, duration: 2 },
  { text: "A disgruntled ex-employee left a 1-star review essay. It's... detailed.", cashFlow: -12000, duration: 1 },
  { text: "Supply chain issues. You're explaining 'backorder' to customers daily.", cashFlow: -10000, duration: 2 },
  { text: "A regulatory inspector showed up and found... things.", cashFlow: -20000, duration: 2 },
  { text: "Someone left a Yelp review that just says 'vibes off.' It's going viral.", cashFlow: -13000, duration: 1 },
  { text: "Your POS system crashed. Employees are doing math by hand. It's going poorly.", cashFlow: -16000, duration: 2 },
  { text: "A TikToker filmed a roach in one of your stores. It has 2M views.", cashFlow: -22000, duration: 1 },
  { text: "Property taxes went up. The city says 'you're welcome.'", cashFlow: -11000, duration: 3 },
];

// =================== CARD DEAL FLAVOR TEXT ===================
export const CARD_DEAL_PHRASES = [
  "Month {month}. Six deals. Pick one. Or don't.",
  "Six opportunities. One choice. Unlimited regret potential.",
  "The market has opinions. Here are six of them.",
  "Month {month} of 36. Read the signals. Choose wisely.",
  "Six cards. Somewhere in there is a winner. Good luck.",
  "Your broker sent six options. He's not sure about any of them.",
  "Another month, another six chances to lose money. Or make it.",
];

export const ALL_PASSED_MSG = "You passed on everything this month. Sometimes the best deal is no deal. Sometimes it's just cowardice.";

// =================== POST-CLOSE WILD EVENTS ===================
// 35% chance one of these fires after you confirm a deal
export const POST_CLOSE_CHANCE = 0.35;

export const POST_CLOSE_GOOD_EVENTS = [
  { label: "anchor tenant moved in next door", profitDelta: 8_000 },
  { label: "local highway exit opened nearby — foot traffic exploded", profitDelta: 10_000 },
  { label: "competitor across the street shut down", profitDelta: 7_000 },
  { label: "city rezoned the area to commercial — property value soared", profitDelta: 6_000 },
  { label: "a new apartment complex opened within walking distance", profitDelta: 9_000 },
  { label: "a TikTok went viral featuring your store. The good kind.", profitDelta: 12_000 },
  { label: "the previous owner left behind a loyal customer base nobody told you about", profitDelta: 5_000 },
  { label: "a college campus expanded right into your trade area", profitDelta: 8_000 },
];

export const POST_CLOSE_BAD_EVENTS = [
  { label: "the roof started leaking on day two", profitDelta: -8_000 },
  { label: "a Walmart opened across the street", profitDelta: -10_000 },
  { label: "the city started a 6-month road construction project out front", profitDelta: -7_000 },
  { label: "the previous owner hid a pest problem. Surprise.", profitDelta: -9_000 },
  { label: "property taxes got reassessed. Way up.", profitDelta: -6_000 },
  { label: "three key employees quit the week you took over", profitDelta: -8_000 },
  { label: "the HVAC system died. Replacement: $40k. Monthly hit until fixed.", profitDelta: -11_000 },
  { label: "a water main broke and flooded the store on week one", profitDelta: -10_000 },
  { label: "turns out the 'trailing revenue' was... optimistic", profitDelta: -7_000 },
  { label: "the landlord immediately raised the rent after close", profitDelta: -5_000 },
];

// =================== DEAL QUALITY MESSAGES ===================
export const DEAL_QUALITY_BEST = [
  "Great eye. This was the BEST deal of the six.",
  "Nailed it. This was the top pick on the table.",
  "Smart money. This was the strongest card this month.",
];

export const DEAL_QUALITY_GOOD = [
  "Solid pick. Not the best, but definitely not the worst.",
  "Decent choice. Could have been better, could have been a disaster.",
  "Middle of the pack. Respectable.",
];

export const DEAL_QUALITY_WORST = [
  "Yikes. This was the WORST deal of the six.",
  "Oof. This was literally the worst card on the table.",
  "You picked the trap card. This was dead last.",
];

export const POST_CLOSE_GOOD_NARRATIVES = [
  "On paper this looked {quality}, BUT {event} and things turned out better than expected.",
  "The analysis said {quality}, BUT {event}. Sometimes you get lucky.",
  "Objectively {quality} deal on paper, BUT {event}. The universe had other plans.",
];

export const POST_CLOSE_BAD_NARRATIVES = [
  "On paper this looked {quality}, BUT {event} and tanked the economics.",
  "The analysis said {quality}, BUT {event}. Welcome to franchise ownership.",
  "Objectively {quality} deal on paper, BUT {event}. Life comes at you fast.",
];

// =================== LOADING QUOTES ===================
export const LOADING_QUOTES = [
  "\"You miss 100% of the stores you don't acquire.\" — Wayne Gretzky's franchise broker",
  "\"Move fast and buy things.\" — Silicon Valley, probably",
  "\"In franchise we trust.\" — Nobody's accountant ever",
  "\"The only thing we have to fear is negative cash flow.\" — FDR's CFO",
  "\"Ask not what your franchise can do for you, but what you can overpay for it.\" — JFK's broker",
  "\"It's not about the money. It's about the money.\" — Every entrepreneur ever",
  "\"Synergy is just a word until you own 30 stores.\" — LinkedIn thought leader",
  "\"Location, location, financial devastation.\" — Real estate 101",
];

// =================== VALUATION WHEEL ===================
// 2x–20x weighted: mostly 4-8x, tails are rare
export const VALUATION_MULTIPLES = [
  2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 10, 12, 15, 20
];

// =================== COLORS ===================
export const COLORS = {
  bg: "#0a0a0f",
  blue: "#00c8ff",
  orange: "#ff6b00",
  green: "#00ff88",
  red: "#ff3344",
  yellow: "#ffdd00",
  white: "#e0e0e0",
  darkGreen: "#1a3a1a",
  lightGreen: "#2a5a2a",
  navy: "#0a0a1a",
};

// =================== DEAR DIARY JOURNAL TEMPLATES ===================
// Monthly journal entry from the ILP franchise CEO
// Tone: Michael Scott writing in his diary. Unfiltered. Stream of consciousness.
// Each entry includes at least one funny reference to a partner:
//   Dan — Utah, golf, mountain biking, investing
//   Stephen — built his own dirty drink concept
//   Michael — Charlotte, finance background, loves golf
//   Jake — Savannah, long ponytail + beard, loves walking his dog
//   Milo — Savannah, obsessed with Claude (AI)
// Focus: acquisitions, builds, gambles, events. NO cashflow numbers. Always end optimistic.

// Partner reference snippets — picked randomly and inserted into entries
export const PARTNER_REFERENCES = [
  "Dan called from somewhere in Utah. Could hear wind. Either mountain biking or falling off a cliff. Either way he sounded fine.",
  "Dan texted me from the golf course. Said 'how's the portfolio.' I said 'which one.' He said 'the one that's losing money.' I said 'you'll have to be more specific.'",
  "Dan sent me an article about investing. I didn't read it but I said I did. Pretty sure he does the same with my updates.",
  "Got a voicemail from Dan. Background noise was either a mountain bike trail or a bear attack. He seemed happy either way.",
  "Dan wants to talk about 'diversifying.' Easy to say from a golf cart in Park City.",
  "Stephen pitched me on some kind of dirty drink concept again. I don't fully understand it but I respect the hustle. The man sees a blender and has a vision.",
  "Stephen called to say his dirty drink thing is blowing up. Meanwhile I'm over here running a REAL business. Ok his might also be real. Whatever.",
  "Stephen says I should add a dirty drink bar inside my stores. I told him that's either genius or a health code violation. Maybe both.",
  "Michael called from Charlotte to review my numbers. He has a 'finance background' which means he judges my spreadsheets professionally. Not recreationally like the rest of us.",
  "Michael wants to golf this weekend. I said sure but last time he spent 18 holes telling me my EBITDA was wrong. I don't even know what EBITDA stands for. I'm not asking.",
  "Michael sent me a 'financial model.' It had 47 tabs. I opened 2 of them and closed the laptop. That man sees the world in pivot tables.",
  "Jake sent me a photo of his dog from Savannah. The dog looked happier than any of my employees. The ponytail was flowing. Jake's, not the dog's.",
  "Jake called from his dog walk in Savannah. I could hear the dog panting. Or maybe that was Jake. The beard probably doesn't help in that humidity.",
  "Jake says I should 'take it slow' and 'enjoy the process.' Easy to say when you're walking a golden retriever through a park in Savannah with a ponytail blowing in the breeze.",
  "Milo sent me a 12-paragraph text about something Claude told him. I think Claude is an AI?? He talks about it like it's his best friend. Maybe it is. No judgment.",
  "Milo tried to get me to use Claude for my business decisions. I said I trust my GUT. He said Claude has better accuracy. I said my gut has VIBES. We agreed to disagree.",
  "Milo is in Savannah doing whatever Milo does. Probably asking Claude about franchise valuations. That AI is gonna take my job and Milo will cheer.",
  "Milo asked Claude what my optimal strategy should be. Claude gave a 3-page answer. I skimmed it. It was probably right. I'm doing the opposite on principle.",
];

export const DIARY_TITLES = {
  great: [
    "MONTH {month} — today was a GOOD day",
    "MONTH {month} — I might actually be good at this???",
    "MONTH {month} — future me is gonna read this and be so proud",
  ],
  ok: [
    "MONTH {month} — fine. everything is fine.",
    "MONTH {month} — not dead yet",
    "MONTH {month} — steady as she goes (she = my sanity)",
  ],
  bad: [
    "MONTH {month} — ok so today was rough",
    "MONTH {month} — do NOT read this one out loud",
    "MONTH {month} — things could be worse (could they? checking...)",
  ],
  critical: [
    "MONTH {month} — if anyone finds this diary BURN IT",
    "MONTH {month} — writing this from under my desk",
    "MONTH {month} — I should've been a dentist",
  ],
};

export const DIARY_OPENINGS = {
  great: [
    "Dear Diary,\n\nBig month. Let me write this down before I forget how good it feels. {partnerRef}",
    "Dear Diary,\n\nMonth {month} in the books. I've been making MOVES. Nobody is doing it like me. Maybe Warren Buffett but he doesn't run a PayMore so. {partnerRef}",
    "Dear Diary,\n\nI'm not saying I'm a genius but if you look at the data (don't look at the data just trust me) — month {month} was incredible. {partnerRef}",
  ],
  ok: [
    "Dear Diary,\n\nMonth {month} update. Steady progress. Nothing caught on fire. That's actually my new bar for success. {partnerRef}",
    "Dear Diary,\n\nAnother month, another dollar. Several dollars actually. Not as many as I'd like but MORE than zero which is what matters. {partnerRef}",
    "Dear Diary,\n\nQuick entry for month {month}. The ship is sailing. Not fast but definitely floating. Floating counts. {partnerRef}",
  ],
  bad: [
    "Dear Diary,\n\nOk so month {month}. BEFORE I judge myself — everything that happened is the economy's fault. Not mine. I'm writing that down so future me remembers. {partnerRef}",
    "Dear Diary,\n\nMonth {month} happened. I know. BUT — literally every franchise owner in America is going through this. I read it on Reddit. It's not just me. {partnerRef}",
    "Dear Diary,\n\nMonth {month}. Sometimes the universe tests you. This is a test. I'm passing. Barely. But barely passing is still passing. {partnerRef}",
  ],
  critical: [
    "Dear Diary,\n\nI need to write this down before I lose it. Month {month}. Deep breaths. {partnerRef}",
    "Dear Diary,\n\nMonth {month}. If anyone ever reads this — no they didn't. This is private. What happened this month stays between me and this diary. And the accountant. {partnerRef}",
    "Dear Diary,\n\nMonth {month}. I'm not gonna sugarcoat this one. Companies that almost die come back stronger right?? I think I read that somewhere. {partnerRef}",
  ],
};

export const DAN_DEAL_GOOD = [
  "• ACQUIRED {city} — {revenue} revenue. Absolute STEAL. I knew it the second I saw it. My gut is undefeated (don't check the spreadsheet).",
  "• Picked up {city}. {revenue} revenue. This one is gonna be a MONSTER. I can feel it in my bones.",
  "• Snagged {city} for {cost} down. Already doing {revenue}. I honestly impress myself sometimes.",
];

export const DAN_DEAL_BAD = [
  "• Acquired {city}. Revenue is {revenue}. The seller may have lied?? Looking into it. Not ideal.",
  "• Picked up {city} — {revenue} revenue. Ok so the numbers are a little softer than expected but the UPSIDE is still there. Probably.",
  "• Got {city}. Revenue: {revenue}. I'm choosing to see this as a learning experience and not a mistake.",
];

export const DAN_BUILD_GOOD = [
  "• BUILT new store in {city}. Revenue looking like {revenue}. I drove by the location twice and just KNEW. That's called instinct.",
  "• New build in {city} — {revenue}. From the GROUND UP baby. We are BUILDING things literally and figuratively.",
  "• Broke ground in {city}. {revenue} revenue. Sometimes you gotta build the dream yourself instead of buying someone else's dream.",
];

export const DAN_BUILD_BAD = [
  "• Built new store in {city}. Revenue: {revenue}. The city promised foot traffic. The city lied.",
  "• New build in {city} — {revenue}. Ok so the location looked better on Google Maps than in person. Lessons learned.",
  "• Opened {city}. {revenue} revenue. In my defense the demographic report was from 2019 and nobody told me.",
];

export const DAN_PASSED = [
  "• No deals this month. Everything was garbage. Sometimes the best move is no move. Sun Tzu said that. Or maybe it was a bumper sticker.",
  "• Passed on all 6 deals. Saving our ammo for a REAL opportunity. (Also nothing was affordable but mainly the first thing)",
  "• Didn't buy anything. Strategic patience. This is what separates the pros from the amateurs.",
];

export const DAN_WILD_EVENT_GOOD = [
  "• PLOT TWIST at {city}: {event}. {delta}/mo profit boost. I saw this coming. This is what they call VISION.",
  "• Huge break in {city} — {event}. {delta}/mo. Some people call it luck. I call it ME picking the right location.",
  "• Update on {city}: {event}. {delta}/mo. I swear I planned this. (I did not plan this but it worked out)",
];

export const DAN_WILD_EVENT_BAD = [
  "• Bad news from {city}: {event}. {delta}/mo impact. This is NOT my fault. I need future me to understand that.",
  "• So uh. {event} happened at {city}. {delta}/mo. In what universe was I supposed to predict this???",
  "• {city} update: {event}. {delta}/mo hit. I'm forming a task force. (The task force is me googling solutions at 2am)",
];

// Random monthly events — things outside your control
export const DAN_RANDOM_EVENT = [
  "• Also this happened outside my control: \"{event}\" — I literally cannot make this up.",
  "• In OTHER news nobody asked for: \"{event}\" — I had nothing to do with this. Just want that on the record.",
  "• Universe update: \"{event}\" — filing this under 'not my fault' and moving on.",
];

export const DAN_CLOSURE = [
  "• CLOSED {city}. 3 straight months of losses. $200k termination fee. I was the one who said this was a good location. But also the economy changed so.",
  "• {city} is dead. 3 losing months in a row. $200k fee. I'm choosing to view this as portfolio optimization and not a catastrophic failure.",
];

export const DAN_DESPERATE = {
  dan: [
    "• Called Dan for money. Result: {result}. I could hear him golfing. He didn't even pause his swing.",
    "• Begged Dan for cash. {result}. Pretty sure he was mountain biking while I was pleading. Could hear gravel.",
  ],
  blackjack: [
    "• Went to a casino. {result}. BEFORE I judge myself — this was a calculated risk. I did the math. (I did not do the math)",
    "• Played blackjack. {result}. Several billionaires gamble. I'm just following the playbook.",
  ],
  lottery: [
    "• Bought lottery tickets. {result}. The expected value was technically positive if you squint.",
    "• Spent $50k on lotto. {result}. In my defense I had a dream about winning and that felt like a sign.",
  ],
  liquidate: [
    "• LIQUIDATED {city}. Got {amount} back. It's not a fire sale. It's a strategic pivot. The difference matters to me.",
    "• Sold {city} for {amount}. Sometimes you gotta cut the dead weight. (I'm the one who bought the dead weight but we're moving forward.)",
  ],
};

// No-gamble boasting — type-specific when desperate measure was available but NOT used
export const DAN_NO_GAMBLE = {
  dan: [
    "• Had the chance to call Dan begging for money this month. Didn't do it. That's called PRIDE. He's probably on hole 14 somewhere in Utah anyway.",
    "• Could've picked up the phone and groveled to Dan for cash. Chose not to. He's probably mountain biking and wouldn't answer anyway.",
    "• Dan's number was RIGHT THERE in my phone and I resisted. No begging. No groveling. Just pure self-reliance.",
  ],
  blackjack: [
    "• A buddy invited me to a blackjack table this month. I said no. That's growth. That's maturity. I'm basically a monk. A franchise monk.",
    "• Had a chance to sit down at the blackjack table and risk it all. Walked away. The old me would've doubled down. New me is built different.",
    "• Someone offered to take me gambling this month. I said 'I have a franchise empire to run.' Then I walked out in slow motion. Probably looked really cool.",
  ],
  lottery: [
    "• A friend offered me a great deal on some lottery tickets this month. I said no thanks. I'm investing in BUSINESSES not FANTASIES. (ok the businesses are also kind of fantasies but still)",
    "• Some guy at the gas station said lottery jackpot was huge. I walked right past the tickets. Didn't even look. Ok I looked but I didn't BUY. That's discipline.",
    "• Had $50k worth of lottery tickets practically in my hand this month. Put them DOWN. The odds were terrible anyway. Unlike my franchise odds which are... also kind of terrible. Moving on.",
  ],
  liquidate: [
    "• Thought about liquidating one of my stores this month. Decided against it. We're GROWING, not shrinking. That's the ILP way.",
    "• Could've sold a store for quick cash. Chose to keep it. Even the bad ones are like children to me. Expensive, ungrateful children.",
    "• Had the option to fire-sale a location this month. Said no. Every store has potential. Even the ones that are actively losing money. ESPECIALLY those ones.",
  ],
  _fallback: [
    "• Had the chance to do something desperate this month and I didn't. That's called restraint. I'm basically a monk. A franchise monk.",
  ],
};

// ALWAYS included — generic gambling/lottery resistance when no desperate measure was even offered
export const DAN_GAMBLING_RESISTANCE = [
  "• Some guy at the gas station tried to sell me on scratch-offs again. I said no. I'm running a COMPANY. A company that's basically a scratch-off itself but at least it's MY scratch-off.",
  "• Drove past the casino on the way home. Didn't stop. Didn't even slow down. Ok I slowed down a little. But I didn't STOP. Growth.",
  "• A buddy texted me about a 'can't miss' poker night. I said I already gamble every single day — it's called franchise ownership. He didn't laugh. It wasn't a joke.",
  "• Saw a billboard for the state lottery. Jackpot was $400M. Kept driving. My financial advisor (me) says I should only gamble with other people's money (Dan's).",
  "• Somebody at Starbucks was scratching lottery tickets and winning $20. I could feel the temptation. But no. I invest in REAL things. Like stores that lose $15k a month.",
  "• Had a dream about winning the Powerball last night. Woke up and almost bought tickets. Then I remembered I already gamble enough just by existing as a franchise owner.",
  "• A friend tried to get me into sports betting this month. I said 'I already bet my life savings on a franchise empire, what more do you want from me.'",
  "• Walked past a lottery ticket vending machine today. Made eye contact with it. Walked away. That's called discipline. Or maybe cowardice. Either way the $50k stays in my account.",
  "• Someone left a casino brochure on my windshield. I threw it away. I only gamble on things I can control. Like franchise locations in cities I've never visited.",
  "• Coworker won $500 on a scratch-off and told everyone. I smiled and said 'nice.' Inside I was doing the math on how many tickets that'd be. NO. We don't do that. Stay strong.",
];

// ALWAYS optimistic diary closings — even when everything is on fire
export const DAN_SIGNOFFS = [
  "Honestly feeling great about where we're headed.\n\n— ILP CEO/CFO/COO/janitor",
  "Next month is gonna be HUGE. I can feel it.\n\n— ILP Management (just me)",
  "The best is yet to come and I'm not just saying that. (Ok I am but I also believe it.)\n\n— ILP HQ (my apartment)",
  "If you squint at the trajectory we are CRUSHING it.\n\n— ILP Management Team (Population: 1)",
  "Everything is going according to plan. (I just made the plan 5 minutes ago but still.)\n\n— ILP Worldwide",
  "I promise next month's entry is gonna be the one where I go 'wow I really turned it around.'\n\n— ILP (undefeated in spirit)",
];

export const DAN_DOWNTURN_START = [
  "P.S. — markets are in downturn. Everything is down 25%. I predicted this (I didn't but nobody keeps records right??). WE WILL EMERGE STRONGER.",
];

export const DAN_DOWNTURN_END = [
  "P.S. — downturn is OVER. We survived. I'm telling everyone this was my strategy the whole time. Ride it out. Genius.",
];

// =================== LEADERBOARD ===================
export const JSONBIN_BIN_ID = "683b5e548a456b79669ae804";
export const JSONBIN_API_KEY = "$2a$10$NqS0yL.WK7/bMmXTIc1Gzuy/NiSjZ4x7plTrqI2pIg3tHaWVMdBji";
