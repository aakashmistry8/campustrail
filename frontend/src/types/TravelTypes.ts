export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  date: string; // ISO date string
  verified: boolean; // verified participation
  helpful: number; // number of helpful votes
  images?: string[]; // optional review images
}

export interface Itinerary {
  id: string;
  title: string;
  creator: string;
  dates: string;
  stops: string[];
  notes: string;
  seats: number;
}

export interface ItineraryDetails extends Itinerary {
  fullDescription: string;
  price: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
  duration: string;
  distance?: string;
  elevation?: string;
  accommodation: string[];
  included: string[];
  excluded: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    accommodation?: string;
    meals?: string[];
  }>;
  packingList: string[];
  requirements: string[];
  images: string[];
  avgRating?: number;
  reviewCount?: number;
  reviews: Review[];
  tags: string[];
  meetingPoint: string;
  emergencyContact: string;
  cancellationPolicy: string;
  groupSize: {
    min: number;
    max: number;
    current: number;
  };
}

export interface Companion {
  id: string;
  name: string;
  trip: string;
  dates: string;
  prefs: string[];
  seats: number;
}

export interface CompanionDetails extends Companion {
  fullBio: string;
  age?: number;
  location: string;
  languages: string[];
  travelStyle: string[];
  experience: {
    totalTrips: number;
    countries: number;
    specialties: string[];
  };
  availability: {
    flexible: boolean;
    preferredDates: string[];
    duration: string;
  };
  budget: {
    range: string;
    splitPreference: string[];
  };
  accommodation: string[];
  transportation: string[];
  interests: string[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  verifications: {
    email: boolean;
    phone: boolean;
    government_id: boolean;
  };
  images: string[];
  avgRating?: number;
  reviewCount?: number;
  reviews: Review[];
  tags: string[];
  lastActive: string;
  responseRate: number;
  responseTime: string;
}
