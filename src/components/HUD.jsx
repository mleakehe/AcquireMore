import { CLOSURE_STREAK } from "../data/constants";

export default function HUD({
  cash,
  debt,
  debtInterest,
  netCashFlow,
  overhead,
  monthsOfRunway,
  ownedStores,
  activeEvents,
  eventLog,
  downturn,
  storeLossStreaks,
}) {
  const cashColor = cash > 500000
    ? "#00ff88"
    : cash > 200000
      ? "#ffdd00"
      : "#ff3344";

  const isLowRunway = monthsOfRunway <= 3 && monthsOfRunway !== Infinity;

  // Stores at risk of closure (2 consecutive losses with streak of 3)
  const atRiskStores = ownedStores.filter(s => {
    const streak = storeLossStreaks[s.id] || 0;
    return streak >= 2 && streak < CLOSURE_STREAK;
  });

  return (
    <div className="hud-panel">
      {downturn?.active && (
        <div className="downturn-banner">
          📉 MARKET DOWNTURN — Revenue -25% | Debt rate 2.5%/mo | Prices discounted
        </div>
      )}

      <div className="hud-stat">
        <span className="hud-label">CASH</span>
        <span className="hud-value" style={{ color: cashColor }}>
          ${cash.toLocaleString()}
        </span>
      </div>

      <div className="hud-stat">
        <span className="hud-label">MONTHLY CASHFLOW</span>
        <span className={`hud-value ${netCashFlow < 0 ? "burn-negative" : "burn-positive"}`}>
          {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toLocaleString()}/mo
        </span>
      </div>

      <div className="hud-stat debt-stat">
        <span className="hud-label debt-label">DEBT MONSTER</span>
        <span className="hud-value debt-value">
          ${debt.toLocaleString()}
        </span>
        {debt > 0 && (
          <span className="hud-sub-detail debt-growth">
            Growing +${debtInterest.toLocaleString()}/mo{downturn?.active ? " (downturn rate)" : ""}
          </span>
        )}
      </div>

      <div className={`hud-stat ${isLowRunway ? "runway-warning" : ""}`}>
        <span className="hud-label">RUNWAY</span>
        <span className={`hud-value ${isLowRunway ? "runway-critical" : ""}`}>
          {monthsOfRunway === Infinity || monthsOfRunway >= 999 ? "∞" : `${monthsOfRunway} months`}
        </span>
      </div>

      {isLowRunway && (
        <div className="warning-banner">
          ⚠️ CASH IS RUNNING OUT. MAKE SMART MOVES.
        </div>
      )}

      {atRiskStores.length > 0 && (
        <div className="closure-warnings">
          <span className="hud-label" style={{ color: "#ff3344" }}>⚠️ CLOSURE RISK</span>
          {atRiskStores.map(s => (
            <div key={s.id} className="closure-risk-item">
              <span>{s.cityName}</span>
              <span className="closure-risk-streak">
                {storeLossStreaks[s.id]}/{CLOSURE_STREAK} losing months
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="hud-divider" />

      {activeEvents.length > 0 && (
        <div className="hud-events-active">
          <span className="hud-label">ACTIVE EFFECTS</span>
          {activeEvents.map((evt, i) => (
            <div key={i} className={`event-active-item ${evt.cashFlow > 0 ? "event-pos" : "event-neg"}`}>
              <span>{evt.cashFlow > 0 ? "+" : ""}${evt.cashFlow.toLocaleString()}/mo</span>
              <span className="event-duration">{evt.remaining}mo left</span>
            </div>
          ))}
        </div>
      )}

      <div className="hud-event-log">
        <span className="hud-label">EVENT LOG</span>
        <div className="event-log-scroll">
          {eventLog.length === 0 && (
            <p className="event-log-empty">No events yet. Bliss is temporary.</p>
          )}
          {eventLog.map((e, i) => (
            <div key={i} className="event-log-item">
              <span className="event-log-month">M{e.month}</span>
              <span className="event-log-text">{e.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
