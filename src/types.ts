export type RoomType = 
  | 'singola' 
  | 'doppia' 
  | 'monolocale' 
  | 'bilocale' 
  | 'posto_letto';

export type MetroLine = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export type University = 
  | 'PoliMi Leonardo' 
  | 'PoliMi Bovisa' 
  | 'Bocconi' 
  | 'Statale (Festa del Perdono)' 
  | 'Cattolica' 
  | 'Bicocca' 
  | 'IULM' 
  | 'NABA / Marangoni';

export const MILAN_UNIVERSITIES: University[] = [
  'PoliMi Leonardo',
  'PoliMi Bovisa',
  'Bocconi',
  'Statale (Festa del Perdono)',
  'Cattolica',
  'Bicocca',
  'IULM',
  'NABA / Marangoni'
];

export interface Listing {
  id: string;
  title: string;
  roomType: RoomType;
  price: number; // in Euros
  billsIncluded: boolean;
  billsEstimate?: number;
  depositMonths: number;
  zone: string;
  address: string;
  metroStation: string;
  metroLine: MetroLine;
  metroWalkingMinutes: number;
  availableFrom: string;
  minStayMonths: number;
  photos: string[];
  description: string;
  contractType: 'Transitorio Studenti' | '4+4 Cedolare Secca' | '3+2 Canone Concordato' | 'Sublocazione Autorizzata';
  landlordType: 'Privato' | 'Coinquilino' | 'Agenzia';
  authorName: string;
  authorAvatar: string;
  authorFbProfileUrl?: string;
  externalListingUrl?: string;
  source?: 'immobiliare' | 'facebook' | 'diretto';
  verified: boolean;
  targetUniversities: University[];
  amenities: {
    wifi: boolean;
    desk: boolean;
    washingMachine: boolean;
    balcony: boolean;
    airConditioning: boolean;
    elevator: boolean;
    privateBathroom: boolean;
    dishwasher: boolean;
  };
  genderPreference: 'tutti' | 'solo_ragazze' | 'solo_ragazzi';
  createdAt: string;
}

export interface SeekerProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'Studente' | 'Lavoratore' | 'Dottorando' | 'Stagista';
  universityOrCompany: string;
  budgetMax: number;
  preferredRoomType: RoomType;
  targetZones: string[];
  moveInDate: string;
  durationMonths: number;
  bio: string;
  smoking: boolean;
  pets: boolean;
  hasGuarantor: boolean;
  fbProfileUrl?: string;
  verified: boolean;
  createdAt: string;
}

export interface ScamAnalysisResult {
  riskLevel: 'SAFE' | 'CAUTION' | 'HIGH_RISK_SCAM';
  score: number;
  verdict: string;
  redFlags: string[];
  positiveSigns: string[];
  priceAssessment: string;
  actionAdvice: string[];
}

export interface MilanZoneInfo {
  id: string;
  name: string;
  averageSingleRoom: number;
  averageStudio: number;
  metroLines: MetroLine[];
  vibe: string;
  universitiesNearby: string[];
  description: string;
  pros: string[];
}

export type UserRole = 'student' | 'worker' | 'landlord' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  isAdmin?: boolean;
  university?: string;
  phone?: string;
  bio?: string;
  savedListingIds?: string[];
  createdAt?: string;
}
