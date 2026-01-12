import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import app from "./app";
import { prisma } from "@/config/database";
import { redis } from "@/config/redis";
import { env } from "@/config/env";

const PORT = Number(env.PORT) || 8087;

// Database connection test
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL database");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}

// Redis connection test
async function connectRedis() {
  try {
    await redis.ping();
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    // Redis is optional for caching, so don't exit process
    console.warn("⚠️  Continuing without Redis caching");
  }
}

// Start server
async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🔄 SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await prisma.$disconnect();
        await redis.quit();
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("🔄 SIGINT received, shutting down gracefully");
      server.close(async () => {
        await prisma.$disconnect();
        await redis.quit();
        console.log("✅ Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
