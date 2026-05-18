import React, { useState, useEffect } from 'react';
import { playBounceSound, playVictorySound } from '../utils/audioEffects';

export default function TutorialOverlay({ onComplete }) {
  const [step, setStep] = useState(0); // 0: Idle/Prep, 1: Drag 4, 2: Drag 2, 3: Drag 3, 4: Complete
  const [pointer, setPointer] = useState({ x: 80, y: 80 }); // starts bottom-right in percentage
  const [isPressing, setIsPressing] = useState(false);
  
  // Simulated committed rectangles { id, x, y, w, h }
  const [rectangles, setRectangles] = useState([]);
  
  // Simulated active drawing coordinate bounds { startX, startY, currentX, currentY }
  const [activeDraw, setActiveDraw] = useState(null);

  // Status caption message
  const [caption, setCaption] = useState('Welcome to Shikaku! Watch this quick guide...');

  // Cells size mapping (3x3 grid inside a 240px container, so each cell is 80px)
  // Grid coordinates mapping to percentages for the cursor:
  // Cell (c, r) => x: 16.6% + c * 33.3%, y: 16.6% + r * 33.3%
  const getCellCoords = (col, row) => {
    return {
      x: 16.6 + col * 33.3,
      y: 16.6 + row * 33.3
    };
  };

  useEffect(() => {
    const timeline = [];

    // --- STEP 1: DRAW THE 4 (size 2x2) ---
    // Move to (0,0)
    timeline.push(setTimeout(() => {
      setCaption('1. Drag from a number to draw a square/rectangle...');
      setPointer(getCellCoords(0, 0));
    }, 600));

    // Press down
    timeline.push(setTimeout(() => {
      setIsPressing(true);
      setActiveDraw({ startX: 0, startY: 0, currentX: 0, currentY: 0 });
    }, 1300));

    // Slide to (1,1)
    timeline.push(setTimeout(() => {
      setPointer(getCellCoords(1, 1));
      setActiveDraw({ startX: 0, startY: 0, currentX: 1, currentY: 1 });
    }, 1600));

    // Release & Commit
    timeline.push(setTimeout(() => {
      setIsPressing(false);
      setActiveDraw(null);
      setRectangles(prev => [...prev, { id: 'rect1', x: 0, y: 0, w: 2, h: 2, color: 'rgba(6, 182, 212, 0.25)', border: '#06b6d4' }]);
      playBounceSound();
      setStep(1);
    }, 2400));

    // --- STEP 2: DRAW THE 2 (size 1x2) ---
    // Move to (2,0)
    timeline.push(setTimeout(() => {
      setCaption('2. The rectangle area (width × height) must match its number.');
      setPointer(getCellCoords(2, 0));
    }, 3100));

    // Press down
    timeline.push(setTimeout(() => {
      setIsPressing(true);
      setActiveDraw({ startX: 2, startY: 0, currentX: 2, currentY: 0 });
    }, 3800));

    // Slide to (2,1)
    timeline.push(setTimeout(() => {
      setPointer(getCellCoords(2, 1));
      setActiveDraw({ startX: 2, startY: 0, currentX: 2, currentY: 1 });
    }, 4100));

    // Release & Commit
    timeline.push(setTimeout(() => {
      setIsPressing(false);
      setActiveDraw(null);
      setRectangles(prev => [...prev, { id: 'rect2', x: 2, y: 0, w: 1, h: 2, color: 'rgba(16, 185, 129, 0.25)', border: '#10b981' }]);
      playBounceSound();
      setStep(2);
    }, 4900));

    // --- STEP 3: DRAW THE 3 (size 3x1) ---
    // Move to (0,2)
    timeline.push(setTimeout(() => {
      setCaption('3. Cover the entire grid without overlaps to win!');
      setPointer(getCellCoords(0, 2));
    }, 5600));

    // Press down
    timeline.push(setTimeout(() => {
      setIsPressing(true);
      setActiveDraw({ startX: 0, startY: 2, currentX: 0, currentY: 2 });
    }, 6300));

    // Slide to (2,2)
    timeline.push(setTimeout(() => {
      setPointer(getCellCoords(2, 2));
      setActiveDraw({ startX: 0, startY: 2, currentX: 2, currentY: 2 });
    }, 6600));

    // Release & Commit
    timeline.push(setTimeout(() => {
      setIsPressing(false);
      setActiveDraw(null);
      setRectangles(prev => [...prev, { id: 'rect3', x: 0, y: 2, w: 3, h: 1, color: 'rgba(139, 92, 246, 0.25)', border: '#8b5cf6' }]);
      playBounceSound();
      setStep(3);
    }, 7400));

    // --- STEP 4: VICTORY CHIME ---
    timeline.push(setTimeout(() => {
      setCaption('Level Cleared! You are ready to play!');
      playVictorySound();
      setStep(4);
      // Retract hand back to bottom corner
      setPointer({ x: 80, y: 80 });
    }, 8100));

    return () => {
      timeline.forEach(id => clearTimeout(id));
    };
  }, []);

  return (
    <div className="modal-overlay fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      {/* Dynamic Keyframes for Touch Ripple and Modal Transitions */}
      <style>{`
        @keyframes rippleEffect {
          0% { width: 10px; height: 10px; opacity: 1; }
          100% { width: 50px; height: 50px; opacity: 0; }
        }
        @keyframes subtlePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalSlideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.35s ease forwards;
        }
      `}</style>

      <div className="glass-panel" style={{
        width: '90%', maxWidth: '360px', padding: '24px', borderRadius: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
        textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            How to Play
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Watch the hand solve this 3×3 board
          </p>
        </div>

        {/* 3x3 Animated Board Container */}
        <div style={{
          position: 'relative',
          width: '240px',
          height: '240px',
          background: 'rgba(255,255,255,0.02)',
          border: '2px solid var(--glass-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {/* Grid lines */}
          {Array(9).fill(null).map((_, i) => (
            <div key={i} style={{
              borderRight: i % 3 !== 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }} />
          ))}

          {/* Tutorial Clues */}
          {/* (0,0) = 4, (2,0) = 2, (0,2) = 3 */}
          <div style={{ position: 'absolute', left: '16.6%', top: '16.6%', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>4</span>
          </div>
          <div style={{ position: 'absolute', left: '83.3%', top: '16.6%', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>2</span>
          </div>
          <div style={{ position: 'absolute', left: '16.6%', top: '83.3%', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>3</span>
          </div>

          {/* Active drawing overlay */}
          {activeDraw && (() => {
            const x = Math.min(activeDraw.startX, activeDraw.currentX) * 80;
            const y = Math.min(activeDraw.startY, activeDraw.currentY) * 80;
            const w = (Math.abs(activeDraw.startX - activeDraw.currentX) + 1) * 80;
            const h = (Math.abs(activeDraw.startY - activeDraw.currentY) + 1) * 80;
            return (
              <div style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '2.5px dashed #06b6d4',
                borderRadius: '8px',
                zIndex: 8,
                pointerEvents: 'none'
              }} />
            );
          })()}

          {/* Committed Rectangles */}
          {rectangles.map(rect => (
            <div key={rect.id} style={{
              position: 'absolute',
              left: `${rect.x * 80}px`,
              top: `${rect.y * 80}px`,
              width: `${rect.w * 80}px`,
              height: `${rect.h * 80}px`,
              background: rect.color,
              border: `2px solid ${rect.border}`,
              borderRadius: '8px',
              zIndex: 5,
              animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              pointerEvents: 'none'
            }} />
          ))}

          {/* Simulated Hand Pointer */}
          <div 
            style={{
              position: 'absolute',
              left: `${pointer.x}%`,
              top: `${pointer.y}%`,
              transform: `translate(-25%, -20%) scale(${isPressing ? 0.8 : 1.0})`,
              transition: 'left 0.7s cubic-bezier(0.25, 1, 0.5, 1), top 0.7s cubic-bezier(0.25, 1, 0.5, 1), transform 0.15s ease',
              zIndex: 100,
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '32px', filter: 'drop-shadow(2px 6px 6px rgba(0,0,0,0.4))' }}>
              👆
            </span>

            {/* Pulsing Touch Ripple */}
            {isPressing && (
              <div style={{
                position: 'absolute',
                left: '25%',
                top: '20%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '3px solid #06b6d4',
                animation: 'rippleEffect 0.8s ease-out infinite'
              }} />
            )}
          </div>
        </div>

        {/* Live caption block */}
        <div style={{
          minHeight: '44px',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
          padding: '0 10px'
        }}>
          {caption}
        </div>

        {/* Action Button */}
        <button 
          className="glass-button glass-button-primary"
          onClick={onComplete}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
            opacity: step === 4 ? 1 : 0.4,
            pointerEvents: step === 4 ? 'auto' : 'none',
            background: step === 4 ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.03)',
            animation: step === 4 ? 'subtlePulse 1.8s infinite ease' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {step === 4 ? 'Got it! Start Playing' : 'Watching Tutorial...'}
        </button>
      </div>
    </div>
  );
}
