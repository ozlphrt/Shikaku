import React, { useEffect } from 'react';
import './App.css';
import { useGameStore } from './store/gameStore';
import CampaignView from './components/CampaignView';
import GameView from './components/GameView';
import WinOverlay from './components/WinOverlay';
import SettingsModal from './components/SettingsModal';

function App() {
  const gameState = useGameStore(state => state.gameState);
  const theme = useGameStore(state => state.theme);
  const setTheme = useGameStore(state => state.setTheme);
  const palette = useGameStore(state => state.palette);
  const setPalette = useGameStore(state => state.setPalette);
  const isSettingsOpen = useGameStore(state => state.isSettingsOpen);
  const closeSettings = useGameStore(state => state.closeSettings);

  // Sync theme and palette variables on mount
  useEffect(() => {
    setTheme(theme);
    setPalette(palette);
  }, [theme, setTheme, palette, setPalette]);

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

      {/* 
        Menu / Level Select screen 
      */}
      {gameState === 'menu' && <CampaignView />}

      {/* 
        Active puzzle stage 
      */}
      {(gameState === 'playing' || gameState === 'won') && <GameView />}

      {/* 
        Sliding win panel 
      */}
      {gameState === 'won' && <WinOverlay />}
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}

export default App;
