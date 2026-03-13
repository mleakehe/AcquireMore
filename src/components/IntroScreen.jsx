import { useState } from "react";
import { LOADING_QUOTES } from "../data/constants";

export default function IntroScreen({ onStart }) {
  const [ready, setReady] = useState(false);
  const quote = LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)];

  return (
    <div className="intro-overlay">
      <div className="scanline-overlay" />
      <div className="intro-box">
        <h1 className="intro-title">
          <span className="pay">ACQUIRE</span>
          <span className="more">MORE</span>
        </h1>
        <p className="intro-tagline">THE ACQUISITION GAME</p>

        <div className="intro-divider" />

        {!ready ? (
          <>
            <div className="intro-briefing">
              <p>
                You have <span style={{ color: "#00ff88" }}>$1,000,000</span> in cash and zero stores.
                Corporate overhead eats <span style={{ color: "#ff3344" }}>$15,000 + $2,000/store</span> every month.
                You have <span style={{ color: "#00c8ff" }}>10 months</span> to build an empire.
              </p>
              <p>
                Each month you'll see <span style={{ color: "#ff6b00" }}>6 deal cards</span> —
                3 acquisitions and 3 new builds. Study the signals. <strong>Pick exactly 1.</strong> Or pass on all.
              </p>
              <p className="intro-signals">
                <strong>Read the signals:</strong> Population, location type, competition, revenue,
                contribution margin, and lease rate. Great stores have high population, highway/downtown locations,
                no competition, strong margins, and low leases.
              </p>
              <p className="intro-formula">
                <strong>Do the math:</strong>{" "}
                <span style={{ color: "#ffdd00" }}>
                  Revenue × Contribution Margin - $20,000 - Lease = Profit
                </span>
              </p>
              <p className="intro-goal">
                MISSION: Build as many profitable stores as possible in 10 months.
                At the end, spin the valuation wheel. Highest valuation wins.
                Stores with 3 straight losing months close permanently ($200k fee).
              </p>
              <p className="intro-tip">
                Acquisitions: stable revenue, but expensive (10-60% down, rest is debt at 1.5%/mo).
                Builds: cheaper, no debt, but revenue is less predictable.
                When you're desperate, you can beg Shandon for cash, gamble at blackjack, buy lottery tickets, bet your buddy at golf, or invest in a meme coin.
              </p>
            </div>
            <button className="intro-btn" onClick={() => setReady(true)}>
              I UNDERSTAND THE GRAVITY OF MY SITUATION
            </button>
          </>
        ) : (
          <>
            <p className="intro-quote">{quote}</p>
            <button className="intro-btn intro-go" onClick={onStart}>
              LET'S DO THIS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
