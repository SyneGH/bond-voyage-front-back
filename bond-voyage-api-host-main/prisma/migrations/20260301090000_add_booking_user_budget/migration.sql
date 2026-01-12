-- Add userBudget to bookings
ALTER TABLE "bookings" ADD COLUMN "userBudget" DECIMAL(10, 2);
