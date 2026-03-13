/**
 * Central route path constants.
 * Using a single source of truth avoids typos in path strings.
 */
export const ROUTE_PATHS = {
  // Public
  HOME: "/",
  VENUES: "/venues",
  VENUE_PROFILE: "/venues/:id",
  EVENTS: "/events",
  EVENT_PUBLIC: "/events/:slug",
  PRICING: "/pricing",
  ABOUT: "/about",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email/:token",

  // Planner
  PLANNER_DASHBOARD: "/planner/dashboard",
  PLANNER_CREATE_EVENT: "/planner/events/create",
  PLANNER_EVENT_DETAIL: "/planner/events/:id",
  PLANNER_GUESTS: "/planner/events/:id/guests",
  PLANNER_VENDORS: "/planner/events/:id/vendors",
  PLANNER_RUNSHEET: "/planner/events/:id/runsheet",
  PLANNER_INVITATIONS: "/planner/events/:id/invitations",
  PLANNER_EVENT_SETTINGS: "/planner/events/:id/settings",

  // Venue Owner
  VENUE_DASHBOARD: "/venue-owner/dashboard",
  VENUE_LISTINGS: "/venue-owner/venues",
  VENUE_CREATE: "/venue-owner/venues/create",
  VENUE_EDIT: "/venue-owner/venues/:id/edit",
  VENUE_BOOKINGS: "/venue-owner/bookings",
  VENUE_ANALYTICS: "/venue-owner/analytics",

  // Guest
  GUEST_DASHBOARD: "/guest/dashboard",
  GUEST_MY_EVENTS: "/guest/events",
  GUEST_PROFILE: "/guest/profile",
  GUEST_SEAT_FINDER: "/guest/events/:eventId/seat",
  GUEST_RATING: "/guest/events/:eventId/rate",
  GUEST_REGISTER_EVENT: "/guest/events/:eventId/register",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_VENUE_APPROVAL: "/admin/venues/approval",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_RATINGS: "/admin/ratings",
  ADMIN_FINANCIALS: "/admin/financials",
  ADMIN_SYSTEM: "/admin/system",
  ADMIN_KYC: "/admin/kyc",

  // Layout Planner (full-screen)
  LAYOUT_EDITOR: "/planner/events/:id/layout",
  LAYOUT_PREVIEW: "/planner/events/:id/layout/preview",
} as const;
