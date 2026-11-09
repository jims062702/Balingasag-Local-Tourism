import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Compass,
  CheckCircle,
  ExternalLink,
  Phone,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  CheckSquare,
  Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Destination } from '../types';
import { getOptimizedMediaUrl } from '../services/cloudinary';

interface DestinationDetailPageProps {
  destination: Destination;
  allDestinations: Destination[];
  onBack: () => void;
  onSelectDestination: (destId: string) => void;
}

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  destination,
  allDestinations,
  onBack,
  onSelectDestination,
}) => {
  const [activeImage, setActiveImage] = useState<string>(destination.heroImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Sync active image when destination changes
  useEffect(() => {
    setActiveImage(destination.heroImage);
    setCompletedSteps({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [destination]);

  const galleryList = Array.from(
    new Set([destination.heroImage, ...(destination.gallery || [])].filter(Boolean))
  );

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % galleryList.length);
      else if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + galleryList.length) % galleryList.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, galleryList.length]);

  const openLightboxWithImage = (imgUrl: string) => {
    const idx = galleryList.indexOf(imgUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const toggleStepCompleted = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.coordinates.lat},${destination.coordinates.lng}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${destination.name} - Discover Balingasag`,
          text: destination.shortDescription,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!', {
        icon: '📋',
        style: {
          borderRadius: '16px',
          background: '#064e3b',
          color: '#fff',
        },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter other tourism spots (excluding current one)
  // Filter other tourism spots (excluding current one)
  const otherSpots = allDestinations
    .filter((d) => d.id !== destination.id)
    .slice(0, 6);

  const getCategoryColor = (_cat: string) => {
    return 'bg-stone-100 text-stone-800 border-stone-200/90';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 pt-24 sm:pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4 py-2 border-b border-slate-200"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Tourism Spots</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{destination.category}</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
              {destination.name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Print Traveler Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Guide</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </motion.div>

        {/* Hero Banner Section with Lightbox Zoom Trigger */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div
            onClick={() => openLightboxWithImage(activeImage)}
            className="relative h-80 sm:h-[480px] w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl cursor-pointer group"
          >
            <img
              src={getOptimizedMediaUrl(activeImage, { width: 1400, height: 900 })}
              alt={destination.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between gap-3">
              <span
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-md ${getCategoryColor(
                  destination.category
                )}`}
              >
                {destination.category}
              </span>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Click to Expand</span>
                </span>

                {destination.featured && (
                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-600 text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>Must-Visit</span>
                  </span>
                )}
              </div>
            </div>

            {/* Details on Bottom */}
            <div className="absolute bottom-6 left-6 right-6 text-white max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/30">
                <MapPin className="w-3.5 h-3.5" />
                <span>Barangay {destination.barangay}, Balingasag, Misamis Oriental</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {destination.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {destination.shortDescription}
              </p>
            </div>
          </div>

          {/* Photo Gallery Thumbnails */}
          {galleryList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 sm:w-28 h-18 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img
                      ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-400/30'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedMediaUrl(img, { width: 200, height: 140 })}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content Columns: Left Profile & Timeline | Right Logistics & Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Historical Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Historical &amp; Cultural Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Heritage narrative and significance to the Municipality of Balingasag
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {destination.description}
              </div>
            </motion.div>

            {/* Recommended Explorer Itinerary Timeline */}
            {destination.itinerary && destination.itinerary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        Recommended Explorer Itinerary
                      </h2>
                      <p className="text-xs text-slate-500">
                        Suggested timing for an optimal local day-tour experience
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    Day Tour Guide
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                  {destination.itinerary.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-xs flex items-center justify-center text-[10px] text-white font-bold" />
                      <div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              {step.time}
                            </span>
                            <h3
                              className={`text-sm sm:text-base font-bold ${
                                completedSteps[idx] ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {step.activity}
                            </h3>
                          </div>
                          <button
                            onClick={() => toggleStepCompleted(idx)}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-medium transition-colors"
                          >
                            {completedSteps[idx] ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                            <span>{completedSteps[idx] ? 'Visited' : 'Check off'}</span>
                          </button>
                        </div>
                        {step.notes && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 pl-1 leading-relaxed">
                            {step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Informational Traveler Guidelines (Strictly NO pricing / NO bookings) */}
            {destination.inclusions && destination.inclusions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Visitor Guidelines &amp; Important Pointers
                    </h2>
                    <p className="text-xs text-slate-500">
                      Environmental rules, safety requirements, and local community etiquette
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {destination.inclusions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-700"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Column (4 cols): Transit Directions, Coordinates & LGU Hotline */}
          <div className="lg:col-span-4 space-y-6">
            {/* Transit Guidelines */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">How to Get There</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {destination.howToGetThere}
              </p>
              <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
                <strong className="text-slate-800">Best Time to Visit:</strong>{' '}
                {destination.bestTimeToVisit}
              </div>
            </div>

            {/* GPS Coordinates & Google Maps */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">GPS Coordinates</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                Lat: {destination.coordinates.lat.toFixed(4)}° N
                <br />
                Lng: {destination.coordinates.lng.toFixed(4)}° E
              </p>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
              >
                <span>Navigate on Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* LGU Official Contact Desk */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">
                Municipal Tourism Desk
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                For ecotourism permits, local barangay coordination, or guide arrangements:
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-blue-200 font-semibold">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{destination.contactLGU}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: "OTHER TOURISM SPOTS IN BALINGASAG" (Prompt Requirement) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          className="pt-12 border-t border-slate-200 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Continue Exploring</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Other Tourism Spots in Balingasag
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Discover more colonial heritage sites, mountain cold springs, and coastal reserves.
              </p>
            </div>

            <button
              onClick={onBack}
              className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
            >
              <span>View All 30 Barangays</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => onSelectDestination(spot.id)}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getOptimizedMediaUrl(spot.heroImage, { width: 600, height: 400 })}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${getCategoryColor(
                          spot.category
                        )}`}
                      >
                        {spot.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 text-xs text-white font-semibold flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>Brgy. {spot.barangay}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {spot.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1">
                  <div className="w-full py-2 px-3 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-800 group-hover:text-white font-bold text-xs transition-colors flex items-center justify-between">
                    <span>View Destination Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FULL-SCREEN PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors focus:outline-none"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav Arrow */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev - 1 + galleryList.length) % galleryList.length)}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors focus:outline-none"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev + 1) % galleryList.length)}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors focus:outline-none"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Modal Image */}
            <div className="max-w-5xl max-h-[85vh] relative flex flex-col items-center">
              <img
                src={galleryList[lightboxIndex]}
                alt={`Full Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="mt-4 text-center text-sm font-semibold text-white/90">
                Photo {lightboxIndex + 1} of {galleryList.length} • {destination.name}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
