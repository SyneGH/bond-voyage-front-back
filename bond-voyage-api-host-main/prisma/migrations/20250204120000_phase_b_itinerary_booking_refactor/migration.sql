-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SENT', 'CONFIRMED');

-- AlterTable
ALTER TABLE "itineraries" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "requestedStatus" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "sentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "itinerary_collaborators" ADD COLUMN     "invitedById" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "destination" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "travelers" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "booking_sequences" ADD COLUMN     "lastIssuedCode" TEXT;

-- AddForeignKey
ALTER TABLE "itinerary_collaborators" ADD CONSTRAINT "itinerary_collaborators_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

