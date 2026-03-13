/** API base URL — the Vite proxy handles /api → server */
export const API_BASE_URL = "/api/v1";

/** Application name */
export const APP_NAME = "EventShere";

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Social score tiers and their display labels */
export const SCORE_TIER_LABELS = {
  platinum: "Platinum Guest",
  gold: "Gold Guest",
  standard: "Standard Guest",
  low_rated: "Low-Rated Guest",
  flagged: "Flagged Guest",
} as const;
