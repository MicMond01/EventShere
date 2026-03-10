// ── Social Score ──────────────────────────────────────────────────────────
export const SCORE_TIERS = {
  PLATINUM: { min: 800, max: 1000, label: "Platinum" },
  GOLD: { min: 650, max: 799, label: "Gold" },
  STANDARD: { min: 450, max: 649, label: "Standard" },
  LOW_RATED: { min: 200, max: 449, label: "Low Rated" },
  FLAGGED: { min: 0, max: 199, label: "Flagged" },
} as const;

export const DEFAULT_SOCIAL_SCORE = 500;
export const PLATFORM_COMMISSION_RATE = 0.1; // 10%
export const RATING_WINDOW_OPEN_HOURS = 2; // opens 2h after event starts
export const RATING_WINDOW_CLOSE_HOURS = 48; // closes 48h after event ends
export const MIN_RATERS_FOR_SCORE_UPDATE = 3;
export const SCORE_DECAY_INACTIVE_MONTHS = 6;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;

export const GUEST_CATEGORY_PRIORITY: Record<string, number> = {
  vip: 1,
  dignitary: 1,
  family: 2,
  general: 3,
  press: 4,
  vendor_staff: 5,
};

export const ZONE_CATEGORY_MAP: Record<string, string[]> = {
  high_table: ["vip", "dignitary"],
  seating: ["family", "general"],
  stage: [],
  vendor: ["vendor_staff"],
  photography: ["press"],
};

// ── Currencies (ISO 4217) ──────────────────────────────────────────────────
export type CurrencyCode =
  | "NGN"
  | "USD"
  | "GBP"
  | "EUR"
  | "KES"
  | "GHS"
  | "ZAR"
  | "XOF"
  | "UGX"
  | "TZS"
  | "RWF"
  | "ETB"
  | "EGP"
  | "MAD"
  | "TND"
  | "XAF"
  | "CAD"
  | "AUD"
  | "AED"
  | "INR"
  | "JPY"
  | "CNY"
  | "BRL";

export type PaymentGateway = "paystack" | "flutterwave" | "stripe";

export const SUPPORTED_CURRENCIES: Record<
  CurrencyCode,
  {
    name: string;
    symbol: string;
    decimals: number;
    gateway: PaymentGateway;
  }
> = {
  // ── Paystack markets ─────────────────────────────────
  NGN: {
    name: "Nigerian Naira",
    symbol: "₦",
    decimals: 2,
    gateway: "paystack",
  },
  GHS: {
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    decimals: 2,
    gateway: "paystack",
  },
  KES: {
    name: "Kenyan Shilling",
    symbol: "KSh",
    decimals: 2,
    gateway: "paystack",
  },
  ZAR: {
    name: "South African Rand",
    symbol: "R",
    decimals: 2,
    gateway: "paystack",
  },
  // ── Flutterwave markets ───────────────────────────────
  XOF: {
    name: "West African CFA Franc",
    symbol: "CFA",
    decimals: 0,
    gateway: "flutterwave",
  },
  XAF: {
    name: "Central African CFA",
    symbol: "CFA",
    decimals: 0,
    gateway: "flutterwave",
  },
  UGX: {
    name: "Ugandan Shilling",
    symbol: "USh",
    decimals: 0,
    gateway: "flutterwave",
  },
  TZS: {
    name: "Tanzanian Shilling",
    symbol: "TSh",
    decimals: 2,
    gateway: "flutterwave",
  },
  RWF: {
    name: "Rwandan Franc",
    symbol: "Fr",
    decimals: 0,
    gateway: "flutterwave",
  },
  ETB: {
    name: "Ethiopian Birr",
    symbol: "Br",
    decimals: 2,
    gateway: "flutterwave",
  },
  EGP: {
    name: "Egyptian Pound",
    symbol: "E£",
    decimals: 2,
    gateway: "flutterwave",
  },
  MAD: {
    name: "Moroccan Dirham",
    symbol: "MAD",
    decimals: 2,
    gateway: "flutterwave",
  },
  TND: {
    name: "Tunisian Dinar",
    symbol: "DT",
    decimals: 3,
    gateway: "flutterwave",
  },
  // ── Stripe markets ────────────────────────────────────
  USD: { name: "US Dollar", symbol: "$", decimals: 2, gateway: "stripe" },
  GBP: { name: "British Pound", symbol: "£", decimals: 2, gateway: "stripe" },
  EUR: { name: "Euro", symbol: "€", decimals: 2, gateway: "stripe" },
  CAD: {
    name: "Canadian Dollar",
    symbol: "CA$",
    decimals: 2,
    gateway: "stripe",
  },
  AUD: {
    name: "Australian Dollar",
    symbol: "A$",
    decimals: 2,
    gateway: "stripe",
  },
  AED: { name: "UAE Dirham", symbol: "د.إ", decimals: 2, gateway: "stripe" },
  INR: { name: "Indian Rupee", symbol: "₹", decimals: 2, gateway: "stripe" },
  JPY: { name: "Japanese Yen", symbol: "¥", decimals: 0, gateway: "stripe" },
  CNY: { name: "Chinese Yuan", symbol: "¥", decimals: 2, gateway: "stripe" },
  BRL: { name: "Brazilian Real", symbol: "R$", decimals: 2, gateway: "stripe" },
};

export const CURRENCY_CODES = Object.keys(
  SUPPORTED_CURRENCIES,
) as CurrencyCode[];

/** Resolves which payment gateway handles a given currency */
export function resolveGateway(currency: string): PaymentGateway {
  const info = SUPPORTED_CURRENCIES[currency as CurrencyCode];
  return info?.gateway ?? "stripe";
}

// ── Countries (ISO 3166-1 alpha-2) ────────────────────────────────────────
export type CountryCode =
  | "NG"
  | "GH"
  | "KE"
  | "ZA"
  | "SN"
  | "CI"
  | "CM"
  | "UG"
  | "TZ"
  | "RW"
  | "ET"
  | "EG"
  | "MA"
  | "TN"
  | "US"
  | "GB"
  | "CA"
  | "AU"
  | "DE"
  | "FR"
  | "AE"
  | "IN"
  | "JP"
  | "CN"
  | "BR";

export const SUPPORTED_COUNTRIES: Record<
  CountryCode,
  {
    name: string;
    currency: CurrencyCode;
    callingCode: string;
    region: string;
  }
> = {
  NG: {
    name: "Nigeria",
    currency: "NGN",
    callingCode: "+234",
    region: "Africa",
  },
  GH: { name: "Ghana", currency: "GHS", callingCode: "+233", region: "Africa" },
  KE: { name: "Kenya", currency: "KES", callingCode: "+254", region: "Africa" },
  ZA: {
    name: "South Africa",
    currency: "ZAR",
    callingCode: "+27",
    region: "Africa",
  },
  SN: {
    name: "Senegal",
    currency: "XOF",
    callingCode: "+221",
    region: "Africa",
  },
  CI: {
    name: "Côte d'Ivoire",
    currency: "XOF",
    callingCode: "+225",
    region: "Africa",
  },
  CM: {
    name: "Cameroon",
    currency: "XAF",
    callingCode: "+237",
    region: "Africa",
  },
  UG: {
    name: "Uganda",
    currency: "UGX",
    callingCode: "+256",
    region: "Africa",
  },
  TZ: {
    name: "Tanzania",
    currency: "TZS",
    callingCode: "+255",
    region: "Africa",
  },
  RW: {
    name: "Rwanda",
    currency: "RWF",
    callingCode: "+250",
    region: "Africa",
  },
  ET: {
    name: "Ethiopia",
    currency: "ETB",
    callingCode: "+251",
    region: "Africa",
  },
  EG: { name: "Egypt", currency: "EGP", callingCode: "+20", region: "Africa" },
  MA: {
    name: "Morocco",
    currency: "MAD",
    callingCode: "+212",
    region: "Africa",
  },
  TN: {
    name: "Tunisia",
    currency: "TND",
    callingCode: "+216",
    region: "Africa",
  },
  US: {
    name: "United States",
    currency: "USD",
    callingCode: "+1",
    region: "Americas",
  },
  GB: {
    name: "United Kingdom",
    currency: "GBP",
    callingCode: "+44",
    region: "Europe",
  },
  CA: {
    name: "Canada",
    currency: "CAD",
    callingCode: "+1",
    region: "Americas",
  },
  AU: {
    name: "Australia",
    currency: "AUD",
    callingCode: "+61",
    region: "Oceania",
  },
  DE: {
    name: "Germany",
    currency: "EUR",
    callingCode: "+49",
    region: "Europe",
  },
  FR: { name: "France", currency: "EUR", callingCode: "+33", region: "Europe" },
  AE: {
    name: "United Arab Emirates",
    currency: "AED",
    callingCode: "+971",
    region: "Asia",
  },
  IN: { name: "India", currency: "INR", callingCode: "+91", region: "Asia" },
  JP: { name: "Japan", currency: "JPY", callingCode: "+81", region: "Asia" },
  CN: { name: "China", currency: "CNY", callingCode: "+86", region: "Asia" },
  BR: {
    name: "Brazil",
    currency: "BRL",
    callingCode: "+55",
    region: "Americas",
  },
};

export const COUNTRY_CODES = Object.keys(SUPPORTED_COUNTRIES) as CountryCode[];
