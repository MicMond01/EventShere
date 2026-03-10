/**
 * EventShere — shared Setup Script
 * 
 * HOW TO USE:
 *   1. Place this file inside your "shared" folder
 *   2. Open Command Prompt in that folder
 *   3. Run: node setup.js
 */

const fs   = require('fs');
const path = require('path');
const BASE = process.cwd();
const files = [
  { p: "src/index.ts", c: `export * from './types/user.types';
export * from './types/venue.types';
export * from './types/event.types';
export * from './types/guest.types';
export * from './types/booking.types';
export * from './types/rating.types';
export * from './types/layout.types';
export * from './constants';
` },
  { p: "src/constants/index.ts", c: `export const SCORE_TIERS = {
  PLATINUM:  { min: 800, max: 1000, label: 'Platinum'  },
  GOLD:      { min: 650, max: 799,  label: 'Gold'      },
  STANDARD:  { min: 450, max: 649,  label: 'Standard'  },
  LOW_RATED: { min: 200, max: 449,  label: 'Low Rated' },
  FLAGGED:   { min: 0,   max: 199,  label: 'Flagged'   },
} as const;

export const DEFAULT_SOCIAL_SCORE = 500;

export const PLATFORM_COMMISSION_RATE = 0.10; // 10%

export const RATING_WINDOW_OPEN_HOURS  = 2;  // opens 2h after event starts
export const RATING_WINDOW_CLOSE_HOURS = 48; // closes 48h after event ends

export const MIN_RATERS_FOR_SCORE_UPDATE = 3;

export const SCORE_DECAY_INACTIVE_MONTHS = 6;

export const GUEST_CATEGORY_PRIORITY: Record<string, number> = {
  vip:          1,
  dignitary:    1,
  family:       2,
  general:      3,
  press:        4,
  vendor_staff: 5,
};

export const ZONE_CATEGORY_MAP: Record<string, string[]> = {
  high_table: ['vip', 'dignitary'],
  seating:    ['family', 'general'],
  stage:      [],
  vendor:     ['vendor_staff'],
  photography:['press'],
};
` },
  { p: "src/types/booking.types.ts", c: `export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'counter_offered'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface IBooking {
  id: string;
  venueId: string;
  eventId: string;
  plannerId: string;
  status: BookingStatus;
  totalAmount: number;
  platformFee: number;
  paymentStatus: PaymentStatus;
  eventDate: string;
  message?: string;
  specialRequirements?: string;
  paystackRef?: string;
  createdAt: Date;
  updatedAt: Date;
}
` },
  { p: "src/types/event.types.ts", c: `export type EventType =
  | 'wedding'
  | 'conference'
  | 'birthday'
  | 'product_launch'
  | 'concert'
  | 'funeral_reception'
  | 'baby_shower'
  | 'graduation'
  | 'award_ceremony'
  | 'religious_gathering'
  | 'custom';

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

export type EventVisibility = 'public' | 'private' | 'unlisted';

export type SeatingMode = 'automatic' | 'manual' | 'hybrid';

export type ScoreInfluence = 'off' | 'low' | 'medium' | 'high';

export type CoPlannerPermission = 'viewer' | 'editor' | 'admin';

export interface IEvent {
  id: string;
  plannerId: string;
  venueId?: string;
  name: string;
  type: EventType;
  description?: string;
  startTime: Date;
  endTime: Date;
  visibility: EventVisibility;
  status: EventStatus;
  maxGuests: number;
  rsvpDeadline?: Date;
  coverImageUrl?: string;
  slug: string;
  seatingMode: SeatingMode;
  scoreInfluence: ScoreInfluence;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoPlanner {
  eventId: string;
  userId: string;
  permission: CoPlannerPermission;
}

export interface IRunsheetItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  scheduledAt?: Date;
  assignedTo?: string;
  isCompleted: boolean;
  sortOrder: number;
}
` },
  { p: "src/types/guest.types.ts", c: `export type GuestCategory =
  | 'vip'
  | 'dignitary'
  | 'family'
  | 'general'
  | 'press'
  | 'vendor_staff';

export type RsvpStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'tentative'
  | 'waitlisted';

export interface IGuest {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  category: GuestCategory;
  rsvpStatus: RsvpStatus;
  checkedIn: boolean;
  checkedInAt?: Date;
  qrCode?: string;
  notes?: string;
  dietaryReq?: string;
  accessibilityReq?: string;
  createdAt: Date;
}

export interface ISeatAssignment {
  id: string;
  guestId: string;
  eventId: string;
  seatLabel: string;
  zoneName?: string;
  assignedBy: 'algorithm' | 'manual';
  assignedAt: Date;
}
` },
  { p: "src/types/layout.types.ts", c: `export type ZoneType =
  | 'seating'
  | 'high_table'
  | 'stage'
  | 'dance_floor'
  | 'vendor'
  | 'walkway'
  | 'registration'
  | 'photography'
  | 'custom';

export interface ILayout {
  id: string;
  eventId: string;
  name: string;
  versionNumber: number;
  isActive: boolean;
  sceneData: ISceneData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISceneData {
  objects: ISceneObject[];
  zones: IZone[];
  seats: ISeat[];
  venueModelUrl?: string;
  gridSize: number;
}

export interface ISceneObject {
  id: string;
  type: string;
  position: IVec3;
  rotation: IVec3;
  scale: IVec3;
  label?: string;
  isLocked: boolean;
}

export interface IZone {
  id: string;
  name: string;
  type: ZoneType;
  color: string;
  vertices: { x: number; z: number }[];
}

export interface ISeat {
  id: string;
  seatLabel: string;
  zoneId: string;
  category: string;
  position: IVec3;
  isAccessible: boolean;
}

export interface IVec3 {
  x: number;
  y: number;
  z: number;
}
` },
  { p: "src/types/rating.types.ts", c: `export interface IRating {
  id: string;
  raterId: string;
  rateeId: string;
  eventId: string;
  conductScore: number;
  socialScore: number;
  punctualityScore: number;
  attireScore: number;
  overallScore: number;
  comment?: string;
  isFlagged: boolean;
  createdAt: Date;
}
` },
  { p: "src/types/user.types.ts", c: `export type UserRole = 'venue_owner' | 'planner' | 'guest' | 'vendor' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';

export type ScoreTier = 'platinum' | 'gold' | 'standard' | 'low_rated' | 'flagged';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  userId: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  phone?: string;
  socialScore: number;
  scoreTier: ScoreTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISocialScore {
  userId: string;
  currentScore: number;
  tier: ScoreTier;
  lastCalculatedAt: Date;
  scoreHistory: IScoreHistoryEntry[];
}

export interface IScoreHistoryEntry {
  score: number;
  tier: ScoreTier;
  calculatedAt: string;
}
` },
  { p: "src/types/venue.types.ts", c: `export type VenueType =
  | 'hall'
  | 'conference_center'
  | 'outdoor_garden'
  | 'rooftop'
  | 'banquet_room'
  | 'amphitheatre'
  | 'warehouse'
  | 'church_hall'
  | 'hotel_ballroom'
  | 'community_center';

export type VenueStatus = 'draft' | 'pending_review' | 'active' | 'suspended';

export type MediaType = 'photo' | 'video' | 'floor_plan' | 'model_3d' | 'panorama';

export interface IVenue {
  id: string;
  ownerId: string;
  name: string;
  shortDesc?: string;
  fullDesc?: string;
  type: VenueType;
  address: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
  seatedCapacity: number;
  standingCapacity?: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
  amenities: string[];
  pricing: IVenuePricing;
  status: VenueStatus;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  minNoticeHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVenuePricing {
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  currency: string;
  securityDeposit?: number;
  cleaningFee?: number;
}

export interface IVenueMedia {
  id: string;
  venueId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  sortOrder: number;
  createdAt: Date;
}

export interface IVenueReview {
  id: string;
  venueId: string;
  reviewerId: string;
  eventId?: string;
  cleanliness: number;
  capacityAccuracy: number;
  staffHelpfulness: number;
  amenityAccuracy: number;
  overall: number;
  comment?: string;
  ownerResponse?: string;
  createdAt: Date;
}
` },
  { p: "package.json", c: `{
  "name": "@eventshere/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
` },
  { p: "tsconfig.json", c: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
` },
];

let created=0, skipped=0, failed=0;
console.log("\nCreating files in: " + BASE + "\n");
for (const file of files) {
  try {
    const full = path.join(BASE, file.p);
    const dir  = path.dirname(full);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(full)) { console.log("  SKIP   " + file.p); skipped++; }
    else { fs.writeFileSync(full, file.c, 'utf8'); console.log("  CREATE " + file.p); created++; }
  } catch(e) { console.log("  ERROR  " + file.p + " -> " + e.message); failed++; }
}
console.log("\n========================================");
console.log("Created: " + created + "  Skipped: " + skipped + "  Failed: " + failed);
console.log("========================================\n");
