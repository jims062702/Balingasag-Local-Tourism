import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
} from 'lucide-react';
import { CarouselSlide } from '../types';
import { INITIAL_CAROUSEL_SLIDES } from '../data/initialData';
import { getHeroOptimizedUrl } from '../services/cloudinary';

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

  // Automatically cycle slides every 3 seconds (strictly continuous, never paused)
  useEffect(() => {
    if (currentSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide, currentSlides.length]);

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

  const scrollToDemographics = () => {
    const el = document.getElementById('demographics');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLGUOfficials = () => {
    const el = document.getElementById('lgu-officials');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSlideData = currentSlides[currentSlide] || currentSlides[0];

  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-[680px] flex items-center overflow-hidden bg-slate-950 text-white"
    >
      {/* Background Smooth Carousel (High-Resolution & AI Sharpened via Cloudinary) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlideData.id || currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 transform-gpu"
          >
            <img
              src={getHeroOptimizedUrl(activeSlideData.imageUrl)}
              alt={activeSlideData.title}
              className="w-full h-full object-cover object-center"
              style={{
                imageRendering: 'auto',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle Vignette Overlays: Maximizes carousel image space & clarity while ensuring text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 pointer-events-none" />
      </div>

      {/* Clean Foreground Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-28 sm:pt-32 pb-20 w-full">
        <div className="max-w-2xl space-y-6 text-left">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]"
          >
            Discover the Heritage &amp; Natural Wonders of{' '}
            <span className="text-blue-400">
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
            of Camuayan Natural Cold Springs alongside the stunning sunsets of Macajalar Baywalk.
            A curated, community-driven guide crafted purely for authentic local exploration.
          </motion.p>

          {/* Primary Action Buttons (Municipal Profile & LGU Officials) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-3.5 pt-2 flex-wrap"
          >
            <button
              onClick={scrollToDemographics}
              className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-950/50 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 group"
            >
              <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              <span>Municipal profile</span>
            </button>

            <button
              onClick={scrollToLGUOfficials}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>LGU officials</span>
            </button>
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

        <span className="font-mono text-[11px] font-bold text-blue-400 tracking-wider">
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
          onClick={scrollToDemographics}
          aria-label="Scroll down to Municipal Profile"
          className="flex flex-col items-center gap-0.5 group text-slate-400 hover:text-white transition-colors focus:outline-none"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
            Scroll to Explore
          </span>
          <ChevronDown className="w-5 h-5 text-blue-400 group-hover:text-blue-300 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
