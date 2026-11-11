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
    slides && slides.length > 0 ? slides.filter((s) => s.isActive) : [];
  const currentSlides =
    activeSlides.length > 0
      ? activeSlides
      : slides && slides.length > 0
      ? slides
      : INITIAL_CAROUSEL_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [phTime, setPhTime] = useState('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  // Automatically cycle slides every 5 seconds (strictly continuous, never paused)
  useEffect(() => {
    if (currentSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 5000);
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

  // Mobile Touch Swipe Gesture Support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const scrollToDestinations = () => {
    const el = document.getElementById('destinations');
    el?.scrollIntoView({ behavior: 'smooth' });
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

        {/* Subtle Vignette Overlays: Maximizes carousel image space & clarity while ensuring left text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 pointer-events-none" />
      </div>

      {/* Floating Left Arrow (Barangay Natumolan Style: Frosted glass circular button on the left edge) */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md items-center justify-center text-white transition-all shadow-xl hover:scale-105 active:scale-95 group focus:outline-none"
      >
        <ChevronLeft className="w-5 h-5 text-white/90 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Floating Right Arrow (Barangay Natumolan Style: Frosted glass circular button on the right edge) */}
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md items-center justify-center text-white transition-all shadow-xl hover:scale-105 active:scale-95 group focus:outline-none"
      >
        <ChevronRight className="w-5 h-5 text-white/90 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Left-Aligned Foreground Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-28 sm:pt-32 pb-24 w-full flex flex-col items-start text-left">
        <div className="max-w-2xl space-y-5 sm:space-y-6 text-left">
          {/* Top Tagline Badge */}

          {/* Main Heading (Left-Aligned) */}
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

          {/* Subtitle (Left-Aligned) */}
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

          {/* Primary Action Buttons (Municipal Profile & LGU Officials strictly on the left side) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-row items-center justify-start gap-2.5 sm:gap-3.5 pt-2 flex-nowrap"
          >
            <button
              onClick={scrollToDemographics}
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-950/50 transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95 group shrink-0 whitespace-nowrap"
            >
              <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              <span>Municipal profile</span>
            </button>

            <button
              onClick={scrollToLGUOfficials}
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>LGU officials</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Centered Slide Dots Indicator (Barangay Natumolan Style: Dots with active oval pill directly above scroll down) */}
      <div className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {currentSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full focus:outline-none ${
              idx === currentSlide
                ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-blue-500 shadow-md shadow-blue-500/50'
                : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Centered Scroll Down Arrow (Barangay Natumolan Style) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <button
          onClick={scrollToDestinations}
          aria-label="Scroll down to Tourism Spots"
          className="flex flex-col items-center gap-0.5 group text-slate-400 hover:text-white transition-colors focus:outline-none"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
            Scroll to Explore
          </span>
          <ChevronDown className="w-4 h-4 text-blue-400 group-hover:text-blue-300 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
