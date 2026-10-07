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
  stars: number; // 0, 1, 2, 3 (or 1 if bonus)
  photoDataUrl?: string; // stored in IndexedDB or Base64
  photoUrl?: string; // remote Supabase URL
  timestamp?: string;
  notes?: string;
}

export interface RankInfo {
  minStars: number;
  maxStars: number;
  title: string;
  badge: string;
  description: string;
  color: string;
}
