import React from 'react';
import { useGameStore } from '../store/gameStore';

// Stable value-based color generator
const getColorForClue = (value) => {
  // Knuth's multiplicative hash to spread colors evenly for sequential values
  const seed = value * 2654435761;
  const hue = Math.abs(seed) % 360;
  return `hsl(${hue}, 90%, 65%)`;
};

const GridCell = React.memo(function GridCell({
  x,
  y,
  number,
  rectState, // 'satisfied' | 'error' | 'incomplete' | null
  isLastRow,
  isLastCol
}) {
  const isSatisfied = rectState === 'satisfied';
  const isError = rectState === 'error';
  const colorByNumber = useGameStore(state => state.colorByNumber);

  const clueColor = number ? getColorForClue(number.value) : null;

  return (
    <div 
      className={`shikaku-cell ${isLastRow ? 'shikaku-cell-in-last-row' : ''} ${isLastCol ? 'shikaku-cell-in-last-col' : ''}`}
      data-x={x}
      data-y={y}
    >
      {number ? (
        <div 
          className={`cell-number-container ${
            isSatisfied ? 'cell-number-satisfied pulse-satisfied' : ''
          } ${
            isError ? 'cell-number-error shake-error' : ''
          }`}
          style={colorByNumber ? {
            color: clueColor,
            textShadow: `0 0 10px ${clueColor}`,
            borderColor: clueColor // If there's any border
          } : {}}
        >
          {number.value}
        </div>
      ) : (
        // Show subtle dot guide for empty cells if not covered by a committed rectangle
        !rectState && <div className="cell-dot" />
      )}
    </div>
  );
});

export default GridCell;
