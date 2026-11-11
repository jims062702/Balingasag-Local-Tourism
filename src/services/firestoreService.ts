import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Destination, TravelAdvisory, LocalEvent, CarouselSlide, MunicipalProfile } from '../types';
import {
  INITIAL_DESTINATIONS,
  INITIAL_ADVISORIES,
  INITIAL_EVENTS,
  INITIAL_CAROUSEL_SLIDES,
  INITIAL_MUNICIPAL_PROFILE,
} from '../data/initialData';

const LOCAL_STORAGE_DESTINATIONS_KEY = 'balingasag_destinations_v1';
const LOCAL_STORAGE_ADVISORIES_KEY = 'balingasag_advisories_v1';
const LOCAL_STORAGE_EVENTS_KEY = 'balingasag_events_v1';
const LOCAL_STORAGE_CAROUSEL_KEY = 'balingasag_carousel_v1';
const LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY = 'balingasag_municipal_profile_v1';
const LOCAL_STORAGE_MEDIA_LIBRARY_KEY = 'balingasag_uploaded_images';

// Persistent tracking of explicitly deleted item IDs (Guarantees deleted items never resurrect on hard refresh)
const DELETED_DESTINATIONS_KEY = 'balingasag_deleted_destinations_v1';
const DELETED_CAROUSEL_KEY = 'balingasag_deleted_carousel_v1';
const DELETED_EVENTS_KEY = 'balingasag_deleted_events_v1';
const DELETED_ADVISORIES_KEY = 'balingasag_deleted_advisories_v1';

export const INITIAL_USER_UPLOADED_IMAGES: string[] = [
  'https://res.cloudinary.com/asqtmony/image/upload/v1794352896/balingasag_tourism/ljmt6kkqwihxvnnwkacv.jpg',
  'https://res.cloudinary.com/asqtmony/image/upload/v1794352925/balingasag_tourism/lptbmifjdvqrlkrkpzhe.jpg',
  'https://res.cloudinary.com/asqtmony/image/upload/v1794352941/balingasag_tourism/xvgdaety0v8e02wqgcee.jpg',
];

// Helpers to get local fallback data
const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const setLocalData = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};

const getDeletedIds = (key: string): Set<string> => {
  return new Set(getLocalData<string[]>(key, []));
};

const addDeletedId = (key: string, id: string) => {
  if (!id) return;
  const current = getLocalData<string[]>(key, []);
  if (!current.includes(id)) {
    setLocalData(key, [...current, id]);
  }
};

const removeDeletedId = (key: string, id: string) => {
  if (!id) return;
  const current = getLocalData<string[]>(key, []);
  setLocalData(key, current.filter((x) => x !== id));
};

/**
 * Smart merge destinations from cloud and local:
 * 1. Filter out all items explicitly marked as deleted by ID or normalized name.
 * 2. Keep locally added / modified items so hard refresh never wipes them.
 * 3. Deduplicate strictly by ID and normalized name so duplicates never appear.
 * 4. Sync merged state to localStorage.
 */
export const mergeDestinations = (cloudItems: Destination[]): Destination[] => {
  const deletedIds = getDeletedIds(DELETED_DESTINATIONS_KEY);
  const localItems = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);

  const isDeleted = (d: Destination) => {
    if (!d || !d.id) return true;
    if (deletedIds.has(d.id)) return true;
    if (d.name && deletedIds.has(d.name.toLowerCase().trim())) return true;
    if (d.heroImage && deletedIds.has(d.heroImage)) return true;
    return false;
  };

  const activeCloud = (cloudItems || []).filter((item) => !isDeleted(item));

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const merged: Destination[] = [];

  // Local items first (takes priority so local adds/edits are preserved immediately)
  for (const local of localItems) {
    if (isDeleted(local)) continue;
    const nameKey = (local.name || '').toLowerCase().trim();
    if (seenIds.has(local.id) || (nameKey && seenNames.has(nameKey))) continue;
    merged.push(local);
    seenIds.add(local.id);
    if (nameKey) seenNames.add(nameKey);
  }

  // Cloud items next
  for (const cloud of activeCloud) {
    if (isDeleted(cloud)) continue;
    const nameKey = (cloud.name || '').toLowerCase().trim();
    if (seenIds.has(cloud.id) || (nameKey && seenNames.has(nameKey))) continue;
    merged.push(cloud);
    seenIds.add(cloud.id);
    if (nameKey) seenNames.add(nameKey);
  }

  merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, merged);
  return merged;
};

// ==========================================
// DESTINATIONS CRUD
// ==========================================

export const getDestinations = async (): Promise<Destination[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'destinations');
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Destination),
          id: docSnap.id,
        }));
        return mergeDestinations(items);
      }
    } catch (error) {
      console.warn('Error reading from Firestore, using local data:', error);
    }
  }

  return mergeDestinations([]);
};

export const getDestinationById = async (id: string): Promise<Destination | null> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'destinations', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...(docSnap.data() as Destination), id: docSnap.id };
      }
    } catch (error) {
      console.warn('Error fetching single destination from Firestore:', error);
    }
  }

  const all = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  return all.find((d) => d.id === id) || null;
};

export const addDestination = async (
  destination: Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Destination> => {
  const newId = destination.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
  const timestamp = Date.now();

  const newDestination: Destination = {
    ...destination,
    id: newId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Remove from deleted list if it was previously deleted
  removeDeletedId(DELETED_DESTINATIONS_KEY, newId);
  if (destination.name) removeDeletedId(DELETED_DESTINATIONS_KEY, destination.name.toLowerCase().trim());
  if (destination.heroImage) removeDeletedId(DELETED_DESTINATIONS_KEY, destination.heroImage);

  // 1. Immediately save to local persistent store so it survives hard refreshes
  const current = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  const updated = [newDestination, ...current.filter((d) => d.id !== newDestination.id)];
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, updated);

  // 2. Sync to Firestore with deterministic ID
  if (isFirebaseConfigured() && db) {
    try {
      const clean = JSON.parse(JSON.stringify(newDestination));
      const docRef = doc(db, 'destinations', newId);
      await setDoc(docRef, {
        ...clean,
        serverCreatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.warn('Firestore offline/delayed, spot saved securely to local storage:', error);
    }
  }

  return newDestination;
};

export const updateDestination = async (
  id: string,
  data: Partial<Omit<Destination, 'id' | 'createdAt'>>
): Promise<Destination> => {
  removeDeletedId(DELETED_DESTINATIONS_KEY, id);
  if (data.name) removeDeletedId(DELETED_DESTINATIONS_KEY, data.name.toLowerCase().trim());
  if (data.heroImage) removeDeletedId(DELETED_DESTINATIONS_KEY, data.heroImage);

  const currentList = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  const index = currentList.findIndex((d) => d.id === id);

  const updatedItem: Destination = {
    ...(index !== -1 ? currentList[index] : ({} as Destination)),
    ...data,
    id,
    updatedAt: Date.now(),
  };

  if (index !== -1) {
    currentList[index] = updatedItem;
  } else {
    currentList.unshift(updatedItem);
  }
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, currentList);

  if (isFirebaseConfigured() && db) {
    try {
      const clean = JSON.parse(JSON.stringify({
        ...data,
        updatedAt: Date.now(),
      }));
      const docRef = doc(db, 'destinations', id);
      await setDoc(docRef, clean, { merge: true });
    } catch (error) {
      console.warn('Firestore offline/delayed, update saved locally:', error);
    }
  }

  return updatedItem;
};

export const deleteDestination = async (id: string): Promise<void> => {
  // 1. Mark as permanently deleted so cloud resync never revives it
  const currentList = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  const target = currentList.find((d) => d.id === id);

  addDeletedId(DELETED_DESTINATIONS_KEY, id);
  if (target) {
    if (target.name) addDeletedId(DELETED_DESTINATIONS_KEY, target.name.toLowerCase().trim());
    if (target.heroImage) addDeletedId(DELETED_DESTINATIONS_KEY, target.heroImage);
  }

  // 2. Remove from local store immediately
  const updated = currentList.filter(
    (d) => d.id !== id && (!target?.name || d.name.toLowerCase().trim() !== target.name.toLowerCase().trim())
  );
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, updated);

  // 3. Sync deletion to Firestore (direct doc ref + query cleanup for mismatched IDs)
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'destinations', id)).catch(() => {});

      const snap = await getDocs(collection(db, 'destinations')).catch(() => null);
      if (snap && !snap.empty) {
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (
            docSnap.id === id ||
            data.id === id ||
            (target?.name && data.name && data.name.toLowerCase().trim() === target.name.toLowerCase().trim()) ||
            (target?.heroImage && data.heroImage === target.heroImage)
          ) {
            await deleteDoc(docSnap.ref).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.warn('Firestore delete offline/delayed, deletion preserved locally:', error);
    }
  }
};

// ==========================================
// TRAVEL ADVISORIES CRUD
// ==========================================

export const mergeAdvisories = (cloudItems: TravelAdvisory[]): TravelAdvisory[] => {
  const deletedIds = getDeletedIds(DELETED_ADVISORIES_KEY);
  const localItems = getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);

  const isDeleted = (a: TravelAdvisory) => {
    if (!a || !a.id) return true;
    if (deletedIds.has(a.id)) return true;
    if (a.title && deletedIds.has(a.title.toLowerCase().trim())) return true;
    return false;
  };

  const activeCloud = (cloudItems || []).filter((item) => !isDeleted(item));

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const merged: TravelAdvisory[] = [];

  for (const local of localItems) {
    if (isDeleted(local)) continue;
    const titleKey = (local.title || '').toLowerCase().trim();
    if (seenIds.has(local.id) || (titleKey && seenTitles.has(titleKey))) continue;
    merged.push(local);
    seenIds.add(local.id);
    if (titleKey) seenTitles.add(titleKey);
  }

  for (const cloud of activeCloud) {
    if (isDeleted(cloud)) continue;
    const titleKey = (cloud.title || '').toLowerCase().trim();
    if (seenIds.has(cloud.id) || (titleKey && seenTitles.has(titleKey))) continue;
    merged.push(cloud);
    seenIds.add(cloud.id);
    if (titleKey) seenTitles.add(titleKey);
  }

  merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, merged);
  return merged;
};

export const getAdvisories = async (): Promise<TravelAdvisory[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'advisories');
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as TravelAdvisory),
          id: docSnap.id,
        }));
        return mergeAdvisories(items);
      }
    } catch (error) {
      console.warn('Error loading advisories from Firestore:', error);
    }
  }

  return mergeAdvisories([]);
};

export const addAdvisory = async (
  advisory: Omit<TravelAdvisory, 'id' | 'createdAt'>
): Promise<TravelAdvisory> => {
  const newId = 'adv-' + Date.now();
  const newAdv: TravelAdvisory = {
    ...advisory,
    id: newId,
    createdAt: Date.now(),
  };

  removeDeletedId(DELETED_ADVISORIES_KEY, newId);
  if (advisory.title) removeDeletedId(DELETED_ADVISORIES_KEY, advisory.title.toLowerCase().trim());

  const current = getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
  setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, [newAdv, ...current]);

  if (isFirebaseConfigured() && db) {
    try {
      const clean = JSON.parse(JSON.stringify(newAdv));
      const docRef = doc(db, 'advisories', newId);
      await setDoc(docRef, clean, { merge: true });
    } catch (error) {
      console.warn('Error adding advisory to Firestore, saved locally:', error);
    }
  }

  return newAdv;
};

export const deleteAdvisory = async (id: string): Promise<void> => {
  const current = getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
  const target = current.find((a) => a.id === id);

  addDeletedId(DELETED_ADVISORIES_KEY, id);
  if (target && target.title) {
    addDeletedId(DELETED_ADVISORIES_KEY, target.title.toLowerCase().trim());
  }

  setLocalData(
    LOCAL_STORAGE_ADVISORIES_KEY,
    current.filter((a) => a.id !== id && (!target?.title || a.title.toLowerCase().trim() !== target.title.toLowerCase().trim()))
  );

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'advisories', id)).catch(() => {});

      const snap = await getDocs(collection(db, 'advisories')).catch(() => null);
      if (snap && !snap.empty) {
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (
            docSnap.id === id ||
            data.id === id ||
            (target?.title && data.title && data.title.toLowerCase().trim() === target.title.toLowerCase().trim())
          ) {
            await deleteDoc(docSnap.ref).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.warn('Error deleting advisory from Firestore, marked locally:', error);
    }
  }
};

export const toggleAdvisoryActive = async (id: string, isActive: boolean): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'advisories', id);
      await updateDoc(docRef, { isActive });
    } catch (error) {
      console.warn('Error updating advisory status:', error);
    }
  }

  const current = getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
  const updated = current.map((a) => (a.id === id ? { ...a, isActive } : a));
  setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, updated);
};

// ==========================================
// LOCAL EVENTS CRUD
// ==========================================

export const mergeEvents = (cloudItems: LocalEvent[]): LocalEvent[] => {
  const deletedIds = getDeletedIds(DELETED_EVENTS_KEY);
  const localItems = getLocalData<LocalEvent[]>(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);

  const isDeleted = (e: LocalEvent) => {
    if (!e || !e.id) return true;
    if (deletedIds.has(e.id)) return true;
    if (e.title && deletedIds.has(e.title.toLowerCase().trim())) return true;
    return false;
  };

  const activeCloud = (cloudItems || []).filter((item) => !isDeleted(item));

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const merged: LocalEvent[] = [];

  for (const local of localItems) {
    if (isDeleted(local)) continue;
    const titleKey = (local.title || '').toLowerCase().trim();
    if (seenIds.has(local.id) || (titleKey && seenTitles.has(titleKey))) continue;
    merged.push(local);
    seenIds.add(local.id);
    if (titleKey) seenTitles.add(titleKey);
  }

  for (const cloud of activeCloud) {
    if (isDeleted(cloud)) continue;
    const titleKey = (cloud.title || '').toLowerCase().trim();
    if (seenIds.has(cloud.id) || (titleKey && seenTitles.has(titleKey))) continue;
    merged.push(cloud);
    seenIds.add(cloud.id);
    if (titleKey) seenTitles.add(titleKey);
  }

  merged.sort((a, b) => (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0));
  setLocalData(LOCAL_STORAGE_EVENTS_KEY, merged);
  return merged;
};

export const getEvents = async (): Promise<LocalEvent[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'events');
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as LocalEvent),
          id: docSnap.id,
        }));
        return mergeEvents(items);
      }
    } catch (error) {
      console.warn('Error loading events from Firestore:', error);
    }
  }

  return mergeEvents([]);
};

export const addEvent = async (event: Omit<LocalEvent, 'id' | 'createdAt'>): Promise<LocalEvent> => {
  const newId = 'evt-' + Date.now();
  const newEvt: LocalEvent = {
    ...event,
    id: newId,
    createdAt: Date.now(),
  };

  removeDeletedId(DELETED_EVENTS_KEY, newId);
  if (event.title) removeDeletedId(DELETED_EVENTS_KEY, event.title.toLowerCase().trim());

  const current = getLocalData<LocalEvent[]>(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);
  setLocalData(LOCAL_STORAGE_EVENTS_KEY, [newEvt, ...current]);

  if (isFirebaseConfigured() && db) {
    try {
      const clean = JSON.parse(JSON.stringify(newEvt));
      const docRef = doc(db, 'events', newId);
      await setDoc(docRef, clean, { merge: true });
    } catch (error) {
      console.warn('Error adding event to Firestore, saved locally:', error);
    }
  }

  return newEvt;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const current = getLocalData<LocalEvent[]>(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);
  const target = current.find((e) => e.id === id);

  addDeletedId(DELETED_EVENTS_KEY, id);
  if (target && target.title) {
    addDeletedId(DELETED_EVENTS_KEY, target.title.toLowerCase().trim());
  }

  setLocalData(
    LOCAL_STORAGE_EVENTS_KEY,
    current.filter((e) => e.id !== id && (!target?.title || e.title.toLowerCase().trim() !== target.title.toLowerCase().trim()))
  );

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'events', id)).catch(() => {});

      const snap = await getDocs(collection(db, 'events')).catch(() => null);
      if (snap && !snap.empty) {
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (
            docSnap.id === id ||
            data.id === id ||
            (target?.title && data.title && data.title.toLowerCase().trim() === target.title.toLowerCase().trim())
          ) {
            await deleteDoc(docSnap.ref).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.warn('Error deleting event from Firestore, marked locally:', error);
    }
  }
};

// ==========================================
// HERO CAROUSEL CRUD
// ==========================================

export const mergeCarouselSlides = (cloudItems: CarouselSlide[]): CarouselSlide[] => {
  const deletedIds = getDeletedIds(DELETED_CAROUSEL_KEY);
  const localItems = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);

  const isDeleted = (s: CarouselSlide) => {
    if (!s || !s.id) return true;
    if (deletedIds.has(s.id)) return true;
    if (s.imageUrl && deletedIds.has(s.imageUrl)) return true;
    if (s.title && deletedIds.has(s.title.toLowerCase().trim())) return true;
    return false;
  };

  const activeCloud = (cloudItems || []).filter((item) => !isDeleted(item));

  const seenIds = new Set<string>();
  const seenImages = new Set<string>();
  const merged: CarouselSlide[] = [];

  for (const local of localItems) {
    if (isDeleted(local)) continue;
    if (seenIds.has(local.id)) continue;
    if (local.imageUrl && seenImages.has(local.imageUrl)) continue;
    merged.push(local);
    seenIds.add(local.id);
    if (local.imageUrl) seenImages.add(local.imageUrl);
  }

  for (const cloud of activeCloud) {
    if (isDeleted(cloud)) continue;
    if (seenIds.has(cloud.id)) continue;
    if (cloud.imageUrl && seenImages.has(cloud.imageUrl)) continue;
    merged.push(cloud);
    seenIds.add(cloud.id);
    if (cloud.imageUrl) seenImages.add(cloud.imageUrl);
  }

  merged.sort((a, b) => (a.order || 0) - (b.order || 0));
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, merged);
  return merged;
};

export const getCarouselSlides = async (): Promise<CarouselSlide[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'carousel');
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as CarouselSlide),
          id: docSnap.id,
        }));
        return mergeCarouselSlides(items);
      }
    } catch (error) {
      console.warn('Error fetching carousel from Firestore:', error);
    }
  }

  return mergeCarouselSlides([]);
};

export const addCarouselSlide = async (
  slide: Omit<CarouselSlide, 'id' | 'createdAt'>
): Promise<CarouselSlide> => {
  const timestamp = Date.now();
  const newId = 'slide-' + timestamp;
  const newSlide: CarouselSlide = {
    ...slide,
    id: newId,
    createdAt: timestamp,
  };

  removeDeletedId(DELETED_CAROUSEL_KEY, newId);
  if (slide.imageUrl) removeDeletedId(DELETED_CAROUSEL_KEY, slide.imageUrl);
  if (slide.title) removeDeletedId(DELETED_CAROUSEL_KEY, slide.title.toLowerCase().trim());

  // 1. Immediately save to local persistent store so it survives hard refreshes
  const current = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  const updated = [...current.filter((s) => s.id !== newId), newSlide].sort((a, b) => a.order - b.order);
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, updated);

  // 2. Sync to Firestore with deterministic ID
  if (isFirebaseConfigured() && db) {
    try {
      const clean = JSON.parse(JSON.stringify(newSlide));
      const docRef = doc(db, 'carousel', newId);
      await setDoc(docRef, clean, { merge: true });
    } catch (error) {
      console.warn('Firestore offline/delayed, carousel slide saved locally:', error);
    }
  }

  return newSlide;
};

export const updateCarouselSlide = async (
  id: string,
  slide: Partial<Omit<CarouselSlide, 'id' | 'createdAt'>>
): Promise<void> => {
  removeDeletedId(DELETED_CAROUSEL_KEY, id);
  if (slide.imageUrl) removeDeletedId(DELETED_CAROUSEL_KEY, slide.imageUrl);
  if (slide.title) removeDeletedId(DELETED_CAROUSEL_KEY, slide.title.toLowerCase().trim());

  const current = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  const updated = current
    .map((s) => (s.id === id ? { ...s, ...slide } : s))
    .sort((a, b) => a.order - b.order);
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, updated);

  if (isFirebaseConfigured() && db) {
    try {
      const clean = JSON.parse(JSON.stringify(slide));
      const docRef = doc(db, 'carousel', id);
      await setDoc(docRef, clean, { merge: true });
    } catch (error) {
      console.warn('Error updating carousel slide in Firestore:', error);
    }
  }
};

export const deleteCarouselSlide = async (id: string): Promise<void> => {
  // 1. Mark as permanently deleted by ID, imageUrl and title
  const current = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  const target = current.find((s) => s.id === id);

  addDeletedId(DELETED_CAROUSEL_KEY, id);
  if (target) {
    if (target.imageUrl) addDeletedId(DELETED_CAROUSEL_KEY, target.imageUrl);
    if (target.title) addDeletedId(DELETED_CAROUSEL_KEY, target.title.toLowerCase().trim());
  }

  // 2. Remove from local store immediately
  setLocalData(
    LOCAL_STORAGE_CAROUSEL_KEY,
    current.filter((s) => s.id !== id && (!target?.imageUrl || s.imageUrl !== target.imageUrl))
  );

  // 3. Sync delete to Firestore (direct doc ref + query cleanup for mismatched IDs)
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'carousel', id)).catch(() => {});

      const snap = await getDocs(collection(db, 'carousel')).catch(() => null);
      if (snap && !snap.empty) {
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (
            docSnap.id === id ||
            data.id === id ||
            (target?.imageUrl && data.imageUrl === target.imageUrl) ||
            (target?.title && data.title && data.title.toLowerCase().trim() === target.title.toLowerCase().trim())
          ) {
            await deleteDoc(docSnap.ref).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.warn('Firestore delete offline/delayed, slide deleted locally:', error);
    }
  }
};

export const toggleCarouselSlideActive = async (id: string, currentState: boolean): Promise<void> => {
  await updateCarouselSlide(id, { isActive: !currentState });
};

// ==========================================
// REAL-TIME MUNICIPAL PROFILE SERVICE
// ==========================================

export const getMunicipalProfile = async (): Promise<MunicipalProfile> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'municipalProfile');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as MunicipalProfile;
        setLocalData(LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY, data);
        return data;
      }
    } catch (error) {
      console.warn('Error fetching municipal profile from Firestore:', error);
    }
  }

  return getLocalData<MunicipalProfile>(
    LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY,
    INITIAL_MUNICIPAL_PROFILE
  );
};

export const updateMunicipalProfile = async (
  profileData: Partial<MunicipalProfile>
): Promise<void> => {
  const current = await getMunicipalProfile();
  const updated: MunicipalProfile = {
    ...current,
    ...profileData,
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'municipalProfile');
      await setDoc(docRef, updated, { merge: true });
    } catch (error) {
      console.warn('Error updating municipal profile in Firestore:', error);
    }
  }

  setLocalData(LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY, updated);
};

/**
 * Real-time listener for Municipal Profile.
 * Automatically notifies the UI whenever data is updated in Firestore without code change!
 */
export const subscribeToMunicipalProfile = (
  callback: (profile: MunicipalProfile) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'municipalProfile');
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as MunicipalProfile;
            setLocalData(LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY, data);
            callback(data);
          } else {
            callback(INITIAL_MUNICIPAL_PROFILE);
          }
        },
        (error) => {
          console.warn('Municipal profile snapshot listener error:', error);
          callback(
            getLocalData<MunicipalProfile>(
              LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY,
              INITIAL_MUNICIPAL_PROFILE
            )
          );
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to municipal profile:', err);
    }
  }

  // Fallback for offline or non-Firebase mode
  callback(
    getLocalData<MunicipalProfile>(
      LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY,
      INITIAL_MUNICIPAL_PROFILE
    )
  );
  return () => {};
};

/**
 * Real-time listener for Carousel Slides.
 * Updates all connected landing page hero banners immediately when slides are added/updated!
 */
export const subscribeToCarouselSlides = (
  callback: (slides: CarouselSlide[]) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'carousel');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((docSnap) => ({
              ...(docSnap.data() as CarouselSlide),
              id: docSnap.id,
            }));
            const merged = mergeCarouselSlides(items);
            callback(merged);
          } else {
            callback(mergeCarouselSlides([]));
          }
        },
        (error) => {
          console.warn('Carousel snapshot listener error:', error);
          callback(mergeCarouselSlides([]));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to carousel slides:', err);
    }
  }

  callback(mergeCarouselSlides([]));
  return () => {};
};

/**
 * Real-time listener for Destinations.
 * Immediately syncs new spots, gallery uploads, and edits across Tourism Spots and Detail views!
 */
export const subscribeToDestinations = (
  callback: (destinations: Destination[]) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'destinations');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((docSnap) => ({
              ...(docSnap.data() as Destination),
              id: docSnap.id,
            }));
            const merged = mergeDestinations(items);
            callback(merged);
          } else {
            callback(mergeDestinations([]));
          }
        },
        (error) => {
          console.warn('Destinations snapshot listener error:', error);
          callback(mergeDestinations([]));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to destinations:', err);
    }
  }

  callback(mergeDestinations([]));
  return () => {};
};

/**
 * Real-time listener for Travel Advisories.
 */
export const subscribeToAdvisories = (
  callback: (advisories: TravelAdvisory[]) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'advisories');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((docSnap) => ({
              ...(docSnap.data() as TravelAdvisory),
              id: docSnap.id,
            }));
            const merged = mergeAdvisories(items);
            callback(merged);
          } else {
            callback(mergeAdvisories([]));
          }
        },
        (error) => {
          console.warn('Advisories snapshot error:', error);
          callback(mergeAdvisories([]));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to advisories:', err);
    }
  }

  callback(mergeAdvisories([]));
  return () => {};
};

/**
 * Real-time listener for Local Events & Festivals.
 */
export const subscribeToEvents = (
  callback: (events: LocalEvent[]) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'events');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((docSnap) => ({
              ...(docSnap.data() as LocalEvent),
              id: docSnap.id,
            }));
            const merged = mergeEvents(items);
            callback(merged);
          } else {
            callback(mergeEvents([]));
          }
        },
        (error) => {
          console.warn('Events snapshot error:', error);
          callback(mergeEvents([]));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to events:', err);
    }
  }

  callback(mergeEvents([]));
  return () => {};
};

// ==========================================
// MEDIA LIBRARY REPOSITORY
// ==========================================

export const getMediaLibrary = async (): Promise<string[]> => {
  const local = getLocalData<string[]>(LOCAL_STORAGE_MEDIA_LIBRARY_KEY, INITIAL_USER_UPLOADED_IMAGES);
  const set = new Set<string>([...INITIAL_USER_UPLOADED_IMAGES, ...local]);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'mediaLibrary');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.images)) {
          data.images.forEach((img: string) => img && set.add(img));
        }
      }
    } catch (err) {
      console.warn('Error reading media library from Firestore:', err);
    }
  }

  const result = Array.from(set);
  setLocalData(LOCAL_STORAGE_MEDIA_LIBRARY_KEY, result);
  return result;
};

export const saveMediaLibraryUrl = async (url: string): Promise<void> => {
  if (!url) return;
  const current = getLocalData<string[]>(LOCAL_STORAGE_MEDIA_LIBRARY_KEY, INITIAL_USER_UPLOADED_IMAGES);
  const updated = Array.from(new Set([url, ...current]));
  setLocalData(LOCAL_STORAGE_MEDIA_LIBRARY_KEY, updated);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'mediaLibrary');
      await setDoc(docRef, { images: arrayUnion(url), updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.warn('Error saving media url to Firestore:', err);
    }
  }
};

// ==========================================
// SEED DATABASE HELPER
// ==========================================

export const seedFirestoreDatabase = async (): Promise<{
  destinationsCount: number;
  advisoriesCount: number;
  eventsCount: number;
  carouselCount: number;
  municipalProfileSeeded: boolean;
}> => {
  let dCount = 0;
  let aCount = 0;
  let eCount = 0;
  let cCount = 0;
  let profileSeeded = false;

  // Clear all deleted sets so factory reset restores all records
  setLocalData(DELETED_DESTINATIONS_KEY, []);
  setLocalData(DELETED_CAROUSEL_KEY, []);
  setLocalData(DELETED_EVENTS_KEY, []);
  setLocalData(DELETED_ADVISORIES_KEY, []);

  // Always reset local cache to complete initial set
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
  setLocalData(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  setLocalData(LOCAL_STORAGE_MUNICIPAL_PROFILE_KEY, INITIAL_MUNICIPAL_PROFILE);

  if (isFirebaseConfigured() && db) {
    try {
      // Seed Destinations
      for (const dest of INITIAL_DESTINATIONS) {
        const docRef = doc(db, 'destinations', dest.id);
        await setDoc(docRef, dest, { merge: true });
        dCount++;
      }

      // Seed Advisories
      for (const adv of INITIAL_ADVISORIES) {
        const docRef = doc(db, 'advisories', adv.id);
        await setDoc(docRef, adv, { merge: true });
        aCount++;
      }

      // Seed Events
      for (const evt of INITIAL_EVENTS) {
        const docRef = doc(db, 'events', evt.id);
        await setDoc(docRef, evt, { merge: true });
        eCount++;
      }

      // Seed Carousel
      for (const slide of INITIAL_CAROUSEL_SLIDES) {
        const docRef = doc(db, 'carousel', slide.id);
        await setDoc(docRef, slide, { merge: true });
        cCount++;
      }

      // Seed Municipal Profile
      const profileDocRef = doc(db, 'settings', 'municipalProfile');
      await setDoc(profileDocRef, INITIAL_MUNICIPAL_PROFILE, { merge: true });
      profileSeeded = true;

      console.info(
        `✅ Successfully seeded Firestore with ${dCount} destinations, ${aCount} advisories, ${eCount} events, ${cCount} carousel slides, and Municipal Profile.`
      );
    } catch (error) {
      console.error('Error during Firestore batch seeding:', error);
    }
  }

  return {
    destinationsCount: dCount || INITIAL_DESTINATIONS.length,
    advisoriesCount: aCount || INITIAL_ADVISORIES.length,
    eventsCount: eCount || INITIAL_EVENTS.length,
    carouselCount: cCount || INITIAL_CAROUSEL_SLIDES.length,
    municipalProfileSeeded: profileSeeded,
  };
};
