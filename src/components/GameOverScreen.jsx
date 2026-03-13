import { useState, useEffect } from "react";
import { playGameOver } from "../utils/sound";
import { submitScore } from "../utils/leaderboard";

export default function GameOverScreen({ month, cash, totalStores, ownedStores, debt, onRestart, onShowLeaderboard }) {
  const [phase, setPhase] = useState("summary");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { playGameOver(); }, []);

  const builds = ownedStores.filter(s => s.source === "built").length;
  const acquisitions = ownedStores.filter(s => s.source === "acquired").length;

  // Bankrupt score: negative outstanding debt (so more debt = worse score)
  const score = debt > 0 ? -debt : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const entry = {
      name: name.trim(),
      valuation: score,
      multiple: 0,
      monthsSurvived: month,
      date: new Date().toISOString().split("T")[0],
      stores: totalStores,
      debt,
      builds,
      acquisitions,
      bankrupt: true,
    };
    await submitScore(entry);
    setSubmitting(false);
    setPhase("done");
    onShowLeaderboard();
  }

  return (
    <div className="endscreen-overlay gameover-overlay">
      <div className="scanline-overlay" />
      <div className="endscreen-box">
        {phase === "summary" && (
          <>
            <h1 className="endscreen-title gameover-title">BANKRUPT</h1>
            <p className="endscreen-subtitle">
              You ran out of money in month {month}. The franchise dream is dead.
              Your investors are "pivoting to other opportunities."
              {debt > 0 ? ` Oh, and you still owe $${debt.toLocaleString()} in debt. Good luck with that.` : ""}
            </p>
            <p className="endscreen-no-wheel">
              No valuation wheel for you. Your score is your outstanding debt.
            </p>

            <div className="endscreen-stats">
              <div className="stat-row">
                <span>Months Survived</span>
                <span>{month}</span>
              </div>
              <div className="stat-row">
                <span>Total Stores</span>
                <span>{totalStores}</span>
              </div>
              <div className="stat-row">
                <span>Acquired / Built</span>
                <span>{acquisitions} / {builds}</span>
              </div>
              <div className="stat-row">
                <span>Remaining Cash</span>
                <span style={{ color: "#ff3344" }}>${Math.max(0, cash).toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Outstanding Debt</span>
                <span style={{ color: "#ff3344" }}>${debt.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Leaderboard Score</span>
                <span style={{ color: "#ff3344" }}>
                  {score === 0 ? "$0" : `-$${Math.abs(score).toLocaleString()}`}
                </span>
              </div>
            </div>

            <button className="endscreen-btn" onClick={() => setPhase("name")}>
              FACE THE MUSIC →
            </button>
          </>
        )}

        {phase === "name" && (
          <div className="name-entry">
            <h2 className="name-title">
              Put your name on the Wall of Shame:
            </h2>
            <p className="name-valuation" style={{ color: "#ff3344" }}>
              Score: {score === 0 ? "$0" : `-$${Math.abs(score).toLocaleString()}`}
              {" "}(bankrupt in month {month})
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
                {submitting ? "SUBMITTING..." : "ENSHRINE MY SHAME"}
              </button>
            </form>
          </div>
        )}

        {phase === "done" && (
          <div className="done-screen">
            <h2 className="done-title" style={{ color: "#ff3344" }}>NOTED</h2>
            <p className="done-sub">Your failure has been permanently recorded for all to see.</p>
            <button className="endscreen-btn" onClick={onRestart}>
              TRY AGAIN (you literally can't do worse)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
