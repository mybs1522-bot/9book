import React, { useState, useEffect, useRef } from 'react';

const BOOKS = [
  { id: 'k1', image: '/images/kitchens/kitchen-1.jpg',  title: 'Modern' },
  { id: 'k2', image: '/images/kitchens/kitchen-2.webp', title: 'Island' },
  { id: 'k3', image: '/images/kitchens/kitchen-3.png',  title: 'Modular' },
  { id: 'k4', image: '/images/kitchens/kitchen-4.jpg',  title: 'Luxury' },
  { id: 'k5', image: '/images/kitchens/kitchen-5.jpg',  title: 'Glossy' },
  { id: 'k6', image: '/images/kitchens/kitchen-6.png',  title: 'Classic' },
];

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'stack' | 'folder' | 'fadeout' | 'done'>('intro');
  const [introVis, setIntroVis] = useState(false);
  const [stackedCount, setStackedCount] = useState(0);
  const [folderOpen, setFolderOpen] = useState(false);
  const [booksFlying, setBooksFlying] = useState(false);
  const [folderClosed, setFolderClosed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = []; };
  const q = (fn: () => void, ms: number) => { timerRef.current.push(setTimeout(fn, ms)); };

  const handleSkip = () => { clearTimers(); setPhase('fadeout'); setTimeout(() => { setPhase('done'); onComplete(); }, 300); };

  useEffect(() => {
    // 0ms: show intro
    q(() => setIntroVis(true), 50);
    // 900ms: hide intro
    q(() => { setIntroVis(false); }, 900);
    q(() => { setPhase('stack'); }, 1100);

    // 1100-2500ms: stack books (220ms each)
    for (let i = 0; i < 6; i++) {
      q(() => setStackedCount(i + 1), 1100 + i * 220);
    }

    // 2600ms: open folder
    q(() => { setPhase('folder'); setFolderOpen(true); }, 2600);
    // 2950ms: fly books in
    q(() => setBooksFlying(true), 2950);
    // 3500ms: close folder
    q(() => { setFolderClosed(true); setFolderOpen(false); }, 3500);
    // 4200ms: fadeout
    q(() => setPhase('fadeout'), 4200);
    // 4700ms: done
    q(() => { setPhase('done'); onComplete(); }, 4700);

    return clearTimers;
  }, []);

  if (phase === 'done') return null;

  return (
    <div onClick={handleSkip} className="sp-root" style={{ opacity: phase === 'fadeout' ? 0 : 1 }}>
      <style>{STYLES}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div className={`sp-intro ${introVis ? 'vis' : ''}`}>
          <h1>Only Book To Design<br /><span>Best Kitchens</span></h1>
        </div>
      )}

      {/* STACKING */}
      {phase === 'stack' && (
        <div className="sp-stack">
          <div className="sp-grid">
            {BOOKS.map((b, i) => (
              <div key={b.id} className={`sp-card ${i < stackedCount ? 'vis' : ''}`}
                style={{ transitionDelay: `${i * 30}ms` }}>
                <img src={b.image} alt={b.title} />
                <span>{b.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOLDER */}
      {phase === 'folder' && (
        <div className="sp-folder-wrap">
          <div className={`sp-folder ${folderOpen ? 'open' : ''}`}>
            <div className="sf-back" />
            <div className="sf-tab" />
            {BOOKS.map((b, i) => (
              <div key={b.id}
                className={`sf-fly ${folderOpen && !booksFlying ? 'spread' : ''} ${booksFlying && !folderClosed ? 'fly' : ''} ${folderClosed ? 'in' : ''}`}
                data-i={i} style={{ transitionDelay: `${i * 30}ms` }}>
                <img src={b.image} alt={b.title} />
              </div>
            ))}
            <div className="sf-front" />
          </div>
          <div className={`sf-title ${folderClosed ? 'vis' : ''}`}>
            <h3>One Book · Every Kitchen Detail</h3>
          </div>
        </div>
      )}
    </div>
  );
};

const STYLES = `
  .sp-root {
    position: fixed; inset: 0; z-index: 9999; background: #0a0a0a;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: opacity 0.4s ease;
    font-family: 'Outfit', sans-serif; color: #fff;
  }

  /* Intro */
  .sp-intro {
    opacity: 0; transform: scale(0.92);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .sp-intro.vis { opacity: 1; transform: scale(1); }
  .sp-intro h1 {
    font-size: clamp(28px, 5vw, 56px); font-weight: 900;
    letter-spacing: -0.04em; line-height: 1.1; text-align: center;
  }
  .sp-intro span {
    font-family: 'Fraunces', serif; font-style: italic; font-weight: 400;
    background: linear-gradient(135deg, #fb923c, #ea580c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  /* Stack grid */
  .sp-stack { display: flex; align-items: center; justify-content: center; }
  .sp-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 280px;
  }
  .sp-card {
    position: relative; border-radius: 8px; overflow: hidden;
    aspect-ratio: 3/4; background: #181818;
    opacity: 0; transform: scale(0.7) translateY(20px);
    transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  }
  .sp-card.vis { opacity: 1; transform: scale(1) translateY(0); }
  .sp-card img { width: 100%; height: 100%; object-fit: cover; }
  .sp-card span {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 6px 8px; font-size: 10px; font-weight: 700; color: #fff;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
  }

  /* Folder */
  .sp-folder-wrap {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .sp-folder {
    position: relative; width: 260px; height: 280px;
    display: flex; align-items: center; justify-content: center;
    perspective: 800px;
  }
  .sf-back {
    position: absolute; width: 150px; height: 110px;
    background: linear-gradient(145deg, #c2813a, #a06830);
    border-radius: 10px; box-shadow: 0 5px 18px rgba(0,0,0,0.4); z-index: 1;
    transform-origin: bottom center;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .sp-folder.open .sf-back { transform: rotateX(-15deg); }

  .sf-tab {
    position: absolute; width: 50px; height: 14px;
    background: linear-gradient(145deg, #b07030, #8c5828);
    border-radius: 5px 5px 0 0;
    top: calc(50% - 55px - 11px); left: calc(50% - 75px + 12px);
    z-index: 1; transform-origin: bottom center;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .sp-folder.open .sf-tab { transform: rotateX(-25deg) translateY(-2px); }

  .sf-front {
    position: absolute; width: 150px; height: 110px;
    background: linear-gradient(145deg, #d4944a, #b87838);
    border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    top: calc(50% - 55px + 3px); z-index: 30;
    transform-origin: bottom center;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .sf-front::after {
    content: ''; position: absolute; inset: 0; border-radius: 10px;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%);
  }
  .sp-folder.open .sf-front { transform: rotateX(20deg) translateY(8px); }

  .sf-fly {
    position: absolute; width: 60px; height: 82px; border-radius: 6px;
    overflow: hidden; z-index: 15; opacity: 0;
    transform: translate(0, 40px) scale(0.3);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 5px 14px rgba(0,0,0,0.4);
  }
  .sf-fly img { width: 100%; height: 100%; object-fit: cover; }

  .sf-fly.spread { opacity: 1; }
  .sf-fly.spread[data-i="0"] { transform: translate(-80px, -75px) rotate(-11deg); }
  .sf-fly.spread[data-i="1"] { transform: translate(80px, -75px) rotate(11deg); }
  .sf-fly.spread[data-i="2"] { transform: translate(-85px, 8px) rotate(-7deg); }
  .sf-fly.spread[data-i="3"] { transform: translate(85px, 8px) rotate(7deg); }
  .sf-fly.spread[data-i="4"] { transform: translate(-75px, 88px) rotate(-4deg); }
  .sf-fly.spread[data-i="5"] { transform: translate(75px, 88px) rotate(4deg); }

  .sf-fly.fly { opacity: 1; }
  .sf-fly.fly[data-i="0"] { transform: translate(-5px, -15px) rotate(-3deg) scale(0.45); }
  .sf-fly.fly[data-i="1"] { transform: translate(5px, -17px) rotate(3deg) scale(0.45); }
  .sf-fly.fly[data-i="2"] { transform: translate(-3px, -13px) rotate(-1deg) scale(0.42); }
  .sf-fly.fly[data-i="3"] { transform: translate(3px, -15px) rotate(1deg) scale(0.42); }
  .sf-fly.fly[data-i="4"] { transform: translate(-2px, -11px) rotate(0deg) scale(0.40); }
  .sf-fly.fly[data-i="5"] { transform: translate(2px, -13px) rotate(0deg) scale(0.40); }

  .sf-fly.in { opacity: 0; transform: translate(0, -12px) scale(0.2); }

  .sf-title {
    text-align: center; opacity: 0; transform: translateY(8px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .sf-title.vis { opacity: 1; transform: translateY(0); }
  .sf-title h3 { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }

  @media (max-width: 640px) {
    .sp-grid { width: 220px; gap: 6px; }
    .sf-fly { width: 48px; height: 66px; }
    .sf-fly.spread[data-i="0"] { transform: translate(-60px, -60px) rotate(-11deg); }
    .sf-fly.spread[data-i="1"] { transform: translate(60px, -60px) rotate(11deg); }
    .sf-fly.spread[data-i="2"] { transform: translate(-65px, 5px) rotate(-7deg); }
    .sf-fly.spread[data-i="3"] { transform: translate(65px, 5px) rotate(7deg); }
    .sf-fly.spread[data-i="4"] { transform: translate(-55px, 68px) rotate(-4deg); }
    .sf-fly.spread[data-i="5"] { transform: translate(55px, 68px) rotate(4deg); }
  }
`;
