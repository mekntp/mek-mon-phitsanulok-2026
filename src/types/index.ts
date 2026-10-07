export interface Place {
  id: number;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  highlights: string[];
  googleMapsQuery: string;
  googleMapsUrl: string;
  isFavoriteForKids?: boolean;
}

export interface PhotoMission {
  id: number;
  title: string;
  icon: string;
  hint: string;
  isBonus?: boolean;
  relatedPlaceId?: number;
}

export interface MissionState {
  missionId: number;
  completed: boolean;
  stars: number;
  photos?: string[];
  photoUrls?: string[];
  photoDataUrl?: string;
  photoUrl?: string;
  timestamp?: string;
  notes?: string;
}

export interface TripJournal {
  note: string;
  updatedAt?: string;
}

export interface RankInfo {
  minStars: number;
  maxStars: number;
  title: string;
  badge: string;
  description: string;
  color: string;
}
