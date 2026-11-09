import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
        setScrollProgress(progress);
      }
      setIsVisible(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG circle calculations
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * scrollProgress) / 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          title={`Scroll to top (${Math.round(scrollProgress)}% viewed)`}
          aria-label="Scroll to top of page"
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 p-1 rounded-full bg-slate-950/90 text-white shadow-2xl backdrop-blur-md border border-slate-700/70 flex items-center justify-center group focus:outline-none"
        >
          {/* Progress Circle SVG (Matches Chatbot Outer Dimensions Exactly) */}
          <svg className="w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 48 48">
            {/* Background Track */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active POV Progress Indicator */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-blue-500 transition-all duration-150"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Centered Arrow Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ArrowUp className="w-5 h-5 text-slate-200 group-hover:text-white transition-colors group-hover:-translate-y-0.5 duration-200" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
