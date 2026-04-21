import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, CheckCircle, Users, BookOpen, Star } from 'lucide-react';
import { Sofa, ChefHat, Bed, Bath, Layers, Map } from 'lucide-react';

export const getDriveUrl = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;

export const BOOK_IMAGES = {
  kitchenCover: 'https://d1yei2z3i6k35z.cloudfront.net/13138299/685712e3dfc75_Your-Numbered-Points-Title-Comes-Right-Here1.jpg',
  kitchenLayouts: 'https://d1yei2z3i6k35z.cloudfront.net/13138299/685712a2593bd_Your-Numbered-Points-Title-Comes-Right-Here-1-12.png',
  kitchenPreview: 'https://d1yei2z3i6k35z.cloudfront.net/13138299/685713307fcf9_Your-Numbered-Points-Title-Comes-Right-Here-3-1.png',
};

export const CURRICULUM_DATA = [
  {
    id: 'kitchens', title: 'Kitchen Design Book', bookNum: 'Part 1', icon: <ChefHat size={20} />, color: 'border-orange-500', imageUrl: BOOK_IMAGES.kitchenCover, sections: [
      { name: 'Layouts and Zones', items: ['Kitchen triangle and zoning', 'Future of kitchen design', 'Kitchen layouts with examples', 'Advantages and limitations'] },
      { name: 'Components', items: ['Stove placement clearances', 'Refrigerator types and mistakes', 'Sink types and placement', 'Pantry types and planning'] },
      { name: 'Storage', items: ['Kitchen top & bottom cabinets', 'Corner and hidden storage', 'Kitchen dimensions', 'Breakfast counter'] },
      { name: 'Services', items: ['Electrical points placement', 'Lighting types and zones'] }
    ]
  }
];

export const PORTRAIT_IMAGES = [
  '/portraits/reader1.jpg',
  '/portraits/reader2.jpg',
  '/portraits/reader3.jpg',
  '/portraits/reader4.jpg',
  '/portraits/reader5.jpg',
  '/portraits/reader6.jpg',
  '/portraits/reader7.jpg'
];

export const BOOK_THUMBNAILS = [
  { label: 'Kitchen Design Book', image: BOOK_IMAGES.kitchenCover },
  { label: 'Layout Rules', image: BOOK_IMAGES.kitchenLayouts },
  { label: 'Dimension Guides', image: BOOK_IMAGES.kitchenPreview }
];

export const PROBLEM_POINTS = [
  { emoji: "😫", text: "Cabinet door hits the fridge. One small clearance miss. $2,400 gone." },
  { emoji: "💸", text: "Pinterest vibes look great — until the workflow feels clunky every time you cook." },
  { emoji: "😤", text: "Contractors want blueprints. Designers charge $3,000. You're stuck guessing." },
  { emoji: "🧠", text: "You have the vision. You're missing the exact numbers that make it work." },
];

export const TRANSFORMATION_STORIES = [
  { name: "Sarah M.", role: "Renovated in 2023", before: "I was crying in my unfinished kitchen because the island was 4 inches too close to the stove. I felt like a failure.", after: "I found this book, moved the island by 5 inches, and saved my $12k renovation. It's now my favorite room.", emoji: "🏠" },
  { name: "Mark D.", role: "Architect", before: "Tired of looking up standard clearances in 500-page manuals every time a client asked a simple question.", after: "This single book stays on my desk. It has everything I need in 10 seconds. My clients think I'm a genius.", emoji: "📐" },
];

// Urgency Banner Component
export const UrgencyBanner = ({ onAction }: { onAction: () => void }) => {
  return (
    <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 py-2.5 px-4 text-white text-center relative z-[60] shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 md:gap-8 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="animate-pulse flex h-2 w-2 rounded-full bg-white"></span>
          <p className="text-[10px] md:text-sm font-bold tracking-tight">LIMITED PIVOT SALE: GET THE KITCHEN BOOK FOR $9</p>
        </div>
        <div className="flex items-center gap-4">
          <CountdownTimer />
          <button onClick={onAction} className="bg-white text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-orange-50 transition-colors shadow-sm">
            Claim Offer
          </button>
        </div>
      </div>
    </div>
  );
};


// Counter component
export const Counter = ({ target, duration = 1500 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let startTime: number | null = null;
        const step = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, started]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// Logo — light theme
export const Logo = () => (
  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
      <ChefHat size={20} className="text-white" />
    </div>
    <div>
      <span className="font-display font-bold text-base tracking-tight leading-none text-gray-900 whitespace-nowrap block">Kitchen Design Book</span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 whitespace-nowrap">The Only Reference You Need</span>
    </div>
  </div>
);

// Countdown Timer — evergreen version starting at 04:36:27
export const CountdownTimer = () => {
  const INITIAL_SECONDS = (4 * 3600) + (36 * 60) + 27;

  const getTargetTime = () => {
    const stored = localStorage.getItem('timer_target');
    const now = Date.now();

    if (stored) {
      const target = parseInt(stored, 10);
      if (target > now) return target;
    }

    const newTarget = now + (INITIAL_SECONDS * 1000);
    localStorage.setItem('timer_target', newTarget.toString());
    return newTarget;
  };

  const getTimeLeft = (target: number) => {
    const diff = Math.max(0, target - Date.now());
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { h, m, s };
  };

  const [target] = useState(getTargetTime);
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = getTimeLeft(target);
      setTime(remaining);
      if (remaining.h === 0 && remaining.m === 0 && remaining.s === 0) {
        const newTarget = Date.now() + (INITIAL_SECONDS * 1000);
        localStorage.setItem('timer_target', newTarget.toString());
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold">
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{pad(time.h)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{pad(time.m)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{pad(time.s)}</span>
    </div>
  );
};

// CSS Animations — light theme version
export const APP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700&display=swap');

  :root {
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-display: 'Outfit', sans-serif;
    --font-serif: 'Fraunces', serif;
  }

  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .font-display { font-family: var(--font-display); }
  .font-serif { font-family: var(--font-serif); }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes softPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-12px); } 100% { transform: translateY(0px); } }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes glow {
    0%, 100% { 
      text-shadow: 0 0 10px rgba(249, 115, 22, 0.2), 0 0 20px rgba(249, 115, 22, 0.1); 
      filter: brightness(1);
    }
    50% { 
      text-shadow: 0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(249, 115, 22, 0.2), 0 0 60px rgba(249, 115, 22, 0.1); 
      filter: brightness(1.1);
    }
  }

  .animate-marquee { animation: marquee 40s linear infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float 6s ease-in-out infinite; animation-delay: 3s; }
  .animate-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .glow-text {
    animation: glow 4s ease-in-out infinite;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .premium-gradient {
    background: linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .text-balance {
    text-wrap: balance;
  }

  .tracking-tightest { letter-spacing: -0.05em; }
  .tracking-tighter { letter-spacing: -0.03em; }
`;
