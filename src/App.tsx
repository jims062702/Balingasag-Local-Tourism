import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import { auth, isFirebaseConfigured } from './services/firebase';
import {
  Destination,
  TravelAdvisory,
  LocalEvent,
  DestinationCategory,
  CarouselSlide,
  MunicipalProfile,
} from './types';
import {
  getDestinations,
  getAdvisories,
  getEvents,
  getCarouselSlides,
  getMunicipalProfile,
  mergeDestinations,
  mergeAdvisories,
  mergeEvents,
  mergeCarouselSlides,
  subscribeToMunicipalProfile,
  subscribeToCarouselSlides,
  subscribeToDestinations,
  subscribeToEvents,
  subscribeToAdvisories,
} from './services/firestoreService';
import { INITIAL_MUNICIPAL_PROFILE } from './data/initialData';
import toast from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { DestinationExplorer } from './components/DestinationExplorer';
import { DestinationDetailPage } from './components/DestinationDetailPage';
import { WeatherAdvisoryWidget } from './components/WeatherAdvisoryWidget';
import { EventsCalendar } from './components/EventsCalendar';
import { DemographicsSection } from './components/DemographicsSection';
import { LGUOfficialsSection } from './components/LGUOfficialsSection';
import { ScrollToTop } from './components/ScrollToTop';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { TourismChatbot } from './components/TourismChatbot';

export const App: React.FC = () => {
  // Routing State: 'landing' | 'detail' | 'admin'
  const [viewMode, setViewMode] = useState<'landing' | 'detail' | 'admin'>('landing');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  // Command Palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Active Section for Scroll-Spy
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Data States (Synchronously initialized so frame-0 has instant local data without blink)
  const [destinations, setDestinations] = useState<Destination[]>(() => mergeDestinations([]));
  const [advisories, setAdvisories] = useState<TravelAdvisory[]>(() => mergeAdvisories([]));
  const [events, setEvents] = useState<LocalEvent[]>(() => mergeEvents([]));
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => mergeCarouselSlides([]));
  const [municipalProfile, setMunicipalProfile] = useState<MunicipalProfile>(() => {
    try {
      const raw = localStorage.getItem('balingasag_municipal_profile_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_MUNICIPAL_PROFILE;
  });
  const [loading, setLoading] = useState(false);

  // Explorer Filtering States (Search & Category managed in Tourism Spots section)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory>('All');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  // Admin Authentication State (Persistent across hard refresh)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('balingasag_admin_logged_in') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('balingasag_admin_email') || '';
  });

  const handleSetIsAdminLoggedIn = (val: boolean) => {
    setIsAdminLoggedIn(val);
    if (val) {
      localStorage.setItem('balingasag_admin_logged_in', 'true');
    } else {
      localStorage.removeItem('balingasag_admin_logged_in');
    }
  };

  const handleSetAdminEmail = (email: string) => {
    setAdminEmail(email);
    if (email) {
      localStorage.setItem('balingasag_admin_email', email);
    } else {
      localStorage.removeItem('balingasag_admin_email');
    }
  };

  // Fetch all initial data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [dList, aList, eList, cList, mProfile] = await Promise.all([
        getDestinations(),
        getAdvisories(),
        getEvents(),
        getCarouselSlides(),
        getMunicipalProfile(),
      ]);
      setDestinations(dList);
      setAdvisories(aList);
      setEvents(eList);
      setCarouselSlides(cList);
      if (mProfile) setMunicipalProfile(mProfile);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Browser Hash Router Listener
  const parseRoute = () => {
    const hash = window.location.hash;
    if (hash === '#/admin') {
      setViewMode('admin');
      setSelectedDestinationId(null);
    } else if (hash.startsWith('#/spot/')) {
      const spotId = hash.replace('#/spot/', '');
      setSelectedDestinationId(spotId);
      setViewMode('detail');
    } else {
      setViewMode('landing');
      setSelectedDestinationId(null);
    }
  };

  useEffect(() => {
    refreshAllData();
    parseRoute();

    window.addEventListener('hashchange', parseRoute);

    // Real-time Firestore subscriptions for live updates without manual page reload
    const unsubscribeProfile = subscribeToMunicipalProfile((updatedProfile) => {
      setMunicipalProfile(updatedProfile);
    });
    const unsubscribeCarousel = subscribeToCarouselSlides((slides) => {
      setCarouselSlides(slides);
    });
    const unsubscribeDestinations = subscribeToDestinations((dests) => {
      setDestinations(dests);
    });
    const unsubscribeEvents = subscribeToEvents((evts) => {
      setEvents(evts);
    });
    const unsubscribeAdvisories = subscribeToAdvisories((advs) => {
      setAdvisories(advs);
    });

    // Listen to Firebase Auth state
    let unsubscribeAuth: (() => void) | undefined;
    if (isFirebaseConfigured() && auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          handleSetIsAdminLoggedIn(true);
          handleSetAdminEmail(user.email || 'admin@balingasag.gov.ph');
        }
      });
    }

    return () => {
      window.removeEventListener('hashchange', parseRoute);
      unsubscribeProfile();
      unsubscribeCarousel();
      unsubscribeDestinations();
      unsubscribeEvents();
      unsubscribeAdvisories();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // IntersectionObserver Scroll Spy for Landing Page Sections
  useEffect(() => {
    if (viewMode !== 'landing') return;

    const sectionIds = ['hero', 'destinations', 'weather-advisories', 'events-calendar', 'demographics', 'lgu-officials'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // Navigation Handlers
  const handleNavigateSection = (sectionId: string) => {
    if (viewMode !== 'landing') {
      window.location.hash = '#/';
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDestination = (destId: string) => {
    window.location.hash = `#/spot/${destId}`;
  };

  const handleBackToHome = () => {
    refreshAllData();
    window.location.hash = '#/';
  };

  const handleOpenAdmin = () => {
    window.location.hash = '#/admin';
  };

  const currentDestination = destinations.find((d) => d.id === selectedDestinationId) || destinations[0];

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-stone-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notifications Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#2563EB',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* RENDER VIEW: SEPARATE ADMIN DASHBOARD INTERFACE */}
      {viewMode === 'admin' ? (
        <AdminDashboard
          isAdminLoggedIn={isAdminLoggedIn}
          setIsAdminLoggedIn={handleSetIsAdminLoggedIn}
          adminEmail={adminEmail}
          setAdminEmail={handleSetAdminEmail}
          destinations={destinations}
          advisories={advisories}
          events={events}
          carouselSlides={carouselSlides}
          municipalProfile={municipalProfile}
          onRefreshAllData={refreshAllData}
          onExitAdmin={handleBackToHome}
        />
      ) : viewMode === 'detail' && currentDestination ? (
        /* RENDER VIEW: DEDICATED DESTINATION DETAIL PAGE (NO MODAL) */
        <>
          <Navbar
            activeSection={activeSection}
            onNavigateSection={handleNavigateSection}
            onOpenAdmin={handleOpenAdmin}
            isAdminLoggedIn={isAdminLoggedIn}
            isDetailPage={true}
            onBackToHome={handleBackToHome}
            onOpenSearch={() => setCommandPaletteOpen(true)}
          />
          <main className="flex-1">
            <DestinationDetailPage
              destination={currentDestination}
              allDestinations={destinations}
              onBack={handleBackToHome}
              onSelectDestination={handleSelectDestination}
            />
          </main>
          <Footer />
          <ScrollToTop />
        </>
      ) : (
        /* RENDER VIEW: LANDING PAGE */
        <>
          <Navbar
            activeSection={activeSection}
            onNavigateSection={handleNavigateSection}
            onOpenAdmin={handleOpenAdmin}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenSearch={() => setCommandPaletteOpen(true)}
          />

          <main className="flex-1">
            {/* 1. HERO SECTION (Left Text + Smooth Carousel + Arrow Down Scroll Indicator) */}
            <HeroBanner
              slides={carouselSlides}
              onSelectCategory={(category) => {
                setSelectedCategory(category);
                handleNavigateSection('destinations');
              }}
              onSelectDestination={handleSelectDestination}
            />

            {/* 2. TOURISM SPOTS SECTION (With Search Bar, Categories & Infinite Scroll) */}
            <DestinationExplorer
              destinations={destinations}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBarangay={selectedBarangay}
              setSelectedBarangay={setSelectedBarangay}
              onSelectDestination={handleSelectDestination}
              loading={loading}
            />

            {/* 3. WEATHER & ADVISORIES SECTION */}
            <WeatherAdvisoryWidget advisories={advisories} />

            {/* 4. FESTIVALS & TOWN EVENTS CALENDAR */}
            <EventsCalendar events={events} />

            {/* 5. MUNICIPAL PROFILE & DEMOGRAPHICS (30 Barangays, 74,385 Pop, 18,235.36 Ha) */}
            <DemographicsSection
              profile={municipalProfile}
              onSelectBarangay={(brgy) => {
                setSelectedBarangay(brgy);
                handleNavigateSection('destinations');
              }}
              onNavigateToDestinations={() => handleNavigateSection('destinations')}
            />

            {/* 6. LGU OFFICIALS SECTION (Mayor, Vice Mayor, Sangguniang Bayan) */}
            <LGUOfficialsSection />
          </main>

          <Footer />

          {/* CIRCULAR POV SCROLL TO TOP BUTTON (Prompt Requirement) */}
          <ScrollToTop />
        </>
      )}

      {/* GLOBAL COMMAND PALETTE (CTRL+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        destinations={destinations}
        onSelectDestination={handleSelectDestination}
        onSelectBarangay={(brgy) => {
          setSelectedBarangay(brgy);
          handleNavigateSection('destinations');
        }}
        onNavigateSection={handleNavigateSection}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* GEMINI AI TOURISM CHATBOT (Max 255 chars, Token-optimized, Progressive Anti-Spam Buffers) */}
      <TourismChatbot />
    </div>
  );
};

export default App;
