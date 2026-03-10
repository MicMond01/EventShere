export const SCORE_TIERS = {
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
