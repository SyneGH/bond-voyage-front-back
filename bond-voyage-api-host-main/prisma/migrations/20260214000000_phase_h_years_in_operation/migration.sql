-- Add yearsInOperation to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "yearsInOperation" INTEGER;
