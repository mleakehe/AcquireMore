import { useState } from "react";
import { PASSWORD, LOADING_QUOTES } from "../data/constants";

export default function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const quote = LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)];

  function handleSubmit(e) {
    e.preventDefault();
    if (pw.trim().toUpperCase() === PASSWORD) {
      localStorage.setItem("acquiremore-auth", "true");
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="gate-container">
      <div className="scanline-overlay" />
      <div className={`gate-box ${shake ? "shake" : ""}`}>
        <h1 className="gate-title">
          <span className="pay">ACQUIRE</span>
          <span className="more">MORE</span>
        </h1>
        <p className="gate-subtitle">THE ACQUISITION GAME</p>
        <div className="gate-divider" />
        <p className="gate-flavor">
          ⚠️ AUTHORIZED FRANCHISE PARTNERS ONLY ⚠️
        </p>
        <form onSubmit={handleSubmit} className="gate-form">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder="ENTER ACCESS CODE"
            className={`gate-input ${error ? "gate-input-error" : ""}`}
            autoFocus
          />
          <button type="submit" className="gate-btn">
            ACCESS GRANTED?
          </button>
        </form>
        {error && (
          <p className="gate-error">
            Access denied. Your franchise broker is disappointed.
          </p>
        )}
        <p className="gate-quote">{quote}</p>
      </div>
    </div>
  );
}
