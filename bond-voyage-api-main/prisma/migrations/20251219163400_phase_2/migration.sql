/*
  Warnings:

  - Added the required column `updatedAt` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `tour_packages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'PAYMENT', 'INQUIRY', 'FEEDBACK', 'SYSTEM');

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "respondedById" TEXT,
ADD COLUMN     "response" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "submittedById" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tour_packages" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tour_package_days" (
    "id" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT,

    CONSTRAINT "tour_package_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_package_activities" (
    "id" TEXT NOT NULL,
    "tourPackageDayId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "tour_package_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_collaborators" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'COLLABORATOR',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tour_package_days_tourPackageId_dayNumber_key" ON "tour_package_days"("tourPackageId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "booking_collaborators_bookingId_userId_key" ON "booking_collaborators"("bookingId", "userId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_package_days" ADD CONSTRAINT "tour_package_days_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_package_activities" ADD CONSTRAINT "tour_package_activities_tourPackageDayId_fkey" FOREIGN KEY ("tourPackageDayId") REFERENCES "tour_package_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_collaborators" ADD CONSTRAINT "booking_collaborators_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_collaborators" ADD CONSTRAINT "booking_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
