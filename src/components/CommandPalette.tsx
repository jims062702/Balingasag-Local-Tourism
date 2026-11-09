import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Phone,
  Compass,
  X,
  ExternalLink,
  Building,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Destination, Barangay, BALINGASAG_BARANGAYS } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  onSelectDestination: (destId: string) => void;
  onSelectBarangay: (barangay: string) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

const EMERGENCY_ITEMS = [
  { name: 'MDRRM 24/7 OPCEN (Disaster)', phone: '0975-691-0090' },
  { name: 'PNP Balingasag (Police)', phone: '0998-598-6948' },
  { name: 'BFP Balingasag (Fire)', phone: '0997-568-8288' },
  { name: 'Coast Guard Sub-Station', phone: '0966-947-7077' },
  { name: 'MHO Balingasag (Health)', phone: '0963-065-1678' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  destinations,
  onSelectDestination,
  onSelectBarangay,
  onNavigateSection,
  onOpenAdmin,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape, toggle on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter items based on query
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        destinations: destinations.slice(0, 4),
        barangays: BALINGASAG_BARANGAYS.slice(0, 4),
        hotlines: EMERGENCY_ITEMS.slice(0, 3),
        sections: [
          { id: 'destinations', label: 'Browse Tourism Spots' },
          { id: 'weather-advisories', label: 'Live Weather & Travel Advisories' },
          { id: 'events-calendar', label: 'Festivals & Town Events' },
          { id: 'demographics', label: 'Municipal Demographics' },
          { id: 'lgu-officials', label: 'LGU Officials' },
        ],
      };
    }

    return {
      destinations: destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.barangay.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      ),
      barangays: BALINGASAG_BARANGAYS.filter((b) => b.toLowerCase().includes(q)),
      hotlines: EMERGENCY_ITEMS.filter((h) => h.name.toLowerCase().includes(q) || h.phone.includes(q)),
      sections: [
        { id: 'destinations', label: 'Browse Tourism Spots' },
        { id: 'weather-advisories', label: 'Live Weather & Travel Advisories' },
        { id: 'events-calendar', label: 'Festivals & Town Events' },
        { id: 'demographics', label: 'Municipal Demographics' },
        { id: 'lgu-officials', label: 'LGU Officials' },
      ].filter((s) => s.label.toLowerCase().includes(q)),
    };
  }, [query, destinations]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Click outside to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <Search className="w-5 h-5 text-blue-600 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spots, barangays, emergency hotlines, or sections..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Tourism Spots */}
            {results.destinations.length > 0 && (
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tourism Spots ({results.destinations.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {results.destinations.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => {
                        onSelectDestination(dest.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={dest.heroImage}
                          alt={dest.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700">
                            {dest.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Brgy. {dest.barangay} • {dest.category}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Barangays */}
            {results.barangays.length > 0 && (
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Barangays ({results.barangays.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
                  {results.barangays.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        onSelectBarangay(b);
                        onNavigateSection('destinations');
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-semibold text-left transition-colors truncate border border-slate-100"
                    >
                      Brgy. {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Hotlines */}
            {results.hotlines.length > 0 && (
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Emergency Dispatch &amp; Hotlines</span>
                </div>
                <div className="space-y-1 mt-1">
                  {results.hotlines.map((h, i) => (
                    <a
                      key={i}
                      href={`tel:${h.phone.replace(/[^0-9]/g, '')}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 hover:bg-red-100 text-red-900 text-xs font-semibold transition-colors border border-red-100"
                    >
                      <span>{h.name}</span>
                      <span className="font-mono font-bold text-red-700">{h.phone}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Shortcuts */}
            {results.sections.length > 0 && (
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                  Sections &amp; Portal Links
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                  {results.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        onNavigateSection(sec.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-medium text-left transition-colors"
                    >
                      → {sec.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Help */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-600">Esc</kbd> to exit</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-600">Ctrl+K</kbd> to toggle</span>
            </div>
            <button
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              className="text-blue-700 font-bold hover:underline"
            >
              Open LGU Admin Portal
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
