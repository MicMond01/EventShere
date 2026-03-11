import "express-async-errors";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

import { connectPostgres } from "./db/postgres/client";
import { connectMongo } from "./db/mongo/client";
import { connectRedis } from "./config/redis";
import { initSocket } from "./socket";
import { globalErrorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { env } from "./config/env";

import apiRoutes from "./routes";

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

// ── Global middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

// ── API routes ─────────────────────────────────────────────
app.use("/api/v1", apiRoutes);

// ── Socket.IO ──────────────────────────────────────────────
initSocket(io);

// ── Error handling (must be last) ─────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

// ── Start ──────────────────────────────────────────────────
async function start() {
  await connectPostgres();
  await connectMongo();
  await connectRedis();
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
