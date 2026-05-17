import { create } from 'zustand';
import { generateShikakuPuzzle } from '../utils/shikakuGenerator';
import { CAMPAIGN_PACKS } from '../data/campaignLevels';

// Helper: Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Load progress from LocalStorage
const loadProgressFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_campaign_progress');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
  }
  return {
    completedLevels: {}, // levelId -> { stars, time }
    stars: 0
  };
};

// Save progress to LocalStorage
const saveProgressToStorage = (progress) => {
  try {
    localStorage.setItem('shikaku_campaign_progress', JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
};

// Load theme from localStorage
const loadThemeFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_theme');
    if (saved) return saved;
  } catch (e) {
    console.error('Failed to load theme from localStorage', e);
  }
  return 'dark';
};

// Save theme to localStorage
const saveThemeToStorage = (theme) => {
  try {
    localStorage.setItem('shikaku_theme', theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
};

// Load palette from localStorage
const loadPaletteFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_palette');
    if (saved) return saved;
  } catch (e) {
    console.error('Failed to load palette from localStorage', e);
  }
  return 'mintchoc';
};

// Save palette to localStorage
const savePaletteToStorage = (palette) => {
  try {
    localStorage.setItem('shikaku_palette', palette);
  } catch (e) {
    console.error('Failed to save palette to localStorage', e);
  }
};

export const useGameStore = create((set, get) => ({
  // Navigation & Game State
  gameState: 'menu', // 'menu', 'playing', 'won'
  campaignProgress: loadProgressFromStorage(),
  theme: loadThemeFromStorage(),
  palette: loadPaletteFromStorage(),
  isSettingsOpen: false,
  
  // Active Level info
  currentPack: null,
  currentLevelIndex: null,
  currentLevel: null, // { id, name, gridSize: { rows, cols }, numbers: [...] }
  
  // Playing State
  rectangles: [], // List of user-drawn { id, x, y, w, h }
  activeDraw: null, // { startX, startY, currentX, currentY } (coordinates of starting & current cells)

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  
  setTheme: (theme) => {
    set({ theme });
    saveThemeToStorage(theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.setAttribute('data-theme', 'dark');
    }
  },
  
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setPalette: (palette) => {
    set({ palette });
    savePaletteToStorage(palette);
    document.body.setAttribute('data-palette', palette);
  },
  
  // Game metrics
  startTime: null,
  elapsedTime: 0,
  timerInterval: null,
  
  // Undo / Redo history
  history: [], // array of rectangles states (JSON string or copy of array)
  redoStack: [], // array of rectangles states
  
  // Actions
  
  // Start the timer
  startTimer: () => {
    get().stopTimer();
    const interval = setInterval(() => {
      set(state => ({ elapsedTime: state.elapsedTime + 1 }));
    }, 1000);
    set({ timerInterval: interval });
  },

  // Stop the timer
  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({ timerInterval: null });
  },
  
  // Load a Campaign Level
  loadCampaignLevel: (packId, levelIndex) => {
    const pack = CAMPAIGN_PACKS.find(p => p.id === packId);
    if (!pack || levelIndex < 0 || levelIndex >= pack.levels.length) return;
    
    const level = pack.levels[levelIndex];
    
    set({
      gameState: 'playing',
      currentPack: packId,
      currentLevelIndex: levelIndex,
      currentLevel: level,
      rectangles: [],
      activeDraw: null,
      elapsedTime: 0,
      startTime: Date.now(),
      history: [],
      redoStack: []
    });
    
    get().startTimer();
  },

  // Load an Endless Mode / Custom Level
  loadEndlessLevel: (size) => {
    const puzzle = generateShikakuPuzzle(size, size);
    const level = {
      id: `endless_${size}_${Date.now()}`,
      name: `Endless ${size} × ${size}`,
      gridSize: puzzle.gridSize,
      numbers: puzzle.numbers,
      isEndless: true
    };
    
    set({
      gameState: 'playing',
      currentPack: 'endless',
      currentLevelIndex: null,
      currentLevel: level,
      rectangles: [],
      activeDraw: null,
      elapsedTime: 0,
      startTime: Date.now(),
      history: [],
      redoStack: []
    });
    
    get().startTimer();
  },

  // Go back to the main menu
  exitToMenu: () => {
    get().stopTimer();
    set({
      gameState: 'menu',
      currentLevel: null,
      rectangles: [],
      activeDraw: null
    });
  },

  // Restart the current level
  resetLevel: () => {
    set({
      rectangles: [],
      activeDraw: null,
      history: [],
      redoStack: [],
      elapsedTime: 0,
      startTime: Date.now()
    });
  },

  // Save current state to history (for Undo)
  pushToHistory: () => {
    const { rectangles, history } = get();
    set({
      history: [...history, JSON.stringify(rectangles)],
      redoStack: [] // Clear redo on new action
    });
  },

  // Undo last action
  undo: () => {
    const { history, rectangles, redoStack } = get();
    if (history.length === 0) return;
    
    const previous = JSON.parse(history[history.length - 1]);
    set({
      rectangles: previous,
      history: history.slice(0, -1),
      redoStack: [...redoStack, JSON.stringify(rectangles)]
    });
  },

  // Redo undone action
  redo: () => {
    const { redoStack, rectangles, history } = get();
    if (redoStack.length === 0) return;
    
    const next = JSON.parse(redoStack[redoStack.length - 1]);
    set({
      rectangles: next,
      redoStack: redoStack.slice(0, -1),
      history: [...history, JSON.stringify(rectangles)]
    });
  },

  // Touch/Mouse draw starts
  startDraw: (cellX, cellY) => {
    if (get().gameState !== 'playing') return;
    set({
      activeDraw: {
        startX: cellX,
        startY: cellY,
        currentX: cellX,
        currentY: cellY
      }
    });
  },

  // Touch/Mouse drag moves
  updateDraw: (cellX, cellY) => {
    const { activeDraw } = get();
    if (!activeDraw) return;
    set({
      activeDraw: {
        ...activeDraw,
        currentX: cellX,
        currentY: cellY
      }
    });
  },

  // Touch/Mouse draw completes
  endDraw: () => {
    const { activeDraw, rectangles, currentLevel } = get();
    if (!activeDraw || !currentLevel) return;

    const { startX, startY, currentX, currentY } = activeDraw;
    
    // Bounds of the new rectangle
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(startX - currentX) + 1;
    const h = Math.abs(startY - currentY) + 1;

    // Check if the rectangle is "right-sized":
    // 1. Must contain EXACTLY ONE number cell
    // 2. The area (w * h) must match that number's value
    const { numbers } = currentLevel;
    const numbersInRect = numbers.filter(n => 
      n.x >= x && n.x < x + w &&
      n.y >= y && n.y < y + h
    );

    const isRightSized = numbersInRect.length === 1 && (w * h === numbersInRect[0].value);

    // If released too early or too late, do not save it, simply cancel active draw
    if (!isRightSized) {
      set({ activeDraw: null });
      return;
    }
    
    // Save to history before modifying state (only for successful commits!)
    get().pushToHistory();

    // Interaction Rule: Auto-delete any existing rectangles that overlap with this new one
    const newRect = { id: generateId(), x, y, w, h };
    const filteredRects = rectangles.filter(rect => {
      // Check overlap
      const xOverlap = Math.max(0, Math.min(rect.x + rect.w, x + w) - Math.max(rect.x, x));
      const yOverlap = Math.max(0, Math.min(rect.y + rect.h, y + h) - Math.max(rect.y, y));
      return !(xOverlap > 0 && yOverlap > 0); // Keep only non-overlapping
    });

    set({
      rectangles: [...filteredRects, newRect],
      activeDraw: null
    });

    // Check if the level is won
    get().checkWinState();
  },

  // Cancel drawing (if user drags outside board boundaries)
  cancelDraw: () => {
    set({ activeDraw: null });
  },

  // Delete a specific rectangle (by tapping it)
  removeRectangle: (rectId) => {
    const { rectangles } = get();
    get().pushToHistory();
    set({
      rectangles: rectangles.filter(r => r.id !== rectId)
    });
  },

  // Check the correctness of all rectangles and see if level is fully completed
  checkWinState: () => {
    const { currentLevel, rectangles } = get();
    if (!currentLevel) return;
    
    const { rows, cols } = currentLevel.gridSize;
    const { numbers } = currentLevel;

    // 1. Check if the sum of areas of rectangles covers the entire board area
    const totalBoardArea = rows * cols;
    const totalRectsArea = rectangles.reduce((sum, r) => sum + r.w * r.h, 0);
    if (totalRectsArea !== totalBoardArea) return; // Must cover all cells

    // 2. Map cells to rectangles to check for overlaps
    const coverage = Array(rows).fill(null).map(() => Array(cols).fill(false));
    let cellOverlap = false;

    for (const rect of rectangles) {
      for (let r = rect.y; r < rect.y + rect.h; r++) {
        for (let c = rect.x; c < rect.x + rect.w; c++) {
          if (r < 0 || r >= rows || c < 0 || c >= cols) continue; // Out of bounds safety
          if (coverage[r][c]) {
            cellOverlap = true;
          }
          coverage[r][c] = true;
        }
      }
    }
    if (cellOverlap) return; // No overlapping cells allowed

    // 3. Each rectangle must contain EXACTLY ONE number, and its area must match the number's value
    for (const rect of rectangles) {
      const numbersInRect = numbers.filter(n => 
        n.x >= rect.x && n.x < rect.x + rect.w &&
        n.y >= rect.y && n.y < rect.y + rect.h
      );

      if (numbersInRect.length !== 1) return; // Must contain exactly one number
      if (rect.w * rect.h !== numbersInRect[0].value) return; // Area must match value
    }

    // If we made it here, the puzzle is perfectly solved!
    get().stopTimer();
    
    // Calculate star rating (1 to 3 stars based on solving speed relative to grid complexity)
    const timeSpent = get().elapsedTime;
    let stars = 3;
    const cellCount = rows * cols;

    // Time thresholds for stars:
    // e.g. 5x5 (25 cells) -> < 15s (3 stars), < 40s (2 stars), else 1 star
    // Scale by total cell count
    const threeStarThreshold = cellCount * 0.8;
    const twoStarThreshold = cellCount * 2.2;

    if (timeSpent > twoStarThreshold) {
      stars = 1;
    } else if (timeSpent > threeStarThreshold) {
      stars = 2;
    }

    set({ gameState: 'won' });

    // Save progress if this is a campaign level
    if (currentLevel.id && !currentLevel.isEndless) {
      const { campaignProgress } = get();
      const existingRecord = campaignProgress.completedLevels[currentLevel.id];
      
      const newStars = existingRecord ? Math.max(existingRecord.stars, stars) : stars;
      const newTime = existingRecord ? Math.min(existingRecord.time, timeSpent) : timeSpent;
      
      const updatedLevels = {
        ...campaignProgress.completedLevels,
        [currentLevel.id]: { stars: newStars, time: newTime }
      };

      // Calculate total star count
      const totalStars = Object.values(updatedLevels).reduce((sum, lvl) => sum + lvl.stars, 0);

      const newProgress = {
        completedLevels: updatedLevels,
        stars: totalStars
      };

      set({ campaignProgress: newProgress });
      saveProgressToStorage(newProgress);
    }
  }
}));
