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

// ==========================================
// DESTINATIONS CRUD
// ==========================================

export const getDestinations = async (): Promise<Destination[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'destinations');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Destination),
          id: docSnap.id,
        }));
        // Update local cache
        setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, items);
        return items;
      } else {
        // If Firestore is empty, seed it with the initial Balingasag items
        console.info('Firestore destinations empty. Seeding initial attractions...');
        await seedFirestoreDatabase();
        return INITIAL_DESTINATIONS;
      }
    } catch (error) {
      console.warn('Error reading from Firestore, falling back to local storage:', error);
    }
  }

  return getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
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

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'destinations');
      const docRef = await addDoc(colRef, {
        ...newDestination,
        serverCreatedAt: serverTimestamp(),
      });
      newDestination.id = docRef.id;
    } catch (error) {
      console.warn('Error adding to Firestore, saving to local store:', error);
    }
  }

  // Update local store
  const current = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  const updated = [newDestination, ...current];
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, updated);

  return newDestination;
};

export const updateDestination = async (
  id: string,
  data: Partial<Omit<Destination, 'id' | 'createdAt'>>
): Promise<Destination> => {
  const currentList = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  const index = currentList.findIndex((d) => d.id === id);

  if (index === -1) {
    throw new Error(`Destination with id "${id}" not found.`);
  }

  const updatedItem: Destination = {
    ...currentList[index],
    ...data,
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'destinations', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.warn('Error updating Firestore document:', error);
    }
  }

  currentList[index] = updatedItem;
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, currentList);

  return updatedItem;
};

export const deleteDestination = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'destinations', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Error deleting from Firestore:', error);
    }
  }

  const currentList = getLocalData<Destination[]>(LOCAL_STORAGE_DESTINATIONS_KEY, INITIAL_DESTINATIONS);
  const updated = currentList.filter((d) => d.id !== id);
  setLocalData(LOCAL_STORAGE_DESTINATIONS_KEY, updated);
};

// ==========================================
// TRAVEL ADVISORIES CRUD
// ==========================================

export const getAdvisories = async (): Promise<TravelAdvisory[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'advisories');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as TravelAdvisory),
          id: docSnap.id,
        }));
        setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, items);
        return items;
      }
    } catch (error) {
      console.warn('Error loading advisories from Firestore:', error);
    }
  }

  return getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
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

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'advisories');
      const docRef = await addDoc(colRef, newAdv);
      newAdv.id = docRef.id;
    } catch (error) {
      console.warn('Error adding advisory to Firestore:', error);
    }
  }

  const current = getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
  setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, [newAdv, ...current]);
  return newAdv;
};

export const deleteAdvisory = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'advisories', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Error deleting advisory from Firestore:', error);
    }
  }

  const current = getLocalData<TravelAdvisory[]>(LOCAL_STORAGE_ADVISORIES_KEY, INITIAL_ADVISORIES);
  setLocalData(LOCAL_STORAGE_ADVISORIES_KEY, current.filter((a) => a.id !== id));
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

export const getEvents = async (): Promise<LocalEvent[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'events');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as LocalEvent),
          id: docSnap.id,
        }));
        setLocalData(LOCAL_STORAGE_EVENTS_KEY, items);
        return items;
      }
    } catch (error) {
      console.warn('Error loading events from Firestore:', error);
    }
  }

  return getLocalData<LocalEvent[]>(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);
};

export const addEvent = async (event: Omit<LocalEvent, 'id' | 'createdAt'>): Promise<LocalEvent> => {
  const newId = 'evt-' + Date.now();
  const newEvt: LocalEvent = {
    ...event,
    id: newId,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'events');
      const docRef = await addDoc(colRef, newEvt);
      newEvt.id = docRef.id;
    } catch (error) {
      console.warn('Error adding event to Firestore:', error);
    }
  }

  const current = getLocalData<LocalEvent[]>(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);
  setLocalData(LOCAL_STORAGE_EVENTS_KEY, [newEvt, ...current]);
  return newEvt;
};

export const deleteEvent = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'events', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Error deleting event from Firestore:', error);
    }
  }

  const current = getLocalData<LocalEvent[]>(LOCAL_STORAGE_EVENTS_KEY, INITIAL_EVENTS);
  setLocalData(LOCAL_STORAGE_EVENTS_KEY, current.filter((e) => e.id !== id));
};

// ==========================================
// HERO CAROUSEL CRUD
// ==========================================

export const getCarouselSlides = async (): Promise<CarouselSlide[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'carousel');
      const q = query(colRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as CarouselSlide),
          id: docSnap.id,
        }));
        setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, items);
        return items;
      }
    } catch (error) {
      console.warn('Error fetching carousel from Firestore:', error);
    }
  }

  return getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
};

export const addCarouselSlide = async (
  slide: Omit<CarouselSlide, 'id' | 'createdAt'>
): Promise<CarouselSlide> => {
  const newId = 'slide-' + Date.now();
  const newSlide: CarouselSlide = {
    ...slide,
    id: newId,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'carousel');
      const docRef = await addDoc(colRef, newSlide);
      newSlide.id = docRef.id;
    } catch (error) {
      console.warn('Error adding carousel slide to Firestore:', error);
    }
  }

  const current = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  const updated = [...current, newSlide].sort((a, b) => a.order - b.order);
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, updated);
  return newSlide;
};

export const updateCarouselSlide = async (
  id: string,
  slide: Partial<Omit<CarouselSlide, 'id' | 'createdAt'>>
): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'carousel', id);
      await updateDoc(docRef, slide);
    } catch (error) {
      console.warn('Error updating carousel slide in Firestore:', error);
    }
  }

  const current = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  const updated = current
    .map((s) => (s.id === id ? { ...s, ...slide } : s))
    .sort((a, b) => a.order - b.order);
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, updated);
};

export const deleteCarouselSlide = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'carousel', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Error deleting carousel slide from Firestore:', error);
    }
  }

  const current = getLocalData<CarouselSlide[]>(LOCAL_STORAGE_CAROUSEL_KEY, INITIAL_CAROUSEL_SLIDES);
  setLocalData(LOCAL_STORAGE_CAROUSEL_KEY, current.filter((s) => s.id !== id));
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
