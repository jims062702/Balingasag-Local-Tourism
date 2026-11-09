// All 30 official barangays of Balingasag, Misamis Oriental (ZIP 9005)
export const BALINGASAG_BARANGAYS = [
  'Balagnan',
  'Baliwagan',
  'Barangay 1 (Poblacion)',
  'Barangay 2 (Poblacion)',
  'Barangay 3 (Poblacion)',
  'Barangay 4 (Poblacion)',
  'Barangay 5 (Poblacion)',
  'Barangay 6 (Poblacion)',
  'Binitinan',
  'Blanco',
  'Calawag',
  'Camuayan',
  'Cogon',
  'Dansuli',
  'Dumarait',
  'Hermano',
  'Kibanban',
  'Linabu',
  'Linggangao',
  'Mambayaan',
  'Mandangoa',
  'Napaliran',
  'Quezon',
  'Rosario',
  'Samay',
  'San Francisco',
  'San Isidro',
  'San Juan',
  'Talusan',
  'Waterfall',
] as const;

export type Barangay = (typeof BALINGASAG_BARANGAYS)[number];

export const CATEGORIES = [
  'All',
  'Heritage & Culture',
  'Nature & Waterfalls',
  'Coastal & Marine',
  'Eco Parks & Springs',
  'Agro-Tourism & Delicacies',
] as const;

export type DestinationCategory = (typeof CATEGORIES)[number];

export interface ItineraryStep {
  time: string;
  activity: string;
  notes?: string;
}

export interface Destination {
  id: string;
  name: string;
  category: Exclude<DestinationCategory, 'All'>;
  barangay: Barangay;
  description: string;
  shortDescription: string;
  heroImage: string;
  gallery: string[];
  itinerary: ItineraryStep[];
  // Strictly informational inclusions / traveler guidance (NO pricing / NO booking / NO workers)
  inclusions: string[];
  bestTimeToVisit: string;
  howToGetThere: string;
  contactLGU: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  featured: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TravelAdvisory {
  id: string;
  title: string;
  severity: 'info' | 'advisory' | 'warning';
  message: string;
  issuedBy: string;
  date: string;
  isActive: boolean;
  createdAt: number;
}

export interface LocalEvent {
  id: string;
  title: string;
  category: 'Festival' | 'Cultural' | 'Civic' | 'Eco-Tourism';
  date: string;
  time?: string;
  location: string;
  barangay: Barangay;
  description: string;
  imageUrl: string;
  organizer: string;
  createdAt: number;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: number;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  precipitationProbability?: number;
  lastUpdated: string;
}

export interface MunicipalProfile {
  id?: string;
  barangaysCount: number;
  urbanCount: number;
  urbanizingCount: number;
  ruralCount: number;
  population: number;
  populationYear: string;
  populationProvinceShare: string;
  populationRegionShare: string;
  landAreaHectares: number;
  landAreaDescription: string;
  headlineTitle: string;
  headlineSubtitle: string;
  spanishHeritageNote: string;
  psaCertifiedNote: string;
  updatedAt: number;
}
