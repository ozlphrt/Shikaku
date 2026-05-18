import React, { useEffect, useState } from 'react';
import './App.css';
import { useGameStore } from './store/gameStore';
import CampaignView from './components/CampaignView';
import GameView from './components/GameView';
import WinOverlay from './components/WinOverlay';
import SettingsModal from './components/SettingsModal';
import TutorialOverlay from './components/TutorialOverlay';
import { RefreshCw, X } from 'lucide-react';

function App() {
  const gameState = useGameStore(state => state.gameState);
  const theme = useGameStore(state => state.theme);
  const setTheme = useGameStore(state => state.setTheme);
  const palette = useGameStore(state => state.palette);
  const setPalette = useGameStore(state => state.setPalette);
  const isSettingsOpen = useGameStore(state => state.isSettingsOpen);
  const closeSettings = useGameStore(state => state.closeSettings);
  const hasSeenTutorial = useGameStore(state => state.hasSeenTutorial);
  const completeTutorial = useGameStore(state => state.completeTutorial);

  const startTimer = useGameStore(state => state.startTimer);
  const updateAvailable = useGameStore(state => state.updateAvailable);
  const checkAppVersion = useGameStore(state => state.checkAppVersion);
  const [dismissedUpdate, setDismissedUpdate] = useState(false);

  // Sync theme and palette variables on mount
  useEffect(() => {
    setTheme(theme);
    setPalette(palette);
    startTimer(); // Immediately kick off the game timer on load

    // Remote version check if client is online
    if (navigator.onLine) {
      checkAppVersion();
    }
  }, [theme, setTheme, palette, setPalette, startTimer, checkAppVersion]);

  // Handle mouse wheel scrolling to cycle palettes
  useEffect(() => {
    const PALETTES = [
      'obsidian',
      'quartz',
      'aurora',
      'cyberpunk',
      'crimson',
      'amethyst',
      'mintjelly',
      'sunset',
      'monochrome',
      'mintchoc'
    ];

    let lastScrollTime = 0;

    const handleWheel = (e) => {
      // Ignore wheel events if target is inside scrollable elements
      const isScrollable = e.target.closest(
        '.campaign-pack-levels, .rules-content, .palette-dropdown'
      );
      if (isScrollable) return;

      const now = Date.now();
      if (now - lastScrollTime < 220) {
        // Debounce/throttle fast scrolls
        e.preventDefault();
        return;
      }
      lastScrollTime = now;

      e.preventDefault();

      const currentIndex = PALETTES.indexOf(palette);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.deltaY > 0) {
        nextIndex = (currentIndex + 1) % PALETTES.length;
      } else if (e.deltaY < 0) {
        nextIndex = (currentIndex - 1 + PALETTES.length) % PALETTES.length;
      }

      if (nextIndex !== currentIndex) {
        setPalette(PALETTES[nextIndex]);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [palette, setPalette]);

  return (
    <div className="app-container">
      {/* Hidden SVG Filter for Rustic Carving Effects */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <filter id="rustic-carve" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <GameView />

      {/* 
        Sliding win panel 
      */}
      {gameState === 'won' && <WinOverlay />}
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />

      {/* Onboarding Interactive Self-Playing Tutorial */}
      {!hasSeenTutorial && <TutorialOverlay onComplete={completeTutorial} />}

      {/* Stunning Glassmorphic Remote Update Notification Banner */}
      {updateAvailable && !dismissedUpdate && (
        <div 
          className="update-notification-banner"
          onClick={() => window.location.reload(true)}
          title="Click to install update and reload"
        >
          <div className="update-text">
            <RefreshCw size={18} className="update-icon-pulse" />
            <span>New update available!</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="update-action-btn">Update</button>
            <button 
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setDismissedUpdate(true);
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
