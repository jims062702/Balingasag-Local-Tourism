import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, ArrowRight } from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebase';

interface NavbarProps {
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  isDetailPage?: boolean;
  onBackToHome?: () => void;
  onOpenSearch?: () => void;
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  // Navlinks matching exact prompt requirements (text only)
  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'destinations', label: 'Tourism spots' },
    { id: 'weather-advisories', label: 'Weather & Advisories' },
    { id: 'events-calendar', label: 'Festivals & Events' },
    { id: 'demographics', label: 'Municipal profile' },
    { id: 'lgu-officials', label: 'LGU Officials' },
  ];

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Floating Capsule / Pill Navbar (No Overlap, Responsive, Generous Padding) */}
        <nav
          className={`pointer-events-auto rounded-full bg-white/95 backdrop-blur-md border border-stone-200/90 transition-all duration-300 px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 ${
            isScrolled
              ? 'shadow-[0_12px_36px_rgba(0,0,0,0.08)] border-stone-300/80'
              : 'shadow-[0_8px_28px_rgba(0,0,0,0.04)]'
          }`}
          aria-label="Main navigation"
        >
          {/* Brand Mark (Official Balingasag Seal with transparent background + Discover Balingasag) */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 select-none min-w-0"
            onClick={() => handleLinkClick('hero')}
          >
            <img
              src="/balingasag-seal.png"
              alt="Official Seal of Balingasag"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />

            <span className="text-sm sm:text-base xl:text-lg font-black tracking-tight text-stone-900 group-hover:text-blue-700 transition-colors whitespace-nowrap truncate">
              Discover Balingasag
            </span>
          </div>

          {/* Desktop Navlinks with 30% Active Underline (Fluid, no overflow) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-3 2xl:gap-5 flex-1 justify-center px-2">
            {navLinks.map((link) => {
              const isActive = !isDetailPage && activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative px-2 py-1.5 text-xs xl:text-[13px] tracking-tight transition-colors whitespace-nowrap flex flex-col items-center focus:outline-none shrink-0 ${
                    isActive
                      ? 'text-stone-950 font-bold'
                      : 'text-stone-600 hover:text-stone-950 font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="navActiveUnderline"
                      className="absolute -bottom-1 h-[2.5px] w-[32%] rounded-full bg-blue-600 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Group: Pill CTA Button & Admin Portal trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Pill CTA Button: Hidden on phone (<640px) to prevent mobile crowding; visible on tablet/desktop */}
            <button
              onClick={() => handleLinkClick('destinations')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 xl:px-5 py-2 text-xs xl:text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs hover:shadow transition-all group shrink-0"
            >
              <span>Explore Spots</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Admin Portal User Button */}
            <button
              onClick={onOpenAdmin}
              title={isAdminLoggedIn ? 'LGU Admin CMS (Active)' : 'LGU Admin Portal'}
              aria-label="Admin Portal"
              className={`p-1.5 sm:p-2 rounded-full border transition-all flex items-center justify-center shrink-0 relative ${
                isAdminLoggedIn
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              <User className="w-4 h-4" />
              {isAdminLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950 focus:outline-none shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Drawer (Responsive floating card under navbar) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto mt-2 p-3 sm:p-4 bg-white/98 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-2xl space-y-1.5 lg:hidden"
            >
              {navLinks.map((link) => {
                const isActive = !isDetailPage && activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-950'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })}

              {/* Mobile CTA Button inside Drawer */}
              <div className="pt-2">
                <button
                  onClick={() => handleLinkClick('destinations')}
                  className="w-full py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Explore All Tourism Spots</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
