import React from 'react';
import {
  Phone,
  Radio,
  MapPin,
  Shield,
  Flame,
  HeartPulse,
  Droplets,
  Zap,
  Clock,
  Compass,
  ExternalLink,
} from 'lucide-react';

interface EmergencyContact {
  agency: string;
  category: string;
  number: string;
  frequency: string | null;
  icon: React.ReactNode;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    agency: 'MDRRM 24/7 Operations Center',
    category: 'Disaster & Rescue',
    number: '0975-691-0090 (TM)',
    frequency: '137.470 MHz',
    icon: <Radio className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'MDRRM Office Administration',
    category: 'Disaster Risk Office',
    number: '0968-261-0486 (SMART)',
    frequency: null,
    icon: <Shield className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'Philippine National Police (PNP)',
    category: 'Law Enforcement',
    number: '0998-598-6948 / 0927-512-1838',
    frequency: '137.470 MHz',
    icon: <Shield className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'Bureau of Fire Protection (BFP)',
    category: 'Fire & Rescue',
    number: '0997-568-8288 (TM)',
    frequency: '153.450 MHz',
    icon: <Flame className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'Philippine Coast Guard Sub-Station',
    category: 'Maritime Safety',
    number: '0966-947-7077 (TM)',
    frequency: '137.470 MHz',
    icon: <Compass className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'Municipal Health Office (MHO)',
    category: 'Medical & Clinic',
    number: '0963-065-1678 (TNT)',
    frequency: '197.470 MHz',
    icon: <HeartPulse className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'BTMA Traffic Management',
    category: 'Traffic & Road Order',
    number: '0967-911-6308 (TM)',
    frequency: '137.470 MHz',
    icon: <Shield className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'Balingasag Water District',
    category: 'Water Utility',
    number: '0906-184-5059 (TM)',
    frequency: '137.470 MHz',
    icon: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    agency: 'MORESCO II Electric Coop',
    category: 'Power & Grid',
    number: '0994-437-5640 (SMART)',
    frequency: '137.470 MHz',
    icon: <Zap className="w-3.5 h-3.5 text-blue-400" />,
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Top Header: Brand Seal + 24/7 Operations Badge */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <img
                src="/balingasag-seal.png"
                alt="Official Seal of Balingasag"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Discover Balingasag
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30 font-semibold">
                    ZIP 9005
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Official Tourism &amp; Heritage Discovery Portal • Misamis Oriental, Philippines
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold bg-blue-950/50 px-4 py-2 rounded-full border border-blue-500/30 shrink-0">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>24/7 Official Emergency &amp; Radio Directory</span>
            </div>
          </div>

          {/* Emergency Hotlines Grid (Clean Categorized Cards with Direct Call Links) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Emergency Response Hotlines &amp; Two-Way Radio Channels
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Tap number to call directly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {EMERGENCY_CONTACTS.map((item, idx) => {
                const primaryNumber = item.number.split(' ')[0];
                return (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-2 hover:border-blue-500/40 hover:bg-slate-900 transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {item.icon}
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 truncate">
                          {item.agency}
                        </span>
                      </div>

                      {item.frequency && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/20 shrink-0">
                          {item.frequency}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.category}
                      </span>

                      <a
                        href={`tel:${primaryNumber.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold group-hover:underline"
                        title={`Call ${item.agency}`}
                      >
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>{item.number}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Section: Heritage Summary, Navigation, & Municipal Hall Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-800/80">
          {/* Col 1: Heritage & Ecotourism */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Balingasag Heritage &amp; Ecotourism
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Home of the 200-year-old Vega Ancestral House, the 1892 Jesuit brick sanctuary,
              refreshing Camuayan Natural Cold Springs, and the scenic Macajalar Baywalk facing Camiguin Island.
            </p>
            <div className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>30 Official Barangays • 1st Class Coastal Municipality</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <li>
                <a href="#hero" className="hover:text-blue-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-blue-400 transition-colors">
                  Tourism Spots
                </a>
              </li>
              <li>
                <a href="#weather-advisories" className="hover:text-blue-400 transition-colors">
                  Weather &amp; Advisories
                </a>
              </li>
              <li>
                <a href="#events-calendar" className="hover:text-blue-400 transition-colors">
                  Festivals &amp; Events
                </a>
              </li>
              <li>
                <a href="#demographics" className="hover:text-blue-400 transition-colors">
                  Municipal Profile
                </a>
              </li>
              <li>
                <a href="#lgu-officials" className="hover:text-blue-400 transition-colors">
                  LGU Officials
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Municipal Office Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Municipal Tourism Office
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Office of the Municipal Mayor &amp; Tourism Unit
              <br />
              Municipal Hall, Poblacion, Balingasag, Misamis Oriental, 9005
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Municipality of Balingasag, Misamis Oriental. Free-tier informational portal.
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Designed &amp; Engineered by</span>
            <a
              href="https://jamesgdev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-400 hover:text-blue-300 underline transition-colors inline-flex items-center gap-1"
            >
              <span>James Gasang</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href="https://jamesgdev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              jamesgdev.vercel.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
