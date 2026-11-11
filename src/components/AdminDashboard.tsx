import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  Plus,
  Trash2,
  Edit,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Compass,
  Database,
  LogOut,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  LayoutDashboard,
  Eye,
  Building2,
  Users,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  Destination,
  TravelAdvisory,
  LocalEvent,
  BALINGASAG_BARANGAYS,
  CATEGORIES,
  Barangay,
  CarouselSlide,
  MunicipalProfile,
} from '../types';
import {
  addDestination,
  updateDestination,
  deleteDestination,
  addAdvisory,
  deleteAdvisory,
  toggleAdvisoryActive,
  addEvent,
  deleteEvent,
  addCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  toggleCarouselSlideActive,
  seedFirestoreDatabase,
  updateMunicipalProfile,
  getMediaLibrary,
  saveMediaLibraryUrl,
  INITIAL_USER_UPLOADED_IMAGES,
} from '../services/firestoreService';
import { INITIAL_MUNICIPAL_PROFILE } from '../data/initialData';
import { uploadToCloudinary, getCloudinaryConfig, PRESET_GALLERY_IMAGES, getHeroOptimizedUrl } from '../services/cloudinary';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  destinations: Destination[];
  advisories: TravelAdvisory[];
  events: LocalEvent[];
  carouselSlides?: CarouselSlide[];
  municipalProfile?: MunicipalProfile;
  onRefreshAllData: () => Promise<void>;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  adminEmail,
  setAdminEmail,
  destinations,
  advisories,
  events,
  carouselSlides = [],
  municipalProfile,
  onRefreshAllData,
  onExitAdmin,
}) => {
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Sidebar View
  const [activeView, setActiveView] = useState<'overview' | 'destinations' | 'advisories' | 'events' | 'carousel' | 'profile' | 'database'>('overview');

  // Real-Time Municipal Profile Form State
  const [profileForm, setProfileForm] = useState<MunicipalProfile>(
    municipalProfile || INITIAL_MUNICIPAL_PROFILE
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profileForm when municipalProfile changes from Firestore
  React.useEffect(() => {
    if (municipalProfile) {
      setProfileForm(municipalProfile);
    }
  }, [municipalProfile]);

  const handleSaveMunicipalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const toastId = toast.loading('Saving real-time municipal profile to Firestore...');
    try {
      await updateMunicipalProfile(profileForm);
      toast.success('Municipal profile successfully updated in real-time!', { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update municipal profile', { id: toastId });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Carousel Slide State & Modal
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState<Omit<CarouselSlide, 'id' | 'createdAt'>>({
    title: '',
    subtitle: '',
    imageUrl: PRESET_GALLERY_IMAGES[0],
    order: 1,
    isActive: true,
  });

  // Destination Form & Modal State
  const [destModalOpen, setDestModalOpen] = useState(false);
  const [editingDestId, setEditingDestId] = useState<string | null>(null);
  const [destForm, setDestForm] = useState<Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    category: 'Heritage & Culture',
    barangay: 'Barangay 1 (Poblacion)',
    shortDescription: '',
    description: '',
    heroImage: PRESET_GALLERY_IMAGES[0],
    gallery: [PRESET_GALLERY_IMAGES[0], PRESET_GALLERY_IMAGES[1]],
    itinerary: [
      { time: '08:30 AM', activity: 'Arrival & Welcome Briefing', notes: 'Coordinate with local community caretakers' },
      { time: '09:30 AM', activity: 'Guided Exploration', notes: 'Observe preservation etiquette' },
    ],
    inclusions: [
      'Preservation guidelines briefing',
      'Clean As You Go (CLAYGO) compliance',
      'Eco-friendly visitation guidelines',
    ],
    bestTimeToVisit: 'Morning hours (8:00 AM – 11:30 AM)',
    howToGetThere: 'Accessible via tricycle from Balingasag Bus Terminal or national highway.',
    contactLGU: 'Balingasag Municipal Tourism Office - (088) 333-2005',
    coordinates: { lat: 8.7441, lng: 124.7765 },
    featured: false,
  });

  // Image Upload States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Persistent library of uploaded images (Remembers every uploaded photo across sessions)
  const [customUploadedUrls, setCustomUploadedUrls] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('balingasag_uploaded_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Set([...INITIAL_USER_UPLOADED_IMAGES, ...parsed]));
        }
      }
    } catch {}
    return INITIAL_USER_UPLOADED_IMAGES;
  });

  // Sync uploaded images from Firestore cloud settings on mount
  React.useEffect(() => {
    getMediaLibrary().then((cloudImages) => {
      if (cloudImages && cloudImages.length > 0) {
        setCustomUploadedUrls((prev) => Array.from(new Set([...prev, ...cloudImages])));
      }
    });
  }, []);

  const recordUploadedImage = (url: string) => {
    if (!url) return;
    setCustomUploadedUrls((prev) => {
      const next = Array.from(new Set([url, ...prev]));
      try {
        localStorage.setItem('balingasag_uploaded_images', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Comprehensive image library: pools all uploaded images across slides, destinations, and browser sessions
  const allLibraryImages = useMemo(() => {
    const set = new Set<string>();

    // 1. Any image uploaded in this browser or persisted in localStorage
    customUploadedUrls.forEach((u) => u && set.add(u));

    // 2. All carousel slide images from Firestore/props
    (carouselSlides || []).forEach((s) => s.imageUrl && set.add(s.imageUrl));

    // 3. All destination images (hero + gallery)
    (destinations || []).forEach((d) => {
      if (d.heroImage) set.add(d.heroImage);
      if (Array.isArray(d.gallery)) d.gallery.forEach((g) => g && set.add(g));
    });

    // 4. All event images
    (events || []).forEach((e) => e.imageUrl && set.add(e.imageUrl));

    return Array.from(set);
  }, [customUploadedUrls, carouselSlides, destinations, events]);

  // Dynamic inputs for Itinerary, Inclusions, Gallery
  const [newItinTime, setNewItinTime] = useState('');
  const [newItinAct, setNewItinAct] = useState('');
  const [newItinNote, setNewItinNote] = useState('');
  const [newInclusionText, setNewInclusionText] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Advisory Form State
  const [advTitle, setAdvTitle] = useState('');
  const [advSeverity, setAdvSeverity] = useState<'info' | 'advisory' | 'warning'>('advisory');
  const [advMessage, setAdvMessage] = useState('');
  const [advIssuedBy, setAdvIssuedBy] = useState('MDRRMO Balingasag / LGU Tourism');

  // Event Form State
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<'Festival' | 'Cultural' | 'Civic' | 'Eco-Tourism'>('Festival');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('Whole Day');
  const [evtLocation, setEvtLocation] = useState('Municipal Plaza / Poblacion');
  const [evtBarangay, setEvtBarangay] = useState<Barangay>('Barangay 1 (Poblacion)');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtImg, setEvtImg] = useState(PRESET_GALLERY_IMAGES[1]);
  const [evtOrg, setEvtOrg] = useState('LGU Balingasag Tourism Office');

  // -------------------------------------------------------------
  // AUTHENTICATION LOGIC WITH REACT-HOT-TOAST
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      if (isFirebaseConfigured() && auth) {
        try {
          const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
          const email = cred.user.email || loginEmail;
          setAdminEmail(email);
          setIsAdminLoggedIn(true);
          localStorage.setItem('balingasag_admin_logged_in', 'true');
          localStorage.setItem('balingasag_admin_email', email);
          toast.success(`Welcome, ${email}! Firebase Auth verified.`);
        } catch (firebaseErr: any) {
          console.warn('Firebase network auth unavailable, using offline fallback:', firebaseErr);
          if (loginEmail && loginPassword) {
            setAdminEmail(loginEmail);
            setIsAdminLoggedIn(true);
            localStorage.setItem('balingasag_admin_logged_in', 'true');
            localStorage.setItem('balingasag_admin_email', loginEmail);
            toast.success('Signed in successfully (Offline/Local Admin Mode).');
          } else {
            throw firebaseErr;
          }
        }
      } else {
        if (loginEmail && loginPassword) {
          setAdminEmail(loginEmail);
          setIsAdminLoggedIn(true);
          localStorage.setItem('balingasag_admin_logged_in', 'true');
          localStorage.setItem('balingasag_admin_email', loginEmail);
          toast.success('Signed in successfully (Free-Tier Sandbox Mode).');
        } else {
          toast.error('Please enter email and password.');
        }
      }
    } catch (err: any) {
      console.warn('Authentication error:', err);
      toast.error(err.message || 'Authentication error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    localStorage.removeItem('balingasag_admin_logged_in');
    localStorage.removeItem('balingasag_admin_email');
    setIsAdminLoggedIn(false);
    setAdminEmail('');
    toast.success('Logged out from LGU Admin CMS.');
  };

  // -------------------------------------------------------------
  // CLOUDINARY UPLOAD HANDLER WITH REACT-HOT-TOAST
  // -------------------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(10);
    const toastId = toast.loading('Uploading photo to Cloudinary...');

    try {
      const res = await uploadToCloudinary(file, (pct) => setUploadProgress(pct));
      if (isHero) {
        setDestForm((prev) => ({
          ...prev,
          heroImage: res.secure_url,
          gallery: Array.from(new Set([res.secure_url, ...(prev.gallery || [])])),
        }));
      } else {
        setDestForm((prev) => ({
          ...prev,
          gallery: [...(prev.gallery || []), res.secure_url],
        }));
      }
      recordUploadedImage(res.secure_url);
      saveMediaLibraryUrl(res.secure_url);
      toast.success('Photo successfully uploaded & optimized with Cloudinary!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Cloudinary upload failed', { id: toastId });
    } finally {
      setTimeout(() => setUploadProgress(null), 800);
    }
  };

  // -------------------------------------------------------------
  // DESTINATION CRUD HANDLERS WITH REACT-HOT-TOAST
  // -------------------------------------------------------------
  const handleOpenAddDestination = () => {
    setEditingDestId(null);
    setDestForm({
      name: '',
      category: 'Heritage & Culture',
      barangay: 'Barangay 1 (Poblacion)',
      shortDescription: '',
      description: '',
      heroImage: PRESET_GALLERY_IMAGES[0],
      gallery: [PRESET_GALLERY_IMAGES[0]],
      itinerary: [
        { time: '08:30 AM', activity: 'Arrival & Welcome Briefing', notes: 'Register at Barangay Outpost' },
        { time: '09:30 AM', activity: 'Guided Tour', notes: 'Follow designated paths' },
      ],
      inclusions: [
        'Preservation guidelines briefing',
        'Clean As You Go (CLAYGO) compliance',
        'Informational visitor assistance',
      ],
      bestTimeToVisit: 'Morning hours (8:00 AM – 11:30 AM)',
      howToGetThere: 'Accessible via local tricycle from Balingasag Bus Terminal.',
      contactLGU: 'Balingasag Municipal Tourism Office - (088) 333-2005',
      coordinates: { lat: 8.7441, lng: 124.7765 },
      featured: false,
    });
    setDestModalOpen(true);
  };

  const handleOpenEditDestination = (dest: Destination) => {
    setEditingDestId(dest.id);
    setDestForm({
      name: dest.name,
      category: dest.category,
      barangay: dest.barangay,
      shortDescription: dest.shortDescription,
      description: dest.description,
      heroImage: dest.heroImage,
      gallery: dest.gallery || [dest.heroImage],
      itinerary: dest.itinerary || [],
      inclusions: dest.inclusions || [],
      bestTimeToVisit: dest.bestTimeToVisit,
      howToGetThere: dest.howToGetThere,
      contactLGU: dest.contactLGU,
      coordinates: dest.coordinates || { lat: 8.7441, lng: 124.7765 },
      featured: dest.featured,
    });
    setDestModalOpen(true);
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destForm.name.trim()) {
      toast.error('Destination name is required');
      return;
    }

    const toastId = toast.loading('Saving to Firestore...');
    try {
      if (editingDestId) {
        await updateDestination(editingDestId, destForm);
        toast.success(`Updated "${destForm.name}" in Firestore!`, { id: toastId });
      } else {
        await addDestination(destForm);
        toast.success(`Created "${destForm.name}" in Firestore!`, { id: toastId });
      }
      setDestModalOpen(false);
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save', { id: toastId });
    }
  };

  const handleDeleteDestination = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Firestore?`)) return;
    const toastId = toast.loading('Deleting from Firestore...');
    try {
      await deleteDestination(id);
      toast.success(`Deleted "${name}".`, { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete', { id: toastId });
    }
  };

  // Itinerary Step Add/Remove
  const handleAddItineraryStep = () => {
    if (!newItinTime.trim() || !newItinAct.trim()) return;
    setDestForm((prev) => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        { time: newItinTime, activity: newItinAct, notes: newItinNote },
      ],
    }));
    setNewItinTime('');
    setNewItinAct('');
    setNewItinNote('');
    toast.success('Itinerary step added');
  };

  const handleRemoveItineraryStep = (idx: number) => {
    setDestForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== idx),
    }));
  };

  // Inclusions Add/Remove
  const handleAddInclusion = () => {
    if (!newInclusionText.trim()) return;
    setDestForm((prev) => ({
      ...prev,
      inclusions: [...(prev.inclusions || []), newInclusionText.trim()],
    }));
    setNewInclusionText('');
    toast.success('Guideline pointer added');
  };

  const handleRemoveInclusion = (idx: number) => {
    setDestForm((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== idx),
    }));
  };

  // Gallery URL Add/Remove
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setDestForm((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), newGalleryUrl.trim()],
    }));
    setNewGalleryUrl('');
    toast.success('Gallery URL added');
  };

  const handleRemoveGalleryItem = (idx: number) => {
    setDestForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx),
    }));
  };

  // -------------------------------------------------------------
  // ADVISORY HANDLERS WITH REACT-HOT-TOAST
  // -------------------------------------------------------------
  const handlePostAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advTitle.trim() || !advMessage.trim()) return;

    const toastId = toast.loading('Publishing advisory...');
    try {
      await addAdvisory({
        title: advTitle.trim(),
        severity: advSeverity,
        message: advMessage.trim(),
        issuedBy: advIssuedBy.trim() || 'MDRRMO Balingasag / LGU Tourism',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isActive: true,
      });
      setAdvTitle('');
      setAdvMessage('');
      toast.success('Travel advisory posted to Notice Board!', { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post advisory', { id: toastId });
    }
  };

  const handleDeleteAdvisory = async (id: string) => {
    const toastId = toast.loading('Removing advisory...');
    try {
      await deleteAdvisory(id);
      toast.success('Advisory removed.', { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete', { id: toastId });
    }
  };

  const handleToggleAdvisory = async (id: string, current: boolean) => {
    try {
      await toggleAdvisoryActive(id, !current);
      toast.success(`Advisory set to ${!current ? 'active' : 'inactive'}.`);
      await onRefreshAllData();
    } catch (err: any) {
      toast.error('Failed to toggle advisory status');
    }
  };

  // -------------------------------------------------------------
  // EVENT HANDLERS WITH REACT-HOT-TOAST
  // -------------------------------------------------------------
  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || !evtDate.trim()) return;

    const toastId = toast.loading('Saving municipal event...');
    try {
      await addEvent({
        title: evtTitle.trim(),
        category: evtCategory,
        date: evtDate.trim(),
        time: evtTime.trim(),
        location: evtLocation.trim(),
        barangay: evtBarangay,
        description: evtDesc.trim(),
        imageUrl: evtImg.trim() || PRESET_GALLERY_IMAGES[2],
        organizer: evtOrg.trim(),
      });
      setEvtTitle('');
      setEvtDate('');
      setEvtDesc('');
      toast.success('Festival added to Municipal Calendar!', { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save event', { id: toastId });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const toastId = toast.loading('Deleting event...');
    try {
      await deleteEvent(id);
      toast.success('Event deleted.', { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete', { id: toastId });
    }
  };

  // -------------------------------------------------------------
  // HERO CAROUSEL CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddSlide = () => {
    setEditingSlideId(null);
    setSlideForm({
      title: '',
      subtitle: '',
      imageUrl: PRESET_GALLERY_IMAGES[0],
      order: (carouselSlides || []).length + 1,
      isActive: true,
    });
    setSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: CarouselSlide) => {
    setEditingSlideId(slide.id);
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle || '',
      imageUrl: slide.imageUrl,
      order: slide.order,
      isActive: slide.isActive,
    });
    setSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title.trim() || !slideForm.imageUrl.trim()) {
      toast.error('Slide title and image are required');
      return;
    }

    const toastId = toast.loading('Saving carousel slide to Firestore...');
    try {
      if (editingSlideId) {
        await updateCarouselSlide(editingSlideId, slideForm);
        toast.success(`Updated slide "${slideForm.title}"!`, { id: toastId });
      } else {
        await addCarouselSlide(slideForm);
        toast.success(`Added slide "${slideForm.title}" to Carousel!`, { id: toastId });
      }
      setSlideModalOpen(false);
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save slide', { id: toastId });
    }
  };

  const handleDeleteSlide = async (id: string, title: string) => {
    if (!window.confirm(`Delete slide "${title}" from Carousel?`)) return;
    const toastId = toast.loading('Deleting slide...');
    try {
      await deleteCarouselSlide(id);
      toast.success('Slide removed from Carousel', { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete slide', { id: toastId });
    }
  };

  const handleToggleSlideActive = async (id: string, current: boolean) => {
    try {
      await toggleCarouselSlideActive(id, current);
      toast.success(`Slide ${!current ? 'activated' : 'hidden'}`);
      await onRefreshAllData();
    } catch (err: any) {
      toast.error('Failed to toggle slide status');
    }
  };

  const handleCarouselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading slide image to Cloudinary...');
    try {
      const res = await uploadToCloudinary(file, (pct) => setUploadProgress(pct));
      setSlideForm((prev) => ({
        ...prev,
        imageUrl: res.secure_url,
      }));
      recordUploadedImage(res.secure_url);
      saveMediaLibraryUrl(res.secure_url);
      toast.success('Slide photo successfully uploaded with Cloudinary!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Cloudinary upload failed', { id: toastId });
    } finally {
      setTimeout(() => setUploadProgress(null), 800);
    }
  };

  // -------------------------------------------------------------
  // SEED DATABASE HANDLER
  // -------------------------------------------------------------
  const handleSeedDatabase = async () => {
    if (!window.confirm('Reset Firestore with authentic Balingasag attractions, advisories, and festivals?')) return;
    const toastId = toast.loading('Seeding Firestore database...');
    try {
      const res = await seedFirestoreDatabase();
      toast.success(`Seeded ${res.destinationsCount} spots, ${res.advisoriesCount} advisories, and ${res.eventsCount} events!`, { id: toastId });
      await onRefreshAllData();
    } catch (err: any) {
      toast.error('Seeding failed: ' + err.message, { id: toastId });
    }
  };

  // =============================================================
  // RENDER: LOGIN FORM (IF NOT LOGGED IN)
  // =============================================================
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        {/* Back to Public Home Button */}
        <div className="w-full max-w-md mb-4 flex justify-between items-center">
          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Tourism Portal</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl text-white"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Balingasag LGU Admin Portal
            </h2>
            <p className="text-xs text-slate-400">
              Authorized municipal tourism administrators (ZIP 9005)
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin Email (Firebase Auth)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@balingasag.gov.ph"
                  className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In via Firebase Auth'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // =============================================================
  // RENDER: SEPARATE DEDICATED ADMIN DASHBOARD INTERFACE
  // =============================================================
  const cloudinaryReady = getCloudinaryConfig().isConfigured;
  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin CMS Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Public Portal"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-white">
                  Balingasag LGU Tourism CMS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Separate CMS Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as: <strong className="text-blue-300">{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Portal</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Layout: Sidebar + Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-1.5">
            <button
              onClick={() => setActiveView('overview')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>CMS Overview</span>
            </button>

            <button
              onClick={() => setActiveView('destinations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'destinations'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>Destinations CRUD</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {destinations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('advisories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'advisories'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-blue-400" />
                <span>Notice Board</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {advisories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('events')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'events'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Events Calendar</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('carousel')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'carousel'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Hero Carousel</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {carouselSlides.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Municipal Profile</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-blue-300 font-mono">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveView('database')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeView === 'database'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>Database &amp; Seeder</span>
            </button>
          </div>

          {/* Storage & Auth Status Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Cloud Integrations
            </span>

            <div className="flex items-center justify-between text-slate-300">
              <span>Firebase Firestore</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                firebaseReady ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {firebaseReady ? 'Online' : 'Sandbox'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Cloudinary Media</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cloudinaryReady ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {cloudinaryReady ? 'Active' : 'Fallback'}
              </span>
            </div>
          </div>
        </aside>

        {/* Content Panel (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* VIEW 1: OVERVIEW */}
          {/* VIEW 1: CMS OVERVIEW */}
          {activeView === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Tourism Spots</span>
                    <Compass className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2">{destinations.length}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Across 30 Balingasag Barangays</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Hero Carousel</span>
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2">{carouselSlides.length}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Landing Page Hero Slides</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Active Notices</span>
                    <AlertTriangle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {advisories.filter((a) => a.isActive).length}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Live on Traveler Notice Board</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Upcoming Events</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2">{events.length}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Lambangus, Sakay-Sakay, Fiestas</p>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Quick CMS Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleOpenAddDestination}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Tourism Destination</span>
                  </button>

                  <button
                    onClick={handleOpenAddSlide}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>Add Hero Carousel Slide</span>
                  </button>

                  <button
                    onClick={() => setActiveView('advisories')}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Broadcast Travel Advisory</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: DESTINATIONS CRUD */}
          {activeView === 'destinations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-white">Destinations Management</h2>
                  <p className="text-xs text-slate-400">
                    Live Firestore collection `destinations` with Cloudinary photo storage
                  </p>
                </div>

                <button
                  onClick={handleOpenAddDestination}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Tourism Spot</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Photo</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Barangay</th>
                        <th className="py-3 px-4">Itinerary</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {destinations.map((dest) => (
                        <tr key={dest.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={dest.heroImage}
                              alt={dest.name}
                              className="w-12 h-10 object-cover rounded-lg border border-slate-700"
                            />
                          </td>
                          <td className="py-3 px-4 font-bold text-white max-w-[180px] truncate">
                            {dest.name}
                          </td>
                          <td className="py-3 px-4">{dest.category}</td>
                          <td className="py-3 px-4">Brgy. {dest.barangay}</td>
                          <td className="py-3 px-4">{dest.itinerary?.length || 0} stages</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditDestination(dest)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDestination(dest.id, dest.name)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: ADVISORIES CRUD */}
          {activeView === 'advisories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Post Travel Advisory</h3>
                <form onSubmit={handlePostAdvisory} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mountain Stream Caution"
                      value={advTitle}
                      onChange={(e) => setAdvTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Severity</label>
                    <select
                      value={advSeverity}
                      onChange={(e) => setAdvSeverity(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="info">Info / Normal (Blue)</option>
                      <option value="advisory">Advisory (Advisory)</option>
                      <option value="warning">Warning (Red)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Body Message</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Guidance details..."
                      value={advMessage}
                      onChange={(e) => setAdvMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                  >
                    Broadcast to Notice Board
                  </button>
                </form>
              </div>

              <div className="md:col-span-7 space-y-3">
                <h3 className="text-sm font-bold text-white">Notice Board Entries</h3>
                {advisories.map((adv) => (
                  <div
                    key={adv.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{adv.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {adv.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">{adv.message}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleAdvisory(adv.id, adv.isActive)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
                      >
                        {adv.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAdvisory(adv.id)}
                        className="p-1 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW 4: EVENTS CRUD */}
          {activeView === 'events' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Add Municipal Event</h3>
                <form onSubmit={handlePostEvent} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lambangus Street Dance"
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Date</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. May 21, 2026"
                        value={evtDate}
                        onChange={(e) => setEvtDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Barangay</label>
                      <select
                        value={evtBarangay}
                        onChange={(e) => setEvtBarangay(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      >
                        {BALINGASAG_BARANGAYS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Poblacion Plaza"
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Description</label>
                    <textarea
                      rows={2}
                      value={evtDesc}
                      onChange={(e) => setEvtDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                  >
                    Post to Events Calendar
                  </button>
                </form>
              </div>

              <div className="md:col-span-7 space-y-3">
                <h3 className="text-sm font-bold text-white">Scheduled Events</h3>
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{evt.title}</h4>
                      <p className="text-blue-400 mt-0.5">
                        {evt.date} • {evt.location} (Brgy. {evt.barangay})
                      </p>
                      <p className="text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW 5: HERO CAROUSEL MANAGER */}
          {activeView === 'carousel' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white">Hero Carousel Manager</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage the high-resolution background photographs and featured titles that automatically cycle every 3 seconds on the landing page hero section.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSlide}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Slide</span>
                </button>
              </div>

              {carouselSlides.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Carousel Slides Yet</h3>
                  <p className="text-xs max-w-md mx-auto">
                    Add custom photography or seed the default 5 high-resolution Balingasag slides.
                  </p>
                  <button
                    onClick={handleOpenAddSlide}
                    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Create First Slide
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carouselSlides.map((slide) => (
                    <div
                      key={slide.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
                    >
                      <div>
                        {/* Slide Image Preview with Order & Active Badges */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-blue-400 border border-white/10">
                              Order #{slide.order}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                slide.isActive
                                  ? 'bg-blue-500/80 text-white'
                                  : 'bg-red-500/80 text-white'
                              }`}
                            >
                              {slide.isActive ? 'Active on Hero' : 'Hidden'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="p-4 space-y-1">
                          <h4 className="font-bold text-white text-sm leading-snug">
                            {slide.title}
                          </h4>
                          {slide.subtitle && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {slide.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="p-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleSlideActive(slide.id, slide.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            slide.isActive
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-blue-950 text-blue-300 border border-blue-800/40'
                          }`}
                        >
                          {slide.isActive ? 'Hide' : 'Activate'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditSlide(slide)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Slide"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlide(slide.id, slide.title)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-200 transition-colors"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: REAL-TIME MUNICIPAL PROFILE MANAGER */}
          {activeView === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Real-Time Firestore Sync</span>
                  </div>
                  <h3 className="text-xl font-black text-white">Municipal Profile &amp; Demographics</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Update total barangays, population, land area, and census citations live without updating any code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveMunicipalProfile}
                  disabled={isSavingProfile}
                  className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Changes Live'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveMunicipalProfile} className="space-y-6">
                {/* 1. Header & Headline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Portal Section Headline
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Section Headline Title
                      </label>
                      <input
                        type="text"
                        value={profileForm.headlineTitle}
                        onChange={(e) => setProfileForm({ ...profileForm, headlineTitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Section Headline Subtitle
                      </label>
                      <textarea
                        rows={2}
                        value={profileForm.headlineSubtitle}
                        onChange={(e) => setProfileForm({ ...profileForm, headlineSubtitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Political Subdivisions (Barangays) */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Political Subdivisions (Barangays)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Total Barangays
                      </label>
                      <input
                        type="number"
                        value={profileForm.barangaysCount}
                        onChange={(e) => setProfileForm({ ...profileForm, barangaysCount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Urban Barangays
                      </label>
                      <input
                        type="number"
                        value={profileForm.urbanCount}
                        onChange={(e) => setProfileForm({ ...profileForm, urbanCount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Urbanizing
                      </label>
                      <input
                        type="number"
                        value={profileForm.urbanizingCount}
                        onChange={(e) => setProfileForm({ ...profileForm, urbanizingCount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Rural Barangays
                      </label>
                      <input
                        type="number"
                        value={profileForm.ruralCount}
                        onChange={(e) => setProfileForm({ ...profileForm, ruralCount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Population & Demographics */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Population &amp; Demographics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Total Population
                      </label>
                      <input
                        type="number"
                        value={profileForm.population}
                        onChange={(e) => setProfileForm({ ...profileForm, population: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Census Source / Year
                      </label>
                      <input
                        type="text"
                        value={profileForm.populationYear}
                        onChange={(e) => setProfileForm({ ...profileForm, populationYear: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Province Share Citation
                      </label>
                      <input
                        type="text"
                        value={profileForm.populationProvinceShare}
                        onChange={(e) => setProfileForm({ ...profileForm, populationProvinceShare: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Region Share Citation
                      </label>
                      <input
                        type="text"
                        value={profileForm.populationRegionShare}
                        onChange={(e) => setProfileForm({ ...profileForm, populationRegionShare: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Land Area & Geography */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Land Area &amp; Geography
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Total Land Area (Hectares)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={profileForm.landAreaHectares}
                        onChange={(e) => setProfileForm({ ...profileForm, landAreaHectares: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Geographical Scope Note
                      </label>
                      <input
                        type="text"
                        value={profileForm.landAreaDescription}
                        onChange={(e) => setProfileForm({ ...profileForm, landAreaDescription: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Civic & Heritage Citations */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Civic &amp; Historical Notes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Heritage Note
                      </label>
                      <input
                        type="text"
                        value={profileForm.spanishHeritageNote}
                        onChange={(e) => setProfileForm({ ...profileForm, spanishHeritageNote: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Certification Citation
                      </label>
                      <input
                        type="text"
                        value={profileForm.psaCertifiedNote}
                        onChange={(e) => setProfileForm({ ...profileForm, psaCertifiedNote: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-3 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Saving...' : 'Save Real-Time Municipal Profile'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* VIEW 6: DATABASE & SEEDER */}
          {activeView === 'database' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Firestore Database Seeder</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Synchronize your Firestore database with all 10 curated Balingasag attractions,
                  active weather advisories, and town festivals in one click.
                </p>
              </div>

              <button
                onClick={handleSeedDatabase}
                className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span>Seed Firestore with Authentic Balingasag Data</span>
              </button>
            </motion.div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT DESTINATION */}
      {destModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col text-xs"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingDestId ? 'Edit Tourism Spot' : 'Add New Tourism Spot'}
              </h3>
              <button
                onClick={() => setDestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={destForm.name}
                    onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={destForm.category}
                    onChange={(e) => setDestForm({ ...destForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Barangay (30 Official)</label>
                  <select
                    value={destForm.barangay}
                    onChange={(e) => setDestForm({ ...destForm, barangay: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {BALINGASAG_BARANGAYS.map((b) => (
                      <option key={b} value={b}>
                        Brgy. {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={destForm.featured}
                    onChange={(e) => setDestForm({ ...destForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="featured" className="text-slate-300 font-bold cursor-pointer">
                    Feature as "Must-Visit"
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={destForm.shortDescription}
                  onChange={(e) => setDestForm({ ...destForm, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Full Cultural &amp; Historical Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={destForm.description}
                  onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Cloudinary Upload Section */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Main Cover / Hero Photo</span>
                  <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={destForm.heroImage}
                    alt=""
                    className="w-20 h-14 object-cover rounded-xl border border-slate-600 shrink-0 bg-slate-950"
                  />
                  <input
                    type="url"
                    value={destForm.heroImage}
                    onChange={(e) => setDestForm({ ...destForm, heroImage: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="https://..."
                  />
                </div>

                {/* Quick Pick Hero Image from Uploaded Library */}
                {allLibraryImages.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="block text-[10px] text-blue-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Or pick from uploaded photos ({allLibraryImages.length}):</span>
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1.5">
                      {allLibraryImages.map((img, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setDestForm({ ...destForm, heroImage: img })}
                          className={`h-12 w-16 rounded-lg overflow-hidden border shrink-0 transition-all ${
                            destForm.heroImage === img
                              ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105'
                              : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="media" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Gallery Photos Management */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">
                      Destination Photo Gallery
                    </span>
                    <span className="text-slate-400 text-xs ml-2">
                      ({(destForm.gallery || []).length} photos)
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 font-bold rounded-xl flex items-center gap-1.5 text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                  </label>
                </div>

                {/* Gallery Thumbnails with Remove */}
                {destForm.gallery && destForm.gallery.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {destForm.gallery.map((imgUrl, gIdx) => (
                      <div
                        key={gIdx}
                        className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-video bg-slate-950"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${gIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(gIdx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-md"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No photos in gallery yet.</p>
                )}

                {/* Add Photo by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL to add to gallery..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                {/* Quick Add from Uploaded Library to Gallery */}
                {allLibraryImages.length > 0 && (
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Quick-add from uploaded library:
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allLibraryImages.map((img, i) => {
                        const inGallery = (destForm.gallery || []).includes(img);
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              if (inGallery) {
                                setDestForm((prev) => ({
                                  ...prev,
                                  gallery: (prev.gallery || []).filter((g) => g !== img),
                                }));
                              } else {
                                setDestForm((prev) => ({
                                  ...prev,
                                  gallery: [...(prev.gallery || []), img],
                                }));
                              }
                            }}
                            className={`h-11 w-14 rounded-lg overflow-hidden border shrink-0 transition-all relative ${
                              inGallery
                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                : 'border-slate-700 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="media" className="w-full h-full object-cover" />
                            {inGallery && (
                              <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Itinerary */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">Recommended Itinerary Stages</label>
                {destForm.itinerary?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between"
                  >
                    <span>
                      <strong>{step.time}</strong> - {step.activity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItineraryStep(idx)}
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Time"
                    value={newItinTime}
                    onChange={(e) => setNewItinTime(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Activity"
                    value={newItinAct}
                    onChange={(e) => setNewItinAct(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddItineraryStep}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl"
                  >
                    Add Stage
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  Save to Firestore
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* MODAL: ADD / EDIT CAROUSEL SLIDE */}
      {slideModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden max-h-[90vh] flex flex-col text-xs"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingSlideId ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
              </h3>
              <button
                onClick={() => setSlideModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Slide Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vega Ancestral House"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subtitle / Cultural Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Circa 1800s Spanish Bahay-na-Bato with Otí-Ot"
                  value={slideForm.subtitle || ''}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={slideForm.order}
                    onChange={(e) => setSlideForm({ ...slideForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="slideActive"
                    checked={slideForm.isActive}
                    onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="slideActive" className="text-slate-300 font-bold cursor-pointer">
                    Active on Landing Hero
                  </label>
                </div>
              </div>

              {/* Slide Image Uploader / URL */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Slide Photograph URL *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={slideForm.imageUrl}
                    onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 text-blue-400 font-semibold shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCarouselImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgress !== null && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {/* Uploaded Photos & Media Library (Displays all images uploaded by user across all slides and destinations) */}
                {allLibraryImages.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Your Uploaded Photos &amp; Media Library ({allLibraryImages.length})</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Click to select for this slide</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
                      {allLibraryImages.map((img, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setSlideForm({ ...slideForm, imageUrl: img })}
                          className={`relative aspect-video rounded-lg overflow-hidden border transition-all ${
                            slideForm.imageUrl === img
                              ? 'border-blue-500 ring-2 ring-blue-500/50 scale-[1.03]'
                              : 'border-slate-700/80 hover:border-slate-500 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Uploaded ${i + 1}`} className="w-full h-full object-cover" />
                          {slideForm.imageUrl === img && (
                            <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Selected</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset Options (All High-Res Presets) */}
                <div className="mt-3">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                    Or choose from high-res presets ({PRESET_GALLERY_IMAGES.length}):
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {PRESET_GALLERY_IMAGES.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setSlideForm({ ...slideForm, imageUrl: img })}
                        className={`h-12 w-16 rounded-lg overflow-hidden border shrink-0 transition-transform ${
                          slideForm.imageUrl === img ? 'border-blue-500 scale-105 ring-2 ring-blue-500/50' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Image */}
                {slideForm.imageUrl && (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mt-2">
                    <img
                      src={getHeroOptimizedUrl(slideForm.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>HD Hero Optimized (1920px &amp; AI Sharpening)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSlideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  Save Slide to Firestore
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
