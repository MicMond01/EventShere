export type EventType =
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
