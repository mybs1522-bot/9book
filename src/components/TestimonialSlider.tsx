
import React, { useState, useEffect, useCallback } from 'react';
import { TESTIMONIALS } from '../constants';
import { GlassCard } from './ui/GlassCard';
import { Quote, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export const TestimonialSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto px-4 py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden relative min-h-[400px]">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="w-full flex-shrink-0 px-2 md:px-4">
              <GlassCard className="p-8 md:p-12 flex flex-col justify-between h-full bg-white relative group border-2 border-gray-50 max-w-4xl mx-auto shadow-2xl">
                <div className="absolute top-8 left-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote size={60} className="text-brand-primary" />
                </div>
                
                <div className="relative z-10 pt-8">
                  <p className="text-gray-800 text-lg md:text-2xl font-medium leading-relaxed italic mb-12">
                    "{t.content}"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-gray-100 pt-8 mt-auto">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-2xl shadow-xl shrink-0">
                      {t.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-xl">{t.name}</span>
                        <div className="flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-green-100 shadow-sm">
                          <CheckCircle2 size={10} strokeWidth={4} />
                          <span>Verified Purchase</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {t.role} • {t.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-6 mt-10">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-white border border-gray-100 shadow-md hover:bg-gray-50 transition-all text-gray-400 hover:text-brand-primary"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-8 bg-brand-primary' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-white border border-gray-100 shadow-md hover:bg-gray-50 transition-all text-gray-400 hover:text-brand-primary"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
