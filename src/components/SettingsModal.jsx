import React from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Sun, Moon, Volume2, VolumeX, HelpCircle, Paintbrush, RotateCcw } from 'lucide-react';

const PALETTES = [
  { id: 'obsidian', name: 'Graphite Steel', colors: ['#1e2024', '#9ba3af'] },
  { id: 'quartz', name: 'Desert Sand', colors: ['#28231f', '#c8b39b'] },
  { id: 'aurora', name: 'Nordic Sage', colors: ['#202624', '#a2b0a8'] },
  { id: 'cyberpunk', name: 'Muted Royal', colors: ['#1e222d', '#9ca6b7'] },
  { id: 'crimson', name: 'Plum Velvet', colors: ['#241e26', '#b29eb7'] },
  { id: 'amethyst', name: 'Matcha Latte', colors: ['#22241d', '#b6bfa8'] },
  { id: 'mintjelly', name: 'Espresso Wood', colors: ['#25201e', '#c2b4ab'] },
  { id: 'sunset', name: 'Steel Blue', colors: ['#1d2328', '#9eb0bc'] },
  { id: 'monochrome', name: 'Crimson Rose', colors: ['#282022', '#c6b0b3'] },
  { id: 'mintchoc', name: 'Autumn Ochre', colors: ['#26211c', '#c4b8a2'] }
];

export default function SettingsModal({ isOpen, onClose }) {
  const theme = useGameStore(state => state.theme);
  const toggleTheme = useGameStore(state => state.toggleTheme);
  const palette = useGameStore(state => state.palette);
  const setPalette = useGameStore(state => state.setPalette);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const toggleSound = useGameStore(state => state.toggleSound);
  const resetTutorial = useGameStore(state => state.resetTutorial);
  const resetEndlessProgress = useGameStore(state => state.resetEndlessProgress);
  const colorByNumber = useGameStore(state => state.colorByNumber);
  const toggleColorByNumber = useGameStore(state => state.toggleColorByNumber);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div className="glass-panel settings-modal-card" onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: '360px', padding: '20px', borderRadius: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative',
        maxHeight: '85vh', overflowY: 'auto'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</h2>
          <button className="glass-button glass-button-icon" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Toggles Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          {/* Dark Mode Switch */}
          <div className="settings-row">
            <div className="settings-label-group">
              <div className="settings-icon-wrapper">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <span className="settings-label-title">Dark Mode</span>
            </div>
            <label className="switch-control">
              <input 
                type="checkbox" 
                checked={theme === 'dark'} 
                onChange={toggleTheme} 
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Sound Switch */}
          <div className="settings-row">
            <div className="settings-label-group">
              <div className="settings-icon-wrapper">
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <span className="settings-label-title">Sound Effects</span>
            </div>
            <label className="switch-control">
              <input 
                type="checkbox" 
                checked={soundEnabled} 
                onChange={toggleSound} 
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Color by Number Switch */}
          <div className="settings-row">
            <div className="settings-label-group">
              <div className="settings-icon-wrapper">
                <Paintbrush size={16} />
              </div>
              <span className="settings-label-title">Color by Number</span>
            </div>
            <label className="switch-control">
              <input 
                type="checkbox" 
                checked={colorByNumber} 
                onChange={toggleColorByNumber} 
              />
              <span className="switch-slider"></span>
            </label>
          </div>

        </div>

        {/* Action Controls Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => {
                onClose();
                resetTutorial();
              }}
              className="glass-button"
              style={{ flex: 1, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '12px' }}
            >
              <HelpCircle size={16} />
              <span>How to Play</span>
            </button>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to reset your endless mode progress back to Level 1?")) {
                  resetEndlessProgress();
                }
              }}
              className="glass-button"
              style={{ 
                flex: 1, 
                padding: '10px', 
                fontSize: '13px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '12px'
              }}
            >
              <RotateCcw size={16} />
              <span>Reset Game</span>
            </button>
          </div>
        </div>

        {/* Palette Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Color Palette</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {PALETTES.map(p => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className="glass-button"
                style={{
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '10px',
                  border: palette === p.id ? '1px solid var(--theme-accent)' : '1px solid var(--glass-border)',
                  background: palette === p.id ? 'var(--theme-accent-glow)' : 'transparent',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '12px', height: '12px', borderRadius: '3px',
                  background: `linear-gradient(135deg, ${p.colors[0]} 0%, ${p.colors[1]} 100%)`
                }} />
                <span style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
