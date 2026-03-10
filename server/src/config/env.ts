import "dotenv/config";

function require_env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  POSTGRES: {
    HOST: process.env.POSTGRES_HOST || "localhost",
    PORT: Number(process.env.POSTGRES_PORT) || 5432,
    USER: process.env.POSTGRES_USER || "eventshere_user",
    PASSWORD: process.env.POSTGRES_PASSWORD || "eventshere_pass",
    DB: process.env.POSTGRES_DB || "eventshere_db",
  },

  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/eventshere_layouts",

  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: Number(process.env.REDIS_PORT) || 6379,
  },

  JWT: {
    ACCESS_SECRET: require_env("JWT_ACCESS_SECRET"),
    REFRESH_SECRET: require_env("JWT_REFRESH_SECRET"),
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    API_KEY: process.env.CLOUDINARY_API_KEY || "",
    API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  },

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@eventshere.com",

  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || "",
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
} as const;
