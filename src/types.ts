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
  source?: 'immobiliare' | 'facebook' | 'diretto' | 'admin';
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

export type AdBannerPosition = 'header' | 'feed' | 'listing_modal' | 'footer' | 'custom';

export type AdBannerType = 'adsense' | 'code' | 'image' | 'text';

export interface AdSenseBanner {
  id: string;
  name: string;
  type?: AdBannerType; // 'adsense' | 'code' | 'image' | 'text' (defaults to 'adsense')
  position: AdBannerPosition;
  slotId?: string; // for adsense
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  responsive?: boolean;
  
  // For 'code' banner:
  customSnippet?: string; // HTML, JS, iFrame or AdSense script snippet

  // For 'image' banner:
  imageUrl?: string;
  targetUrl?: string; // Destination link URL
  imageAlt?: string;
  badgeText?: string; // e.g. "Sponsor", "Partner", "Promo"
  openInNewTab?: boolean;

  // For 'text' banner:
  title?: string;
  description?: string;
  ctaText?: string; // e.g. "Scopri l'offerta →"

  active: boolean;
}

export interface AdSenseConfig {
  enabled: boolean;
  publisherId: string; // e.g. "ca-pub-1234567890123456"
  testMode: boolean;   // visual placeholder mode for previewing
  banners: AdSenseBanner[];
  updatedAt?: string;
  updatedBy?: string;
}

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
  newsletterSubscribed?: boolean;
  createdAt?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  role?: UserRole | 'seeker' | 'generic';
  active: boolean;
  preferredZones?: string[];
  maxBudget?: number;
  roomTypes?: RoomType[];
  receiveNewListings: boolean;
  receiveWeeklyNewsletter: boolean;
  receiveAdminAlerts: boolean;
  subscribedAt: string;
  source?: 'portal_footer' | 'popup_modal' | 'profile_optin' | 'manual_admin';
  lastNotifiedAt?: string;
}

export type NotificationType = 'new_listing' | 'newsletter' | 'system' | 'scam_alert' | 'urgent';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetAudience: 'all' | 'students' | 'workers' | 'landlords' | 'subscribers';
  link?: string;
  listingId?: string;
  createdAt: string;
  authorName?: string;
  readBy?: string[]; // user UIDs who marked this notification as read
}

export interface Newsletter {
  id: string;
  subject: string;
  previewText?: string;
  content: string;
  featuredListingIds?: string[];
  targetAudience: 'all' | 'students' | 'workers' | 'landlords' | 'subscribers';
  sentAt: string;
  sentBy: string;
  recipientCount: number;
  status: 'draft' | 'sent';
}

