import { useState, useCallback } from "react";
import PasswordGate from "./components/PasswordGate";
import IntroScreen from "./components/IntroScreen";
import StoreGrid from "./components/StoreGrid";
import HUD from "./components/HUD";
import CardPanel from "./components/CardPanel";
import Popup from "./components/Popup";
import MonthlyReport from "./components/MonthlyReport";
import GameOverScreen from "./components/GameOverScreen";
import EndScreen from "./components/EndScreen";
import Leaderboard from "./components/Leaderboard";
import { useGameState } from "./hooks/useGameState";
import { playMonthTick, playClick } from "./utils/sound";
import { recordGamePlayed } from "./utils/leaderboard";
import { BLACKJACK_STAKES, LOTTERY_COST, INITIATIVE_COST } from "./data/constants";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem("paymore-auth") === "true");
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [monthFlash, setMonthFlash] = useState(false);
  const [showDesperateModal, setShowDesperateModal] = useState(false);
  const [blackjackStake, setBlackjackStake] = useState(0);
  const [liquidateTarget, setLiquidateTarget] = useState(null);
  const [initiativeTarget, setInitiativeTarget] = useState(null);

  const {
    state,
    netCashFlow,
    debtInterest,
    overhead,
    monthsOfRunway,
    monthsRemaining,
    canAdvance,
    storeCF,
    eventCF,
    selectCard,
    confirmSelection,
    passAll,
    desperateAction,
    storeInitiative,
    closePopup,
    advanceMonth,
    closeMonthReport,
    resetGame,
  } = useGameState();

  const handleAdvanceMonth = useCallback(() => {
    playMonthTick();
    setMonthFlash(true);
    setTimeout(() => {
      advanceMonth();
      setMonthFlash(false);
    }, 150);
  }, [advanceMonth]);

  const handleRestart = useCallback(() => {
    recordGamePlayed();
    resetGame();
    setGameStarted(false);
    setShowDesperateModal(false);
  }, [resetGame]);

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleCloseReport = useCallback(() => {
    closeMonthReport();
  }, [closeMonthReport]);

  const handleSelectCard = useCallback((index) => {
    playClick();
    selectCard(index);
  }, [selectCard]);

  const handleConfirmSelection = useCallback(() => {
    playClick();
    confirmSelection();
  }, [confirmSelection]);

  const handlePassAll = useCallback(() => {
    playClick();
    passAll();
  }, [passAll]);

  const handleDesperateAction = useCallback((actionType, params) => {
    playClick();
    desperateAction(actionType, params);
    setShowDesperateModal(false);
  }, [desperateAction]);

  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />;
  }

  if (!gameStarted) {
    return <IntroScreen onStart={handleStartGame} />;
  }

  if (state.phase === "lost") {
    return (
      <>
        <GameOverScreen
          month={state.month}
          cash={state.cash}
          totalStores={state.totalStores}
          ownedStores={state.ownedStores}
          debt={state.debt}
          onRestart={handleRestart}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
        {showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </>
    );
  }

  if (state.phase === "ended") {
    return (
      <>
        <EndScreen
          month={state.month}
          totalStores={state.totalStores}
          ownedStores={state.ownedStores}
          netCashFlow={netCashFlow}
          debt={state.debt}
          cash={state.cash}
          onRestart={handleRestart}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
        {showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </>
    );
  }

  const desperateType = state.desperateMeasure;
  const desperateUsed = state.desperateUsed;

  return (
    <div className="game-container">
      <div className="scanline-overlay" />
      {monthFlash && <div className="month-flash" />}

      <div className="game-top-bar">
        <div className="top-brand">
          <span className="pay">PAY</span>
          <span className="more">MORE</span>
        </div>
        <div className="top-actions">
          <span className="month-indicator">MONTH {state.month} / 10</span>
          {state.downturn?.active && (
            <span className="downturn-badge">📉 DOWNTURN</span>
          )}
          <button
            className="lb-btn"
            onClick={() => { playClick(); setShowLeaderboard(true); }}
          >
            LEADERBOARD
          </button>
        </div>
      </div>

      <div className="game-layout">
        <div className="game-map-area">
          <StoreGrid
            ownedStores={state.ownedStores}
            storeLossStreaks={state.storeLossStreaks}
            storeCF={storeCF}
            overhead={overhead}
            netCashFlow={netCashFlow}
            cash={state.cash}
            onStoreClick={(storeId) => { playClick(); setInitiativeTarget(storeId); }}
          />
          <div className="map-bottom-bar">
            <button
              className={`advance-btn ${canAdvance ? "advance-btn-ready" : ""}`}
              onClick={handleAdvanceMonth}
              disabled={!canAdvance || state.popup !== null || state.showMonthReport}
            >
              {canAdvance ? "END MONTH →" : "PICK A DEAL OR PASS"}
            </button>

            {desperateType && !desperateUsed && (
              <button
                className="desperate-btn"
                onClick={() => { playClick(); setShowDesperateModal(true); }}
                disabled={state.popup !== null || state.showMonthReport}
              >
                {desperateType === "dan" && "🙏 BEG DAN FOR MONEY"}
                {desperateType === "blackjack" && "🃏 GAMBLE AT BLACKJACK"}
                {desperateType === "lottery" && "🎰 BUY LOTTERY TICKETS"}
                {desperateType === "liquidate" && "🔥 LIQUIDATE A STORE"}
              </button>
            )}
          </div>
        </div>

        <div className="game-sidebar">
          <HUD
            cash={state.cash}
            debt={state.debt}
            debtInterest={debtInterest}
            netCashFlow={netCashFlow}
            overhead={overhead}
            monthsOfRunway={monthsOfRunway}
            ownedStores={state.ownedStores}
            activeEvents={state.activeEvents}
            eventLog={state.eventLog}
            downturn={state.downturn}
            storeLossStreaks={state.storeLossStreaks}
          />

          <CardPanel
            cards={state.cards}
            selectedCardIndex={state.selectedCardIndex}
            hasConfirmed={state.hasConfirmed}
            hasPassed={state.hasPassed}
            cash={state.cash}
            onSelect={handleSelectCard}
            onConfirm={handleConfirmSelection}
            onPass={handlePassAll}
            month={state.month}
            dealQualityMsg={state.dealQualityMsg}
            postCloseEvent={state.postCloseEvent}
          />
        </div>
      </div>

      <Popup popup={state.popup} onClose={closePopup} />

      {/* Desperate Measure Modal */}
      {showDesperateModal && (
        <div className="desperate-overlay" onClick={() => setShowDesperateModal(false)}>
          <div className="desperate-box" onClick={e => e.stopPropagation()}>

            {desperateType === "dan" && (
              <>
                <h2 className="desperate-title">🙏 BEG DAN FOR MONEY</h2>
                <p className="desperate-desc">
                  Dan is your investor. He lives in Utah. He might be on a golf course or mountain bike trail right now.
                  He might be in a good mood. He might not. Spin the wheel and find out.
                </p>
                <p className="desperate-warn">Results range from +$500,000 to -$50,000. 4-month cooldown.</p>
                <button className="desperate-go" onClick={() => handleDesperateAction("dan")}>
                  MAKE THE CALL
                </button>
              </>
            )}

            {desperateType === "blackjack" && (
              <>
                <h2 className="desperate-title">🃏 GAMBLE AT BLACKJACK</h2>
                <p className="desperate-desc">
                  45% chance to double your stake. 55% chance to lose it all. Choose your wager.
                </p>
                <div className="desperate-stakes">
                  {BLACKJACK_STAKES.map((pct, i) => {
                    const amount = Math.round(state.cash * pct);
                    return (
                      <button
                        key={i}
                        className={`stake-btn ${blackjackStake === i ? "stake-selected" : ""}`}
                        onClick={() => setBlackjackStake(i)}
                      >
                        {Math.round(pct * 100)}% — ${amount.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
                <button className="desperate-go" onClick={() => handleDesperateAction("blackjack", { stakeIndex: blackjackStake })}>
                  DEAL THE CARDS
                </button>
              </>
            )}

            {desperateType === "lottery" && (
              <>
                <h2 className="desperate-title">🎰 BUY LOTTERY TICKETS</h2>
                <p className="desperate-desc">
                  Cost: ${LOTTERY_COST.toLocaleString()}. 2% chance to win $2,000,000.
                  98% chance to light $50k on fire.
                </p>
                <button className="desperate-go" onClick={() => handleDesperateAction("lottery")}>
                  BUY TICKETS
                </button>
              </>
            )}

            {desperateType === "liquidate" && (
              <>
                <h2 className="desperate-title">🔥 LIQUIDATE A STORE</h2>
                <p className="desperate-desc">
                  Sell a store for 50% of its purchase price. Pick one to liquidate.
                </p>
                <div className="liquidate-list">
                  {state.ownedStores.map(store => (
                    <button
                      key={store.id}
                      className={`liquidate-item ${liquidateTarget === store.id ? "liquidate-selected" : ""}`}
                      onClick={() => setLiquidateTarget(store.id)}
                    >
                      <span>{store.cityName}</span>
                      <span className={store.profit >= 0 ? "card-green" : "card-red"}>
                        {store.profit >= 0 ? "+" : ""}${store.profit.toLocaleString()}/mo
                      </span>
                      <span className="liquidate-recovery">
                        → ${Math.round((store.purchasePrice || 200_000) * 0.5).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  className="desperate-go"
                  disabled={liquidateTarget === null}
                  onClick={() => handleDesperateAction("liquidate", { storeId: liquidateTarget })}
                >
                  {liquidateTarget !== null ? "LIQUIDATE" : "SELECT A STORE"}
                </button>
              </>
            )}

            <button className="desperate-cancel" onClick={() => setShowDesperateModal(false)}>
              NEVER MIND
            </button>
          </div>
        </div>
      )}

      {/* Store Initiative Modal */}
      {initiativeTarget !== null && (() => {
        const store = state.ownedStores.find(s => s.id === initiativeTarget);
        if (!store) return null;
        const canAfford = state.cash >= INITIATIVE_COST;
        const isLosing = store.profit < 0;
        return (
          <div className="desperate-overlay" onClick={() => setInitiativeTarget(null)}>
            <div className="desperate-box" onClick={e => e.stopPropagation()}>
              <h2 className="desperate-title">🎲 STORE INITIATIVE</h2>
              <p className="desperate-desc" style={{ textAlign: "left" }}>
                <strong>{store.cityName}</strong> is losing{" "}
                <span style={{ color: "#ff3344" }}>${Math.abs(store.profit).toLocaleString()}/mo</span>
              </p>
              <p className="desperate-desc">
                Spend <span style={{ color: "#ffdd00" }}>${INITIATIVE_COST.toLocaleString()}</span> on an initiative to try and fix it.
                45% chance it works. 55% chance it makes things worse.
              </p>
              {!isLosing && (
                <p className="desperate-warn">This store is profitable — no initiative needed.</p>
              )}
              {!canAfford && isLosing && (
                <p className="desperate-warn">You can't afford this. Need ${INITIATIVE_COST.toLocaleString()}.</p>
              )}
              <button
                className="desperate-go"
                disabled={!canAfford || !isLosing}
                onClick={() => {
                  playClick();
                  storeInitiative(initiativeTarget);
                  setInitiativeTarget(null);
                }}
              >
                {canAfford && isLosing ? "ROLL THE DICE" : "CAN'T DO IT"}
              </button>
              <button className="desperate-cancel" onClick={() => setInitiativeTarget(null)}>
                NEVER MIND
              </button>
            </div>
          </div>
        );
      })()}

      {state.showMonthReport && (
        <MonthlyReport
          report={state.monthReport}
          onClose={handleCloseReport}
        />
      )}

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
