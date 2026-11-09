import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Compass,
  ArrowRight,
  Search,
  CheckCircle2,
  ChevronDown,
  Check,
  BookmarkCheck,
  Star,
  Layers,
} from 'lucide-react';
import {
  Destination,
  DestinationCategory,
  CATEGORIES,
  BALINGASAG_BARANGAYS,
} from '../types';
import { getOptimizedMediaUrl } from '../services/cloudinary';

interface DestinationExplorerProps {
  destinations: Destination[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: DestinationCategory;
  setSelectedCategory: (cat: DestinationCategory) => void;
  selectedBarangay: string;
  setSelectedBarangay: (brgy: string) => void;
  onSelectDestination: (destId: string) => void;
  loading: boolean;
}

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  destinations,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedBarangay,
  setSelectedBarangay,
  onSelectDestination,
  loading,
}) => {
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

  // Custom Animated Barangay Dropdown State
  const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState('');
  const barangayDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close custom barangay dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        barangayDropdownRef.current &&
        !barangayDropdownRef.current.contains(event.target as Node)
      ) {
        setBarangayDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pagination state: strictly 6 spots initially, +6 when clicking 'Show More'
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Filter logic
  const filtered = destinations.filter((dest) => {
    if (selectedCategory !== 'All' && dest.category !== selectedCategory) {
      return false;
    }
    if (selectedBarangay && dest.barangay !== selectedBarangay) {
      return false;
    }
    if (showOnlyFeatured && !dest.featured) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = dest.name.toLowerCase().includes(q);
      const inBrgy = dest.barangay.toLowerCase().includes(q);
      const inDesc = dest.description.toLowerCase().includes(q);
      const inShort = dest.shortDescription.toLowerCase().includes(q);
      const inCat = dest.category.toLowerCase().includes(q);
      return inName || inBrgy || inDesc || inShort || inCat;
    }
    return true;
  });

  // Reset visibleCount back to 6 whenever filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCategory, selectedBarangay, showOnlyFeatured]);

  const displayedDestinations = filtered.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const getCategoryColor = (_cat: string) => {
    return 'bg-stone-100 text-stone-800 border-stone-200/90';
  };

  return (
    <section className="py-20 bg-[#FAF7F2] text-stone-900" id="destinations">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Title & Section Introduction matching zalio.ai editorial headers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Balingasag Tourism Spots
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-xl">
              Browse authentic heritage sanctuaries, mountain cold springs, and coastal reserves across all 30 barangays.
            </p>
          </div>

          {/* Barangay & Featured Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Custom Animated Barangay Filter Dropdown */}
            <div className="relative min-w-[210px]" ref={barangayDropdownRef}>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Filter by Barangay
              </label>

              {/* Trigger Button with Animated Rotating Chevron */}
              <button
                type="button"
                onClick={() => setBarangayDropdownOpen(!barangayDropdownOpen)}
                className={`w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 bg-white rounded-full text-xs sm:text-sm font-semibold text-stone-800 border transition-all shadow-xs focus:outline-none ${
                  barangayDropdownOpen
                    ? 'border-stone-900 ring-2 ring-stone-900/10'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="truncate">
                  {selectedBarangay ? `Brgy. ${selectedBarangay}` : 'All 30 Barangays'}
                </span>
                {/* Animated Rotating Arrow */}
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform duration-300 shrink-0 ml-2 ${
                    barangayDropdownOpen ? 'rotate-180 text-stone-900' : 'rotate-0'
                  }`}
                />
              </button>

              {/* Custom Animated Dropdown Menu Panel */}
              <AnimatePresence>
                {barangayDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 z-50 overflow-hidden flex flex-col"
                  >
                    {/* Quick Search Header inside Dropdown */}
                    <div className="p-2.5 border-b border-stone-100 bg-stone-50/70">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search barangay..."
                          value={barangaySearch}
                          onChange={(e) => setBarangaySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 text-stone-800 placeholder-stone-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Scrollable Barangays List */}
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-stone-100">
                      {/* All Barangays Option */}
                      {!barangaySearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBarangay('');
                            setBarangayDropdownOpen(false);
                            setBarangaySearch('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                            !selectedBarangay
                              ? 'bg-stone-100 text-stone-950 font-extrabold'
                              : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                        >
                          <span>All 30 Barangays</span>
                          {!selectedBarangay && (
                            <Check className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      )}

                      {/* Filtered Barangays */}
                      {BALINGASAG_BARANGAYS.filter((b) =>
                        b.toLowerCase().includes(barangaySearch.toLowerCase())
                      ).map((b) => {
                        const isSelected = selectedBarangay === b;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setSelectedBarangay(b);
                              setBarangayDropdownOpen(false);
                              setBarangaySearch('');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                              isSelected
                                ? 'bg-blue-50 text-blue-950 font-bold'
                                : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                            }`}
                          >
                            <span className="truncate">Brgy. {b}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}

                      {BALINGASAG_BARANGAYS.filter((b) =>
                        b.toLowerCase().includes(barangaySearch.toLowerCase())
                      ).length === 0 && (
                        <div className="p-3 text-center text-xs text-stone-400">
                          No matching barangay found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Must-Visit Spots Toggle */}
            <div className="pt-4 sm:pt-5">
              <button
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2 ${
                  showOnlyFeatured
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <BookmarkCheck className={`w-4 h-4 ${showOnlyFeatured ? 'text-blue-400' : 'text-blue-600'}`} />
                <span>Must Visit Spots</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* SEARCH BAR (Zalio Capsule Style) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative flex items-center shadow-xs rounded-full bg-white border border-stone-200/90 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/10 transition-all p-1">
            <Search className="w-5 h-5 text-stone-400 ml-3.5 shrink-0" />
            <input
              type="text"
              placeholder="Search spots, barangays (e.g. Natumolan, Cogon, Baliwagan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-2 px-2 py-1 text-xs text-stone-400 hover:text-stone-700 font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {}}
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* SPOT CATEGORIES PILLS (Zalio Capsule Pills) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 flex-wrap pt-1"
        >
          <span className="text-xs text-stone-500 font-bold mr-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs scale-105'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* Active Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-stone-900">{displayedDestinations.length}</strong> of{' '}
              <strong className="text-stone-900">{filtered.length}</strong> spots
            </span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-200/80 text-stone-900 font-medium">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="ml-1 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {selectedBarangay && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-950 font-medium border border-blue-200">
                Barangay: {selectedBarangay}
                <button
                  onClick={() => setSelectedBarangay('')}
                  className="ml-1 hover:text-stone-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-950 font-medium border border-blue-200">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-stone-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {(selectedCategory !== 'All' || selectedBarangay || searchQuery || showOnlyFeatured) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBarangay('');
                setSearchQuery('');
                setShowOnlyFeatured(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Destinations Grid */}
        <div className="pt-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs animate-pulse"
                >
                  <div className="h-60 bg-stone-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                    <div className="h-6 bg-stone-200 rounded w-3/4" />
                    <div className="h-12 bg-stone-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8 shadow-xs">
              <Compass className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-800">No Destinations Found</h3>
              <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
                No tourism destinations matched your current filters. Try selecting "All 30 Barangays"
                or broadening your search keyword.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBarangay('');
                  setSearchQuery('');
                  setShowOnlyFeatured(false);
                }}
                className="mt-4 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
              >
                Show All Balingasag Attractions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedDestinations.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 hover:border-stone-400 hover:shadow-[0_20px_50px_rgba(24,24,27,0.08)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image with Badges */}
                    <div className="relative h-60 w-full overflow-hidden bg-stone-900">
                      <img
                        src={getOptimizedMediaUrl(dest.heroImage, { width: 700, height: 480 })}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md shadow-xs ${getCategoryColor(
                            dest.category
                          )}`}
                        >
                          {dest.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {dest.featured && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                              <Star className="w-3 h-3 fill-white text-white" />
                              <span>Must-Visit Spot</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Barangay Pill */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-stone-950/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Brgy. {dest.barangay}</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {dest.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                        {dest.shortDescription}
                      </p>

                      {/* Visitor Guidelines Highlights */}
                      {dest.inclusions && dest.inclusions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5">
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Visitor Guide Highlights:
                          </div>
                          {dest.inclusions.slice(0, 2).map((inc, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-stone-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{inc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Button (Redirects to Dedicated Page - NO MODAL) */}
                  <div className="px-6 pb-6 pt-1">
                    <button
                      onClick={() => onSelectDestination(dest.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-stone-900 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow group/btn"
                    >
                      <span>View Spot Details</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Show More Button (Loads 6 more spots per click) */}
          {visibleCount < filtered.length && (
            <div className="pt-10 text-center">
              <button
                onClick={handleShowMore}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-200"
              >
                <span>Show More Tourism Spots</span>
                <ChevronDown className="w-4 h-4" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 ml-1">
                  +{Math.min(6, filtered.length - visibleCount)} more
                </span>
              </button>
              <p className="text-xs text-stone-500 mt-2.5">
                Displaying {displayedDestinations.length} of {filtered.length} attractions in Balingasag
              </p>
            </div>
          )}

          {visibleCount >= filtered.length && filtered.length > 6 && (
            <div className="pt-8 text-center text-xs text-stone-400 font-medium">
              You have explored all {filtered.length} spots in this selection.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
