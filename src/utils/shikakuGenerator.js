/**
 * Procedural Shikaku Level Generator with unique solution validator.
 */

// Helper: Get divisors of a number to find all possible rectangle dimensions
function getRectDimensions(area) {
  const dimensions = [];
  for (let w = 1; w <= area; w++) {
    if (area % w === 0) {
      dimensions.push({ w, h: area / w });
    }
  }
  return dimensions;
}

// Generate a random partition of a grid of size (rows, cols)
// Returns a list of rectangles: { x, y, w, h }
function generateSlices(rows, cols, minArea = 2, maxArea = 16, splitProbability = 0.7) {
  const slices = [];
  const queue = [{ x: 0, y: 0, w: cols, h: rows }];

  while (queue.length > 0) {
    const rect = queue.shift();
    const area = rect.w * rect.h;

    // Determine if we should split this rectangle
    let shouldSplit = false;
    if (area > maxArea) {
      shouldSplit = true;
    } else if (area > minArea && Math.random() < splitProbability) {
      shouldSplit = true;
    }

    // AVOID 7s, 14s & FULL-SPANNING STRIPS (e.g. 1x7, 7x1, 2x7, 7x2, 1xcols or rowsx1)
    // Area 7 and 14 configurations are excessively long, splitting the board and oversimplifying logic.
    // Also block any slice that spans the full width/height in a single line (cutting the board in half).
    if (area === 7 || area === 14 || (rect.w === cols && rect.h === 1) || (rect.h === rows && rect.w === 1)) {
      shouldSplit = true;
    }

    if (!shouldSplit) {
      slices.push(rect);
      continue;
    }

    // Determine split direction:
    // Prefer splitting perpendicular to the longer side to avoid extremely skinny pieces
    let splitVertical = Math.random() < 0.5;
    if (rect.w > rect.h * 1.8) {
      splitVertical = true; // split vertically (cut width)
    } else if (rect.h > rect.w * 1.8) {
      splitVertical = false; // split horizontally (cut height)
    }

    let splitSuccess = false;

    if (splitVertical && rect.w >= 2) {
      // Choose a split point along width (1 to w-1)
      const candidates = [];
      for (let cut = 1; cut < rect.w; cut++) {
        const a1 = cut * rect.h;
        const a2 = (rect.w - cut) * rect.h;
        if (a1 >= minArea && a2 >= minArea) {
          // Staggering heuristic: Count adjacent slices whose boundaries align with this cut
          const x_cut = rect.x + cut;
          let alignCount = 0;
          for (const s of slices) {
            const yOverlap = Math.max(rect.y, s.y) < Math.min(rect.y + rect.h, s.y + s.h);
            if (yOverlap && (s.x === x_cut || s.x + s.w === x_cut)) {
              alignCount++;
            }
          }
          candidates.push({ cut, alignCount });
        }
      }

      if (candidates.length > 0) {
        // Sort ascending by alignCount to minimize boundary alignment (max staggering!)
        candidates.sort((a, b) => a.alignCount - b.alignCount);
        const minAlign = candidates[0].alignCount;
        const bestPoints = candidates.filter(c => c.alignCount === minAlign).map(c => c.cut);
        const cut = bestPoints[Math.floor(Math.random() * bestPoints.length)];

        queue.push({ x: rect.x, y: rect.y, w: cut, h: rect.h });
        queue.push({ x: rect.x + cut, y: rect.y, w: rect.w - cut, h: rect.h });
        splitSuccess = true;
      }
    }

    if (!splitSuccess && rect.h >= 2) {
      // Choose a split point along height (1 to h-1)
      const candidates = [];
      for (let cut = 1; cut < rect.h; cut++) {
        const a1 = rect.w * cut;
        const a2 = rect.w * (rect.h - cut);
        if (a1 >= minArea && a2 >= minArea) {
          // Staggering heuristic: Count adjacent slices whose boundaries align with this cut
          const y_cut = rect.y + cut;
          let alignCount = 0;
          for (const s of slices) {
            const xOverlap = Math.max(rect.x, s.x) < Math.min(rect.x + rect.w, s.x + s.w);
            if (xOverlap && (s.y === y_cut || s.y + s.h === y_cut)) {
              alignCount++;
            }
          }
          candidates.push({ cut, alignCount });
        }
      }

      if (candidates.length > 0) {
        // Sort ascending by alignCount to minimize boundary alignment (max staggering!)
        candidates.sort((a, b) => a.alignCount - b.alignCount);
        const minAlign = candidates[0].alignCount;
        const bestPoints = candidates.filter(c => c.alignCount === minAlign).map(c => c.cut);
        const cut = bestPoints[Math.floor(Math.random() * bestPoints.length)];

        queue.push({ x: rect.x, y: rect.y, w: rect.w, h: cut });
        queue.push({ x: rect.x, y: rect.y + cut, w: rect.w, h: rect.h - cut });
        splitSuccess = true;
      }
    }

    // If split failed for some reason, keep it as a slice
    if (!splitSuccess) {
      slices.push(rect);
    }
  }

  return slices;
}

// Check if a cell contains a number (from the list of numbers)
function isNumberCell(x, y, numbers) {
  return numbers.some(n => n.x === x && n.y === y);
}

// Fast Backtracking Shikaku Solver
// Returns the number of solutions (up to 2, as we only care if it's unique or not)
function countSolutions(rows, cols, numbers) {
  const totalArea = rows * cols;
  const targetArea = numbers.reduce((sum, n) => sum + n.value, 0);
  if (targetArea !== totalArea) return 0;

  // Pre-calculate all valid candidate rectangles for each number
  const numbersWithCandidates = numbers.map((num, index) => {
    const candidates = [];
    const dimensions = getRectDimensions(num.value);

    for (const dim of dimensions) {
      // The rectangle of size (dim.w x dim.h) must contain the cell (num.x, num.y)
      // So the top-left corner (rx, ry) can vary:
      // rx must be in [num.x - dim.w + 1, num.x]
      // ry must be in [num.y - dim.h + 1, num.y]
      for (let rx = num.x - dim.w + 1; rx <= num.x; rx++) {
        for (let ry = num.y - dim.h + 1; ry <= num.y; ry++) {
          // Check bounds
          if (rx < 0 || ry < 0 || rx + dim.w > cols || ry + dim.h > rows) {
            continue;
          }

          // Check that it does not contain any other numbered cell
          let hasOtherNumber = false;
          for (let otherIndex = 0; otherIndex < numbers.length; otherIndex++) {
            if (otherIndex === index) continue;
            const other = numbers[otherIndex];
            if (other.x >= rx && other.x < rx + dim.w && other.y >= ry && other.y < ry + dim.h) {
              hasOtherNumber = true;
              break;
            }
          }

          if (!hasOtherNumber) {
            candidates.push({ x: rx, y: ry, w: dim.w, h: dim.h });
          }
        }
      }
    }

    return {
      index,
      x: num.x,
      y: num.y,
      value: num.value,
      candidates
    };
  });

  // Sort by fewest candidates first (MRV heuristic) to speed up search
  numbersWithCandidates.sort((a, b) => a.candidates.length - b.candidates.length);

  // If any number has 0 candidates, no solution exists
  if (numbersWithCandidates.some(n => n.candidates.length === 0)) {
    return 0;
  }

  // Grid to track filled cells
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(false));
  let solutionsCount = 0;

  function solve(numIdx) {
    if (numIdx === numbersWithCandidates.length) {
      solutionsCount++;
      return solutionsCount >= 2; // Stop search if we find 2 or more solutions
    }

    const currentNum = numbersWithCandidates[numIdx];

    for (const cand of currentNum.candidates) {
      // Check if candidate overlaps with already filled cells
      let overlaps = false;
      for (let r = cand.y; r < cand.y + cand.h; r++) {
        for (let c = cand.x; c < cand.x + cand.w; c++) {
          if (grid[r][c]) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) break;
      }

      if (!overlaps) {
        // Place candidate
        for (let r = cand.y; r < cand.y + cand.h; r++) {
          for (let c = cand.x; c < cand.x + cand.w; c++) {
            grid[r][c] = true;
          }
        }

        // Recurse
        const stop = solve(numIdx + 1);
        if (stop) return true;

        // Backtrack
        for (let r = cand.y; r < cand.y + cand.h; r++) {
          for (let c = cand.x; c < cand.x + cand.w; c++) {
            grid[r][c] = false;
          }
        }
      }
    }

    return false;
  }

  solve(0);
  return solutionsCount;
}

/**
 * Generate a complete, verified Shikaku puzzle
 * @param {number} rows - number of rows (e.g. 5 to 12)
 * @param {number} cols - number of columns (e.g. 5 to 12)
 * @param {number} maxArea - maximum area of a partitioned slice
 * @param {number} splitProbability - chance of further partitioning a slice
 * @returns {{gridSize: {rows, cols}, numbers: Array<{x, y, value}>}}
 */
export function generateShikakuPuzzle(rows, cols, minArea = 2, maxArea = 16, splitProbability = 0.7) {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const slices = generateSlices(rows, cols, minArea, maxArea, splitProbability);
    
    // Post-generation validation to strictly filter out any 7s, 14s or full-spanning strips
    const hasForbiddenSlice = slices.some(slice => 
      slice.w * slice.h === 7 || 
      slice.w * slice.h === 14 || 
      (slice.w === cols && slice.h === 1) || 
      (slice.h === rows && slice.w === 1)
    );

    if (hasForbiddenSlice) {
      continue;
    }

    const numbers = [];

    // For each slice, place its number inside
    for (const slice of slices) {
      const area = slice.w * slice.h;
      // Select a random cell inside this slice
      const randX = slice.x + Math.floor(Math.random() * slice.w);
      const randY = slice.y + Math.floor(Math.random() * slice.h);

      numbers.push({ x: randX, y: randY, value: area });
    }

    // Sort numbers by coordinate for consistent rendering
    numbers.sort((a, b) => a.y - b.y || a.x - b.x);

    // Validate unique solution
    const solutions = countSolutions(rows, cols, numbers);
    if (solutions === 1) {
      return {
        gridSize: { rows, cols },
        numbers
      };
    }
  }

  // Fallback: If we exceed max attempts, generate a very simple grid
  // (Should rarely happen since generating slices is fast and usually yields unique solutions)
  return {
    gridSize: { rows, cols },
    numbers: [
      { x: 0, y: 0, value: rows * cols }
    ]
  };
}
