import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Clock, Star, Settings } from 'lucide-react';

export default function GameHeader() {
  const elapsedTime = useGameStore(state => state.elapsedTime);
  const currentLevel = useGameStore(state => state.currentLevel);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  return (
    <div className="game-header glass-panel" style={{ position: 'relative' }}>

      <div className="header-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0px' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.65, color: 'var(--text-secondary)', background: 'none', WebkitTextFillColor: 'initial' }}>
          {currentLevel?.isEndless ? 'Procedural' : 'Campaign'} • {currentLevel?.gridSize.rows}×{currentLevel?.gridSize.cols}
        </span>
        <span style={{ fontSize: '18px', fontWeight: '800', marginTop: '-2px', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {currentLevel?.name || 'SHIKAKU'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Settings Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            useGameStore.getState().openSettings();
          }}
          className="glass-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            background: 'rgba(255, 255, 255, 0.04)',
            transition: 'all 0.25s ease'
          }}
          title="Settings"
          id="settings-toggle-game"
        >
          <Settings size={15} />
        </button>

        <div className="timer-pill" style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
          <Clock size={15} />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>
    </div>
  );
}
