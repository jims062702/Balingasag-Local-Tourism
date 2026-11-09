import React from 'react';
import { Landmark, Phone, Radio, Shield, MapPin, Zap, Droplets, HeartPulse } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  {
    agency: 'MDRRM OFFICE NO.',
    number: '0968-261-0486 (SMART)',
    frequency: null,
  },
  {
    agency: 'MDRRM 24/7 OPCEN',
    number: '0975-691-0090 (TM)',
    frequency: '137.470 MHz',
  },
  {
    agency: 'PNP BALINGASAG',
    number: '0998-598-6948 (SMART) / 0927-512-1838 (TM)',
    frequency: '137.470 MHz',
  },
  {
    agency: 'BFP BALINGASAG (FIRE)',
    number: '0997-568-8288 (TM)',
    frequency: '153.450 MHz',
  },
  {
    agency: 'BTMA BALINGASAG (TRAFFIC)',
    number: '0967-911-6308 (TM)',
    frequency: '137.470 MHz',
  },
  {
    agency: 'MHO BALINGASAG (HEALTH)',
    number: '0963-065-1678 (TNT)',
    frequency: '197.470 MHz',
  },
  {
    agency: 'COAST GUARD SUB STATION BALINGASAG',
    number: '0966-947-7077 (TM)',
    frequency: '137.470 MHz',
  },
  {
    agency: 'BALINGASAG WATER DISTRICT',
    number: '0906-184-5059 (TM)',
    frequency: '137.470 MHz',
  },
  {
    agency: 'MORESCO II (ELECTRIC)',
    number: '0994-437-5640 (SMART)',
    frequency: '137.470 MHz',
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Top Section: Municipal Seal & Official Emergency Hotlines Directory */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">

            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-4 py-2 rounded-2xl border border-emerald-500/20">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>24/7 Official Emergency &amp; Radio Frequencies Directory</span>
            </div>
          </div>

          {/* Emergency Numbers Grid (Exact numbers provided by user) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EMERGENCY_CONTACTS.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    {item.agency}
                  </span>
                  {item.frequency && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5" />
                      {item.frequency}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-white font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${item.number.split(' ')[0]}`}
                    className="hover:text-emerald-300 hover:underline transition-colors"
                  >
                    {item.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section: Quick Nav & Policy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-900">
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Municipal Heritage
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Home of the Spanish-era Vega Ancestral House, the 1892 Jesuit brick sanctuary,
              Camuayan natural cold springs, and the scenic Macajalar Baywalk facing Camiguin Island.
            </p>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>30 Official Barangays • 9005</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Navigation Links
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="#hero" className="hover:text-emerald-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-emerald-400 transition-colors">
                  Tourism Spots
                </a>
              </li>
              <li>
                <a href="#weather-advisories" className="hover:text-emerald-400 transition-colors">
                  Weather &amp; Advisories
                </a>
              </li>
              <li>
                <a href="#events-calendar" className="hover:text-emerald-400 transition-colors">
                  Festivals &amp; Events
                </a>
              </li>
              <li>
                <a href="#demographics" className="hover:text-emerald-400 transition-colors">
                  Municipal Profile
                </a>
              </li>
              <li>
                <a href="#lgu-officials" className="hover:text-emerald-400 transition-colors">
                  LGU Officials
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Municipality of Balingasag, Misamis Oriental 9005. All
            rights reserved.
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Designed &amp; Engineered by</span>
            <a
              href="https://jamesgdev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:text-emerald-300 underline transition-colors"
            >
              James Gasang
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://jamesgdev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              jamesgdev.vercel.app ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
