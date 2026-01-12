-- CreateEnum
CREATE TYPE "ItineraryType" AS ENUM ('STANDARD', 'CUSTOMIZED', 'REQUESTED', 'SMART_TRIP');

-- CreateEnum
CREATE TYPE "ItineraryStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "itinerary_days" DROP CONSTRAINT "itinerary_days_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "booking_collaborators" DROP CONSTRAINT "booking_collaborators_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "booking_collaborators" DROP CONSTRAINT "booking_collaborators_userId_fkey";

-- DropIndex
DROP INDEX "itinerary_days_bookingId_dayNumber_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "destination",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "travelers",
ADD COLUMN     "bookingCode" TEXT NOT NULL,
ADD COLUMN     "itineraryId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "itinerary_days" DROP COLUMN "bookingId",
ADD COLUMN     "itineraryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "itineraryId" TEXT;

-- DropTable
DROP TABLE "booking_collaborators";

-- CreateTable
CREATE TABLE "itineraries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "travelers" INTEGER NOT NULL DEFAULT 1,
    "estimatedCost" DECIMAL(10,2),
    "type" "ItineraryType" NOT NULL DEFAULT 'CUSTOMIZED',
    "status" "ItineraryStatus" NOT NULL DEFAULT 'DRAFT',
    "tourType" "TourType" NOT NULL DEFAULT 'PRIVATE',
    "rejectionReason" TEXT,
    "rejectionResolution" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_collaborators" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'COLLABORATOR',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerary_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_sequences" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_collaborators_itineraryId_userId_key" ON "itinerary_collaborators"("itineraryId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_sequences_year_key" ON "booking_sequences"("year");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingCode_key" ON "bookings"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_days_itineraryId_dayNumber_key" ON "itinerary_days"("itineraryId", "dayNumber");

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_collaborators" ADD CONSTRAINT "itinerary_collaborators_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_collaborators" ADD CONSTRAINT "itinerary_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

