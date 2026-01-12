import { PrismaClient } from "@prisma/client";

// Uncommenting the log will log the query everytime the user makes a request
const prisma = new PrismaClient({
  // log:
  //   process.env.NODE_ENV === "development"
  //     ? ["query", "error", "warn"]
  //     : ["error"],
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit();
});

export { prisma };
