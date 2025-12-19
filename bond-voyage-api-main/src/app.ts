import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "@/routes";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/response";
import authRoutes from '@/routes/auth.route';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging middleware
// app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing middleware
app.use(cookieParser());

// API routes
app.use("/api/v1", routes);
app.use("/api/v1/auth", authRoutes);

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
  const response = createResponse(false, `Route ${req.originalUrl} not found`);
  res.status(HTTP_STATUS.NOT_FOUND).json(response);
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    const response = createResponse(
      false,
      error.message || "Internal server error",
      process.env.NODE_ENV === "development" ? error.stack : undefined
    );

    res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(response);
  }
);

export default app;
