import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Building,
  RefreshCw,
  Search,
  CalendarPlus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { LocalEvent } from '../types';
import { getEvents } from '../services/firestoreService';
import { getOptimizedMediaUrl } from '../services/cloudinary';

export const EventsCalendar: React.FC = () => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEventsData = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, []);

  const generateGoogleCalendarUrl = (event: LocalEvent) => {
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `${event.description}\n\nOrganizer: ${event.organizer}\nDiscover Balingasag Local Tourism (ZIP 9005)`
    );
    const location = encodeURIComponent(
      `${event.location}, Brgy. ${event.barangay}, Balingasag, Misamis Oriental`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  const categories = ['All', 'Festival', 'Cultural', 'Civic', 'Eco-Tourism'] as const;

  const filteredEvents = events.filter((evt) => {
    if (filterCategory !== 'All' && evt.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = evt.title.toLowerCase().includes(q);
      const inDesc = evt.description.toLowerCase().includes(q);
      const inBrgy = evt.barangay.toLowerCase().includes(q);
      const inLoc = evt.location.toLowerCase().includes(q);
      return inTitle || inDesc || inBrgy || inLoc;
    }
    return true;
  });

  return (
    <section className="py-16 bg-[#FFFAF0] text-slate-900 border-t border-amber-900/10" id="events-calendar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-amber-900/10"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-teal-700" />
              <span>Municipal Calendar</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Festivals &amp; Events
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Experience the vibrant traditions of Balingasag — from the Lambangus street dances to
              the coastal Sakay-Sakay fluvial parade.
            </p>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search festival..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:border-teal-600 shadow-xs"
              />
            </div>

            <button
              onClick={loadEventsData}
              title="Reload events from Firestore"
              className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-2">
            {filteredEvents.length} scheduled
          </span>
        </div>

        {/* Events Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4 shadow-sm"
                >
                  <div className="h-48 bg-slate-200 rounded-2xl" />
                  <div className="h-6 bg-slate-200 rounded w-2/3" />
                  <div className="h-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-slate-800">No Events Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No municipal events matching your search were found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: (idx % 2) * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Event Image Banner */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getOptimizedMediaUrl(event.imageUrl, { width: 800, height: 450 })}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                      {/* Date Pill Top Right */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-white/20 text-slate-900 text-center">
                        <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                          Date
                        </div>
                        <div className="text-xs font-black">{event.date}</div>
                      </div>

                      {/* Category Pill Top Left */}
                      <div className="absolute top-4 left-4">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-xs">
                          {event.category}
                        </span>
                      </div>

                      {/* Bottom Location */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-1.5 font-semibold bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                          <MapPin className="w-3.5 h-3.5 text-teal-400" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                        {event.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          Brgy. {event.barangay}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            {event.time}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Organizer Info & Add to Calendar */}
                  <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.organizer}</span>
                    </div>

                    <a
                      href={generateGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white font-bold text-[11px] transition-colors"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Add to Calendar</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
