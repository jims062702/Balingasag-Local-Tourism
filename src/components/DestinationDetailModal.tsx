import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Compass,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Phone,
  Sparkles,
  Calendar,
  Share2,
} from 'lucide-react';
import { Destination } from '../types';
import { getOptimizedMediaUrl } from '../services/cloudinary';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
}) => {
  if (!destination) return null;

  const [activeImage, setActiveImage] = useState<string>(destination.heroImage);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync active image when destination changes
  useEffect(() => {
    setActiveImage(destination.heroImage);
  }, [destination]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const galleryList = Array.from(
    new Set([destination.heroImage, ...(destination.gallery || [])].filter(Boolean))
  );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.coordinates.lat},${destination.coordinates.lng}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${destination.name} - Discover Balingasag`,
        text: destination.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-slate-200">
        {/* Sticky Header with Title and Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {destination.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Brgy. {destination.barangay}, Balingasag
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Share destination"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Gallery Display */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={getOptimizedMediaUrl(activeImage, { width: 1200, height: 800 })}
                alt={destination.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h1 className="text-2xl sm:text-3xl font-black">{destination.name}</h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Barangay {destination.barangay}, Balingasag, Misamis Oriental (ZIP 9005)
                  </span>
                </p>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {galleryList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === img
                        ? 'border-blue-500 scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getOptimizedMediaUrl(img, { width: 160, height: 120 })}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Historical & Cultural Profile</span>
            </h2>
            <div className="prose pblue-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {destination.description}
            </div>
          </div>

          {/* Recommended Itinerary Timeline */}
          {destination.itinerary && destination.itinerary.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Recommended Explorer Itinerary</span>
                </h2>
                <span className="text-xs text-slate-500">Day Tour Guide</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                {destination.itinerary.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-xs flex items-center justify-center text-[10px] text-white font-bold" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {step.time}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{step.activity}</h3>
                      </div>
                      {step.notes && (
                        <p className="text-xs text-slate-600 mt-1 pl-1">{step.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traveler Inclusions, Guidelines & Safety (STRICTLY NO PRICING / NO BOOKINGS) */}
          {destination.inclusions && destination.inclusions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Visitor Guidelines & Important Pointers</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.inclusions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logistics, Transit & Contact Information */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* How to get there */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>How to Get There</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {destination.howToGetThere}
              </p>
              <div className="pt-2 text-xs text-slate-500">
                <strong>Best time to visit:</strong> {destination.bestTimeToVisit}
              </div>
            </div>

            {/* Coordinates & LGU Contact */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Location Coordinates</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Lat: {destination.coordinates.lat.toFixed(4)}° N, Lng:{' '}
                  {destination.coordinates.lng.toFixed(4)}° E
                </p>
                <div className="mt-2 text-xs text-slate-700 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{destination.contactLGU}</span>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 hover:text-blue-700 hover:border-blue-500 text-xs font-bold transition-colors shadow-xs"
              >
                <span>View Coordinates on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Strictly informational tourism directory • Municipality of Balingasag LGU
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
