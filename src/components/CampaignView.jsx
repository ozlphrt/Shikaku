import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CAMPAIGN_PACKS } from '../data/campaignLevels';
import { Star, Sparkles, ChevronDown, ChevronUp, Lock, Settings } from 'lucide-react';

export default function CampaignView() {
  const campaignProgress = useGameStore(state => state.campaignProgress);
  const loadCampaignLevel = useGameStore(state => state.loadCampaignLevel);
  const loadEndlessLevel = useGameStore(state => state.loadEndlessLevel);
  const levelNumber = useGameStore(state => state.levelNumber);
  const starsEarned = useGameStore(state => state.starsEarned);

  // Track which section is expanded ('easy', 'medium', 'hard', 'endless')
  const [expandedSection, setExpandedSection] = useState('easy');

  // Helper: check if a campaign level is unlocked
  const isLevelUnlocked = (packId, levelIndex) => {
    const packIdx = CAMPAIGN_PACKS.findIndex(p => p.id === packId);
    if (packIdx === 0 && levelIndex === 0) return true;

    let prevPackIdx = packIdx;
    let prevLvlIdx = levelIndex - 1;

    if (prevLvlIdx < 0) {
      prevPackIdx = packIdx - 1;
      prevLvlIdx = CAMPAIGN_PACKS[prevPackIdx].levels.length - 1;
    }

    const prevLevel = CAMPAIGN_PACKS[prevPackIdx].levels[prevLvlIdx];
    return !!campaignProgress.completedLevels[prevLevel.id];
  };

  const handleToggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="campaign-menu fade-in" style={{ padding: '8px 4px' }}>
      
      {/* Sleek, Minimalist Top Header Bar */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 20px', 
        borderRadius: '16px',
        marginBottom: '16px',
        position: 'relative',
        zIndex: 110
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--text-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          SHIKAKU
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              width: '36px',
              height: '36px',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              background: 'rgba(255, 255, 255, 0.04)',
              transition: 'all 0.25s ease'
            }}
            title="Settings"
            id="settings-toggle-menu"
          >
            <Settings size={18} />
          </button>

          <div className="stars-pill" style={{ padding: '4px 12px', fontSize: '13px', height: '36px', display: 'flex', alignItems: 'center' }}>
            <Star size={13} fill="#fbbf24" stroke="#fbbf24" style={{ marginRight: '6px' }} />
            <span>{campaignProgress.stars} Stars</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Stack */}
      <div className="campaign-grid" style={{ gap: '12px' }}>
        
        {/* Campaign Packs */}
        {CAMPAIGN_PACKS.map(pack => {
          const isExpanded = expandedSection === pack.id;
          const packLevelIds = pack.levels.map(l => l.id);
          const packCompletedCount = packLevelIds.filter(id => !!campaignProgress.completedLevels[id]).length;
          
          return (
            <div 
              key={pack.id} 
              className="pack-card glass-panel" 
              onClick={() => handleToggleSection(pack.id)}
              style={{ 
                padding: '14px 18px', 
                borderRadius: '16px',
                borderLeft: isExpanded ? `3px solid var(--accent-${pack.id === 'easy' ? 'cyan' : pack.id === 'medium' ? 'purple' : 'rose'})` : '1px solid var(--glass-border)'
              }}
            >
              <div className="pack-header" style={{ margin: 0, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 className="pack-name" style={{ fontSize: '20px', fontWeight: '700' }}>
                    {pack.name}
                  </h3>
                  <span style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {packCompletedCount}/{pack.levels.length}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>

              {/* Expandable levels grid */}
              {isExpanded && (
                <div className="levels-drawer" onClick={(e) => e.stopPropagation()} style={{ marginTop: '14px', paddingTop: '14px' }}>
                  {pack.levels.map((level, idx) => {
                    const unlocked = isLevelUnlocked(pack.id, idx);
                    const record = campaignProgress.completedLevels[level.id];
                    const starsWon = starsEarned[level.id] || (record ? record.stars : 0);

                    return (
                      <button
                        key={level.id}
                        className={`level-select-btn ${record ? 'completed' : ''}`}
                        disabled={!unlocked}
                        style={{ 
                          opacity: unlocked ? 1 : 0.3, 
                          cursor: unlocked ? 'pointer' : 'not-allowed',
                          borderRadius: '10px'
                        }}
                        onClick={() => loadCampaignLevel(pack.id, idx)}
                      >
                        {!unlocked ? (
                          <Lock size={13} style={{ color: 'var(--text-muted)' }} />
                        ) : (
                          <>
                            <span className="level-num" style={{ fontSize: '18px' }}>{idx + 1}</span>
                            <div className="level-stars" style={{ gap: '1px', marginTop: '2px' }}>
                              {[1, 2, 3].map(s => (
                                <Star 
                                  key={s} 
                                  size={7} 
                                  className={`level-star ${s <= starsWon ? 'active' : 'inactive'}`}
                                  fill={s <= starsWon ? '#10b981' : 'none'}
                                  color={s <= starsWon ? '#10b981' : 'currentColor'}
                                  style={{
                                    filter: s <= starsWon ? 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.6))' : 'none'
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Endless Mode Unified Panel */}
        {(() => {
          const isExpanded = expandedSection === 'endless';
          return (
            <div 
              className="pack-card glass-panel"
              onClick={() => handleToggleSection('endless')}
              style={{ 
                padding: '14px 18px', 
                borderRadius: '16px',
                borderLeft: isExpanded ? '3px solid var(--accent-cyan)' : '1px solid var(--glass-border)'
              }}
            >
              <div className="pack-header" style={{ margin: 0, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#06b6d4' }} />
                  <h3 className="pack-name" style={{ fontSize: '20px', fontWeight: '700' }}>
                    Endless Generator
                  </h3>
                </div>
                <div>
                  {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>

              {isExpanded && (
                <div 
                  className="endless-options" 
                  onClick={(e) => e.stopPropagation()} 
                  style={{ 
                    marginTop: '14px', 
                    paddingTop: '14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <button 
                    className="glass-button glass-button-primary"
                    onClick={() => loadEndlessLevel()}
                    style={{ 
                      gridColumn: '1 / -1', 
                      padding: '12px 14px', 
                      borderRadius: '12px',
                      marginBottom: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--theme-accent-glow)',
                      borderColor: 'var(--theme-accent)',
                      boxShadow: '0 0 15px var(--theme-accent-glow)'
                    }}
                  >
                    <strong style={{ fontSize: '15px' }}>Resume Endless Journey</strong>
                    <span style={{ fontSize: '12px', opacity: 0.85 }}>Play Level {levelNumber + 1}</span>
                  </button>

                  <button 
                    className="glass-button endless-btn"
                    onClick={() => loadEndlessLevel(6)}
                    style={{ borderRadius: '10px', padding: '8px' }}
                  >
                    <strong>6 × 6</strong>
                    <span style={{ fontSize: '11px', color: '#22d3ee' }}>Easy</span>
                  </button>
                  <button 
                    className="glass-button endless-btn"
                    onClick={() => loadEndlessLevel(9)}
                    style={{ borderRadius: '10px', padding: '8px' }}
                  >
                    <strong>9 × 9</strong>
                    <span style={{ fontSize: '11px', color: '#818cf8' }}>Medium</span>
                  </button>
                  <button 
                    className="glass-button endless-btn"
                    onClick={() => loadEndlessLevel(12)}
                    style={{ borderRadius: '10px', padding: '8px' }}
                  >
                    <strong>12 × 12</strong>
                    <span style={{ fontSize: '11px', color: '#fb7185' }}>Hard</span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
