import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Clock, Star, Settings, Award } from 'lucide-react';

export default function GameHeader() {
  const elapsedTime = useGameStore(state => state.elapsedTime);
  const currentLevel = useGameStore(state => state.currentLevel);
  const moveCount = useGameStore(state => state.moveCount);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Calculate live score
  let liveScore = 0;
  if (currentLevel && currentLevel.numbers) {
    const { rows, cols } = currentLevel.gridSize;
    const cellCount = rows * cols;
    const perfectMoves = currentLevel.numbers.length;
    
    const baseScore = cellCount * 40;
    const extraMoves = Math.max(0, moveCount - perfectMoves);
    const accuracyMultiplier = Math.max(0.5, 1.0 - (extraMoves * 0.05));
    
    const parTime = cellCount * 1.2;
    const timeUnderPar = Math.max(0, parTime - elapsedTime);
    const timeBonus = Math.floor(timeUnderPar * 15);
    
    liveScore = Math.floor((baseScore * accuracyMultiplier) + timeBonus);
  }

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

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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

        <div className="timer-pill" style={{ height: '32px', display: 'flex', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <Star size={15} fill="#10b981" />
          <span style={{ fontWeight: 800 }}>{liveScore.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
