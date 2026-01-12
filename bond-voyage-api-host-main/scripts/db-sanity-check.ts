import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [bookingCount, itineraryCount] = await Promise.all([
    prisma.booking.count(),
    prisma.itinerary.count(),
  ]);

  const sampleBooking = await prisma.booking.findFirst({
    include: {
      itinerary: {
        include: {
          collaborators: true,
        },
      },
      inquiry: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const sequences = await prisma.bookingSequence.findMany({
    orderBy: { year: 'desc' },
  });

  console.log('Bookings total:', bookingCount);
  console.log('Itineraries total:', itineraryCount);

  if (sampleBooking) {
    console.log('Latest booking summary:', {
      id: sampleBooking.id,
      bookingCode: sampleBooking.bookingCode,
      itineraryId: sampleBooking.itineraryId,
      itineraryTitle: sampleBooking.itinerary?.title,
      collaboratorCount: sampleBooking.itinerary?.collaborators.length ?? 0,
      inquiryId: sampleBooking.inquiry?.id,
    });
  } else {
    console.log('No bookings found to sample.');
  }

  console.log('Booking sequences (year -> current):', sequences);
}

main()
  .catch((error) => {
    console.error('Sanity check failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
