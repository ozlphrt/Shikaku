import React from 'react';

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
