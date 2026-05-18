import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CAMPAIGN_PACKS } from '../data/campaignLevels';
import { Clock, ArrowRight, RotateCcw } from 'lucide-react';
export default function WinOverlay() {
  const currentPack = useGameStore(state => state.currentPack);
  const currentLevelIndex = useGameStore(state => state.currentLevelIndex);
  const currentLevel = useGameStore(state => state.currentLevel);
  const elapsedTime = useGameStore(state => state.elapsedTime);
  
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
      loadEndlessLevel(rows);
    }
  };

  return (
    <div className="win-overlay-container">
      <div className="win-card glass-panel">
        <h2 className="win-title">Level Cleared!</h2>
        
        {/* Luminous Solving Time Readout */}
        <div className="win-stat-box" style={{ width: '100%', margin: '4px 0 8px 0' }}>
          <div className="win-stat-label" style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.6 }}>
            Solving Time
          </div>
          <div className="win-stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
            <Clock size={20} style={{ color: '#10b981' }} />
            <span>{formatTime(elapsedTime)}</span>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', width: '100%' }}>
            <button className="glass-button" onClick={resetLevel} style={{ width: '100%' }}>
              <RotateCcw size={16} />
              <span>Retry Level</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
