import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Trash2,
  Printer,
  Compass,
  ArrowRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Destination } from '../types';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedSpots: Destination[];
  onRemoveSpot: (destId: string) => void;
  onClearAll: () => void;
  onSelectDestination: (destId: string) => void;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  savedSpots,
  onRemoveSpot,
  onClearAll,
  onSelectDestination,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">My Balingasag Itinerary</h3>
                  <p className="text-xs text-slate-400">
                    {savedSpots.length} saved {savedSpots.length === 1 ? 'spot' : 'spots'} for your visit
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {savedSpots.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto border border-rose-100">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Click the bookmark or heart icon on any attraction while browsing to build your personalized Balingasag trip plan.
                  </p>
                </div>
              ) : (
                savedSpots.map((spot, index) => (
                  <div
                    key={spot.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex items-start justify-between gap-3 shadow-xs group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-emerald-200">
                        {index + 1}
                      </span>
                      <img
                        src={spot.heroImage}
                        alt={spot.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 cursor-pointer"
                        onClick={() => {
                          onSelectDestination(spot.id);
                          onClose();
                        }}
                      />
                      <div className="min-w-0">
                        <h4
                          onClick={() => {
                            onSelectDestination(spot.id);
                            onClose();
                          }}
                          className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                        >
                          {spot.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">Brgy. {spot.barangay}</span>
                        </div>
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                          {spot.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveSpot(spot.id)}
                      title="Remove from saved list"
                      className="text-slate-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary Actions */}
            {savedSpots.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Day-Tour Checklist</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">Offline Travel Ready</span>
                  <button
                    onClick={onClearAll}
                    className="text-red-600 hover:text-red-700 font-bold hover:underline"
                  >
                    Clear All Spots
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
