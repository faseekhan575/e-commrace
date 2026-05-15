import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setVisible(true);
    setLeaving(false);
    const t1 = setTimeout(() => setLeaving(true), 700);
    const t2 = setTimeout(() => setVisible(false), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#080808] transition-opacity duration-300 ${leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <style>{`
        @keyframes triSpin {
          0%   { transform: scale(0.2) rotate(-30deg); opacity: 0; }
          30%  { transform: scale(1.15) rotate(12deg); opacity: 1; }
          60%  { transform: scale(0.9) rotate(-5deg);  opacity: 1; }
          85%  { transform: scale(1.05) rotate(3deg);  opacity: 1; }
          100% { transform: scale(2.2) rotate(0deg);   opacity: 0; }
        }
        @keyframes colorShift {
          0%   { filter: drop-shadow(0 0 24px #fff) brightness(1); }
          25%  { filter: drop-shadow(0 0 40px #a78bfa) brightness(1.3) hue-rotate(60deg); }
          50%  { filter: drop-shadow(0 0 40px #f472b6) brightness(1.3) hue-rotate(180deg); }
          75%  { filter: drop-shadow(0 0 40px #34d399) brightness(1.3) hue-rotate(280deg); }
          100% { filter: drop-shadow(0 0 60px #fff) brightness(2); }
        }
        .tri-wrap {
          position: relative; width: 100px; height: 100px;
          display: flex; align-items: center; justify-content: center;
          animation: triSpin 0.9s cubic-bezier(0.22,1,0.36,1) forwards, colorShift 0.9s ease forwards;
        }
        .tri-shape {
          width: 0; height: 0;
          border-left: 40px solid transparent;
          border-right: 40px solid transparent;
          border-bottom: 70px solid #fff;
        }
        .vault-word {
          position: absolute; bottom: calc(50% - 80px);
          font-family: 'Helvetica Neue', Helvetica, sans-serif;
          font-size: 10px; font-weight: 800; letter-spacing: 0.45em;
          color: rgba(255,255,255,0.55); text-transform: uppercase;
          animation: vaultFade 0.9s ease forwards;
        }
        @keyframes vaultFade {
          0%,100% { opacity: 0; }
          40%,70% { opacity: 1; }
        }
      `}</style>
      <div className="relative flex items-center justify-center">
        <div className="tri-wrap"><div className="tri-shape" /></div>
      </div>
      <div className="vault-word">VAULT</div>
    </div>
  );
}