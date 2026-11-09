import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { User, Menu, X, Landmark } from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebase';

interface NavbarProps {
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  isDetailPage?: boolean;
  onBackToHome?: () => void;
  onOpenSearch?: () => void;
  onOpenSavedTrips?: () => void;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigateSection,
  onOpenAdmin,
  isAdminLoggedIn,
  isDetailPage = false,
  onBackToHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const firebaseReady = isFirebaseConfigured();

  // Scroll Progress Tracking for the Top Aesthetic Reading Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (sectionId: string) => {
    if (isDetailPage && onBackToHome) {
      onBackToHome();
      setTimeout(() => {
        onNavigateSection(sectionId);
      }, 100);
    } else {
      onNavigateSection(sectionId);
    }
    setMobileMenuOpen(false);
  };

  // Requested navlinks without icons
  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'destinations', label: 'Tourism spots' },
    { id: 'weather-advisories', label: 'Weather & Advisories' },
    { id: 'events-calendar', label: 'Festivals & Events' },
    { id: 'demographics', label: 'Municipal profile' },
    { id: 'lgu-officials', label: 'LGU Officials' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-white/10 shadow-lg py-2.5'
          : 'bg-slate-950/85 backdrop-blur-sm border-b border-white/10 py-3'
      }`}
    >
      {/* Top Scroll Reading Progress Bar with Emerald Glow */}
      <motion.div
        style={{ scaleX }}
        className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 origin-left z-50 pointer-events-none shadow-[0_0_10px_rgba(52,211,153,0.8)]"
      />

      {/* Maximum space utilization: px-4 sm:px-6 lg:px-8 without excessive margin */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Municipal Text on the LEFT SIDE (Using space efficiently, no oversized margin) */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleLinkClick('hero')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Landmark className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
                  Discover Balingasag
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                LGU Tourism Portal • Misamis Oriental
              </p>
            </div>
          </div>

          {/* Desktop Navlinks (Text only, Underline indicator under active section) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = !isDetailPage && activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap focus:outline-none ${
                    isActive
                      ? 'text-emerald-400 font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navActiveUnderline"
                      className="absolute -bottom-1 left-2.5 right-2.5 h-[2.5px] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            <div className="h-4 w-px bg-white/20 mx-2" />

            {/* ADMIN PORTAL: USER ICON BUTTON (Prompt Requirement) */}
            <button
              onClick={onOpenAdmin}
              title={isAdminLoggedIn ? 'LGU Admin CMS (Active)' : 'LGU Admin Portal Login'}
              aria-label="Admin Portal"
              className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center group relative ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20'
              }`}
            >
              <User className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
              {isAdminLoggedIn && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
              )}
            </button>
          </nav>

          {/* Mobile Menu & User Icon for Mobile (Clean without search and wishlist) */}
          <div className="lg:hidden flex items-center gap-2">
            {/* User Icon for Mobile Admin */}
            <button
              onClick={onOpenAdmin}
              title="Admin Portal"
              className="p-2 rounded-xl bg-white/10 text-slate-200 hover:text-white border border-white/20"
            >
              <User className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 text-slate-200 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-white/10 px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const isActive = !isDetailPage && activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between border-b ${
                  isActive
                    ? 'text-emerald-400 border-emerald-400 font-extrabold'
                    : 'text-slate-300 border-slate-800/60 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
