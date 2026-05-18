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

  if (!currentLevel) return null;

  const { rows, cols } = currentLevel.gridSize;
  const { numbers } = currentLevel;

  // Touch handlers to track cell under drag finger
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = elem ? elem.closest('.shikaku-cell') : null;
    if (cell) {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      startDraw(x, y);
    }
  };

  const handleTouchMove = (e) => {
    if (!activeDraw) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = elem ? elem.closest('.shikaku-cell') : null;
    if (cell) {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      
      // Ensure coords are in bounds
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        updateDraw(x, y);
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
      updateDraw(x, y);
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

  // Map each cell to its rectangle status for GridCell rendering
  const getCellRectState = (x, y) => {
    for (const rect of rectangles) {
      if (x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h) {
        return getRectState(rect);
      }
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
        {rectangles.map(rect => {
          const state = getRectState(rect);
          const styles = getDominoTileStyles(rect, cols, rows);
          
          return (
            <div
              key={rect.id}
              className={`completed-rect-overlay ${
                state === 'satisfied' ? 'rect-state-valid' : 
                state === 'error' ? 'rect-state-error' : 'rect-state-neutral'
              }`}
              style={styles}
              onClick={(e) => {
                e.stopPropagation();
                removeRectangle(rect.id);
              }}
            />
          );
        })}

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
