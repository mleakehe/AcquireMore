import { useMemo } from "react";
import { CARD_DEAL_PHRASES, CANT_AFFORD_MESSAGES } from "../data/constants";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => "$" + Math.abs(Math.round(n)).toLocaleString();
const fmtSigned = (n) => (n >= 0 ? "+" : "-") + "$" + Math.abs(Math.round(n)).toLocaleString();

export default function CardPanel({
  cards,
  selectedCardIndex,
  hasConfirmed,
  hasPassed,
  cash,
  onSelect,
  onConfirm,
  onPass,
  month,
  dealQualityMsg,
  postCloseEvent,
}) {
  const flavor = useMemo(
    () => pick(CARD_DEAL_PHRASES).replace("{month}", month),
    [month]
  );

  const cantAffordMsgs = useMemo(() => {
    return cards.map(() => pick(CANT_AFFORD_MESSAGES));
  }, [cards]);

  if (!cards || cards.length === 0) return null;

  const done = hasConfirmed || hasPassed;

  return (
    <div className="card-panel">
      <p className="card-flavor">{flavor}</p>
      <div className="card-grid-6">
        {cards.map((card, i) => (
          <DealCard
            key={`${card.cityId}-${i}`}
            card={card}
            index={i}
            isSelected={selectedCardIndex === i}
            hasConfirmed={hasConfirmed}
            hasPassed={hasPassed}
            cash={cash}
            cantAffordMsg={cantAffordMsgs[i]}
            onSelect={onSelect}
            dealQualityMsg={dealQualityMsg}
            postCloseEvent={postCloseEvent}
          />
        ))}
      </div>
      {!done && (
        <div className="card-action-bar">
          <button
            className="card-btn-confirm"
            disabled={selectedCardIndex === null}
            onClick={onConfirm}
          >
            {selectedCardIndex !== null
              ? `CONFIRM DEAL — ${cards[selectedCardIndex].cityName}`
              : "SELECT A CARD ABOVE"}
          </button>
          <button className="card-btn-pass-all" onClick={onPass}>
            PASS ON ALL
          </button>
        </div>
      )}
      {done && (
        <div className="card-action-bar">
          <div className="card-done-msg">
            {hasConfirmed ? "✓ DEAL CONFIRMED" : "✕ PASSED ON ALL"}
          </div>
        </div>
      )}
    </div>
  );
}

function DealCard({ card, index, isSelected, hasConfirmed, hasPassed, cash, cantAffordMsg, onSelect, dealQualityMsg, postCloseEvent }) {
  const canAfford = cash >= card.cost;
  const done = hasConfirmed || hasPassed;
  const isConfirmed = hasConfirmed && isSelected;
  const isDimmed = done && !isConfirmed;
  const isAcq = card.type === "acquire";

  let cardClass = "deal-card";
  if (isAcq) cardClass += " deal-card-acq";
  else cardClass += " deal-card-build";
  if (isSelected && !done) cardClass += " deal-card-selected";
  if (isConfirmed) cardClass += " deal-card-confirmed";
  if (isDimmed) cardClass += " deal-card-dimmed";
  if (!canAfford && !done) cardClass += " deal-card-unaffordable";

  const handleClick = () => {
    if (done) return;
    if (!canAfford) return;
    onSelect(index);
  };

  return (
    <div className={cardClass} onClick={handleClick}>
      {/* Confirmation overlay */}
      {isConfirmed && <div className="card-check-overlay">✓</div>}
      {hasPassed && <div className="card-x-overlay">✕</div>}

      {/* Type badge */}
      <div className={`card-type-badge ${isAcq ? "badge-acq" : "badge-build"}`}>
        {isAcq ? "🏪 ACQUISITION" : "🔨 NEW BUILD"}
      </div>

      {/* City name */}
      <div className="card-city">{card.cityName}</div>

      {/* Signal attributes */}
      <div className="card-signals">
        <SignalRow label="Population (3mi)" value={card.population.toLocaleString()} />
        <SignalRow label="Location" value={card.locationType.label} />
        <SignalRow label="Competition" value={card.competition.label} />
        <SignalRow
          label={isAcq ? "Revenue (trailing)" : "Revenue (projected)"}
          value={isAcq
            ? `${fmt(card.revenue)}/mo`
            : `${fmt(card.revenueRange.min)} – ${fmt(card.revenueRange.max)}/mo`}
          highlight
        />
        <SignalRow label="Contrib. Margin" value={`${card.cm.label} (${Math.round(card.cm.rate * 100)}%)`} highlight />
        <SignalRow label="Operating Costs" value={`$20,000/mo`} />
        <SignalRow label="Lease" value={`${fmt(card.leaseRate)}/mo`} />
        {isAcq && (
          <SignalRow
            label="Store Age"
            value={`${card.storeAge} yr${card.storeAge !== 1 ? "s" : ""} (${card.ageBracket.label})`}
          />
        )}
      </div>

      {/* Financials */}
      <div className="card-financials">
        {isAcq ? (
          <>
            <div className="card-fin-row">
              <span>Purchase Price</span>
              <span>{fmt(card.price)}</span>
            </div>
            <div className="card-fin-row">
              <span>Down ({Math.round(card.downPct * 100)}%)</span>
              <span className="card-orange">{fmt(card.downPayment)}</span>
            </div>
            <div className="card-fin-row">
              <span>Debt</span>
              <span className="card-red">{fmt(card.debtTaken)}</span>
            </div>
          </>
        ) : (
          <div className="card-fin-row">
            <span>Build Cost</span>
            <span className="card-orange">{fmt(card.buildCost)}</span>
          </div>
        )}
      </div>

      {/* Can't afford message */}
      {!canAfford && !done && (
        <div className="card-cant-afford">{cantAffordMsg}</div>
      )}

      {/* Post-confirmation feedback — only on the confirmed card */}
      {isConfirmed && (dealQualityMsg || postCloseEvent) && (
        <div className="card-post-close">
          {dealQualityMsg && (
            <div className="card-quality-msg">{dealQualityMsg}</div>
          )}
          {postCloseEvent && (
            <div className={`card-wild-event ${postCloseEvent.isGood ? "wild-good" : "wild-bad"}`}>
              <div className="wild-event-icon">{postCloseEvent.isGood ? "🍀" : "💀"}</div>
              <div className="wild-event-text">{postCloseEvent.narrative}</div>
              <div className={`wild-event-impact ${postCloseEvent.isGood ? "cf-pos" : "cf-neg"}`}>
                {fmtSigned(postCloseEvent.profitDelta)}/mo to store profit
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SignalRow({ label, value, highlight }) {
  return (
    <div className={`signal-row ${highlight ? "signal-highlight" : ""}`}>
      <span className="signal-label">{label}</span>
      <span className="signal-value">{value}</span>
    </div>
  );
}
