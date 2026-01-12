import {
  PrismaClient,
  UserRole,
  BookingType,
  BookingStatus,
  TourType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  InquiryStatus,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const userPassword = await bcrypt.hash("User@123", 12);

  const [admin, admin2, user, collaborator] = await Promise.all([
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
        companyName: "BondVoyage HQ",
        customerRating: 4.95,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin2@example.com" },
      update: {},
      create: {
        firstName: "Admin2",
        lastName: "BondVoyage",
        email: "admin2@example.com",
        mobile: "09987654321",
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

  console.log("✅ Created Admin:", admin.email);
  console.log("✅ Created Admin 2:", admin2.email);
  console.log("✅ Created User:", user.email);
  console.log("✅ Created Collaborator:", collaborator.email);

  await prisma.bookingCollaborator.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.tourPackage.deleteMany({});
  await prisma.location.deleteMany({});

  const locations = await prisma.location.createMany({
    data: [
      {
        name: "Boracay",
        alias: ["boracay", "white beach", "boracay island"],
        latitude: 11.9674,
        longitude: 121.9248,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        description: "BondVoyage verified destination known for powdery white sand.",
        isActive: true,
      },
      {
        name: "El Nido",
        alias: ["el nido", "palawan el nido", "elnido"],
        latitude: 11.2026,
        longitude: 119.4168,
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        description: "BondVoyage verified destination with lagoons and limestone cliffs.",
        isActive: true,
      },
      {
        name: "Baguio",
        alias: ["baguio", "baguio city", "summer capital"],
        latitude: 16.4023,
        longitude: 120.596,
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        description: "BondVoyage verified destination known for cool climate and pine trees.",
        isActive: true,
      },
    ],
  });

  console.log("✅ Seeded Locations:", locations.count);

  const tourPackage1 = await prisma.tourPackage.create({
    data: {
      title: "El Nido Island Hopping",
      destination: "Palawan",
      category: "Beach",
      description: "Discover lagoons, beaches, and island tours.",
      price: 15000.0,
      duration: 3,
      thumbUrl: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1",
      isActive: true,
      days: {
        create: [
          {
            dayNumber: 1,
            title: "Arrival & City Tour",
            activities: {
              create: [
                {
                  time: "08:00 AM",
                  title: "Arrival at El Nido Airport",
                  description: "Meet and greet",
                  location: "El Nido Airport",
                  icon: "Plane",
                  order: 1,
                },
                {
                  time: "01:00 PM",
                  title: "Check-in",
                  description: "Hotel check-in",
                  location: "El Nido",
                  icon: "Hotel",
                  order: 2,
                },
              ],
            },
          },
          {
            dayNumber: 2,
            title: "Island Hopping",
            activities: {
              create: [
                {
                  time: "09:00 AM",
                  title: "Tour A",
                  description: "Big Lagoon and Secret Lagoon",
                  location: "El Nido",
                  icon: "Boat",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const tourPackage2 = await prisma.tourPackage.create({
    data: {
      title: "Coron Ultimate Tour",
      destination: "Palawan",
      category: "Adventure",
      description: "Dive into shipwrecks and lakes.",
      price: 18500.0,
      duration: 4,
      thumbUrl: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86",
      isActive: true,
    },
  });

  console.log("✅ Created Tour Packages:", tourPackage1.id, tourPackage2.id);

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      destination: "Boracay Luxury Escape",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-04"),
      travelers: 2,
      totalPrice: 25000.0,
      type: BookingType.CUSTOMIZED,
      status: BookingStatus.DRAFT,
      tourType: TourType.PRIVATE,
      itinerary: {
        create: [
          {
            dayNumber: 1,
            activities: {
              create: [
                {
                  time: "08:00 AM",
                  title: "Arrival at Caticlan",
                  icon: "Plane",
                  order: 1,
                },
                {
                  time: "02:00 PM",
                  title: "Check-in",
                  icon: "Hotel",
                  order: 2,
                },
              ],
            },
          },
          {
            dayNumber: 2,
            activities: {
              create: [
                {
                  time: "09:00 AM",
                  title: "Island Hopping Tour",
                  icon: "Boat",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.bookingCollaborator.create({
    data: {
      bookingId: booking.id,
      userId: collaborator.id,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      submittedById: user.id,
      amount: 10000.0,
      method: PaymentMethod.GCASH,
      status: PaymentStatus.PENDING,
      type: PaymentType.PARTIAL,
      proofImage: Buffer.from("aGVsbG8=", "base64"),
      proofMimeType: "image/png",
      proofSize: Buffer.from("aGVsbG8=", "base64").length,
      transactionId: "TXN-10001",
    },
  });

  const inquiry = await prisma.inquiry.create({
    data: {
      userId: user.id,
      subject: "Visa Requirements",
      status: InquiryStatus.OPEN,
      messages: {
        create: {
          senderId: user.id,
          content: "Do we need a visa for this trip?",
        },
      },
    },
  });

  await prisma.message.create({
    data: {
      inquiryId: inquiry.id,
      senderId: admin.id,
      content: "We can help with visa guidance. Please share your nationality.",
    },
  });

  await prisma.feedback.create({
    data: {
      userId: user.id,
      rating: 5,
      comment: "Amazing service and smooth booking!",
      response: "Thank you for the feedback!",
      respondedById: admin.id,
      respondedAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      details: "Seeded initial admin activity",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: NotificationType.BOOKING,
      title: "Booking Draft Saved",
      message: "Your Boracay booking draft is saved.",
    },
  });

  console.log("✅ Created Booking:", booking.id);
  console.log("✅ Created Collaboration, Payment, Inquiry, Feedback, Activity Log, Notification");

  await prisma.booking.create({
    data: {
      userId: user.id,
      destination: "El Nido (Rejected Test)",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-07-05"),
      travelers: 4,
      totalPrice: 45000.0,
      type: BookingType.CUSTOMIZED,
      status: BookingStatus.REJECTED, // Critical for testing
      tourType: TourType.PRIVATE,
      rejectionReason: "Dates unavailable due to weather.",
      rejectionResolution: "Please select dates in August.",
      isResolved: false,
    },
  });
  console.log("✅ Created 'Rejected' Booking for frontend testing.");

  console.log("\n🎉 Database seeding completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin User:");
  console.log("  Email: admin@example.com");
  console.log("  Pass:  Admin@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Regular User:");
  console.log("  Email: user@example.com");
  console.log("  Pass:  User@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
