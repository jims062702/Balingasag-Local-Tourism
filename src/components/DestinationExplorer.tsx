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
  Heart,
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
  savedSpotIds?: string[];
  onToggleSave?: (destId: string) => void;
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
  savedSpotIds = [],
  onToggleSave,
}) => {
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [showOnlySaved, setShowOnlySaved] = useState(false);

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
    if (showOnlySaved && !savedSpotIds.includes(dest.id)) {
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
  }, [searchQuery, selectedCategory, selectedBarangay, showOnlyFeatured, showOnlySaved]);

  const displayedDestinations = filtered.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Heritage & Culture':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Nature & Waterfalls':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Coastal & Marine':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Eco Parks & Springs':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Agro-Tourism & Delicacies':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <section className="py-16 bg-[#FFFAF0] text-slate-900" id="destinations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title & Section Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-amber-900/10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Balingasag Tourism Spots
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Browse authentic heritage sites, mountain cold springs, and coastal reserves across all 30 barangays.
            </p>
          </div>

          {/* Barangay & Featured Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Animated Barangay Filter Dropdown */}
            <div className="relative min-w-[210px]" ref={barangayDropdownRef}>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Barangay
              </label>

              {/* Trigger Button with Animated Rotating Chevron */}
              <button
                type="button"
                onClick={() => setBarangayDropdownOpen(!barangayDropdownOpen)}
                className={`w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-800 border transition-all shadow-xs focus:outline-none ${
                  barangayDropdownOpen
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 hover:border-emerald-500'
                }`}
              >
                <span className="truncate">
                  {selectedBarangay ? `Brgy. ${selectedBarangay}` : 'All 30 Barangays'}
                </span>
                {/* Animated Rotating Arrow */}
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ml-2 ${
                    barangayDropdownOpen ? 'rotate-180 text-emerald-600' : 'rotate-0'
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
                    className="absolute top-full left-0 mt-1.5 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col"
                  >
                    {/* Quick Search Header inside Dropdown */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search barangay..."
                          value={barangaySearch}
                          onChange={(e) => setBarangaySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Scrollable Barangays List */}
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100/60">
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
                              ? 'bg-emerald-50 text-emerald-900 font-extrabold'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span>All 30 Barangays</span>
                          {!selectedBarangay && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
                                ? 'bg-emerald-50 text-emerald-900 font-bold'
                                : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                            }`}
                          >
                            <span className="truncate">Brgy. {b}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}

                      {BALINGASAG_BARANGAYS.filter((b) =>
                        b.toLowerCase().includes(barangaySearch.toLowerCase())
                      ).length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No matching barangay found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Must-Visit Spots Toggle */}
            <div className="pt-5">
              <button
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 ${
                  showOnlyFeatured
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <BookmarkCheck className={`w-4 h-4 ${showOnlyFeatured ? 'text-amber-300' : 'text-emerald-700'}`} />
                <span>Must Visit Spots</span>
              </button>
            </div>

            {/* Saved Wishlist Toggle */}
            {savedSpotIds.length > 0 && (
              <div className="pt-5">
                <button
                  onClick={() => setShowOnlySaved(!showOnlySaved)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 ${
                    showOnlySaved
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${showOnlySaved ? 'text-white fill-white' : 'text-rose-500'}`} />
                  <span>Saved Wishlist ({savedSpotIds.length})</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1">
            <Search className="w-5 h-5 text-emerald-600 ml-3.5 shrink-0" />
            <input
              type="text"
              placeholder="Search spots, barangays (e.g. Natumolan, Cogon, Baliwagan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-2 px-2 py-1 text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {}}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
            >
              Explore
            </button>
          </div>
        </motion.div>

        {/* SPOT CATEGORIES PILLS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 flex-wrap pt-2"
        >
          <span className="text-xs text-slate-500 font-bold mr-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            Spot Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* Active Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-slate-800">{displayedDestinations.length}</strong> of{' '}
              <strong className="text-slate-800">{filtered.length}</strong> spots
            </span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-800 font-medium">
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-medium">
                Barangay: {selectedBarangay}
                <button
                  onClick={() => setSelectedBarangay('')}
                  className="ml-1 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-medium">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-red-600 font-bold"
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
              className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Destinations Grid */}
        <div className="pt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm animate-pulse"
                >
                  <div className="h-60 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-12 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-xs">
              <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Destinations Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
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
                className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
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
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image with Badges */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                      <img
                        src={getOptimizedMediaUrl(dest.heroImage, { width: 700, height: 480 })}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

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
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                              <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                              <span>Must-Visit Spot</span>
                            </span>
                          )}

                          {onToggleSave && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSave(dest.id);
                              }}
                              className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                                savedSpotIds.includes(dest.id)
                                  ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                                  : 'bg-black/40 text-white hover:bg-black/60 border-white/20'
                              }`}
                              title={savedSpotIds.includes(dest.id) ? 'Remove from wishlist' : 'Save to my trip plan'}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  savedSpotIds.includes(dest.id) ? 'fill-white' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Barangay Pill */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Brgy. {dest.barangay}</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {dest.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {dest.shortDescription}
                      </p>

                      {/* Visitor Guidelines Highlights */}
                      {dest.inclusions && dest.inclusions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Visitor Guide Highlights:
                          </div>
                          {dest.inclusions.slice(0, 2).map((inc, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-slate-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{inc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Button (Redirects to Dedicated Page - NO MODAL) */}
                  <div className="px-6 pb-6 pt-2">
                    <button
                      onClick={() => onSelectDestination(dest.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs sm:text-sm transition-all duration-200 group-hover:bg-emerald-600 group-hover:text-white shadow-xs"
                    >
                      <span>View Destination Page</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Show More Button (Loads 6 more spots per click, no auto-infinite scroll) */}
          {visibleCount < filtered.length && (
            <div className="pt-10 text-center">
              <button
                onClick={handleShowMore}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>Show More Tourism Spots</span>
                <ChevronDown className="w-4 h-4" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 ml-1">
                  +{Math.min(6, filtered.length - visibleCount)} more
                </span>
              </button>
              <p className="text-xs text-slate-500 mt-2.5">
                Displaying {displayedDestinations.length} of {filtered.length} attractions in Balingasag
              </p>
            </div>
          )}

          {visibleCount >= filtered.length && filtered.length > 6 && (
            <div className="pt-8 text-center text-xs text-slate-400 font-medium">
              You have explored all {filtered.length} spots in this selection.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
