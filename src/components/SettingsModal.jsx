import React from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Sun, Moon, Volume2, VolumeX, HelpCircle } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: '360px', padding: '24px', borderRadius: '24px',
        display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Settings</h2>
          <button className="glass-button glass-button-icon" onClick={onClose} style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>Appearance</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => { if(theme !== 'dark') toggleTheme() }}
              className={`glass-button ${theme === 'dark' ? 'active' : ''}`}
              style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: theme === 'dark' ? 'var(--theme-accent-glow)' : '', borderColor: theme === 'dark' ? 'var(--theme-accent)' : '' }}
            >
              <Moon size={20} />
              <span style={{ fontSize: '14px' }}>Dark</span>
            </button>
            <button 
              onClick={() => { if(theme !== 'light') toggleTheme() }}
              className={`glass-button ${theme === 'light' ? 'active' : ''}`}
              style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: theme === 'light' ? 'var(--theme-accent-glow)' : '', borderColor: theme === 'light' ? 'var(--theme-accent)' : '' }}
            >
              <Sun size={20} />
              <span style={{ fontSize: '14px' }}>Light</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>Sound Effects</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={toggleSound}
              className={`glass-button ${soundEnabled ? 'active' : ''}`}
              style={{ flex: 1, padding: '12.5px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px', background: soundEnabled ? 'var(--theme-accent-glow)' : '', borderColor: soundEnabled ? 'var(--theme-accent)' : '' }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>Guide</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={resetTutorial}
              className="glass-button"
              style={{ flex: 1, padding: '12.5px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HelpCircle size={18} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Replay Tutorial</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>Color Palette</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {PALETTES.map(p => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className="glass-button"
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'flex-start',
                  border: palette === p.id ? '1px solid var(--theme-accent)' : '1px solid var(--glass-border)',
                  background: palette === p.id ? 'var(--theme-accent-glow)' : 'transparent',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '4px',
                  background: `linear-gradient(135deg, ${p.colors[0]} 0%, ${p.colors[1]} 100%)`
                }} />
                <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
