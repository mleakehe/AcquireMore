import { useState, useEffect } from "react";
import { fetchLeaderboard } from "../utils/leaderboard";

const CROWNS = ["👑", "🥈", "🥉"];

export default function Leaderboard({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const winRate = data && data.totalGames > 0
    ? Math.round((data.totalWins / data.totalGames) * 100)
    : 0;

  function formatValuation(val) {
    if (val < 0) return `-$${Math.abs(val).toLocaleString()}`;
    return `$${val.toLocaleString()}`;
  }

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-box" onClick={e => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose}>✕</button>
        <h2 className="lb-title">HALL OF FRANCHISE LEGENDS</h2>
        <p className="lb-subtitle">(and people who went bankrupt)</p>

        {loading ? (
          <p className="lb-loading">Loading the legends...</p>
        ) : (
          <>
            <div className="lb-table-wrap">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NAME</th>
                    <th>VALUATION</th>
                    <th>GRADE</th>
                    <th>MULT</th>
                    <th>MONTHS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {(!data.entries || data.entries.length === 0) && (
                    <tr>
                      <td colSpan={7} className="lb-empty">
                        No legends yet. Be the first. No pressure.
                      </td>
                    </tr>
                  )}
                  {data.entries && data.entries.map((e, i) => {
                    const isBankrupt = e.bankrupt || e.valuation < 0;
                    return (
                      <tr key={i} className={`${i < 3 ? `lb-top-${i + 1}` : ""} ${isBankrupt ? "lb-bankrupt" : ""}`}>
                        <td>{i < 3 ? CROWNS[i] : i + 1}</td>
                        <td className="lb-name">
                          {e.name}
                          {isBankrupt && <span className="lb-bankrupt-badge"> 💀</span>}
                        </td>
                        <td className={`lb-val ${isBankrupt ? "lb-val-negative" : ""}`}>
                          {formatValuation(e.valuation)}
                        </td>
                        <td className={`lb-grade ${e.investorGrade ? `grade-${e.investorGrade.toLowerCase()}` : ""}`}>
                          {e.investorGrade || "—"}
                        </td>
                        <td>{isBankrupt ? "—" : `${e.multiple}x`}</td>
                        <td>{e.monthsSurvived}</td>
                        <td className="lb-date">{e.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="lb-footer">
              {data.totalGames || 0} brave souls have attempted this.
              Only {winRate}% survived. You're welcome.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
