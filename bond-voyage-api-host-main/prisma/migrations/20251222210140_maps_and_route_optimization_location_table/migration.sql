-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "bookingId" TEXT;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
