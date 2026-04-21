import React, { useState, useEffect, useRef } from 'react';
import { CheckoutPage } from './components/CheckoutPage';
import { HardcopyCheckoutPage } from './components/HardcopyCheckoutPage';
import { SuccessPage } from './components/SuccessPage';
import { OnetimePage } from './components/OnetimePage';
import { AdminModal } from './components/AdminModal';
import { LoginModal } from './components/LoginModal';
import { FAQ_ITEMS, TESTIMONIALS, COURSES, INDUSTRIES, FEATURES, BUSINESS_MODULES } from './constants';
import { SplashScreen } from './components/SplashScreen';
import { ChevronDown, ArrowRight, Star, BookOpen, Sparkles, CheckCircle2, ShieldCheck, Target, TrendingUp, Zap, Users, X, Home, Sofa, ChefHat, Bed, Bath, Map, GraduationCap, Building, Wrench, Hammer, Palette, Download, Infinity, Award, Eye, Heart, Clock, Layers, LifeBuoy, Briefcase, AlertCircle, Package, Truck, Quote } from 'lucide-react';
import { Course } from './types';
import { trackMetaEvent } from './utils/meta-tracking';
import {
  Counter, Logo, UrgencyBanner, CountdownTimer,
  APP_STYLES, PORTRAIT_IMAGES, BOOK_IMAGES,
  PROBLEM_POINTS, TRANSFORMATION_STORIES, CURRICULUM_DATA
} from './AppHelpers';

const ICON_MAP: Record<string, any> = { Home, BookOpen, Palette, Building, Hammer, Wrench, Download, Infinity, LifeBuoy, Users, Briefcase, GraduationCap, TrendingUp };

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.history.replaceState({}, '', redirect);
      return redirect;
    }
    return window.location.pathname;
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeCurriculumBook, setActiveCurriculumBook] = useState(0);
  const [curriculumPaused, setCurriculumPaused] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Auto-cycle curriculum tabs
  useEffect(() => {
    if (curriculumPaused) return;
    const timer = setInterval(() => {
      setActiveCurriculumBook(prev => (prev + 1) % CURRICULUM_DATA.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [curriculumPaused]);

  const handleCurriculumClick = (index: number) => {
    setActiveCurriculumBook(index);
    setCurriculumPaused(true);
    setTimeout(() => setCurriculumPaused(false), 8000);
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [currentPath]);

  useEffect(() => {
    const h = () => setShowStickyBar(window.scrollY > 800);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (currentPath === '/') {
      trackMetaEvent({
        eventName: 'ViewContent',
        content_name: 'Kitchen Design Book',
        content_ids: ['kitchen-design-book'],
        content_type: 'product',
        value: 9.00,
        currency: 'USD'
      });
    }
  }, [currentPath]);

  if (currentPath === '/checkout') return <CheckoutPage />;
  if (currentPath === '/checkout-hardcopy') return <HardcopyCheckoutPage />;
  if (currentPath === '/onetime') return <OnetimePage />;
  if (currentPath.startsWith('/success')) return <SuccessPage />;

  const navigateToCheckout = () => {
    trackMetaEvent({
      eventName: 'AddToCart',
      content_name: 'Kitchen Design Book',
      content_ids: ['kitchen-design-book'],
      content_type: 'product',
      value: 9.00,
      currency: 'USD'
    });
    window.scrollTo(0, 0);
    window.history.pushState({}, '', '/checkout');
    setCurrentPath('/checkout');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden antialiased relative">
      <style>{APP_STYLES}</style>
      
      {showSplash && currentPath === '/' && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <main>
        {/* ==========================================
            PART 1: EMOTION (The Pain & The Dream)
            ========================================== */}
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-32" style={{ background: 'linear-gradient(165deg, #fefcf9 0%, #fff8f0 25%, #ffffff 50%, #fef9f2 75%, #fffdf8 100%)' }}>
          <div className="absolute top-[-150px] right-[-100px] w-[700px] h-[700px] rounded-full pointer-events-none opacity-50" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%)' }} />
          
          <div className="max-w-6xl mx-auto px-5 relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide sm:tracking-widest mb-6 animate-fadeIn whitespace-nowrap max-w-full">
              <Sparkles size={12} className="shrink-0" /> Handmade Diagrams · Real Dimensions · No Guesswork
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-[5.5rem] font-display font-black leading-[0.95] mb-6 text-gray-950 tracking-tightest">
              The Only Book You'll Refer To.<br />
              <span className="premium-gradient">Design Best Kitchens Possible.</span>
            </h1>

            <p className="text-gray-700 text-lg md:text-2xl font-medium mb-10 max-w-2xl leading-relaxed">
              One wrong decision can turn your <span className="text-orange-600 font-bold">dream kitchen</span> into a daily frustration. This is the <em className="font-serif italic">one</em> book that guides you like a pro designer — for the price of a coffee.
            </p>

            <div className="w-full max-w-4xl mx-auto mb-12 group relative">
              <div className="absolute -inset-4 bg-orange-500/10 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/40 cursor-pointer aspect-[16/10] md:aspect-video border border-gray-100 bg-gray-950"
                onClick={navigateToCheckout}
              >
                <img
                  src="https://mir-s3-cdn-cf.behance.net/project_modules/hd/e73fbd127166603.613c3c5346de6.gif"
                  alt="Design the best kitchens possible — animated showcase"
                  className="w-full h-full object-cover"
                />
                {/* Bottom-only gradient — keeps the GIF visible */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                {/* Bottom-anchored classy lockup */}
                <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 pb-5 md:pb-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2 md:mb-3">
                    <span className="h-px w-6 md:w-10 bg-orange-300/80" />
                    <p className="text-orange-200 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.45em] font-display">The Kitchen Design Book</p>
                    <span className="h-px w-6 md:w-10 bg-orange-300/80" />
                  </div>
                  <h3 className="text-white text-xl md:text-4xl lg:text-5xl font-display font-black tracking-tightest leading-[1] drop-shadow-2xl">
                    Every Dimension. <span className="italic font-serif font-normal premium-gradient">Every Detail.</span>
                  </h3>
                </div>
              </div>
            </div>

            <button onClick={navigateToCheckout} className="group relative px-8 md:px-12 py-5 md:py-6 bg-gray-950 text-white rounded-2xl font-bold text-lg md:text-xl shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-4 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="relative z-10">Get the Kitchen Book — $9</span>
               <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={24} />
            </button>
            <p className="text-gray-400 text-xs mt-4 flex items-center gap-2">
              <Clock size={12} /> Instant Digital Download · Lifetime Access
            </p>
          </div>
        </section>

        {/* INSIDE THE BOOK — Handmade Diagrams Showcase (moved directly below first CTA) */}
        <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-orange-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Inside The Book</p>
              <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 leading-[1.1] mb-6 max-w-3xl mx-auto">
                Handmade Diagrams That Explain <span className="premium-gradient">Every Detail</span> of Your Kitchen
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Hand-drawn, pro-verified pages that help you <strong>plan perfectly</strong> — from layouts and clearances to modules and storage.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto group">
              <div className="absolute -inset-6 bg-orange-300/20 rounded-[3rem] -rotate-1 blur-3xl -z-10" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-900/20 border border-gray-800 bg-gray-900">
                <img
                  src="/images/kitchen-book.png"
                  alt="Every chapter of the Kitchen Design Book — 150 hand-drawn pages"
                  loading="lazy"
                  className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-700"
                />
                {/* subtle inner vignette for depth */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)' }} />
              </div>
              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 shadow-lg border border-gray-100">
                ✨ 150 Pages · Every Chapter
              </div>
            </div>

            <div className="text-center mt-10 md:mt-12">
              <button onClick={navigateToCheckout} className="inline-flex items-center gap-3 px-8 py-4 bg-gray-950 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all">
                Unlock Every Page — $9 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* EMOTION: OPENER — tight version */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-4xl font-display font-black text-gray-950 leading-tight mb-4">
              Handmade Diagrams. Real Dimensions.<br /><span className="text-orange-600">No Guesswork. No Regrets.</span>
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              Your kitchen is the <strong className="text-gray-950">heart of your home</strong> — one wrong decision turns your dream into a <strong className="text-orange-600">daily frustration.</strong> This is the <em className="font-serif italic">one</em> book that guides you like a pro designer.
            </p>
          </div>
        </section>

        {/* BOOK COVER REVEAL (before Emotional Toll) */}
        <section className="relative py-20 md:py-28 bg-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(249,115,22,0.08), transparent 60%)' }} />
          <div className="max-w-4xl mx-auto px-5 text-center relative">
            <p className="text-orange-600 text-xs font-black uppercase tracking-[0.3em] mb-4">The Book That Changes Everything</p>
            <h3 className="text-3xl md:text-5xl font-display font-black text-gray-950 tracking-tightest mb-12">
              Meet the <span className="premium-gradient">One Book</span><br className="hidden md:block" /> Recommended for Designers &amp; Homeowners Alike
            </h3>
            <div className="relative inline-block group max-w-md w-full">
              <div className="absolute -inset-10 bg-orange-300/30 rounded-full blur-3xl -z-10" />
              <div className="absolute -inset-3 bg-gray-950/10 rounded-[2rem] rotate-2 -z-10" />
              <img
                src="/images/nono.jpg"
                alt="Kitchen Design Book — Inside Preview"
                loading="lazy"
                className="relative w-full mx-auto rounded-2xl shadow-2xl border border-gray-200 group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
            <p className="text-gray-500 text-sm md:text-base mt-10 max-w-lg mx-auto italic">
              150 pages. Hand-drawn diagrams. Verified clearances. The one resource on every designer's desk.
            </p>
          </div>
        </section>

        {/* WHAT'S INSIDE BOOK — moved above Emotional Toll */}
        <section className="py-20 md:py-32">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="w-full md:w-1/3">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">What's <span className="text-orange-500">Inside</span> Book</h2>
                <p className="text-gray-600 mb-10">We don't give you vibes. We give you blueprints. 150 pages of high-density precision.</p>
                <div className="space-y-4">
                  {FEATURES.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                      <span className="text-sm font-semibold text-gray-800">{f.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-2/3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                   <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                       <ChefHat size={24} />
                     </div>
                     <div>
                       <h3 className="text-2xl font-bold text-gray-900 leading-none">Kitchen Design Book</h3>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">{CURRICULUM_DATA[0].bookNum}</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
                     {CURRICULUM_DATA[0].sections.map((section, idx) => (
                       <div key={idx}>
                         <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <span className="w-4 h-px bg-orange-200" /> {section.name}
                         </h4>
                         <ul className="space-y-3">
                           {section.items.map((item, k) => (
                             <li key={k} className="flex items-start gap-2.5 text-sm font-medium text-gray-700">
                               <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-200" />
                               {item}
                             </li>
                           ))}
                         </ul>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR NO-REGRET PROMISE — moved below What's Inside Book */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100 text-emerald-600">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-gray-950 mb-5">Our No-Regret Promise</h3>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
              If you ever feel the need to open <em className="font-serif italic">any other</em> kitchen design book after reading this one, <strong className="underline decoration-orange-400 decoration-2 underline-offset-4">just write to us, and we'll happily refund your money.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mt-4">
              That's how confident we are that this will be the <strong>only kitchen design resource you'll ever need.</strong>
            </p>
          </div>
        </section>

        {/* EMOTION: PAIN POINTS (tight) */}
        <section className="py-14 md:py-20 bg-gray-950 text-white">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight">The <span className="text-orange-500">Emotional Toll</span> of Bad Design</h2>
              <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">One wrong clearance. A lifetime of regret.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {PROBLEM_POINTS.map((pt, i) => (
                <div key={i} className="flex items-center gap-4 p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all hover:bg-white/[0.07] group">
                  <div className="text-3xl md:text-4xl shrink-0 group-hover:scale-110 transition-transform">{pt.emoji}</div>
                  <p className="text-gray-200 text-sm md:text-base font-medium leading-snug">{pt.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EMOTION: TRANSFORMATION STORIES */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-display font-black text-gray-900 leading-[1] mb-8">
                  From <span className="text-orange-600 italic font-serif font-normal">Design Regret</span> to Construction Pride
                </h2>
                <div className="space-y-8">
                  {TRANSFORMATION_STORIES.map((story, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-orange-50 border border-orange-100 relative">
                       <Quote className="absolute top-4 right-4 text-orange-200" size={40} />
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700">{story.emoji}</div>
                         <div>
                           <p className="font-bold text-gray-900 leading-none">{story.name}</p>
                           <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">{story.role}</p>
                         </div>
                       </div>
                       <p className="text-gray-600 italic mb-4">"{story.before}"</p>
                       <p className="text-gray-900 font-semibold leading-relaxed">"{story.after}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-orange-100 rounded-3xl -rotate-2 -z-10" />
                <img src={BOOK_IMAGES.kitchenPreview} alt="Kitchen Design Book Preview" className="w-full rounded-2xl shadow-2xl border border-gray-100" />
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            PART 2: LOGIC (The Proof & The How-To)
            ========================================== */}

        {/* LOGIC: WHY THIS BOOK CHANGES EVERYTHING */}
        <section className="py-20 md:py-32 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <div className="w-24 h-1.5 bg-orange-500 rounded-full mx-auto mb-8" />
            <h2 className="text-4xl md:text-6xl font-display font-black text-gray-950 tracking-tightest mb-12">
              Why This Book <span className="premium-gradient">Changes Everything</span>
            </h2>
            <ul className="space-y-5 md:space-y-6 text-left max-w-2xl mx-auto">
              {[
                { emoji: '✏️', text: <>You <strong>don't need an architect</strong> to understand it</> },
                { emoji: '📏', text: <>Every detail is <strong>to scale</strong>, verified by experienced designers</> },
                { emoji: '🧠', text: <>Built with <strong>real kitchens</strong> in mind, not showroom fantasies</> },
                { emoji: '👀', text: <>A <strong>hand‑made diagrams book</strong> that skips boring theory</> },
                { emoji: '🔴', text: <>Saves you from <strong>costly design mistakes</strong> before they happen</> },
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all">
                  <span className="text-3xl md:text-4xl shrink-0 leading-none">{it.emoji}</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium leading-relaxed pt-1">{it.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* LOGIC: WHAT'S INSIDE */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-orange-50/40">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-14">
              <p className="text-orange-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Every Page. Every Detail. Every Dimension.</p>
              <h2 className="text-4xl md:text-6xl font-display font-black text-gray-950 tracking-tightest">What's Inside</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {[
                { emoji: '📐', text: 'Layout rules for every kitchen type' },
                { emoji: '🚪', text: 'Door and aisle clearance guides' },
                { emoji: '🧊', text: 'Refrigerator, hob and sink triangle logic' },
                { emoji: '📊', text: 'Planning checklists to stay on track' },
                { emoji: '💥', text: "Tips contractors won't tell you, but you'll wish you knew" },
                { emoji: '🔧', text: 'Cabinet modules and smart storage ideas' },
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <span className="text-3xl md:text-4xl shrink-0 leading-none">{it.emoji}</span>
                  <span className="text-gray-800 text-base md:text-lg font-semibold leading-snug pt-1">{it.text}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-gray-500 text-sm md:text-base mt-12 italic max-w-xl mx-auto">
              150 pages of high-density precision. Every diagram hand-drawn. Every clearance verified by working designers.
            </p>
          </div>
        </section>

        {/* LOGIC: INDUSTRY SEGMENTS */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-5">
            <div className="bg-white rounded-3xl p-10 md:p-16 border border-gray-200 shadow-sm text-center">
               <h3 className="text-2xl md:text-4xl font-display font-bold text-gray-900 mb-12">Who is this logically for?</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                 {INDUSTRIES.map((ind, i) => {
                    const IconComp = ICON_MAP[ind.icon] || Home;
                    return (
                      <div key={i} className="flex flex-col items-center gap-4 group cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                           <IconComp size={28} />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-800">{ind.label}</span>
                      </div>
                    );
                 })}
               </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            PART 3: URGENCY (The Closer & Decision)
            ========================================== */}

        {/* URGENCY: SMARTEST MOVE OPENER */}
        <section className="py-20 md:py-28 bg-white text-center">
          <div className="max-w-3xl mx-auto px-5">
            <div className="w-16 h-1.5 bg-orange-500 rounded-full mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-display font-black text-gray-950 tracking-tightest mb-8">
              Detailed <span className="premium-gradient">Handmade Diagrams</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-3">
              Make the Smartest Move in Your Design Journey.
            </p>
            <p className="text-gray-600 text-lg md:text-xl mb-6">
              Grab the <strong>one book</strong> that takes the guesswork out of kitchen design.
            </p>
            <p className="text-2xl md:text-3xl font-display font-bold text-gray-950 mt-8">
              Because <span className="text-orange-600">kitchens last for years.</span><br />
              <span className="italic font-serif">Mistakes don't have to.</span>
            </p>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-32 relative">
          <div className="absolute inset-0 bg-gray-50 -z-10" />
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-7xl font-display font-black text-gray-900 tracking-tightest mb-6">Claim Your Copy<br /><span className="text-orange-600">for the price of a coffee.</span></h2>
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold text-gray-700 tracking-wide">PRICE GOES BACK TO $29 WHEN THE TIMER HITS ZERO</p>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
               <div className="absolute top-0 right-0 p-8">
                  <div className="bg-orange-500 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center -rotate-12 font-black shadow-lg">
                    <span className="text-xs opacity-80 leading-none">SAVE</span>
                    <span className="text-2xl leading-none">69%</span>
                  </div>
               </div>

               <div className="w-full md:w-1/2 space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">Get everything now:</h3>
                  <ul className="space-y-4">
                    {['High-Density Dimension Guides', 'Workflow Clearance Charts', 'Zoning & Triangle Rules', 'Lifetime Free Updates', 'Instant Access on any device'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6">
                    <div className="flex items-center gap-4 mb-2 h-10">
                       <span className="text-2xl text-gray-400 line-through">$29.00</span>
                       <span className="text-6xl font-display font-black text-orange-600">$9.00</span>
                    </div>
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">ONE TIME PAYMENT — NO SUBSCRIPTION</p>
                  </div>
               </div>

               <div className="w-full md:w-1/2 flex flex-col gap-6">
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 text-center">
                     <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Time Remaining:</p>
                     <div className="flex justify-center scale-150 py-2">
                        <CountdownTimer />
                     </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={navigateToCheckout} className="relative w-full py-4 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center text-white overflow-hidden group tracking-wider">
                      <span className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-[length:200%_100%] group-hover:bg-[position:100%_0] transition-[background-position] duration-700" />
                      <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                      <span className="relative z-10 uppercase">Yes! Give Me Instant Access</span>
                    </button>
                    <p className="text-[10px] text-gray-500 text-center uppercase tracking-[0.2em] font-bold">
                      Sent to your email in 30 seconds
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] flex items-center justify-center gap-2 font-bold">
                    <ShieldCheck size={14} /> Encrypted Stripe Checkout
                  </p>
               </div>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 md:py-32">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-12">
               <p className="text-orange-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Still thinking?</p>
               <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 tracking-tight">The Questions Buyers Ask <span className="text-orange-500">Right Before Clicking</span></h2>
            </div>
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, i) => (
                <details key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-gray-300 transition-colors" open={openFaqIndex === i}>
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none list-none text-left" onClick={(e) => { e.preventDefault(); setOpenFaqIndex(openFaqIndex === i ? null : i); }}>
                    <span className="text-sm md:text-base font-bold text-gray-800 tracking-tight">{faq.question}</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
        
        {/* FOOTER */}
        <footer className="py-12 bg-white border-t border-gray-100 text-gray-900">
          <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-8">
            <Logo />
          </div>
          <div className="max-w-6xl mx-auto px-5 mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest"> {new Date().getFullYear()} Kitchen Design Book. Dimension matters.</p>
             <div className="flex items-center gap-4">
                {PORTRAIT_IMAGES.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-6 h-6 rounded-full border border-gray-200 grayscale" />
                ))}
             </div>
          </div>
        </footer>
      </main>

      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* STICKY BOTTOM BAR (Converston Guard) */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 shadow-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
             <div className="hidden sm:flex items-center gap-4">
               <div className="flex -space-x-3">
                 {PORTRAIT_IMAGES.slice(0, 4).map((img, i) => (
                   <img key={i} src={img} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                 ))}
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-900 leading-none mb-1 uppercase tracking-widest">Join 5000+ Designers</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Risk-Free Purchase</p>
               </div>
             </div>
             <button onClick={navigateToCheckout} className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-600/20 hover:scale-[1.03] transition-all flex items-center justify-center gap-2 group">
               Get the Book Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;