import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { CarouselSlide } from '../types';
import { INITIAL_CAROUSEL_SLIDES } from '../data/initialData';

interface HeroBannerProps {
  slides?: CarouselSlide[];
  onSelectCategory?: (category: any) => void;
  onSelectDestination?: (destId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ slides }) => {
  const activeSlides =
    slides && slides.length > 0 ? slides.filter((s) => s.isActive) : INITIAL_CAROUSEL_SLIDES;
  const currentSlides = activeSlides.length > 0 ? activeSlides : INITIAL_CAROUSEL_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [phTime, setPhTime] = useState('');

  // Real-time Philippine Standard Time (PST, UTC+8) Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setPhTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Navigation: Left & Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlides.length]);

  // Automatically cycle slides every 3 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, currentSlides.length]);

  // Reset currentSlide if array length shrinks
  useEffect(() => {
    if (currentSlide >= currentSlides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlides.length, currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
  };

  const scrollToDestinations = () => {
    const el = document.getElementById('destinations');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSlideData = currentSlides[currentSlide] || currentSlides[0];

  return (
    <section
      id="hero"
      className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Smooth Carousel with Ken Burns Zoom Transition */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlideData.id || currentSlide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="absolute inset-0"
          >
            <img
              src={activeSlideData.imageUrl}
              alt={activeSlideData.title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Refined Vignette Overlays: Balanced contrast so photos remain vivid, text is crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      {/* Clean Foreground Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6 text-left">
          {/* LGU Official Badge with PST Clock */}
          

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]"
          >
            Discover the Heritage &amp; Natural Wonders of{' '}
            <span className="text-emerald-400">
              Balingasag
            </span>
          </motion.h1>

          {/* Subtitle (Camuayan Cold Springs accurately phrased) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed"
          >
            Immerse yourself in the heart of Balingasag. Explore the living history of the legendary Vega
             Ancestral House and ancestral brick sanctuaries, or chase the refreshing crystal-clear waters
              of Camuayan Cold Springs alongside the stunning sunsets of Macajalar Baywalk.
               A curated, community-driven guide crafted purely for authentic local exploration.
          </motion.p>

          {/* Primary Action Buttons (Clean & purposeful) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-3.5 pt-2 flex-wrap"
          >
            <button
              onClick={scrollToDestinations}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 group"
            >
              <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              <span>Explore Tourism Spots</span>
            </button>

            <a
              href="#weather-advisories"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Live Weather &amp; Advisories</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Sleek Carousel Slide Navigator (Bottom-Right Glass Pill: Clean, Minimal, Non-Intrusive) */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex items-center gap-3 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-xl text-xs">
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-mono text-[11px] font-bold text-emerald-300 tracking-wider">
          {String(currentSlide + 1).padStart(2, '0')} / {String(currentSlides.length).padStart(2, '0')}
        </span>

        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Scroll Down Arrow */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <button
          onClick={scrollToDestinations}
          aria-label="Scroll down to Tourism Spots"
          className="flex flex-col items-center gap-0.5 group text-slate-400 hover:text-white transition-colors focus:outline-none"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/90 group-hover:text-emerald-300 transition-colors">
            Scroll to Explore
          </span>
          <ChevronDown className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
