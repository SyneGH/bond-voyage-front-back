import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "@/routes";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/responseHandler";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { env, resolveCorsOrigins } from "@/config/env";

const app = express();

// Security middleware
app.use(helmet());

const corsOrigins = resolveCorsOrigins();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed =
        corsOrigins.includes("*") || corsOrigins.includes(origin);
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging middleware
// app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Body parsing middleware
const bodyLimit = env.BODY_LIMIT || "8mb";
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Cookie parsing middleware
app.use(cookieParser());

// API routes
app.use("/api/v1", routes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Node.js Prisma Auth API",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      users: "/api/v1/users",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  createResponse(res, HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use(errorMiddleware);

export default app;
