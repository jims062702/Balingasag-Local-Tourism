import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Maximize2,
  MapPin,
  TrendingUp,
  Trees,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  X,
  Compass,
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { BALINGASAG_BARANGAYS, MunicipalProfile } from '../types';
import { INITIAL_MUNICIPAL_PROFILE } from '../data/initialData';

interface DemographicsSectionProps {
  profile?: MunicipalProfile;
  onSelectBarangay?: (brgy: string) => void;
  onNavigateToDestinations?: () => void;
}

const URBAN_BARANGAYS = [
  'Barangay 1 (Poblacion)',
  'Barangay 2 (Poblacion)',
  'Barangay 3 (Poblacion)',
  'Barangay 4 (Poblacion)',
  'Barangay 5 (Poblacion)',
  'Barangay 6 (Poblacion)',
];

const URBANIZING_BARANGAYS = [
  'Baliwagan',
  'Binitinan',
  'Blanco',
  'Calawag',
  'Cogon',
  'Dumarait',
  'Hermano',
  'Linggangao',
  'Mambayaan',
  'Mandangoa',
  'Napaliran',
];

const RURAL_BARANGAYS = [
  'Balagnan',
  'Camuayan',
  'Dansuli',
  'Kibanban',
  'Linabu',
  'Quezon',
  'Rosario',
  'Samay',
  'San Francisco',
  'San Isidro',
  'San Juan',
  'Talusan',
  'Waterfall',
];

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({
  profile,
  onSelectBarangay,
  onNavigateToDestinations,
}) => {
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'urban' | 'urbanizing' | 'rural'>('all');

  const p = profile || INITIAL_MUNICIPAL_PROFILE;

  const handleBarangayClick = (brgy: string) => {
    if (onSelectBarangay) {
      onSelectBarangay(brgy);
    }
    if (onNavigateToDestinations) {
      onNavigateToDestinations();
    } else {
      const el = document.getElementById('destinations');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setDirectoryOpen(false);
  };

  const getFilteredList = () => {
    switch (activeTab) {
      case 'urban':
        return URBAN_BARANGAYS;
      case 'urbanizing':
        return URBANIZING_BARANGAYS;
      case 'rural':
        return RURAL_BARANGAYS;
      default:
        return BALINGASAG_BARANGAYS;
    }
  };

  return (
    <section className="py-20 bg-[#FFFAF0] text-slate-900 border-t border-amber-900/10" id="demographics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official Municipal Profile</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {p.headlineTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {p.headlineSubtitle}
          </p>
        </motion.div>

        {/* 3 Core Demographic Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Barangays Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Political Subdivision
                </span>
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-6">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                  <AnimatedCounter value={p.barangaysCount} duration={1800} />
                  <span className="text-base font-bold text-emerald-700">Barangays</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-1">Official Municipal Subdivisions</h3>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">{p.urbanCount} Urban Barangays</strong> (Poblacion 1 through 6)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">{p.urbanizingCount} Urbanizing</strong> coastal and highway junctions
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">{p.ruralCount} Rural Barangays</strong> in upland eco-zones
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setDirectoryOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View All {p.barangaysCount} Barangays Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{p.spanishHeritageNote}</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Population */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  Demographics ({p.populationYear})
                </span>
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-6">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                  <AnimatedCounter value={p.population} duration={2400} />
                  <span className="text-base font-bold text-teal-700">Residents</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-1">Official PSA Municipal Census</h3>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    Represents <strong className="text-slate-900">{p.populationProvinceShare}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    Represents <strong className="text-slate-900">{p.populationRegionShare}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Vibrant culture of fisherfolk, cacao growers, and heritage artisans
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{p.psaCertifiedNote}</span>
            </div>
          </motion.div>

          {/* Card 3: Land Area */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                  Geographical Scope
                </span>
                <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-6">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                  <AnimatedCounter value={p.landAreaHectares} decimals={2} duration={2200} />
                  <span className="text-base font-bold text-sky-700">Hectares</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-1">Total Land & Marine Area</h3>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Coastal Marine Belt:</strong> Extensive Macajalar Bay frontage
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Upland Watershed:</strong> Camuayan cold springs & falls
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Agro-Ecology:</strong> Rich volcanic soil for native cacao & crops
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <Trees className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{p.landAreaDescription}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ALL 30 BARANGAYS DIRECTORY MODAL */}
      <AnimatePresence>
        {directoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setDirectoryOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Official 30 Barangays Directory</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Municipality of Balingasag, Misamis Oriental (ZIP 9005)
                  </p>
                </div>
                <button
                  onClick={() => setDirectoryOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Classification Filter Tabs */}
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-2">Filter Category:</span>
                {(
                  [
                    { id: 'all', label: 'All 30 Barangays' },
                    { id: 'urban', label: '6 Urban (Poblacion)' },
                    { id: 'urbanizing', label: '11 Urbanizing' },
                    { id: 'rural', label: '13 Rural Upland' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Barangays Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {getFilteredList().map((brgy) => {
                    const isUrban = URBAN_BARANGAYS.includes(brgy);
                    const isUrbanizing = URBANIZING_BARANGAYS.includes(brgy);
                    const isRural = RURAL_BARANGAYS.includes(brgy);

                    return (
                      <div
                        key={brgy}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white flex flex-col justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                isUrban
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isUrbanizing
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {isUrban ? 'Urban Poblacion' : isUrbanizing ? 'Urbanizing' : 'Rural Eco'}
                            </span>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors">
                            Brgy. {brgy}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Balingasag, Misamis Oriental
                          </p>
                        </div>

                        <button
                          onClick={() => handleBarangayClick(brgy)}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-50 group-hover:bg-emerald-600 text-slate-700 group-hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Explore Spots Here</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
                <span>Total Registered: 30 Official Barangays</span>
                <button
                  onClick={() => setDirectoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  Close Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

