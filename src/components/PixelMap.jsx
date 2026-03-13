import { useRef, useEffect, useCallback } from "react";
import { US_MAP_GRID, ALASKA_GRID, HAWAII_GRID } from "../data/usMap";
import { COLORS } from "../data/constants";

const CELL_SIZE = 8;
const MAP_W = 80;
const MAP_H = 50;
const CANVAS_W = MAP_W * CELL_SIZE;
const CANVAS_H = MAP_H * CELL_SIZE;

export default function PixelMap({ locations, ownedStores }) {
  const canvasRef = useRef(null);
  const blinkRef = useRef(true);

  // Build a set of owned city IDs for quick lookup
  const ownedIds = new Set((ownedStores || []).map(s => s.id));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Background (ocean)
    ctx.fillStyle = COLORS.navy;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw US landmass
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (US_MAP_GRID[y] && US_MAP_GRID[y][x]) {
          const edgeX = x > 0 && US_MAP_GRID[y][x - 1] === 0;
          const edgeY = y > 0 && US_MAP_GRID[y - 1] && US_MAP_GRID[y - 1][x] === 0;
          ctx.fillStyle = (edgeX || edgeY) ? COLORS.lightGreen : COLORS.darkGreen;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw Alaska inset
    const akOffX = 4;
    const akOffY = 40;
    for (let y = 0; y < ALASKA_GRID.length; y++) {
      for (let x = 0; x < ALASKA_GRID[y].length; x++) {
        if (ALASKA_GRID[y][x]) {
          ctx.fillStyle = COLORS.darkGreen;
          ctx.fillRect((akOffX + x) * CELL_SIZE, (akOffY + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw Hawaii inset
    const hiOffX = 16;
    const hiOffY = 44;
    for (let y = 0; y < HAWAII_GRID.length; y++) {
      for (let x = 0; x < HAWAII_GRID[y].length; x++) {
        if (HAWAII_GRID[y][x]) {
          ctx.fillStyle = COLORS.darkGreen;
          ctx.fillRect((hiOffX + x) * CELL_SIZE, (hiOffY + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw city markers
    const blink = blinkRef.current;
    for (const loc of locations) {
      const px = loc.gridX * CELL_SIZE;
      const py = loc.gridY * CELL_SIZE;
      const s = CELL_SIZE;

      if (ownedIds.has(loc.id)) {
        // Owned store — solid electric blue with $ symbol
        ctx.fillStyle = COLORS.blue;
        ctx.fillRect(px, py, s, s);
        ctx.fillStyle = "#000";
        ctx.font = `${Math.max(6, CELL_SIZE - 2)}px monospace`;
        ctx.fillText("$", px + 1, py + s - 1);
      } else {
        // Available city — blinking dot
        if (blink) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
        } else {
          ctx.fillStyle = "#888";
          ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
        }
      }
    }
  }, [locations, ownedIds]);

  useEffect(() => {
    let animId;
    let lastBlink = 0;
    function loop(t) {
      if (t - lastBlink > 600) {
        blinkRef.current = !blinkRef.current;
        lastBlink = t;
      }
      draw();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  return (
    <div className="pixel-map-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="pixel-map-canvas"
      />
    </div>
  );
}
