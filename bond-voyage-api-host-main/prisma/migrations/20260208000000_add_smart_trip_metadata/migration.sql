-- Add Smart Trip metadata fields
ALTER TABLE "itineraries"
ADD COLUMN "travelPace" TEXT,
ADD COLUMN "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[];
