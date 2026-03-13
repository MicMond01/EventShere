/**
 * Re-export all shared types from the monorepo.
 * Client-specific types are also added here.
 */
export type {
  IUser,
  IUserProfile,
  ISocialScore,
  IScoreHistoryEntry,
  UserRole,
  UserStatus,
  ScoreTier,
} from "@eventshere/shared";

export type {
  IVenue,
  IVenuePricing,
  IVenueMedia,
  IVenueReview,
  VenueType,
  VenueStatus,
  MediaType,
} from "@eventshere/shared";

export type {
  IEvent,
  ICoPlanner,
  IRunsheetItem,
  EventType,
  EventStatus,
  EventVisibility,
  SeatingMode,
  ScoreInfluence,
  CoPlannerPermission,
} from "@eventshere/shared";

export type {
  IGuest,
  ISeatAssignment,
  GuestCategory,
  RsvpStatus,
} from "@eventshere/shared";

export type {
  IBooking,
} from "@eventshere/shared";

export type {
  IRating,
} from "@eventshere/shared";

export type {
  ILayout,
  ISceneData,
  ISceneObject,
  IZone,
  ISeat,
  IVec3,
  ZoneType,
} from "@eventshere/shared";

/* ── Client-only types ── */

export interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
