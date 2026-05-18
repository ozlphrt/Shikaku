import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import GridCell from './GridCell';

// Simple deterministic pseudo-random hash generator for organic surface irregularities
const getHashRandom = (id, salt = '') => {
  const str = id + salt;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash % 10000) / 10000;
};

// Generates unique, stable inline variables for each individual tile
const getDominoTileStyles = (rect, cols, rows) => {
  const baseStyles = {
    left: `calc(${(rect.x / cols) * 100}% + 3.5px)`,
    top: `calc(${(rect.y / rows) * 100}% + 3.5px)`,
    width: `calc(${(rect.w / cols) * 100}% - 7px)`,
    height: `calc(${(rect.h / rows) * 100}% - 7px)`
  };

  const id = rect.id || 'default';
  
  // Asymmetrical borders
  const r1 = 8 + getHashRandom(id, 'r1') * 6;
  const r2 = 8 + getHashRandom(id, 'r2') * 6;
  const r3 = 8 + getHashRandom(id, 'r3') * 6;
  const r4 = 8 + getHashRandom(id, 'r4') * 6;
  
  // Dent 1 Coordinates & Radius
  const dx1 = 15 + getHashRandom(id, 'dx1') * 25;
  const dy1 = 15 + getHashRandom(id, 'dy1') * 25;
  const ds1 = 18 + getHashRandom(id, 'ds1') * 16;
  
  // Dent 2 Coordinates & Radius
  const dx2 = 55 + getHashRandom(id, 'dx2') * 30;
  const dy2 = 55 + getHashRandom(id, 'dy2') * 30;
  const ds2 = 22 + getHashRandom(id, 'ds2') * 20;

  // Highlight Peak Coordinates
  const px = 60 + getHashRandom(id, 'px') * 25;
  const py = 15 + getHashRandom(id, 'py') * 25;

  // Glare sweep angle
  const angle = 125 + getHashRandom(id, 'ang') * 25;

  // Micro-scratch / veins
  const va1 = 70 + getHashRandom(id, 'va1') * 30;
  const vp1 = 30 + getHashRandom(id, 'vp1') * 25;
  const va2 = -15 - getHashRandom(id, 'va2') * 30;
  const vp2 = 50 + getHashRandom(id, 'vp2') * 25;

  return {
    ...baseStyles,
    '--rect-w': rect.w,
    '--rect-h': rect.h,
    '--domino-radius': `${r1}px ${r2}px ${r3}px ${r4}px`,
    '--domino-dent-x1': `${dx1}%`,
    '--domino-dent-y1': `${dy1}%`,
    '--domino-dent-size1': `${ds1}%`,
    '--domino-dent-x2': `${dx2}%`,
    '--domino-dent-y2': `${dy2}%`,
    '--domino-dent-size2': `${ds2}%`,
    '--domino-peak-x': `${px}%`,
    '--domino-peak-y': `${py}%`,
    '--domino-angle': `${angle}deg`,
    '--domino-vein-ang1': `${va1}deg`,
    '--domino-vein-pos1': `${vp1}%`,
    '--domino-vein-ang2': `${va2}deg`,
    '--domino-vein-pos2': `${vp2}%`,
  };
};

// Cache for domino styles to avoid heavy recalculations during drag events
const styleCache = new Map();
const getCachedDominoTileStyles = (rect, cols, rows) => {
  const key = `${rect.id}-${rect.x}-${rect.y}-${rect.w}-${rect.h}-${cols}-${rows}`;
  if (styleCache.has(key)) {
    return styleCache.get(key);
  }
  const styles = getDominoTileStyles(rect, cols, rows);
  styleCache.set(key, styles);
  return styles;
};

// Stable value-based color generator using the Golden Angle (137.5 degrees)
const getColorForClue = (value, opacity = 1) => {
  const hue = Math.floor((value * 137.5) % 360);
  return opacity === 1 ? `hsl(${hue}, 92%, 65%)` : `hsla(${hue}, 92%, 65%, ${opacity})`;
};

// Find color for a rectangle based on any number clues inside its bounds
const getRectangleColor = (rect, numbers) => {
  if (!numbers) return null;
  const numbersInRect = numbers.filter(n => 
    n.x >= rect.x && n.x < rect.x + rect.w &&
    n.y >= rect.y && n.y < rect.y + rect.h
  );
  if (numbersInRect.length >= 1) {
    return numbersInRect[0].value;
  }
  return null;
};

const CommittedRectangles = React.memo(function CommittedRectangles({ rectStates, cols, rows, removeRectangle, numbers }) {
  const colorByNumber = useGameStore(state => state.colorByNumber);

  return (
    <>
      {rectStates.map(({ rect, state }) => {
        const styles = getCachedDominoTileStyles(rect, cols, rows);
        
        let customStyles = { ...styles };
        if (colorByNumber && state === 'satisfied') {
          const val = getRectangleColor(rect, numbers);
          if (val !== null) {
            const baseColor = getColorForClue(val, 1);
            const transparentBgColor = getColorForClue(val, 0.15);
            const glowColor = getColorForClue(val, 0.4);

            customStyles = {
              ...styles,
              borderColor: baseColor,
              background: `linear-gradient(135deg, rgba(0,0,0,0.72) 0%, ${transparentBgColor} 100%)`,
              boxShadow: `
                0 12px 28px rgba(0, 0, 0, 0.55), 
                0 4px 10px rgba(0, 0, 0, 0.25),
                inset 2.5px 2.5px 0px rgba(255, 255, 255, 0.35), 
                inset -2.5px -2.5px 0px rgba(0, 0, 0, 0.5),
                inset 0 0 20px ${glowColor}
              `
            };
          }
        }

        return (
          <div
            key={rect.id}
            className={`completed-rect-overlay ${
              state === 'satisfied' ? 'rect-state-valid' : 
              state === 'error' ? 'rect-state-error' : 'rect-state-neutral'
            }`}
            style={customStyles}
            onClick={(e) => {
              e.stopPropagation();
              removeRectangle(rect.id);
            }}
          />
        );
      })}
    </>
  );
});

export default function ShikakuGrid() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const rectangles = useGameStore(state => state.rectangles);
  const activeDraw = useGameStore(state => state.activeDraw);
  
  const startDraw = useGameStore(state => state.startDraw);
  const updateDraw = useGameStore(state => state.updateDraw);
  const endDraw = useGameStore(state => state.endDraw);
  const cancelDraw = useGameStore(state => state.cancelDraw);
  const removeRectangle = useGameStore(state => state.removeRectangle);

  const gridRef = useRef(null);
  const cachedGridRectRef = useRef(null);
  const isFramePendingRef = useRef(false);
  const pendingCoordsRef = useRef(null);

  // Prevent elastic scrolling/bounce on iOS Safari while drawing/dragging
  useEffect(() => {
    const wrapper = gridRef.current;
    if (!wrapper) return;

    const preventDefaultScroll = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    wrapper.addEventListener('touchstart', preventDefaultScroll, { passive: false });
    wrapper.addEventListener('touchmove', preventDefaultScroll, { passive: false });

    return () => {
      wrapper.removeEventListener('touchstart', preventDefaultScroll);
      wrapper.removeEventListener('touchmove', preventDefaultScroll);
    };
  }, []);

  // Clear style cache on level change
  useEffect(() => {
    styleCache.clear();
  }, [currentLevel]);

  if (!currentLevel) return null;

  const { rows, cols } = currentLevel.gridSize;
  const { numbers } = currentLevel;

  const updateCachedGridRect = () => {
    const gridEl = gridRef.current?.querySelector('.shikaku-grid-element');
    if (gridEl) {
      cachedGridRectRef.current = gridEl.getBoundingClientRect();
    }
  };

  // Helper to find the row/col coordinates from a screen touch event
  const getGridCoordsFromTouch = (touch) => {
    const rect = cachedGridRectRef.current;
    if (!rect) return null;
    
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;
    
    const x = Math.floor(touchX / cellWidth);
    const y = Math.floor(touchY / cellHeight);
    
    // Clamp coordinates to keep drag inside board boundaries safely
    const clampedX = Math.max(0, Math.min(cols - 1, x));
    const clampedY = Math.max(0, Math.min(rows - 1, y));
    
    return { x: clampedX, y: clampedY };
  };

  // Snaps touch drag targets directly to the valid factor layouts of the starting number cell
  const updateDrawSnapped = (targetX, targetY) => {
    if (!activeDraw) return;
    const { startX, startY } = activeDraw;
    
    // Find the starting cell's number
    const startNumber = numbers.find(n => n.x === startX && n.y === startY);
    if (!startNumber) {
      updateDraw(targetX, targetY);
      return;
    }

    const V = startNumber.value;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const rawW = Math.abs(dx) + 1;
    const rawH = Math.abs(dy) + 1;

    // If the finger hasn't swiped away from the start cell, don't snap yet
    if (rawW === 1 && rawH === 1) {
      updateDraw(targetX, targetY);
      return;
    }

    // Precompute valid factors of V
    const pairs = [];
    for (let w = 1; w <= V; w++) {
      if (V % w === 0) {
        pairs.push({ w, h: V / w });
      }
    }

    const signX = dx >= 0 ? 1 : -1;
    const signY = dy >= 0 ? 1 : -1;

    // Filter factors that fit completely inside board boundary
    let playablePairs = pairs.filter(({ w, h }) => {
      const endX = startX + (w - 1) * signX;
      const endY = startY + (h - 1) * signY;
      return endX >= 0 && endX < cols && endY >= 0 && endY < rows;
    });

    if (playablePairs.length === 0) {
      playablePairs = pairs;
    }

    // Pick factor pair with minimum squared Euclidean distance to user's swipe size
    let bestPair = playablePairs[0];
    let minDistance = Infinity;

    for (const pair of playablePairs) {
      const dist = Math.pow(rawW - pair.w, 2) + Math.pow(rawH - pair.h, 2);
      if (dist < minDistance) {
        minDistance = dist;
        bestPair = pair;
      }
    }

    const snappedX = startX + (bestPair.w - 1) * signX;
    const snappedY = startY + (bestPair.h - 1) * signY;

    updateDraw(snappedX, snappedY);
  };

  // Touch handlers to track cell under drag finger
  const handleTouchStart = (e) => {
    updateCachedGridRect();
    const touch = e.touches[0];
    const coords = getGridCoordsFromTouch(touch);
    if (coords) {
      startDraw(coords.x, coords.y);
    }
  };

  const handleTouchMove = (e) => {
    if (!activeDraw) return;
    const touch = e.touches[0];
    const coords = getGridCoordsFromTouch(touch);
    if (coords) {
      pendingCoordsRef.current = coords;
      if (!isFramePendingRef.current) {
        isFramePendingRef.current = true;
        requestAnimationFrame(() => {
          isFramePendingRef.current = false;
          if (pendingCoordsRef.current) {
            updateDrawSnapped(pendingCoordsRef.current.x, pendingCoordsRef.current.y);
          }
        });
      }
    }
  };

  const handleTouchEnd = () => {
    if (activeDraw) {
      endDraw();
    }
  };

  // Mouse handlers (Event Delegation on the Grid wrapper)
  const handleMouseDown = (e) => {
    updateCachedGridRect();
    const cell = e.target.closest('.shikaku-cell');
    if (cell) {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      startDraw(x, y);
    }
  };

  const handleMouseMove = (e) => {
    if (!activeDraw) return;
    const cell = e.target.closest('.shikaku-cell');
    if (cell) {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      
      pendingCoordsRef.current = { x, y };
      if (!isFramePendingRef.current) {
        isFramePendingRef.current = true;
        requestAnimationFrame(() => {
          isFramePendingRef.current = false;
          if (pendingCoordsRef.current) {
            updateDrawSnapped(pendingCoordsRef.current.x, pendingCoordsRef.current.y);
          }
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (activeDraw) {
      endDraw();
    }
  };

  // Helper to determine state of a rectangle
  const getRectState = (rect) => {
    // Find all numbers contained in this rectangle
    const numsInRect = numbers.filter(
      n => n.x >= rect.x && n.x < rect.x + rect.w && n.y >= rect.y && n.y < rect.y + rect.h
    );

    if (numsInRect.length === 1) {
      const num = numsInRect[0];
      const area = rect.w * rect.h;
      if (area === num.value) {
        return 'satisfied';
      } else if (area < num.value) {
        return 'neutral'; // Too small - dotted boundary
      } else {
        return 'error'; // Too big - crimson glow
      }
    } else {
      return 'error'; // Covers 0 or >= 2 numbers - crimson glow
    }
  };

  // Precompute committed rectangle states once per render
  const rectStates = React.useMemo(() => {
    return rectangles.map(rect => ({
      rect,
      state: getRectState(rect)
    }));
  }, [rectangles, numbers]);

  // Precompute 2D grid map of cell rect states
  const cellStateMap = React.useMemo(() => {
    const map = Array(rows).fill(null).map(() => Array(cols).fill(null));
    for (const { rect, state } of rectStates) {
      for (let r = rect.y; r < rect.y + rect.h; r++) {
        for (let c = rect.x; c < rect.x + rect.w; c++) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            map[r][c] = state;
          }
        }
      }
    }
    return map;
  }, [rectStates, rows, cols]);

  // Map each cell to its rectangle status for GridCell rendering
  const getCellRectState = (x, y) => {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      return cellStateMap[y][x];
    }
    return null;
  };

  // Calculate coordinates for absolute overlay drawing (in percentage for responsiveness)
  const getAbsoluteOverlayStyles = (x, y, w, h) => {
    return {
      left: `calc(${(x / cols) * 100}% + 3.5px)`,
      top: `calc(${(y / rows) * 100}% + 3.5px)`,
      width: `calc(${(w / cols) * 100}% - 7px)`,
      height: `calc(${(h / rows) * 100}% - 7px)`
    };
  };

  // Render cells array
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const number = numbers.find(n => n.x === c && n.y === r);
      cells.push(
        <GridCell
          key={`${r}-${c}`}
          x={c}
          y={r}
          number={number}
          rectState={getCellRectState(c, r)}
          isLastRow={r === rows - 1}
          isLastCol={c === cols - 1}
        />
      );
    }
  }

  // Active draw positioning
  let activeDrawRect = null;
  let drawStateText = '';
  let isDrawSizeMatch = false;

  if (activeDraw) {
    const { startX, startY, currentX, currentY } = activeDraw;
    const ax = Math.min(startX, currentX);
    const ay = Math.min(startY, currentY);
    const aw = Math.abs(startX - currentX) + 1;
    const ah = Math.abs(startY - currentY) + 1;
    const area = aw * ah;

    activeDrawRect = { x: ax, y: ay, w: aw, h: ah, area };

    // Find all number cells contained inside the active selection
    const numbersInActiveDraw = numbers.filter(n => 
      n.x >= ax && n.x < ax + aw &&
      n.y >= ay && n.y < ay + ah
    );

    // It matches if there is exactly one number and the area matches its value
    isDrawSizeMatch = numbersInActiveDraw.length === 1 && (area === numbersInActiveDraw[0].value);

    // Display dimensions only (e.g. 3 × 3)
    drawStateText = `${aw} × ${ah}`;
  }

  return (
    <div className="board-outer-container">
      <div 
        className={`board-grid-wrapper ${activeDraw ? 'drawing-active' : ''}`}
        ref={gridRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="shikaku-grid-element"
          style={{
            '--grid-rows': rows,
            '--grid-cols': cols
          }}
        >
          {cells}
        </div>

        {/* Render committed rectangles as overlays */}
        <CommittedRectangles 
          rectStates={rectStates} 
          cols={cols} 
          rows={rows} 
          removeRectangle={removeRectangle} 
          numbers={currentLevel?.numbers}
        />

        {/* Render active touch draw boundary */}
        {activeDrawRect && (
          <div
            className={`active-draw-box ${isDrawSizeMatch ? 'active-draw-valid' : 'active-draw-invalid'}`}
            style={getAbsoluteOverlayStyles(
              activeDrawRect.x,
              activeDrawRect.y,
              activeDrawRect.w,
              activeDrawRect.h
            )}
          >
            {/* Draw Size Indicator floating above finger */}
            <div className="draw-size-indicator">
              <span className={isDrawSizeMatch ? 'size-match' : 'size-mismatch'}>
                {drawStateText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
