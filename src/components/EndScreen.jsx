import { useState, useEffect, useCallback } from "react";
import { playWin } from "../utils/sound";
import ValuationWheel from "./ValuationWheel";
import { submitScore } from "../utils/leaderboard";

export default function EndScreen({ month, totalStores, ownedStores, netCashFlow, debt, cash, onRestart, onShowLeaderboard }) {
  const [phase, setPhase] = useState("summary");
  const [result, setResult] = useState(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { playWin(); }, []);

  const builds = ownedStores.filter(s => s.source === "built").length;
  const acquisitions = ownedStores.filter(s => s.source === "acquired").length;
  const positiveStores = ownedStores.filter(s => s.profit > 0).length;
  const negativeStores = ownedStores.filter(s => s.profit <= 0).length;
  const bestStore = ownedStores.length > 0
    ? ownedStores.reduce((a, b) => b.profit > a.profit ? b : a)
    : null;
  const worstStore = ownedStores.length > 0
    ? ownedStores.reduce((a, b) => b.profit < a.profit ? b : a)
    : null;

  const handleWheelComplete = useCallback((res) => {
    setResult(res);
    setPhase("name");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const entry = {
      name: name.trim(),
      valuation: result.finalValuation,
      multiple: result.multiple,
      monthsSurvived: month,
      date: new Date().toISOString().split("T")[0],
      stores: totalStores,
      debt,
      builds,
      acquisitions,
    };
    await submitScore(entry);
    setSubmitting(false);
    setPhase("done");
    onShowLeaderboard();
  }

  const [confetti, setConfetti] = useState([]);
  useEffect(() => {
    if (totalStores >= 20) {
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
        color: ["#00c8ff", "#ff6b00", "#00ff88", "#ffdd00", "#ff3344"][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 8,
      }));
      setConfetti(pieces);
    }
  }, [totalStores]);

  const headlineText = totalStores >= 30
    ? "EMPIRE BUILDER"
    : totalStores >= 20
      ? "SOLID OPERATOR"
      : totalStores >= 10
        ? "GETTING THERE"
        : totalStores >= 5
          ? "HUMBLE BEGINNINGS"
          : "FRANCHISE TOURIST";

  const subtitleText = totalStores >= 30
    ? `30+ stores in 10 months. You're basically a retail empire. Time to find out what it's worth.`
    : totalStores >= 20
      ? `${totalStores} stores. Not bad. Let's see what the market thinks.`
      : totalStores >= 10
        ? `${totalStores} stores in 10 months. Room to grow, but you survived. Valuation time.`
        : `${totalStores} stores. The board is unimpressed, but at least you're not bankrupt. Let's spin the wheel.`;

  return (
    <div className="endscreen-overlay win-overlay">
      <div className="scanline-overlay" />
      {confetti.map(c => (
        <div
          key={c.id}
          className="confetti-pixel"
          style={{
            left: `${c.x}%`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            backgroundColor: c.color,
            width: c.size,
            height: c.size,
          }}
        />
      ))}

      <div className="endscreen-box win-box">
        {phase === "summary" && (
          <>
            <h1 className="endscreen-title win-title">{headlineText}</h1>
            <p className="endscreen-subtitle">{subtitleText}</p>

            <div className="endscreen-stats">
              <div className="stat-row">
                <span>Months Played</span>
                <span>{month}</span>
              </div>
              <div className="stat-row">
                <span>Total Stores</span>
                <span style={{ color: "#00c8ff" }}>{totalStores}</span>
              </div>
              <div className="stat-row">
                <span>Acquired / Built</span>
                <span>{acquisitions} / {builds}</span>
              </div>
              <div className="stat-row">
                <span>Profitable / Losing</span>
                <span>
                  <span style={{ color: "#00ff88" }}>{positiveStores}</span>
                  {" / "}
                  <span style={{ color: "#ff3344" }}>{negativeStores}</span>
                </span>
              </div>
              {bestStore && (
                <div className="stat-row">
                  <span>Best Store</span>
                  <span style={{ color: "#00ff88" }}>
                    {bestStore.cityName} (+${bestStore.profit.toLocaleString()}/mo)
                  </span>
                </div>
              )}
              {worstStore && worstStore !== bestStore && (
                <div className="stat-row">
                  <span>Worst Store</span>
                  <span style={{ color: "#ff3344" }}>
                    {worstStore.cityName} ({worstStore.profit >= 0 ? "+" : ""}${worstStore.profit.toLocaleString()}/mo)
                  </span>
                </div>
              )}
              <div className="stat-row">
                <span>Monthly Net CF</span>
                <span>{netCashFlow >= 0 ? "+" : ""}${netCashFlow.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Cash Remaining</span>
                <span style={{ color: "#00ff88" }}>${cash.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Outstanding Debt</span>
                <span style={{ color: debt > 0 ? "#ff3344" : "#00ff88" }}>
                  ${debt.toLocaleString()}
                </span>
              </div>
            </div>

            <button className="endscreen-btn win-btn" onClick={() => setPhase("wheel")}>
              SPIN THE VALUATION WHEEL
            </button>
          </>
        )}

        {phase === "wheel" && (
          <ValuationWheel
            netCashFlow={netCashFlow}
            debt={debt}
            onComplete={handleWheelComplete}
          />
        )}

        {phase === "name" && (
          <div className="name-entry">
            <h2 className="name-title">
              Enter your name for the leaderboard:
            </h2>
            <p className="name-valuation">
              Final Valuation: ${result.finalValuation.toLocaleString()}
              {result.finalValuation === 0 ? " (the Debt Monster ate it)" : ""}
            </p>
            <form onSubmit={handleSubmit} className="name-form">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME HERE"
                className="name-input"
                maxLength={24}
                autoFocus
              />
              <button type="submit" className="name-submit" disabled={submitting || !name.trim()}>
                {submitting ? "SUBMITTING..." : "ENSHRINE MY LEGACY"}
              </button>
            </form>
          </div>
        )}

        {phase === "done" && (
          <div className="done-screen">
            <h2 className="done-title">LEGENDARY</h2>
            <p className="done-sub">Your name echoes through the halls of franchise history.</p>
            <button className="endscreen-btn" onClick={onRestart}>
              PLAY AGAIN (addiction is real)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
