import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CAMPAIGN_PACKS } from '../data/campaignLevels';
import { Clock, ArrowRight, RotateCcw, Eye, EyeOff, Star } from 'lucide-react';

export default function WinOverlay() {
  const [minimized, setMinimized] = useState(false);
  const currentPack = useGameStore(state => state.currentPack);
  const currentLevelIndex = useGameStore(state => state.currentLevelIndex);
  const currentLevel = useGameStore(state => state.currentLevel);
  const elapsedTime = useGameStore(state => state.elapsedTime);
  const lastScoreData = useGameStore(state => state.lastScoreData);
  
  const { 
    finalScore = 0, 
    stars = 1, 
    baseScore = 0, 
    accuracyMultiplier = 1, 
    timeBonus = 0 
  } = lastScoreData || {};
  
  const resetLevel = useGameStore(state => state.resetLevel);
  const loadCampaignLevel = useGameStore(state => state.loadCampaignLevel);
  const loadEndlessLevel = useGameStore(state => state.loadEndlessLevel);

  if (!currentLevel) return null;

  const { rows } = currentLevel.gridSize;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Determine if next level exists
  let hasNextLevel = false;
  let nextPackId = null;
  let nextLevelIdx = null;

  if (currentPack && currentPack !== 'endless') {
    const packIdx = CAMPAIGN_PACKS.findIndex(p => p.id === currentPack);
    const pack = CAMPAIGN_PACKS[packIdx];

    if (currentLevelIndex + 1 < pack.levels.length) {
      hasNextLevel = true;
      nextPackId = currentPack;
      nextLevelIdx = currentLevelIndex + 1;
    } else if (packIdx + 1 < CAMPAIGN_PACKS.length) {
      hasNextLevel = true;
      nextPackId = CAMPAIGN_PACKS[packIdx + 1].id;
      nextLevelIdx = 0;
    }
  }

  const handleNextLevel = () => {
    if (hasNextLevel) {
      loadCampaignLevel(nextPackId, nextLevelIdx);
    } else if (currentLevel.isEndless) {
      loadEndlessLevel(); // Let it scale dynamically based on the new levelNumber!
    }
  };

  return (
    <div className={`win-overlay-container ${minimized ? 'minimized' : ''}`}>
      {/* Floating Restore Button (rendered only when minimized) */}
      {minimized && (
        <button 
          className="glass-button glass-button-primary restore-win-btn fade-in"
          onClick={() => setMinimized(false)}
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            zIndex: 99999,
            boxShadow: '0 0 20px var(--theme-accent-glow)',
            animation: 'fadeIn 0.3s ease forwards'
          }}
        >
          <EyeOff size={16} />
          <span>Show Results Panel</span>
        </button>
      )}

      <div className="win-card glass-panel">
        <h2 className="win-title">Level Cleared!</h2>
        
        {/* Glowing Stars Display */}
        <div className="win-stars-container" style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
          {[1, 2, 3].map(starNum => (
            <Star 
              key={starNum}
              size={36} 
              fill={starNum <= stars ? '#10b981' : 'transparent'} 
              color={starNum <= stars ? '#10b981' : 'var(--glass-border)'}
              style={{
                filter: starNum <= stars ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))' : 'none',
                transform: starNum === 2 ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            />
          ))}
        </div>

        {/* Massive Final Score */}
        <div className="win-score-display">
          <div className="win-score-label">Final Score</div>
          <div className="win-score-value">
            {finalScore.toLocaleString()}
          </div>
        </div>

        {/* Score Breakdown (Grid) */}
        <div className="win-stat-grid">
          <div className="win-stat-box">
            <div className="win-stat-label">Time</div>
            <div className="win-stat-value">{formatTime(elapsedTime)}</div>
          </div>
          <div className="win-stat-box">
            <div className="win-stat-label">Accuracy</div>
            <div className="win-stat-value" style={{ color: accuracyMultiplier === 1 ? 'var(--score-color, #10b981)' : '#f59e0b' }}>
              {accuracyMultiplier.toFixed(2)}x
            </div>
          </div>
          <div className="win-stat-box win-stat-box-full">
            <span className="win-stat-label-large">Time Bonus:</span>
            <span className="win-stat-value" style={{ color: timeBonus > 0 ? 'var(--score-color, #10b981)' : 'var(--text-primary)' }}>
              +{timeBonus}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="win-buttons" style={{ width: '100%' }}>
          {(hasNextLevel || currentLevel.isEndless) && (
            <button 
              className="glass-button glass-button-primary win-btn-action"
              onClick={handleNextLevel}
              style={{ marginBottom: '12px', width: '100%' }}
            >
              <span>{currentLevel.isEndless ? 'Generate Another' : 'Next Level'}</span>
              <ArrowRight size={18} />
            </button>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
            <button className="glass-button" onClick={resetLevel} style={{ width: '100%' }}>
              <RotateCcw size={16} />
              <span>Retry</span>
            </button>
            <button 
              className="glass-button" 
              onClick={() => setMinimized(true)} 
              style={{ width: '100%', border: '1px dashed rgba(255,255,255,0.15)' }}
            >
              <Eye size={16} />
              <span>Inspect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
