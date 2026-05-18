import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import ShikakuGrid from './ShikakuGrid';
import GameHeader from './GameHeader';
import { Undo2, Redo2, RotateCcw, HelpCircle } from 'lucide-react';

export default function GameView() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const history = useGameStore(state => state.history);
  const redoStack = useGameStore(state => state.redoStack);
  
  const undo = useGameStore(state => state.undo);
  const redo = useGameStore(state => state.redo);
  const resetLevel = useGameStore(state => state.resetLevel);

  // Help modal display state
  const [showHelp, setShowHelp] = useState(false);

  if (!currentLevel) return null;

  return (
    <div className="game-stage fade-in">
      {/* Upper header */}
      <GameHeader />



      {/* The Game Board */}
      <ShikakuGrid />

      {/* Control Buttons Panel */}
      <div className="game-controls-row">
        <button 
          className="glass-button control-btn"
          onClick={undo}
          disabled={history.length === 0}
          style={{ opacity: history.length === 0 ? 0.35 : 1 }}
          title="Undo last stroke"
        >
          <Undo2 />
          <span>Undo</span>
        </button>
        
        <button 
          className="glass-button control-btn"
          onClick={redo}
          disabled={redoStack.length === 0}
          style={{ opacity: redoStack.length === 0 ? 0.35 : 1 }}
          title="Redo stroke"
        >
          <Redo2 />
          <span>Redo</span>
        </button>
        
        <button 
          className="glass-button control-btn"
          onClick={resetLevel}
          title="Restart level"
        >
          <RotateCcw />
          <span>Restart</span>
        </button>
        
        {/* Help Panel Trigger (replaces redundant exit to menu shortcut) */}
        <button 
          className="glass-button control-btn"
          onClick={() => setShowHelp(true)}
          title="Show how to play rules modal"
        >
          <HelpCircle />
          <span>Help</span>
        </button>
      </div>

      {/* 
        High-Fidelity Frosted Help Modal Overlay 
        Displays rules in highly readable, large typography when requested.
      */}
      {showHelp && (
        <div className="win-overlay-container" style={{ zIndex: 200 }} onClick={() => setShowHelp(false)}>
          <div 
            className="win-card glass-panel" 
            style={{ 
              maxWidth: '420px', 
              padding: '24px 20px', 
              textAlign: 'left', 
              alignItems: 'stretch',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title bar */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '16px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
              paddingBottom: '12px' 
            }}>
              <HelpCircle size={24} style={{ color: '#06b6d4' }} />
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                How to Play
              </h2>
            </div>
            
            {/* Rules Text Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>📏</span>
                <p style={{ margin: 0 }}><strong>Grid Partition:</strong> Divide the entire grid into chambers of perfect squares or rectangles.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>🔢</span>
                <p style={{ margin: 0 }}><strong>Single Number:</strong> Each chamber must contain exactly <strong>one</strong> numbered cell inside it.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>📐</span>
                <p style={{ margin: 0 }}><strong>Area Matching:</strong> The area of the chamber (width × height) must match the value of its number. For example, a <code>6</code> needs a shape of 2×3 or 1×6 cells.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>📱</span>
                <p style={{ margin: 0 }}><strong>Gestures:</strong> Touch a number cell and drag outward to draw. <strong>Tap</strong> a committed rectangle to delete it. New rectangles overwrite overlapping ones automatically.</p>
              </div>
            </div>

            {/* Acknowledge Button */}
            <button 
              className="glass-button glass-button-primary" 
              onClick={() => setShowHelp(false)}
              style={{ marginTop: '24px', width: '100%', padding: '12px', fontSize: '15px', fontWeight: '600' }}
            >
              Got It, Let's Play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
