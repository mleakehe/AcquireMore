import { useState, useRef, useEffect } from "react";
import { VALUATION_MULTIPLES, COLORS } from "../data/constants";
import { playSpinTick, playSpinResult } from "../utils/sound";

const SEGMENT_COUNT = VALUATION_MULTIPLES.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
const SEGMENT_COLORS = [
  "#1a1a3e", "#2a1a4e", "#1a2a4e", "#2a2a3e",
  "#1a3a4e", "#2a1a3e", "#1a2a3e", "#2a3a4e",
  "#1a1a4e", "#3a2a4e", "#2a2a4e", "#1a3a3e",
  "#3a1a4e", "#2a3a3e", "#1a3a4e", "#2a1a4e",
  "#1a2a4e", "#2a2a3e",
];

export default function ValuationWheel({ netCashFlow, debt, cash, onComplete }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef(null);
  const tickCountRef = useRef(0);

  function drawWheel(ctx, w, h, rot) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const startAngle = ((i * SEGMENT_ANGLE + rot) * Math.PI) / 180;
      const endAngle = (((i + 1) * SEGMENT_ANGLE + rot) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = COLORS.blue;
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = (startAngle + endAngle) / 2;
      const labelR = radius * 0.7;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillStyle = VALUATION_MULTIPLES[i] >= 10 ? COLORS.yellow : COLORS.white;
      ctx.font = "bold 12px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${VALUATION_MULTIPLES[i]}x`, 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bg;
    ctx.fill();
    ctx.strokeStyle = COLORS.orange;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 12, 8);
    ctx.lineTo(cx + 12, 8);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = COLORS.orange;
    ctx.fill();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawWheel(ctx, canvas.width, canvas.height, rotation);
  }, [rotation]);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setShowResult(false);

    const idx = Math.floor(Math.random() * SEGMENT_COUNT);
    const multiple = VALUATION_MULTIPLES[idx];

    // The pointer is at the top (270° in canvas coords = 12 o'clock).
    // Segment i center is at: i * SEGMENT_ANGLE + SEGMENT_ANGLE/2 + rotation.
    // We want that to equal 270°, so:
    // finalRot = 270 - (idx * SEGMENT_ANGLE + SEGMENT_ANGLE/2)
    // Ensure positive final rotation with enough full spins
    const targetSegCenter = idx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    let finalRot = (270 - targetSegCenter) % 360;
    if (finalRot < 0) finalRot += 360;
    // Add random jitter within the segment to not always land dead center
    const jitter = (Math.random() - 0.5) * SEGMENT_ANGLE * 0.6;
    finalRot = (finalRot + jitter + 360) % 360;
    const fullSpins = 360 * (8 + Math.random() * 4);
    const totalRot = fullSpins + finalRot - (rotation % 360);
    // Ensure totalRot is always positive (spinning forward)
    const adjustedTotalRot = totalRot > 0 ? totalRot : totalRot + 360;

    let startTime = null;
    const duration = 5000;
    const startRot = rotation;
    tickCountRef.current = 0;

    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentRot = startRot + adjustedTotalRot * eased;
      setRotation(currentRot % 360);

      const segIdx = Math.floor((currentRot % 360) / SEGMENT_ANGLE);
      if (segIdx !== tickCountRef.current) {
        tickCountRef.current = segIdx;
        playSpinTick();
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        const annualCF = netCashFlow * 12;
        const grossValuation = annualCF * multiple;
        const enterpriseValue = Math.max(0, grossValuation - debt);
        const finalValuation = enterpriseValue + cash;
        playSpinResult();
        setResult({ multiple, grossValuation, enterpriseValue, finalValuation, annualCF, debt, cash });
        setSpinning(false);
        setTimeout(() => setShowResult(true), 500);
      }
    }
    requestAnimationFrame(animate);
  }

  const flavorText = result
    ? result.finalValuation === 0
      ? "Your valuation just got eaten by the Debt Monster. This is why people rent."
      : result.multiple <= 4
        ? "The market is 'cautious.' Classic market."
        : result.multiple <= 6
          ? "Respectable. Your investors will pretend they always believed in you."
          : result.multiple <= 10
            ? "Now we're talking. Your investors are actually smiling."
            : result.multiple <= 15
              ? "PREMIUM MULTIPLE. The PE firms are circling."
              : "GENERATIONAL WEALTH UNLOCKED. Call your mom."
    : "";

  return (
    <div className="wheel-container">
      <h2 className="wheel-title">THE MARKET DECIDES YOUR FATE</h2>
      <p className="wheel-subtitle">
        Annual Net Cashflow: ${(netCashFlow * 12).toLocaleString()}
        {debt > 0 && ` | Debt: $${debt.toLocaleString()}`}
        {` | Cash: $${cash.toLocaleString()}`}
      </p>

      <div className="wheel-wrapper">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="wheel-canvas"
        />
      </div>

      {!spinning && !result && (
        <button className="wheel-spin-btn" onClick={spin}>
          PRAY AND SPIN
        </button>
      )}

      {showResult && result && (
        <div className="wheel-result">
          <p className="wheel-multiple">{result.multiple}x MULTIPLE</p>
          <p className="wheel-flavor">{flavorText}</p>

          <div className="wheel-debt-calc">
            <p className="wheel-calc-line">
              Gross Valuation: ${result.grossValuation.toLocaleString()}
            </p>
            {debt > 0 && (
              <p className="wheel-calc-line wheel-calc-debt">
                - Debt: ${debt.toLocaleString()}
              </p>
            )}
            <p className="wheel-calc-line wheel-calc-cash">
              + Cash on Hand: ${result.cash.toLocaleString()}
            </p>
          </div>

          <div className="wheel-valuation">
            <span className="wheel-val-label">FINAL VALUATION</span>
            <span className={`wheel-val-number ${result.finalValuation <= 0 ? 'val-negative' : ''}`}>
              ${result.finalValuation.toLocaleString()}
            </span>
          </div>
          <button className="wheel-continue-btn" onClick={() => onComplete(result)}>
            CLAIM YOUR GLORY
          </button>
        </div>
      )}
    </div>
  );
}
