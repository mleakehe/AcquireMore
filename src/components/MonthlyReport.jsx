import {
  DIARY_TITLES, DIARY_OPENINGS, PARTNER_REFERENCES,
  DAN_DEAL_GOOD, DAN_DEAL_BAD,
  DAN_BUILD_GOOD, DAN_BUILD_BAD,
  DAN_PASSED, DAN_WILD_EVENT_GOOD, DAN_WILD_EVENT_BAD,
  DAN_RANDOM_EVENT,
  DAN_CLOSURE, DAN_DESPERATE, DAN_NO_GAMBLE, DAN_GAMBLING_RESISTANCE, DAN_SIGNOFFS,
  DAN_DOWNTURN_START, DAN_DOWNTURN_END,
  MAX_MONTHS,
} from "../data/constants";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmt(n) {
  const prefix = n >= 0 ? "+$" : "-$";
  return prefix + Math.abs(n).toLocaleString();
}

function fmtPlain(n) {
  return "$" + Math.abs(Math.round(n)).toLocaleString();
}

function generateLetter(report) {
  const { month, netCashFlow, actions, closures, downturnEvent, postCloseEvent, dealQualityMsg, randomEvent, activeEvents, desperateMeasureType } = report;

  // Determine performance bucket (drives title/opening tone)
  let bucket;
  if (netCashFlow > 30000) bucket = "great";
  else if (netCashFlow >= 0) bucket = "ok";
  else if (netCashFlow >= -30000) bucket = "bad";
  else bucket = "critical";

  // Diary title (replaces email subject)
  const title = pick(DIARY_TITLES[bucket]).replace("{month}", String(month));

  // Pick a random partner reference
  const partnerRef = pick(PARTNER_REFERENCES);

  // Opening — "Dear Diary" with partner reference baked in
  const opening = pick(DIARY_OPENINGS[bucket])
    .replace("{month}", String(month))
    .replace("{partnerRef}", partnerRef);

  // Bullets — focus on what happened, not numbers
  const bullets = [];

  // 1. Deal bullet (acquisition or build)
  if (actions.deal) {
    const deal = actions.deal;
    const isProfit = deal.profit > 0;

    if (deal.type === "acquired") {
      const templates = isProfit ? DAN_DEAL_GOOD : DAN_DEAL_BAD;
      bullets.push(
        pick(templates)
          .replace("{city}", deal.cityName)
          .replace("{revenue}", fmtPlain(deal.revenue) + "/mo")
          .replace("{cost}", fmtPlain(deal.downPayment))
      );
    } else {
      const templates = isProfit ? DAN_BUILD_GOOD : DAN_BUILD_BAD;
      bullets.push(
        pick(templates)
          .replace("{city}", deal.cityName)
          .replace("{revenue}", fmtPlain(deal.revenue) + "/mo")
      );
    }

    // Deal quality removed from diary — shown on card after confirming
  } else {
    bullets.push(pick(DAN_PASSED));
  }

  // 2. Post-close wild event (tied to the deal)
  if (postCloseEvent && actions.deal) {
    const templates = postCloseEvent.isGood ? DAN_WILD_EVENT_GOOD : DAN_WILD_EVENT_BAD;
    bullets.push(
      pick(templates)
        .replace("{event}", postCloseEvent.eventLabel)
        .replace("{city}", actions.deal.cityName)
        .replace("{delta}", fmt(postCloseEvent.profitDelta))
    );
  }

  // 3. Desperate measure (if used) or gambling resistance (ALWAYS)
  if (actions.desperate) {
    const d = actions.desperate;
    const templates = DAN_DESPERATE[d.type] || [];
    if (templates.length > 0) {
      let text = pick(templates).replace("{result}", d.message);
      if (d.type === "liquidate") {
        text = text
          .replace("{city}", d.storeName || "a store")
          .replace("{amount}", fmtPlain(d.recovery || 0));
      }
      bullets.push(text);
    }
  } else if (report.hadDesperateOption) {
    // Didn't gamble — boast about it with type-specific text
    const noGamblePool = DAN_NO_GAMBLE[desperateMeasureType] || DAN_NO_GAMBLE._fallback;
    bullets.push(pick(noGamblePool));
  } else {
    // No desperate measure offered — still always reference resisting gambling/lottery
    bullets.push(pick(DAN_GAMBLING_RESISTANCE));
  }

  // 4. Closures
  if (closures && closures.length > 0) {
    for (const closed of closures) {
      bullets.push(
        pick(DAN_CLOSURE).replace("{city}", closed.cityName)
      );
    }
  }

  // 5. Random monthly event (outside your control)
  if (randomEvent) {
    bullets.push(
      pick(DAN_RANDOM_EVENT).replace("{event}", randomEvent.text)
    );
  }

  // 6. Ongoing events (active events still ticking)
  if (activeEvents && activeEvents.length > 0) {
    const ongoing = activeEvents.filter(e => e.remaining > 0 && e !== randomEvent);
    if (ongoing.length > 0) {
      const evtTexts = ongoing.map(e =>
        `"${e.text}" (${e.remaining}mo left)`
      );
      bullets.push("• Ongoing situations: " + evtTexts.join("; "));
    }
  }

  // Downturn P.S.
  let ps = null;
  if (downturnEvent === "start") {
    ps = pick(DAN_DOWNTURN_START);
  } else if (downturnEvent === "end") {
    ps = pick(DAN_DOWNTURN_END);
  }

  // Sign-off — ALWAYS unreasonably optimistic
  const signoff = pick(DAN_SIGNOFFS);

  return { title, opening, bullets, signoff, ps };
}

function getButtonText(netCashFlow) {
  if (netCashFlow > 20000) return "CLOSE DIARY (FEELING DANGEROUS)";
  if (netCashFlow < -10000) return "CLOSE DIARY (SWEATING)";
  return "CLOSE DIARY";
}

export default function MonthlyReport({ report, onClose }) {
  if (!report) return null;

  const letter = generateLetter(report);
  const buttonText = getButtonText(report.netCashFlow);

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-box dan-letter" onClick={e => e.stopPropagation()}>
        {/* Diary header */}
        <div className="diary-header">
          <div className="diary-icon">📓</div>
          <div className="diary-title">{letter.title}</div>
        </div>

        <div className="report-divider" />

        {/* Opening (Dear Diary + partner ref baked in) */}
        <p className="dan-greeting">{letter.opening}</p>

        {/* Bullet list */}
        <div className="dan-bullets">
          {letter.bullets.map((b, i) => (
            <p key={i} className="dan-bullet">{b}</p>
          ))}
        </div>

        {/* P.S. (downturn) */}
        {letter.ps && (
          <p className="dan-ps">{letter.ps}</p>
        )}

        <div className="report-divider" />

        {/* Sign-off */}
        <pre className="dan-signoff">{letter.signoff}</pre>

        <button className="report-btn" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
