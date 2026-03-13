import { CLOSURE_STREAK, CORPORATE_OVERHEAD_BASE, CORPORATE_OVERHEAD_PER_STORE } from "../data/constants";

const fmt = (n) => "$" + Math.abs(Math.round(n)).toLocaleString();
const fmtSigned = (n) => (n >= 0 ? "+" : "-") + fmt(n);

export default function StoreGrid({ ownedStores, storeLossStreaks, storeCF, overhead, netCashFlow, cash, onStoreClick }) {
  const storeCount = ownedStores?.length || 0;

  if (storeCount === 0) {
    return (
      <div className="store-grid-container">
        <div className="store-grid-header">YOUR EMPIRE</div>
        <div className="store-grid-empty">
          <div className="store-grid-empty-inner">
            <span className="empty-icon">🏪</span>
            NO STORES YET
            <br />
            PICK A DEAL TO GET STARTED
          </div>
        </div>
        <CashFlowFooter
          storeCF={storeCF}
          overhead={overhead}
          netCashFlow={netCashFlow}
          storeCount={storeCount}
        />
      </div>
    );
  }

  const profitable = ownedStores.filter(s => s.profit > 0).length;

  return (
    <div className="store-grid-container">
      <div className="store-grid-header">
        YOUR EMPIRE &mdash; <span>{storeCount}</span> STORE{storeCount !== 1 ? "S" : ""}
        {" "}({profitable} profitable)
      </div>
      <div className="store-grid">
        {ownedStores.map(store => {
          const isPositive = store.profit > 0;
          const streak = storeLossStreaks?.[store.id] || 0;
          const icon = store.source === "acquired" ? "🏪" : "🔨";

          const clickable = !isPositive && onStoreClick;
          return (
            <div
              key={store.id}
              className={`store-thumb ${isPositive ? "store-thumb-positive" : "store-thumb-negative"} ${clickable ? "store-thumb-clickable" : ""}`}
              onClick={clickable ? () => onStoreClick(store.id) : undefined}
            >
              <div className={`store-thumb-indicator ${isPositive ? "indicator-positive" : "indicator-negative"}`} />
              <div className="store-thumb-icon">{icon}</div>
              <div className="store-thumb-name">{store.cityName}</div>
              <div className="store-thumb-type">
                {store.source === "acquired" ? "ACQUIRED" : "BUILT"}
              </div>
              <div className={`store-thumb-profit ${isPositive ? "profit-positive" : "profit-negative"}`}>
                {store.profit >= 0 ? "+" : ""}${store.profit.toLocaleString()}/mo
              </div>
              {streak >= 2 && (
                <div className="store-thumb-streak">
                  {streak}/{CLOSURE_STREAK} LOSSES
                </div>
              )}
              {clickable && (
                <div className="store-thumb-fix-hint">🎲 FIX IT?</div>
              )}
            </div>
          );
        })}
      </div>
      <CashFlowFooter
        storeCF={storeCF}
        overhead={overhead}
        netCashFlow={netCashFlow}
        storeCount={storeCount}
      />
    </div>
  );
}

function CashFlowFooter({ storeCF, overhead, netCashFlow, storeCount }) {
  const companyCF = storeCF - overhead;

  return (
    <div className="cf-footer">
      {/* Total Store Cashflow */}
      <div className="cf-footer-line">
        <span className="cf-footer-label">TOTAL STORE CASHFLOW</span>
        <span className={`cf-footer-value ${storeCF >= 0 ? "cf-pos" : "cf-neg"}`}>
          {fmtSigned(storeCF)}/mo
        </span>
      </div>

      {/* HQ Card — looks like a store thumb but for corporate */}
      <div className="store-thumb store-thumb-hq">
        <div className="store-thumb-icon">🏢</div>
        <div className="store-thumb-name">ILP HQ</div>
        <div className="store-thumb-type">CORPORATE OVERHEAD</div>
        <div className="store-thumb-profit profit-negative">
          -${overhead.toLocaleString()}/mo
        </div>
        <div className="hq-breakdown">
          ${CORPORATE_OVERHEAD_BASE.toLocaleString()} base + ${CORPORATE_OVERHEAD_PER_STORE.toLocaleString()} × {storeCount} stores
        </div>
      </div>

      {/* Net Company Cashflow */}
      <div className="cf-footer-total">
        <span className="cf-footer-total-label">NET COMPANY CASHFLOW</span>
        <span className={`cf-footer-total-value ${companyCF >= 0 ? "cf-pos" : "cf-neg"}`}>
          {fmtSigned(companyCF)}/mo
        </span>
      </div>
    </div>
  );
}
