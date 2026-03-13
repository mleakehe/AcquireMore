import { useReducer, useMemo } from "react";
import CITIES from "../data/cities";
import {
  STARTING_CASH, MAX_MONTHS,
  CORPORATE_OVERHEAD_BASE, CORPORATE_OVERHEAD_PER_STORE,
  BASE_FIXED_COSTS,
  CM_CATEGORIES, LEASE_RATE_MIN, LEASE_RATE_MAX,
  CARD_TIER_DISTRIBUTION, CARD_TIERS, REVENUE_RANGES,
  POPULATION_BRACKETS, LOCATION_TYPES, COMPETITION_LEVELS, STORE_AGE_BRACKETS,
  ACQ_DOWN_PAYMENT_PCT_MIN, ACQ_DOWN_PAYMENT_PCT_MAX,
  ACQ_VALUATION_MULTIPLE_MIN, ACQ_VALUATION_MULTIPLE_MAX, ACQ_LOSER_DISCOUNT,
  BUILD_COST_MIN, BUILD_COST_MAX,
  DEBT_INTEREST_RATE,
  CLOSURE_STREAK, CLOSURE_COST,
  DAN_WHEEL_SEGMENTS, DAN_COOLDOWN_MONTHS,
  BLACKJACK_WIN_CHANCE, BLACKJACK_STAKES,
  LOTTERY_COST, LOTTERY_WIN_CHANCE, LOTTERY_WIN_AMOUNT,
  LIQUIDATE_RECOVERY_RATE,
  GOLF_BET_COST, GOLF_WIN_CHANCE, GOLF_WIN_AMOUNT,
  MEMECOIN_COST, MEMECOIN_MOON_CHANCE, MEMECOIN_MOON_AMOUNT,
  MEMECOIN_PARTIAL_CHANCE, MEMECOIN_PARTIAL_AMOUNT,
  POSITIVE_EVENTS, NEGATIVE_EVENTS,
  POST_CLOSE_CHANCE, POST_CLOSE_GOOD_EVENTS, POST_CLOSE_BAD_EVENTS,
  POST_CLOSE_GOOD_NARRATIVES, POST_CLOSE_BAD_NARRATIVES,
  DEAL_QUALITY_BEST, DEAL_QUALITY_GOOD, DEAL_QUALITY_WORST,
  INITIATIVE_COST, INITIATIVE_SUCCESS_CHANCE,
  INITIATIVE_GOOD_OUTCOMES, INITIATIVE_BAD_OUTCOMES,
} from "../data/constants";

/* =================== HELPERS =================== */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (val, lo, hi) => Math.max(lo, Math.min(hi, val));

function weightedPick(items) {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * totalWeight;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =================== CITY POOL =================== */
function generateCityPool() {
  return CITIES.map((c, i) => ({ ...c, id: i, status: "available" }));
}

function pickAvailableCity(cityPool) {
  const available = cityPool.filter(c => c.status === "available");
  if (available.length === 0) return null;
  return pick(available);
}

/* =================== PROFIT FORMULA =================== */
// Revenue × Contribution Margin - Fixed Costs - Lease = Profit
function computeStoreProfit(revenue, cmRate, leaseRate) {
  return Math.round(revenue * cmRate - BASE_FIXED_COSTS - leaseRate);
}

/* =================== SIGNAL GENERATION =================== */
// Each tier gets correlated signals with noise — "great" stores tend to have great signals
// but occasionally a great store has a bad signal (noise), making evaluation harder

// Tier quality mapping: great/good → "top", ok/mediocre → "mid", bad/terrible → "bottom"
function tierQuality(tier) {
  if (tier === "great" || tier === "good") return "top";
  if (tier === "ok" || tier === "mediocre") return "mid";
  return "bottom"; // bad, terrible
}

function pickPopulation(tier) {
  const q = tierQuality(tier);
  const noise = Math.random();
  if (q === "top") {
    if (noise < 0.70) return rand(POPULATION_BRACKETS.great.min, POPULATION_BRACKETS.great.max);
    if (noise < 0.90) return rand(POPULATION_BRACKETS.ok.min, POPULATION_BRACKETS.ok.max);
    return rand(POPULATION_BRACKETS.bad.min, POPULATION_BRACKETS.bad.max);
  }
  if (q === "mid") {
    if (noise < 0.20) return rand(POPULATION_BRACKETS.great.min, POPULATION_BRACKETS.great.max);
    if (noise < 0.65) return rand(POPULATION_BRACKETS.ok.min, POPULATION_BRACKETS.ok.max);
    return rand(POPULATION_BRACKETS.bad.min, POPULATION_BRACKETS.bad.max);
  }
  // bottom
  if (noise < 0.10) return rand(POPULATION_BRACKETS.great.min, POPULATION_BRACKETS.great.max);
  if (noise < 0.30) return rand(POPULATION_BRACKETS.ok.min, POPULATION_BRACKETS.ok.max);
  return rand(POPULATION_BRACKETS.bad.min, POPULATION_BRACKETS.bad.max);
}

function pickLocationType(tier) {
  const greatTypes = LOCATION_TYPES.filter(l => l.quality === "great");
  const okTypes = LOCATION_TYPES.filter(l => l.quality === "ok");
  const badTypes = LOCATION_TYPES.filter(l => l.quality === "bad");
  const q = tierQuality(tier);
  const noise = Math.random();

  if (q === "top") {
    if (noise < 0.70) return pick(greatTypes);
    if (noise < 0.90) return pick(okTypes);
    return pick(badTypes);
  }
  if (q === "mid") {
    if (noise < 0.20) return pick(greatTypes);
    if (noise < 0.65) return pick(okTypes);
    return pick(badTypes);
  }
  // bottom
  if (noise < 0.10) return pick(greatTypes);
  if (noise < 0.35) return pick(okTypes);
  return pick(badTypes);
}

function pickCompetition(tier) {
  const q = tierQuality(tier);
  const noise = Math.random();
  if (q === "top") {
    if (noise < 0.60) return COMPETITION_LEVELS[0]; // none
    if (noise < 0.90) return COMPETITION_LEVELS[1]; // 1 competitor
    return COMPETITION_LEVELS[2]; // 2+
  }
  if (q === "mid") {
    if (noise < 0.25) return COMPETITION_LEVELS[0];
    if (noise < 0.65) return COMPETITION_LEVELS[1];
    return COMPETITION_LEVELS[2];
  }
  // bottom
  if (noise < 0.10) return COMPETITION_LEVELS[0];
  if (noise < 0.30) return COMPETITION_LEVELS[1];
  return COMPETITION_LEVELS[2];
}

function pickCM(tier) {
  // CM_CATEGORIES: [0]=Elite(45%), [1]=Strong(40%), [2]=Healthy(35%), [3]=Thin(28%), [4]=Razor(22%), [5]=Bleeding(15%)
  const q = tierQuality(tier);
  const noise = Math.random();
  if (q === "top") {
    if (noise < 0.35) return CM_CATEGORIES[0]; // Elite
    if (noise < 0.70) return CM_CATEGORIES[1]; // Strong
    if (noise < 0.90) return CM_CATEGORIES[2]; // Healthy
    return CM_CATEGORIES[3];                    // Thin (rare noise)
  }
  if (q === "mid") {
    if (noise < 0.10) return CM_CATEGORIES[0]; // Elite (lucky)
    if (noise < 0.30) return CM_CATEGORIES[1]; // Strong
    if (noise < 0.60) return CM_CATEGORIES[2]; // Healthy
    if (noise < 0.85) return CM_CATEGORIES[3]; // Thin
    return CM_CATEGORIES[4];                    // Razor
  }
  // bottom
  if (noise < 0.05) return CM_CATEGORIES[2]; // Healthy (trap — looks ok)
  if (noise < 0.15) return CM_CATEGORIES[3]; // Thin
  if (noise < 0.50) return CM_CATEGORIES[4]; // Razor
  return CM_CATEGORIES[5];                    // Bleeding
}

function pickLeaseRate(tier) {
  // top tiers → low lease, bottom → high lease
  const range = LEASE_RATE_MAX - LEASE_RATE_MIN;
  const q = tierQuality(tier);
  if (q === "top") return Math.round(LEASE_RATE_MIN + range * randFloat(0, 0.35));
  if (q === "mid") return Math.round(LEASE_RATE_MIN + range * randFloat(0.20, 0.65));
  // bottom
  return Math.round(LEASE_RATE_MIN + range * randFloat(0.50, 1.0));
}

function pickStoreAge(tier) {
  // Only for acquisitions — top tiers tend to be established
  const q = tierQuality(tier);
  const noise = Math.random();
  if (q === "top") {
    if (noise < 0.60) return STORE_AGE_BRACKETS.established;
    if (noise < 0.90) return STORE_AGE_BRACKETS.mature;
    return STORE_AGE_BRACKETS.young;
  }
  if (q === "mid") {
    if (noise < 0.25) return STORE_AGE_BRACKETS.established;
    if (noise < 0.65) return STORE_AGE_BRACKETS.mature;
    return STORE_AGE_BRACKETS.young;
  }
  // bottom
  if (noise < 0.10) return STORE_AGE_BRACKETS.established;
  if (noise < 0.35) return STORE_AGE_BRACKETS.mature;
  return STORE_AGE_BRACKETS.young;
}

/* =================== REVENUE GENERATION =================== */
// Generate revenue that, combined with the chosen CM/lease, hits the tier's target profit range
function generateRevenue(tier, cmRate, leaseRate) {
  const { profitMin, profitMax } = CARD_TIERS[tier];
  const targetProfit = randFloat(profitMin, profitMax);
  // Solve: profit = rev * CM - fixedCosts - lease
  // rev = (profit + fixedCosts + lease) / CM
  let revenue = Math.round((targetProfit + BASE_FIXED_COSTS + leaseRate) / cmRate);
  // Clamp to tier's revenue range (soft guide)
  const { min: revMin, max: revMax } = REVENUE_RANGES[tier];
  revenue = clamp(revenue, revMin, revMax);
  // Add small noise (±5%)
  revenue = Math.round(revenue * randFloat(0.95, 1.05));
  return revenue;
}

/* =================== CARD GENERATION =================== */
function generateDealCards(cityPool, ownedStores, month) {
  // 6 tiers on a spectrum: great → good → ok → mediocre → bad → terrible
  const tiers = shuffle([...CARD_TIER_DISTRIBUTION]);

  // Exactly 3 acquisitions and 3 builds, shuffled into random positions
  const cardTypes = shuffle(["acquire", "acquire", "acquire", "build", "build", "build"]);

  const cards = [];
  const usedCityIds = new Set();

  for (let i = 0; i < 6; i++) {
    const tier = tiers[i];
    const cardType = cardTypes[i];

    // Pick a unique city
    let city = null;
    const available = cityPool.filter(c => c.status === "available" && !usedCityIds.has(c.id));
    if (available.length === 0) break;
    city = pick(available);
    usedCityIds.add(city.id);

    // Generate signal attributes
    const population = pickPopulation(tier);
    const locationType = pickLocationType(tier);
    const competition = pickCompetition(tier);
    const cm = pickCM(tier);
    const leaseRate = pickLeaseRate(tier);
    const revenue = generateRevenue(tier, cm.rate, leaseRate);
    const actualProfit = computeStoreProfit(revenue, cm.rate, leaseRate);

    const card = {
      tier, // hidden — player doesn't see this
      type: cardType,
      cityId: city.id,
      cityName: city.name,
      // Signals (visible to player)
      population,
      locationType,
      competition,
      revenue,
      cm,
      leaseRate,
      actualProfit, // hidden — this is the actual monthly profit
    };

    if (cardType === "acquire") {
      // Acquisition-specific: store age, price, down payment, debt
      const ageBracket = pickStoreAge(tier);
      const storeAge = rand(ageBracket.min, ageBracket.max);

      // Revenue has variance based on store age
      const revenueVariance = ageBracket.revenueVariance;

      // Price = annual profit × valuation multiple
      // For losers, apply discount
      const annualProfit = actualProfit * 12;
      let multiple = randFloat(ACQ_VALUATION_MULTIPLE_MIN, ACQ_VALUATION_MULTIPLE_MAX);
      let price = Math.max(50_000, Math.round(Math.abs(annualProfit) * multiple));
      if (tier === "bad" || tier === "terrible") price = Math.round(price * ACQ_LOSER_DISCOUNT);

      // Down payment: 10-60% in 5% increments
      const dpSteps = Math.round((ACQ_DOWN_PAYMENT_PCT_MAX - ACQ_DOWN_PAYMENT_PCT_MIN) / 0.05);
      const downPct = ACQ_DOWN_PAYMENT_PCT_MIN + (Math.floor(Math.random() * (dpSteps + 1)) * 0.05);
      const downPayment = Math.round(price * downPct);
      const debtTaken = price - downPayment;

      card.storeAge = storeAge;
      card.ageBracket = ageBracket;
      card.revenueVariance = revenueVariance;
      card.price = price;
      card.downPct = downPct;
      card.downPayment = downPayment;
      card.debtTaken = debtTaken;
      card.cost = downPayment; // what player pays upfront
    } else {
      // Build-specific: build cost, no debt, projected revenue range
      let buildCost = rand(BUILD_COST_MIN, BUILD_COST_MAX);
      // Revenue shown as range (wider for builds — more uncertain)
      const revLow = Math.round(revenue * 0.80);
      const revHigh = Math.round(revenue * 1.20);
      card.buildCost = buildCost;
      card.revenueRange = { min: revLow, max: revHigh };
      card.cost = buildCost; // what player pays upfront
    }

    cards.push(card);
  }

  return cards;
}

/* =================== EXECUTE A DEAL =================== */
function executeDeal(card, state) {
  let cash = state.cash;
  let debt = state.debt;
  let ownedStores = [...state.ownedStores];
  let totalStores = state.totalStores;
  let cityPool = [...state.cityPool];
  let popup = null;

  if (card.type === "acquire") {
    if (cash < card.downPayment) return null; // can't afford

    // Apply revenue variance based on store age
    const variance = card.revenueVariance || 0;
    const actualRevenue = Math.round(card.revenue * randFloat(1 - variance, 1 + variance));
    const monthlyProfit = computeStoreProfit(actualRevenue, card.cm.rate, card.leaseRate);

    const newStore = {
      id: card.cityId,
      cityName: card.cityName,
      revenue: actualRevenue,
      cmRate: card.cm.rate,
      leaseRate: card.leaseRate,
      profit: monthlyProfit,
      source: "acquired",
      purchasePrice: card.price,
      monthAcquired: state.month,
    };

    cash -= card.downPayment;
    debt += card.debtTaken;
    ownedStores = [...ownedStores, newStore];
    totalStores += 1;
    cityPool = cityPool.map(c => c.id === card.cityId ? { ...c, status: "acquired" } : c);

    const good = monthlyProfit > 0;
    popup = {
      type: good ? "homerun" : "lemon",
      locationName: card.cityName,
      message: `ACQUIRED: ${card.cityName}`,
      subtext: good
        ? `Revenue: $${actualRevenue.toLocaleString()}/mo. Looking profitable.`
        : `Revenue: $${actualRevenue.toLocaleString()}/mo. The math is... concerning.`,
      cashFlow: monthlyProfit,
    };

    return { cash, debt, ownedStores, totalStores, cityPool, popup,
      action: { type: "acquired", cityName: card.cityName, revenue: actualRevenue, profit: monthlyProfit, price: card.price, downPayment: card.downPayment } };
  }

  // BUILD
  if (cash < card.buildCost) return null; // can't afford

  // Build revenue has wider variance (±20% of projected)
  const actualRevenue = Math.round(card.revenue * randFloat(0.80, 1.20));
  const monthlyProfit = computeStoreProfit(actualRevenue, card.cm.rate, card.leaseRate);

  const newStore = {
    id: card.cityId,
    cityName: card.cityName,
    revenue: actualRevenue,
    cmRate: card.cm.rate,
    leaseRate: card.leaseRate,
    profit: monthlyProfit,
    source: "built",
    purchasePrice: card.buildCost,
    monthBuilt: state.month,
  };

  cash -= card.buildCost;
  ownedStores = [...ownedStores, newStore];
  totalStores += 1;
  cityPool = cityPool.map(c => c.id === card.cityId ? { ...c, status: "acquired" } : c);

  const good = monthlyProfit > 5000;
  popup = {
    type: good ? "homerun" : monthlyProfit < -3000 ? "lemon" : "solid",
    locationName: card.cityName,
    message: `BUILT: ${card.cityName}`,
    subtext: good
      ? `Revenue: $${actualRevenue.toLocaleString()}/mo. This one could be a winner.`
      : `Revenue: $${actualRevenue.toLocaleString()}/mo. Time will tell.`,
    cashFlow: monthlyProfit,
  };

  return { cash, debt, ownedStores, totalStores, cityPool, popup,
    action: { type: "built", cityName: card.cityName, revenue: actualRevenue, profit: monthlyProfit, buildCost: card.buildCost } };
}

/* =================== DESPERATE MEASURES =================== */
function pickDesperateMeasure(ownedStores, cash, lastDanMonth, month) {
  const options = [];

  // Beg Shandon (if cooldown expired)
  if (lastDanMonth === null || (month - lastDanMonth) >= DAN_COOLDOWN_MONTHS) {
    options.push("dan");
  }

  // Blackjack (always available if you have cash)
  if (cash > 0) {
    options.push("blackjack");
  }

  // Lottery (if you can afford it)
  if (cash >= LOTTERY_COST) {
    options.push("lottery");
  }

  // Golf bet (if you can afford it)
  if (cash >= GOLF_BET_COST) {
    options.push("golf");
  }

  // Meme coin (if you can afford it)
  if (cash >= MEMECOIN_COST) {
    options.push("memecoin");
  }

  // Liquidate (if you own stores)
  if (ownedStores.length > 0) {
    options.push("liquidate");
  }

  if (options.length === 0) return null;
  return pick(options);
}

function executeDan() {
  const segment = weightedPick(DAN_WHEEL_SEGMENTS);
  return {
    segment,
    amount: segment.amount,
    message: segment.amount > 0
      ? `Shandon is feeling ${segment.label}! +$${segment.amount.toLocaleString()}`
      : segment.amount < 0
        ? `Shandon says "${segment.label}." You owe him $${Math.abs(segment.amount).toLocaleString()}.`
        : `Shandon says "${segment.label}." No money for you.`,
    success: segment.amount > 0,
  };
}

function executeBlackjack(cash, stakeIndex) {
  const stakePct = BLACKJACK_STAKES[stakeIndex];
  const stakeAmount = Math.round(cash * stakePct);
  const win = Math.random() < BLACKJACK_WIN_CHANCE;
  return {
    stakeAmount,
    stakePct,
    won: win,
    amount: win ? stakeAmount : -stakeAmount,
    message: win
      ? `BLACKJACK! You doubled $${stakeAmount.toLocaleString()}!`
      : `BUST. You lost $${stakeAmount.toLocaleString()}.`,
  };
}

function executeLottery() {
  const win = Math.random() < LOTTERY_WIN_CHANCE;
  return {
    won: win,
    cost: LOTTERY_COST,
    amount: win ? LOTTERY_WIN_AMOUNT - LOTTERY_COST : -LOTTERY_COST,
    message: win
      ? `JACKPOT! $${LOTTERY_WIN_AMOUNT.toLocaleString()}! The odds were 10%. You absolute maniac.`
      : `Nothing. $${LOTTERY_COST.toLocaleString()} gone. The odds were 10%. Better luck next time.`,
  };
}

function executeGolfBet() {
  const win = Math.random() < GOLF_WIN_CHANCE;
  return {
    won: win,
    cost: GOLF_BET_COST,
    amount: win ? GOLF_WIN_AMOUNT - GOLF_BET_COST : -GOLF_BET_COST,
    message: win
      ? `You won the golf bet! +$${(GOLF_WIN_AMOUNT - GOLF_BET_COST).toLocaleString()}. Your buddy is NOT happy.`
      : `Lost the golf bet. -$${GOLF_BET_COST.toLocaleString()}. Your buddy is buying new clubs with YOUR money.`,
  };
}

function executeMemecoin() {
  const roll = Math.random();
  if (roll < MEMECOIN_MOON_CHANCE) {
    // MOON — 10x
    return {
      won: true,
      mooned: true,
      cost: MEMECOIN_COST,
      amount: MEMECOIN_MOON_AMOUNT - MEMECOIN_COST,
      message: `$ACQUIRE TO THE MOON! 10x return! +$${(MEMECOIN_MOON_AMOUNT - MEMECOIN_COST).toLocaleString()}! Your friend is a GENIUS.`,
    };
  }
  if (roll < MEMECOIN_MOON_CHANCE + MEMECOIN_PARTIAL_CHANCE) {
    // 2x
    return {
      won: true,
      mooned: false,
      cost: MEMECOIN_COST,
      amount: MEMECOIN_PARTIAL_AMOUNT - MEMECOIN_COST,
      message: `Meme coin doubled! +$${(MEMECOIN_PARTIAL_AMOUNT - MEMECOIN_COST).toLocaleString()}. Not bad. Not a Lambo, but not bad.`,
    };
  }
  // Rug pull — total loss
  return {
    won: false,
    mooned: false,
    cost: MEMECOIN_COST,
    amount: -MEMECOIN_COST,
    message: `Rug pulled. $${MEMECOIN_COST.toLocaleString()} gone. The coin's website is now a 404. Classic.`,
  };
}

function executeLiquidate(store) {
  const recovery = Math.round((store.purchasePrice || 200_000) * LIQUIDATE_RECOVERY_RATE);
  return {
    storeId: store.id,
    storeName: store.cityName,
    recovery,
    message: `Liquidated ${store.cityName} for $${recovery.toLocaleString()} (50% of purchase price).`,
  };
}

/* =================== STORE CLOSURES =================== */
function updateStoreLossStreaks(ownedStores, streaks) {
  const updated = { ...streaks };
  for (const store of ownedStores) {
    updated[store.id] = store.profit < 0 ? (updated[store.id] || 0) + 1 : 0;
  }
  return updated;
}

function findClosures(streaks) {
  return Object.entries(streaks)
    .filter(([, count]) => count >= CLOSURE_STREAK)
    .map(([id]) => Number(id));
}

/* =================== MONTHLY CASH FLOW =================== */
function computeMonthlyCashFlow(state) {
  let storeCF = 0;
  for (const s of state.ownedStores) {
    storeCF += s.profit;
  }

  let eventCF = 0;
  for (const e of state.activeEvents) eventCF += e.cashFlow;

  const overhead = CORPORATE_OVERHEAD_BASE + (CORPORATE_OVERHEAD_PER_STORE * state.ownedStores.length);
  const debtInterest = Math.round(state.debt * DEBT_INTEREST_RATE);

  const net = storeCF + eventCF - overhead;

  return { storeCF, eventCF, overhead, debtInterest, net };
}

/* =================== INITIAL STATE =================== */
function createInitialState() {
  const cityPool = generateCityPool();
  const cards = generateDealCards(cityPool, [], 1);
  const desperateMeasure = pickDesperateMeasure([], STARTING_CASH, null, 1);

  return {
    phase: "playing",       // "playing" | "ended" | "lost"
    month: 1,
    cash: STARTING_CASH,
    debt: 0,
    cityPool,
    ownedStores: [],
    totalStores: 0,
    activeEvents: [],
    eventLog: [],
    storeLossStreaks: {},

    // 5-card system
    cards,
    selectedCardIndex: null,  // 0-4 or null
    hasConfirmed: false,
    hasPassed: false,
    dealQualityMsg: null,     // feedback after confirming
    postCloseEvent: null,     // wild event after confirming

    // Deal history — track tier of each picked card for investor accuracy grade
    dealHistory: [],           // array of { month, tier } objects

    // Desperate measures
    desperateMeasure,         // "dan" | "blackjack" | "lottery" | "liquidate" | null
    desperateUsed: false,     // used this month?
    lastDanMonth: null,

    // Month lifecycle
    monthActions: { deal: null, event: null, closures: [], desperate: null },
    popup: null,
    showMonthReport: false,
    monthReport: null,
  };
}

/* =================== REDUCER =================== */
function reducer(state, action) {
  switch (action.type) {

    case "SELECT_CARD": {
      if (state.hasConfirmed || state.hasPassed) return state;
      const { index } = action;
      // Toggle selection (deselect if same card clicked again)
      const newIndex = state.selectedCardIndex === index ? null : index;
      return { ...state, selectedCardIndex: newIndex };
    }

    case "CONFIRM_SELECTION": {
      if (state.hasConfirmed || state.hasPassed) return state;
      if (state.selectedCardIndex === null) return state;

      const card = state.cards[state.selectedCardIndex];
      if (!card) return state;

      // Check affordability
      const cost = card.type === "acquire" ? card.downPayment : card.buildCost;
      if (state.cash < cost) return state;

      // Execute the deal
      const result = executeDeal(card, state);
      if (!result) return state;

      // --- Deal quality: rank all affordable cards by actualProfit ---
      const affordableCards = state.cards.filter(c => state.cash >= c.cost);
      const sorted = [...affordableCards].sort((a, b) => b.actualProfit - a.actualProfit);
      const bestTier = sorted.length > 0 ? sorted[0].tier : null;
      const worstTier = sorted.length > 0 ? sorted[sorted.length - 1].tier : null;
      const chosenRank = sorted.findIndex(c => c.cityId === card.cityId);
      let dealQualityMsg = pick(DEAL_QUALITY_GOOD);
      if (chosenRank === 0) dealQualityMsg = pick(DEAL_QUALITY_BEST);
      else if (chosenRank === sorted.length - 1 && sorted.length > 1) dealQualityMsg = pick(DEAL_QUALITY_WORST);

      // --- Post-close wild event (35% chance) ---
      let postCloseEvent = null;
      if (Math.random() < POST_CLOSE_CHANCE) {
        // 50/50 good or bad
        const isGood = Math.random() < 0.5;
        const eventList = isGood ? POST_CLOSE_GOOD_EVENTS : POST_CLOSE_BAD_EVENTS;
        const narrativeList = isGood ? POST_CLOSE_GOOD_NARRATIVES : POST_CLOSE_BAD_NARRATIVES;
        const evt = pick(eventList);
        const narrative = pick(narrativeList);

        // Describe the deal quality for the narrative
        const qualityWord = (card.tier === "great" || card.tier === "good") ? "great"
          : (card.tier === "ok") ? "solid"
          : (card.tier === "mediocre") ? "okay"
          : "rough";

        postCloseEvent = {
          isGood,
          eventLabel: evt.label,
          profitDelta: evt.profitDelta,
          narrative: narrative.replace("{quality}", qualityWord).replace("{event}", evt.label),
        };

        // Modify the store's profit in ownedStores
        const storeId = card.cityId;
        result.ownedStores = result.ownedStores.map(s =>
          s.id === storeId
            ? { ...s, profit: s.profit + evt.profitDelta }
            : s
        );
      }

      return {
        ...state,
        cash: result.cash,
        debt: result.debt,
        ownedStores: result.ownedStores,
        totalStores: result.totalStores,
        cityPool: result.cityPool,
        hasConfirmed: true,
        dealQualityMsg,
        postCloseEvent,
        monthActions: { ...state.monthActions, deal: result.action },
        popup: result.popup,
        dealHistory: [...state.dealHistory, { month: state.month, tier: card.tier }],
      };
    }

    case "PASS_ALL": {
      if (state.hasConfirmed || state.hasPassed) return state;
      return { ...state, hasPassed: true, selectedCardIndex: null };
    }

    case "DESPERATE_ACTION": {
      if (state.desperateUsed) return state;
      const { actionType, params } = action;

      let s = { ...state, desperateUsed: true };

      if (actionType === "dan") {
        const result = executeDan();
        s = {
          ...s,
          cash: s.cash + result.amount,
          lastDanMonth: s.month,
          monthActions: { ...s.monthActions, desperate: { type: "dan", ...result } },
          popup: {
            type: result.success ? "homerun" : result.amount < 0 ? "lemon" : "solid",
            message: "BEG SHANDON FOR MONEY",
            subtext: result.message,
            cashFlow: result.amount,
          },
        };
      }

      if (actionType === "blackjack") {
        const result = executeBlackjack(s.cash, params?.stakeIndex ?? 0);
        s = {
          ...s,
          cash: s.cash + result.amount,
          monthActions: { ...s.monthActions, desperate: { type: "blackjack", ...result } },
          popup: {
            type: result.won ? "homerun" : "lemon",
            message: result.won ? "BLACKJACK!" : "BUST!",
            subtext: result.message,
            cashFlow: result.amount,
          },
        };
      }

      if (actionType === "lottery") {
        const result = executeLottery();
        s = {
          ...s,
          cash: s.cash + result.amount,
          monthActions: { ...s.monthActions, desperate: { type: "lottery", ...result } },
          popup: {
            type: result.won ? "homerun" : "lemon",
            message: result.won ? "JACKPOT!" : "BETTER LUCK NEVER",
            subtext: result.message,
            cashFlow: result.amount,
          },
        };
      }

      if (actionType === "golf") {
        const result = executeGolfBet();
        s = {
          ...s,
          cash: s.cash + result.amount,
          monthActions: { ...s.monthActions, desperate: { type: "golf", ...result } },
          popup: {
            type: result.won ? "homerun" : "lemon",
            message: result.won ? "GOLF PRO!" : "TRIPLE BOGEY",
            subtext: result.message,
            cashFlow: result.amount,
          },
        };
      }

      if (actionType === "memecoin") {
        const result = executeMemecoin();
        s = {
          ...s,
          cash: s.cash + result.amount,
          monthActions: { ...s.monthActions, desperate: { type: "memecoin", ...result } },
          popup: {
            type: result.won ? "homerun" : "lemon",
            message: result.mooned ? "TO THE MOON! 🚀" : result.won ? "GAINS!" : "RUG PULLED",
            subtext: result.message,
            cashFlow: result.amount,
          },
        };
      }

      if (actionType === "liquidate") {
        const store = s.ownedStores.find(st => st.id === params?.storeId);
        if (!store) return state;
        const result = executeLiquidate(store);
        s = {
          ...s,
          cash: s.cash + result.recovery,
          ownedStores: s.ownedStores.filter(st => st.id !== store.id),
          totalStores: s.totalStores - 1,
          cityPool: s.cityPool.map(c => c.id === store.id ? { ...c, status: "available" } : c),
          monthActions: { ...s.monthActions, desperate: { type: "liquidate", ...result } },
          popup: {
            type: "solid",
            message: "STORE LIQUIDATED",
            subtext: result.message,
            cashFlow: result.recovery,
          },
        };
        // Remove loss streak entry
        const newStreaks = { ...s.storeLossStreaks };
        delete newStreaks[store.id];
        s.storeLossStreaks = newStreaks;
      }

      return s;
    }

    case "CLOSE_POPUP":
      return { ...state, popup: null };

    case "STORE_INITIATIVE": {
      const { storeId } = action;
      const store = state.ownedStores.find(s => s.id === storeId);
      if (!store) return state;
      if (store.profit >= 0) return state; // only losing stores
      if (state.cash < INITIATIVE_COST) return state;

      const success = Math.random() < INITIATIVE_SUCCESS_CHANCE;
      const outcomes = success ? INITIATIVE_GOOD_OUTCOMES : INITIATIVE_BAD_OUTCOMES;
      const outcome = pick(outcomes);

      const updatedStores = state.ownedStores.map(s =>
        s.id === storeId
          ? { ...s, profit: s.profit + outcome.profitDelta }
          : s
      );

      const newProfit = store.profit + outcome.profitDelta;
      const popupType = success ? "homerun" : "lemon";

      return {
        ...state,
        cash: state.cash - INITIATIVE_COST,
        ownedStores: updatedStores,
        popup: {
          type: popupType,
          message: success ? "INITIATIVE WORKED!" : "INITIATIVE BACKFIRED",
          subtext: outcome.label,
          cashFlow: outcome.profitDelta,
          locationName: store.cityName,
        },
        eventLog: [
          { month: state.month, text: `${store.cityName}: ${outcome.label} (${outcome.profitDelta >= 0 ? "+" : ""}$${outcome.profitDelta.toLocaleString()}/mo)` },
          ...state.eventLog,
        ].slice(0, 20),
      };
    }

    case "ADVANCE_MONTH": {
      // Must have confirmed or passed
      if (!state.hasConfirmed && !state.hasPassed) return state;

      const month = state.month + 1;
      const cf = computeMonthlyCashFlow(state);
      let cash = state.cash + cf.net;
      let debt = state.debt + cf.debtInterest;

      // Tick events
      let activeEvents = state.activeEvents
        .map(e => ({ ...e, remaining: e.remaining - 1 }))
        .filter(e => e.remaining > 0);

      // Random event (25%)
      let newEvent = null;
      if (state.ownedStores.length > 0 && Math.random() < 0.25) {
        const pool = Math.random() < 0.40 ? POSITIVE_EVENTS : NEGATIVE_EVENTS;
        const evt = pick(pool);
        newEvent = { ...evt, remaining: evt.duration };
        activeEvents.push(newEvent);
      }

      // Store loss streaks & closures
      let streaks = updateStoreLossStreaks(state.ownedStores, state.storeLossStreaks);
      const closureIds = findClosures(streaks);
      let ownedStores = [...state.ownedStores];
      let totalStores = state.totalStores;
      const closures = [];
      for (const cid of closureIds) {
        const closed = ownedStores.find(s => s.id === cid);
        if (closed) {
          closures.push(closed);
          ownedStores = ownedStores.filter(s => s.id !== cid);
          totalStores -= 1;
          cash -= CLOSURE_COST;
          delete streaks[cid];
        }
      }

      // Event log
      let eventLog = [...state.eventLog];
      if (newEvent) eventLog = [{ ...newEvent, month: state.month }, ...eventLog].slice(0, 20);

      // Month report
      const monthReport = {
        month: state.month,
        netCashFlow: cf.net,
        storeCF: cf.storeCF,
        eventCF: cf.eventCF,
        overhead: cf.overhead,
        debtInterest: cf.debtInterest,
        actions: state.monthActions,
        closures,
        totalStores,
        cash,
        debt,
        runway: cf.net >= 0 ? 999 : Math.floor(cash / Math.abs(cf.net)),
        dealQualityMsg: state.dealQualityMsg,
        postCloseEvent: state.postCloseEvent,
        randomEvent: newEvent,
        activeEvents,
        hadDesperateOption: !!state.desperateMeasure && !state.desperateUsed,
        desperateMeasureType: (!state.desperateUsed && state.desperateMeasure) ? state.desperateMeasure : null,
      };

      // Phase check
      let phase = state.phase;
      if (cash <= 0) {
        phase = "lost"; // bankruptcy — game over immediately
      } else if (month > MAX_MONTHS) {
        phase = "ended"; // month 36 reached — go to end screen + wheel
      }

      // Generate new cards for next month (unless game is over)
      let newCards = [];
      let newDesperateMeasure = null;
      if (phase === "playing") {
        newCards = generateDealCards(state.cityPool, ownedStores, month);
        newDesperateMeasure = pickDesperateMeasure(ownedStores, cash, state.lastDanMonth, month);
      }

      return {
        ...state,
        phase,
        month,
        cash,
        debt,
        ownedStores,
        totalStores,
        activeEvents,
        eventLog,
        storeLossStreaks: streaks,

        // Reset card selection for next month
        cards: newCards,
        selectedCardIndex: null,
        hasConfirmed: false,
        hasPassed: false,
        dealQualityMsg: null,
        postCloseEvent: null,

        // Desperate measures
        desperateMeasure: newDesperateMeasure,
        desperateUsed: false,

        // Month lifecycle
        monthActions: { deal: null, event: newEvent, closures, desperate: null },
        popup: null,
        showMonthReport: true,
        monthReport,
      };
    }

    case "CLOSE_MONTH_REPORT":
      return { ...state, showMonthReport: false };

    case "RESET_GAME":
      return createInitialState();

    default:
      return state;
  }
}

/* =================== HOOK =================== */
export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  const cf = useMemo(() => computeMonthlyCashFlow(state), [
    state.ownedStores, state.activeEvents, state.debt,
  ]);

  const monthsOfRunway = cf.net >= 0 ? 999 : Math.floor(state.cash / Math.abs(cf.net));
  const monthsRemaining = MAX_MONTHS - state.month + 1;
  const canAdvance = state.hasConfirmed || state.hasPassed;

  return {
    state,
    storeCF: cf.storeCF,
    eventCF: cf.eventCF,
    overhead: cf.overhead,
    debtInterest: cf.debtInterest,
    netCashFlow: cf.net,
    monthsOfRunway,
    monthsRemaining,
    canAdvance,

    // Card actions
    selectCard: (index) => dispatch({ type: "SELECT_CARD", index }),
    confirmSelection: () => dispatch({ type: "CONFIRM_SELECTION" }),
    passAll: () => dispatch({ type: "PASS_ALL" }),

    // Desperate measures
    desperateAction: (actionType, params) =>
      dispatch({ type: "DESPERATE_ACTION", actionType, params }),

    // Store initiatives
    storeInitiative: (storeId) =>
      dispatch({ type: "STORE_INITIATIVE", storeId }),

    // Lifecycle
    closePopup: () => dispatch({ type: "CLOSE_POPUP" }),
    advanceMonth: () => dispatch({ type: "ADVANCE_MONTH" }),
    closeMonthReport: () => dispatch({ type: "CLOSE_MONTH_REPORT" }),
    resetGame: () => dispatch({ type: "RESET_GAME" }),
  };
}
