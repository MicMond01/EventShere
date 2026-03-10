export type VenueType =
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
