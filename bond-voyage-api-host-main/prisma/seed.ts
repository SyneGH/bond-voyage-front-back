import {
  PrismaClient,
  UserRole,
  ItineraryType,
  ItineraryStatus,
  BookingType,
  BookingStatus,
  TourType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  CollaboratorRole,
  NotificationType,
  InquiryStatus
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TOUR_PACKAGE_ID = "00000000-0000-0000-0000-0000000000aa";
const ITINERARY_ID = "00000000-0000-0000-0000-0000000000ab";
const BOOKING_YEAR = new Date().getFullYear();
const BOOKING_CODE = `BV-${BOOKING_YEAR}-001`;

const FAQ_ENTRIES = [
  {
    id: "00000000-0000-0000-0000-00000000f001",
    question: "How do I create a booking?",
    answer:
      "Create or select an itinerary, then submit a booking request. Only the itinerary owner can convert it to a booking.",
    order: 1,
  },
  {
    id: "00000000-0000-0000-0000-00000000f002",
    question: "How do I upload a payment receipt?",
    answer: "Open your booking details and use the payment upload section to attach your receipt.",
    order: 2,
  },
  {
    id: "00000000-0000-0000-0000-00000000f003",
    question: "Can collaborators edit my itinerary?",
    answer: "Yes, collaborators can edit the itinerary plan, but only the owner can place bookings.",
    order: 3,
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const userPassword = await bcrypt.hash("User@123", 12);

  // --- USERS ---
  const [admin, user, collaborator] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        firstName: "Admin",
        lastName: "BondVoyage",
        email: "admin@example.com",
        mobile: "09123456789",
        password: adminPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "user@example.com" },
      update: {},
      create: {
        firstName: "John",
        lastName: "Traveler",
        email: "user@example.com",
        mobile: "09876543210",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "collab@example.com" },
      update: {},
      create: {
        firstName: "Maria",
        lastName: "Collaborator",
        email: "collab@example.com",
        mobile: "09012345678",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
    }),
  ]);

  // --- LOCATIONS ---
  await prisma.location.createMany({
    skipDuplicates: true,
    data: [
      { name: "Boracay", latitude: 11.9674, longitude: 121.9248, isActive: true },
      { name: "El Nido", latitude: 11.2026, longitude: 119.4168, isActive: true },
    ],
  });

  // --- TOUR PACKAGES (Standard Templates) ---
  const tourPackage = await prisma.tourPackage.upsert({
    where: { id: TOUR_PACKAGE_ID },
    update: {
      title: "Standard Boracay Package",
      destination: "Boracay",
      price: 15000.0,
      duration: 3,
      isActive: true,
    },
    create: {
      id: TOUR_PACKAGE_ID,
      title: "Standard Boracay Package",
      destination: "Boracay",
      price: 15000.0,
      duration: 3,
      isActive: true,
    },
  });

  // --- NEW: ITINERARY (Collaborative) ---
  const itinerary = await prisma.itinerary.upsert({
    where: { id: ITINERARY_ID },
    update: {
      userId: user.id,
      title: "Family Palawan Trip",
      destination: "Palawan",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-04"),
      type: ItineraryType.CUSTOMIZED,
      status: ItineraryStatus.APPROVED,
      travelers: 4,
      collaborators: {
        deleteMany: { itineraryId: ITINERARY_ID },
        create: {
          userId: collaborator.id,
          role: CollaboratorRole.COLLABORATOR,
          invitedById: user.id,
        },
      },
      days: {
        deleteMany: { itineraryId: ITINERARY_ID },
        create: {
          dayNumber: 1,
          activities: {
            create: { time: "10:00 AM", title: "Island Hopping", order: 1 },
          },
        },
      },
    },
    create: {
      id: ITINERARY_ID,
      userId: user.id,
      title: "Family Palawan Trip",
      destination: "Palawan",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-04"),
      type: ItineraryType.CUSTOMIZED,
      status: ItineraryStatus.APPROVED,
      travelers: 4,
      collaborators: {
        create: { userId: collaborator.id, role: CollaboratorRole.COLLABORATOR, invitedById: user.id }
      },
      days: {
        create: {
          dayNumber: 1,
          activities: { create: { time: "10:00 AM", title: "Island Hopping", order: 1 } }
        }
      }
    }
  });

  // --- NEW: BOOKING (With BV-ID and Customer Data) ---
  const booking = await prisma.booking.upsert({
    where: { bookingCode: BOOKING_CODE },
    update: {
      itineraryId: itinerary.id,
      userId: user.id,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      travelers: itinerary.travelers,
      customerName: "John Traveler", // Capturing modal input
      customerEmail: "user@example.com",
      customerMobile: "09876543210", // Addressing missing mobile
      totalPrice: 45000.0,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING, // Quick-look status
    },
    create: {
      itineraryId: itinerary.id,
      userId: user.id,
      bookingCode: BOOKING_CODE, // Required format
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      travelers: itinerary.travelers,
      customerName: "John Traveler", // Capturing modal input
      customerEmail: "user@example.com",
      customerMobile: "09876543210", // Addressing missing mobile
      totalPrice: 45000.0,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING, // Quick-look status
    }
  });

  const bookingYear = BOOKING_YEAR;
  const bookingNumber = booking.bookingCode?.split("-").at(2);
  const parsedBookingNumber = bookingNumber
    ? Number.parseInt(bookingNumber, 10) || 1
    : 1;

  const existingSequence = await prisma.bookingSequence.findUnique({
    where: { year: bookingYear },
  });

  const latestForYear = await prisma.booking.findFirst({
    where: { bookingCode: { startsWith: `BV-${bookingYear}-` } },
    orderBy: { bookingCode: "desc" },
    select: { bookingCode: true },
  });
  const latestNumber = latestForYear?.bookingCode?.split("-").at(2);
  const parsedLatestNumber = latestNumber ? Number.parseInt(latestNumber, 10) || 0 : 0;

  const nextCurrentNumber = Math.max(
    existingSequence?.currentNumber ?? 0,
    parsedBookingNumber,
    parsedLatestNumber
  );

  await prisma.bookingSequence.upsert({
    where: { year: bookingYear },
    update: {
      currentNumber: nextCurrentNumber,
      lastIssuedCode: latestForYear?.bookingCode ?? booking.bookingCode,
    },
    create: {
      year: bookingYear,
      currentNumber: nextCurrentNumber,
      lastIssuedCode: latestForYear?.bookingCode ?? booking.bookingCode,
    },
  });

  // --- PAYMENTS ---
  await prisma.payment.deleteMany({ where: { bookingId: booking.id } });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      submittedById: user.id,
      amount: 22500.0,
      method: PaymentMethod.GCASH,
      status: PaymentStatus.PENDING,
      type: PaymentType.PARTIAL,
    }
  });

  // --- NOTIFICATIONS ---
  await prisma.notification.deleteMany({ where: { userId: admin.id, type: NotificationType.BOOKING } });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      type: NotificationType.BOOKING,
      message: `${user.firstName} submits a customized itinerary for approval`, // Dynamic string
    }
  });

  // --- FAQ ENTRIES (RAG SOURCE) ---
  await Promise.all(
    FAQ_ENTRIES.map((faq) =>
      prisma.faqEntry.upsert({
        where: { id: faq.id },
        update: {
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isActive: true,
        },
        create: {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isActive: true,
        },
      })
    )
  );

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
