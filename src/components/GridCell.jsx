import React from 'react';

const GridCell = React.memo(function GridCell({
  x,
  y,
  rectState, // 'satisfied' | 'error' | 'incomplete' | null
  isLastRow,
  isLastCol
}) {
  return (
    <div 
      className={`shikaku-cell ${isLastRow ? 'shikaku-cell-in-last-row' : ''} ${isLastCol ? 'shikaku-cell-in-last-col' : ''}`}
      data-x={x}
      data-y={y}
    >
      {/* Show subtle dot guide for empty cells if not covered by a committed rectangle */}
      {!rectState && <div className="cell-dot" />}
    </div>
  );
});

export default GridCell;
