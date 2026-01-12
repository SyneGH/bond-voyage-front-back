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

// CORS Configuration
const allowedOrigins = resolveCorsOrigins();

// Startup Validation & Logging
if (allowedOrigins.length === 0) {
  console.warn("⚠️  WARNING: No CORS origins configured. Using FRONTEND_URL fallback.");
}

console.log("✅ CORS Configuration:");
console.log("   NODE_ENV:", process.env.NODE_ENV);
console.log("   Allowed Origins:", allowedOrigins.length > 0 ? allowedOrigins : ["NONE - Will reject all"]);

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow requests with no origin (server-to-server, Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Check for wildcard FIRST (before expensive array operations)
      if (allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      // 3. Check if origin is in whitelist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 4. REJECT: Log clearly what was blocked
      console.error(`❌ CORS BLOCKED: "${origin}" not in whitelist`);
      console.error(`   Expected one of: [${allowedOrigins.join(", ")}]`);
      
      return callback(new Error(`CORS policy: Origin "${origin}" is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging middleware
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