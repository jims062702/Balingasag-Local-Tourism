import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  Info,
  RefreshCw,
  Clock,
  Compass,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { TravelAdvisory, WeatherData } from '../types';
import { getAdvisories } from '../services/firestoreService';
import { DroppingWaterAnimation, BlowingWindAnimation } from './WeatherAnimations';

export const WeatherAdvisoryWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advisories, setAdvisories] = useState<TravelAdvisory[]>([]);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  const [loadingAdvisories, setLoadingAdvisories] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'warning' | 'advisory' | 'info'>('all');

  const fetchBalingasagWeather = async () => {
    setLoadingWeather(true);
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=8.7441&longitude=124.7765&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FManila'
      );
      if (response.ok) {
        const data = await response.json();
        const current = data.current;

        const code = current.weather_code || 0;
        let desc = 'Clear Skies';
        if (code === 1 || code === 2) desc = 'Mainly Clear / Partly Sunny';
        else if (code === 3) desc = 'Overcast';
        else if (code >= 51 && code <= 67) desc = 'Passing Rain Showers';
        else if (code >= 80 && code <= 82) desc = 'Localized Tropical Downpours';
        else if (code >= 95) desc = 'Thunderstorm in Vicinity';

        setWeather({
          temperature: Math.round(current.temperature_2m),
          apparentTemperature: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          weatherCode: code,
          weatherDescription: desc,
          isDay: current.is_day === 1,
          lastUpdated: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
      setWeather({
        temperature: 29,
        apparentTemperature: 32,
        humidity: 78,
        windSpeed: 14,
        weatherCode: 2,
        weatherDescription: 'Partly Sunny • Coastal Sea Breeze',
        isDay: true,
        lastUpdated: 'Just now',
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadAdvisories = async () => {
    setLoadingAdvisories(true);
    try {
      const list = await getAdvisories();
      setAdvisories(list.filter((a) => a.isActive));
    } catch (err) {
      console.error('Failed to load advisories:', err);
    } finally {
      setLoadingAdvisories(false);
    }
  };

  useEffect(() => {
    fetchBalingasagWeather();
    loadAdvisories();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code >= 95) return <CloudLightning className="w-10 h-10 text-amber-500 animate-pulse" />;
    if (code >= 50) return <CloudRain className="w-10 h-10 text-cyan-500" />;
    if (code === 1 || code === 2 || code === 3)
      return <CloudSun className="w-10 h-10 text-amber-400" />;
    return <Sun className="w-10 h-10 text-yellow-500 animate-spin-slow" />;
  };

  const filteredAdvisories = advisories.filter((adv) => {
    if (activeFilter === 'all') return true;
    return adv.severity === activeFilter;
  });

  return (
    <section className="py-16 bg-[#FFFAF0] text-slate-900 border-t border-amber-900/10" id="weather-advisories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="pb-4 border-b border-amber-900/10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Traveler Safety &amp; Climate</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Weather &amp; Travel Advisories
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real-time coastal micro-climate and official municipal advisories for all Balingasag visitors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Live Weather Card for Balingasag */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Live Micro-Climate
                    </span>
                  </div>
                  <button
                    onClick={fetchBalingasagWeather}
                    title="Refresh weather data"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-slate-300 hover:text-white"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="mt-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">Balingasag Coast</h3>
                    <p className="text-xs text-slate-400">Lat 8.74° N, Long 124.77° E</p>
                    <p className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-white">
                      {weather ? `${weather.temperature}°C` : '--'}
                    </p>
                    <p className="text-xs font-semibold text-emerald-300 mt-1">
                      Feels like {weather?.apparentTemperature || '--'}°C
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                    {weather ? (
                      getWeatherIcon(weather.weatherCode)
                    ) : (
                      <Sun className="w-10 h-10 text-yellow-400" />
                    )}
                  </div>
                </div>

                <div className="mt-4 px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-emerald-100 flex items-center justify-between">
                  <span>{weather?.weatherDescription || 'Loading weather report...'}</span>
                  <span className="text-[10px] text-slate-400">Updated {weather?.lastUpdated}</span>
                </div>

                {/* Humidity (Dropping Water) & Coastal Wind (Blowing Wind) */}
                <div className="mt-6 grid grid-cols-2 gap-3.5">
                  {/* Humidity Card with Dropping Water Animation */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 flex items-center gap-3">
                    <DroppingWaterAnimation className="w-11 h-11 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-emerald-200 font-semibold tracking-wide">Humidity</div>
                      <div className="text-base font-extrabold text-white">
                        {weather ? `${weather.humidity}%` : '--'}
                      </div>
                      <div className="text-[10px] text-emerald-300/80 leading-none mt-0.5 truncate">
                        Moisture Drop
                      </div>
                    </div>
                  </div>

                  {/* Coastal Wind Card with Blowing Wind Animation */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 flex items-center gap-3">
                    <BlowingWindAnimation className="w-11 h-11 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-teal-200 font-semibold tracking-wide">Coastal Wind</div>
                      <div className="text-base font-extrabold text-white">
                        {weather ? `${weather.windSpeed} km/h` : '--'}
                      </div>
                      <div className="text-[10px] text-teal-300/80 leading-none mt-0.5 truncate">
                        Bay Breeze
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Tropical maritime climate along Macajalar Bay. Mornings are typically best for hiking.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Travel Advisory Notice Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Travel Advisory Notice Board
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official tourist advisories synced with Balingasag MDRRMO &amp; LGU Firestore
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['all', 'warning', 'advisory', 'info'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                          activeFilter === filter
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                    <button
                      onClick={loadAdvisories}
                      title="Reload Firestore advisories"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingAdvisories ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  {loadingAdvisories ? (
                    <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
                      Retrieving active advisories from Firestore database...
                    </div>
                  ) : filteredAdvisories.length === 0 ? (
                    <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                      <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No Active Advisories</p>
                      <p className="text-xs text-slate-500 mt-1">
                        All travel routes and ecotourism trails in Balingasag are reported normal and clear.
                      </p>
                    </div>
                  ) : (
                    filteredAdvisories.map((advisory) => {
                      const isWarning = advisory.severity === 'warning';
                      const isAdvisory = advisory.severity === 'advisory';

                      return (
                        <div
                          key={advisory.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isWarning
                              ? 'bg-red-50/80 border-red-200'
                              : isAdvisory
                              ? 'bg-amber-50/80 border-amber-200'
                              : 'bg-blue-50/80 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {isWarning ? (
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                              ) : isAdvisory ? (
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                              ) : (
                                <Info className="w-5 h-5 text-blue-600" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <h4
                                  className={`text-sm font-bold ${
                                    isWarning
                                      ? 'text-red-900'
                                      : isAdvisory
                                      ? 'text-amber-900'
                                      : 'text-blue-900'
                                  }`}
                                >
                                  {advisory.title}
                                </h4>
                                <span
                                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    isWarning
                                      ? 'bg-red-200 text-red-800'
                                      : isAdvisory
                                      ? 'bg-amber-200 text-amber-800'
                                      : 'bg-blue-200 text-blue-800'
                                  }`}
                                >
                                  {advisory.severity}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed">
                                {advisory.message}
                              </p>

                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                                <span className="font-medium text-slate-600">{advisory.issuedBy}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {advisory.date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Emergency MDRRMO Hotline: 0968-261-0486</span>
                <span>LGU Tourism Information Center</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
