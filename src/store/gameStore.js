import { create } from 'zustand';
import { generateShikakuPuzzle } from '../utils/shikakuGenerator';
import { CAMPAIGN_PACKS } from '../data/campaignLevels';
import { playClickSound, playBounceSound, playVictorySound } from '../utils/audioEffects';

// Helper: Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Load sound state from localStorage
const loadSoundFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_sound');
    if (saved) return saved === 'true';
  } catch (e) {
    console.error('Failed to load sound from localStorage', e);
  }
  return true; // Enabled by default
};

// Save sound state to localStorage
const saveSoundToStorage = (enabled) => {
  try {
    localStorage.setItem('shikaku_sound', enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save sound to localStorage', e);
  }
};

// Load color by number state from localStorage
const loadColorByNumberFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_color_by_number');
    if (saved) return saved === 'true';
  } catch (e) {
    console.error('Failed to load color_by_number from localStorage', e);
  }
  return false; // Disabled by default
};

// Save color by number state to localStorage
const saveColorByNumberToStorage = (enabled) => {
  try {
    localStorage.setItem('shikaku_color_by_number', enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save color_by_number to localStorage', e);
  }
};

// Save current session to localStorage
const saveSessionToStorage = (session) => {
  try {
    localStorage.setItem('shikaku_active_session', JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
  }
};

// Load current session from localStorage
const loadSessionFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_active_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.currentLevel && parsed.rectangles) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load session from localStorage', e);
  }
  return null;
};

// Save level number to localStorage
const saveLevelNumberToStorage = (levelNum) => {
  try {
    localStorage.setItem('shikaku_level_number', String(levelNum));
  } catch (e) {
    console.error('Failed to save level number to localStorage', e);
  }
};

// Load level number from localStorage
const loadLevelNumberFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_level_number');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load level number from localStorage', e);
  }
  return 1;
};

// Grid size scaling based on level number
const getSizeForLevel = (levelNum) => {
  if (levelNum <= 3) return 5;
  if (levelNum <= 7) return 6;
  if (levelNum <= 12) return 7;
  if (levelNum <= 18) return 8;
  if (levelNum <= 24) return 9;
  if (levelNum <= 32) return 10;
  if (levelNum <= 42) return 11;
  return 12; // Level 43+ is 12x12
};

// Difficulty scaling helper
const getDifficultyForLevel = (levelNum) => {
  const size = getSizeForLevel(levelNum);
  let minArea = 2;
  let maxArea = 8;
  let splitProb = 0.62;

  if (size <= 5) {
    minArea = 2;
    maxArea = 8;
    splitProb = 0.62;
  } else if (size === 6) {
    minArea = 2;
    maxArea = 12;
    splitProb = 0.58;
  } else if (size === 7) {
    minArea = 2;
    maxArea = 16;
    splitProb = 0.54;
  } else if (size === 8) {
    minArea = 2;
    maxArea = 18;
    splitProb = 0.50;
  } else if (size === 9) {
    minArea = 2;
    maxArea = 20;
    splitProb = 0.48;
  } else if (size === 10) {
    minArea = 2;
    maxArea = 24;
    splitProb = 0.45;
  } else if (size === 11) {
    minArea = 3;
    maxArea = 28;
    splitProb = 0.42;
  } else {
    // 12x12
    minArea = 3;
    maxArea = 36;
    splitProb = 0.40;
  }

  return { minArea, maxArea, splitProb, size };
};

// Helper: Save current session from store getters
const saveCurrentSession = (state) => {
  if (state.currentLevel && state.currentLevel.isEndless) {
    saveSessionToStorage({
      levelNumber: state.levelNumber,
      currentLevel: state.currentLevel,
      rectangles: state.rectangles,
      elapsedTime: state.elapsedTime,
      gameState: state.gameState
    });
  }
};

// Determine initial state by restoring saved session or saved level number
const savedSession = loadSessionFromStorage();
const savedLevelNum = loadLevelNumberFromStorage();

let initialLevel;
let initialLevelNumber = savedLevelNum;
let initialRectangles = [];
let initialElapsedTime = 0;
let initialGameState = 'playing';

if (savedSession) {
  initialLevel = savedSession.currentLevel;
  initialLevelNumber = savedSession.levelNumber;
  initialRectangles = savedSession.rectangles;
  initialElapsedTime = savedSession.elapsedTime;
  initialGameState = savedSession.gameState;
} else {
  // Generate fresh starting level for savedLevelNum
  const diff = getDifficultyForLevel(savedLevelNum);
  const initialPuzzle = generateShikakuPuzzle(diff.size, diff.size, diff.minArea, diff.maxArea, diff.splitProb);
  initialLevel = {
    id: `endless_${diff.size}_${Date.now()}`,
    name: `Level ${savedLevelNum}`,
    gridSize: initialPuzzle.gridSize,
    numbers: initialPuzzle.numbers,
    isEndless: true
  };
}

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

// Load stars from localStorage
const loadStarsFromStorage = () => {
  try {
    const saved = localStorage.getItem('shikaku_stars_earned');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load stars from localStorage', e);
  }
  return {};
};

// Save stars to localStorage
const saveStarsToStorage = (starsEarned) => {
  try {
    localStorage.setItem('shikaku_stars_earned', JSON.stringify(starsEarned));
  } catch (e) {
    console.error('Failed to save stars to localStorage', e);
  }
};

export const useGameStore = create((set, get) => ({
  // Navigation & Game State
  gameState: initialGameState, // Resume previous game state (playing/won) on startup
  campaignProgress: loadProgressFromStorage(),
  theme: loadThemeFromStorage(),
  palette: loadPaletteFromStorage(),
  soundEnabled: loadSoundFromStorage(),
  hasSeenTutorial: (() => {
    try {
      return localStorage.getItem('shikaku_seen_tutorial') === 'true';
    } catch (e) {
      return false;
    }
  })(),
  isSettingsOpen: false,
  levelNumber: initialLevelNumber, // Track saved sequential level progression
  starsEarned: loadStarsFromStorage(),
  moveCount: 0,
  lastScoreData: null,
  appVersion: '2.8.3',
  updateAvailable: false,
  colorByNumber: loadColorByNumberFromStorage(),

  checkAppVersion: async () => {
    if (!navigator.onLine) return;
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.version && data.version !== get().appVersion) {
          set({ updateAvailable: true });
        }
      }
    } catch (e) {
      console.warn('Failed to check app version', e);
    }
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    set({ soundEnabled: next });
    saveSoundToStorage(next);
  },

  toggleColorByNumber: () => {
    const next = !get().colorByNumber;
    set({ colorByNumber: next });
    saveColorByNumberToStorage(next);
  },

  completeTutorial: () => {
    set({ hasSeenTutorial: true });
    try {
      localStorage.setItem('shikaku_seen_tutorial', 'true');
    } catch (e) {
      console.error(e);
    }
  },

  resetTutorial: () => {
    set({ hasSeenTutorial: false, isSettingsOpen: false });
    try {
      localStorage.removeItem('shikaku_seen_tutorial');
    } catch (e) {
      console.error(e);
    }
  },

  resetEndlessProgress: () => {
    try {
      localStorage.removeItem('shikaku_session');
    } catch (e) {}
    set({ levelNumber: 0, isSettingsOpen: false });
    saveLevelNumberToStorage(0);
    get().loadEndlessLevel();
  },
  
  // Active Level info
  currentPack: 'endless',
  currentLevelIndex: null,
  currentLevel: initialLevel,
  
  // Playing State
  rectangles: initialRectangles, // List of user-drawn { id, x, y, w, h } restored on load
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
  elapsedTime: initialElapsedTime, // Restore saved timers
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
      saveCurrentSession(get()); // Sync active timer to storage on every tick
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
      redoStack: [],
      moveCount: 0,
      lastScoreData: null
    });
    
    get().startTimer();
    get().checkAppVersion();
  },

  // Load an Endless Mode / Custom Level
  loadEndlessLevel: (size) => {
    const nextLevelNum = get().levelNumber + 1;
    const diff = getDifficultyForLevel(nextLevelNum);
    const targetSize = size || diff.size;

    const puzzle = generateShikakuPuzzle(targetSize, targetSize, diff.minArea, diff.maxArea, diff.splitProb);
    const level = {
      id: `endless_${targetSize}_${Date.now()}`,
      name: `Level ${nextLevelNum}`,
      gridSize: puzzle.gridSize,
      numbers: puzzle.numbers,
      isEndless: true
    };
    
    set({
      gameState: 'playing',
      currentPack: 'endless',
      currentLevelIndex: null,
      currentLevel: level,
      levelNumber: nextLevelNum,
      rectangles: [],
      activeDraw: null,
      elapsedTime: 0,
      startTime: Date.now(),
      history: [],
      redoStack: [],
      moveCount: 0,
      lastScoreData: null
    });
    
    saveLevelNumberToStorage(nextLevelNum);
    saveCurrentSession(get());
    get().startTimer();
    get().checkAppVersion();
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
      startTime: Date.now(),
      moveCount: 0,
      lastScoreData: null
    });
    saveCurrentSession(get());
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
    saveCurrentSession(get());
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
    saveCurrentSession(get());
  },

  // Touch/Mouse draw starts
  startDraw: (cellX, cellY) => {
    if (get().gameState !== 'playing') return;
    
    const { rectangles } = get();
    // Check if there is an existing rectangle covering the starting cell (cellX, cellY)
    const coveringRect = rectangles.find(r => 
      cellX >= r.x && cellX < r.x + r.w &&
      cellY >= r.y && cellY < r.y + r.h
    );

    if (coveringRect) {
      get().pushToHistory();
      set({
        rectangles: rectangles.filter(r => r.id !== coveringRect.id)
      });
      saveCurrentSession(get());
    }

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
    const { activeDraw, soundEnabled } = get();
    if (!activeDraw) return;
    if (activeDraw.currentX === cellX && activeDraw.currentY === cellY) return;

    set({
      activeDraw: {
        ...activeDraw,
        currentX: cellX,
        currentY: cellY
      }
    });

    if (soundEnabled) {
      playClickSound();
    }
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

    saveCurrentSession(get());

    if (get().soundEnabled) {
      playBounceSound();
    }

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
    saveCurrentSession(get());
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
    
    // Calculate final score using Hybrid Math
    const timeSpent = get().elapsedTime;
    const { moveCount, starsEarned } = get();
    const cellCount = rows * cols;
    const perfectMoves = numbers.length;
    
    // Base Score: (rows * cols) * 40
    const baseScore = cellCount * 40;
    
    // Accuracy Multiplier: drops by 0.05 for every extra move over perfectMoves
    const extraMoves = Math.max(0, moveCount - perfectMoves);
    const accuracyMultiplier = Math.max(0.5, 1.0 - (extraMoves * 0.05));
    
    // Par Time: cellCount * 1.2s
    const parTime = cellCount * 1.2;
    const timeUnderPar = Math.max(0, parTime - timeSpent);
    const timeBonus = Math.floor(timeUnderPar * 15);
    
    // Final Score
    const finalScore = Math.floor((baseScore * accuracyMultiplier) + timeBonus);
    
    // Calculate Star Rating
    let stars = 1;
    if (accuracyMultiplier === 1.0 && timeBonus > 0) {
      stars = 3; // Flawless and Fast
    } else if (finalScore >= baseScore * 0.7) {
      stars = 2; // Great
    }
    
    // Update global starsEarned
    const levelId = currentLevel.id || `level_${get().levelNumber}`;
    const prevStars = starsEarned[levelId] || 0;
    const newStarsEarned = {
      ...starsEarned,
      [levelId]: Math.max(prevStars, stars)
    };
    saveStarsToStorage(newStarsEarned);

    const lastScoreData = {
      baseScore,
      accuracyMultiplier,
      timeBonus,
      finalScore,
      stars,
      moveCount,
      perfectMoves,
      parTime,
      timeSpent
    };

    set({ 
      gameState: 'won', 
      starsEarned: newStarsEarned,
      lastScoreData 
    });

    // Save progression and register win to store
    saveLevelNumberToStorage(get().levelNumber + 1);
    saveCurrentSession(get());

    if (get().soundEnabled) {
      playVictorySound();
    }

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
