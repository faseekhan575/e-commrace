import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Geometry ────────────────────────────────────────────────────────────────
// Triangle A(50,4) · B(4,92) · C(96,92) · Centroid G(50,63)
// Split through centroid → 3 sub-triangles that tile the original perfectly.
const PIECES = [
  { id: 'left',   points: '50,4 4,92 50,63',  tx: -18, ty: -10, rz: -7 },
  { id: 'bottom', points: '4,92 96,92 50,63', tx:   0, ty:  22, rz:  0 },
  { id: 'right',  points: '50,4 50,63 96,92', tx:  18, ty: -10, rz:  7 },
];

// ─── Easing ──────────────────────────────────────────────────────────────────
const E = {
  spring:  'cubic-bezier(0.22, 1, 0.36, 1)',
  magnet:  'cubic-bezier(0.16, 1, 0.3, 1)',
  shatter: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  fade:    'cubic-bezier(0.4, 0, 1, 1)',
};

// ─── Sequence  [delay_ms, phase] ─────────────────────────────────────────────
const SEQ = [
  [0,    'appear'],
  [260,  'fracture'],
  [580,  'hold'],
  [750,  'reassemble'],
  [1100, 'flip'],
  [1380, 'exit'],
];

export default function PageTransition() {
  const location  = useLocation();
  const [visible, setVisible] = useState(false);
  const [phase,   setPhase]   = useState('idle');
  const timers = useRef([]);

  useEffect(() => {
    // Clear any in-flight timers from a previous navigation
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setPhase('idle');

    SEQ.forEach(([delay, p]) => {
      const id = setTimeout(() => setPhase(p), delay);
      timers.current.push(id);
    });

    // Hide overlay after full sequence
    const hide = setTimeout(() => {
      setVisible(false);
      setPhase('idle');
    }, 1600);
    timers.current.push(hide);

    return () => timers.current.forEach(clearTimeout);
  }, [location.pathname]);

  if (!visible) return null;

  // ── per-piece style ─────────────────────────────────────────────────────
  const pieceStyle = ({ tx, ty, rz }) => {
    const apart = phase === 'fracture' || phase === 'hold';
    return {
      transform:  apart ? `translate(${tx}px,${ty}px) rotate(${rz}deg)` : 'translate(0,0) rotate(0deg)',
      transition: phase === 'fracture'   ? `transform 0.34s ${E.shatter}` :
                  phase === 'reassemble' ? `transform 0.36s ${E.magnet}`  : 'none',
      transformBox:    'fill-box',
      transformOrigin: 'center',
      willChange:      'transform',
    };
  };

  // ── logo 3-D wrapper ────────────────────────────────────────────────────
  const wrapStyle = {
    transform:  phase === 'flip'   ? 'rotateY(180deg)'             :
                phase === 'exit'   ? 'rotateY(360deg) scale(1.07)' :
                phase === 'appear' ? 'scale(1)'                    : 'scale(0.86)',
    transition: phase === 'appear' ? `transform 0.28s ${E.spring}` :
                phase === 'flip'   ? `transform 0.30s ${E.magnet}` :
                phase === 'exit'   ? `transform 0.22s ${E.fade}`   : 'none',
    transformStyle: 'preserve-3d',
  };

  // ── SVG glow ────────────────────────────────────────────────────────────
  const glow =
    phase === 'reassemble' || phase === 'flip'
      ? 'drop-shadow(0 0 14px rgba(255,255,255,0.55)) drop-shadow(0 0 36px rgba(255,255,255,0.2))'
      : phase === 'fracture' || phase === 'hold'
      ? 'drop-shadow(0 3px 12px rgba(255,255,255,0.10))'
      : 'none';

  // ── wordmark alpha ──────────────────────────────────────────────────────
  const textAlpha =
    phase === 'fracture' || phase === 'hold'                                   ? 0.18 :
    phase === 'appear'   || phase === 'reassemble' || phase === 'flip'         ? 0.55 : 0;

  // ── overlay fade ────────────────────────────────────────────────────────
  const overlayOpacity  = phase === 'exit' ? 0 : 1;
  const overlayTransition = phase === 'exit' ? `opacity 0.20s ${E.fade}` : 'none';

  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        background: '#080808',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity:    overlayOpacity,
        transition: overlayTransition,
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Scan-line texture — premium depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)',
          opacity: 0.6,
        }}
      />

      {/* Logo + wordmark */}
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          perspective:    '700px',
          position:       'relative',
          zIndex:         1,
        }}
      >
        {/* 3-D flip container */}
        <div style={wrapStyle}>
          <svg
            viewBox="0 0 100 96"
            width="90"
            height="86"
            style={{
              display:    'block',
              overflow:   'visible',
              filter:     glow,
              transition: 'filter 0.30s ease',
            }}
          >
            {PIECES.map(p => (
              <g key={p.id} style={pieceStyle(p)}>
                <polygon points={p.points} fill="white" />
              </g>
            ))}
          </svg>
        </div>

        {/* Vault wordmark — typography and branding unchanged */}
        <div
          style={{
            marginTop:     14,
            fontFamily:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize:      10,
            fontWeight:    800,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            userSelect:    'none',
            color:         `rgba(255,255,255,${textAlpha})`,
            transition:    'color 0.28s ease',
          }}
        >
          VAULT
        </div>
      </div>
    </div>
  );
}