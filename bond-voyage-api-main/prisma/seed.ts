import { PrismaClient, UserRole, BookingType, BookingStatus, TourType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // ===========================================
  // 1. SEED USERS (Flattened Structure)
  // ===========================================

  // --- Admin User ---
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "BondVoyage",
      email: "admin@example.com",
      phoneNumber: "+1234567890",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      // Admin Specific Fields (Now directly on User model)
      companyName: "BondVoyage HQ",
      customerRating: 4.95,
    },
  });
  console.log("✅ Created Admin:", admin.email);

  // --- Second Admin ---
  const admin2 = await prisma.user.upsert({
    where: { email: "sarah.admin@example.com" },
    update: {},
    create: {
      firstName: "Sarah",
      lastName: "Agency",
      email: "sarah.admin@example.com",
      phoneNumber: "+1122334455",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      companyName: "Travel Solutions Co.",
      customerRating: 4.72,
    },
  });
  console.log("✅ Created Admin 2:", admin2.email);

  // --- Regular User ---
  const userPassword = await bcrypt.hash("User@123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Traveler",
      email: "user@example.com",
      phoneNumber: "+1234567891",
      password: userPassword,
      role: UserRole.USER,
      isActive: true,
    },
  });
  console.log("✅ Created User:", user.email);

  // ===========================================
  // 2. SEED TOUR PACKAGES (Standard Trips)
  // ===========================================
  
  // Clean up old packages to avoid duplicates during dev
  await prisma.tourPackage.deleteMany({});

  await prisma.tourPackage.createMany({
    data: [
      {
        destination: "El Nido Island Hopping",
        price: 15000.00,
        duration: 3, // Days
        thumbUrl: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1",
        isActive: true,
      },
      {
        destination: "Coron Ultimate Tour",
        price: 18500.00,
        duration: 4,
        thumbUrl: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86",
        isActive: true,
      },
      {
        destination: "Siargao Surf & Chill",
        price: 12000.00,
        duration: 5,
        thumbUrl: "https://images.unsplash.com/photo-1534008897995-27a23e859048",
        isActive: true,
      }
    ]
  });
  console.log("✅ Created 3 Standard Tour Packages");

  // ===========================================
  // 3. SEED A COMPLEX BOOKING (With Itinerary)
  // ===========================================

  // We delete existing bookings for this user to ensure a clean seed
  await prisma.booking.deleteMany({ where: { userId: user.id } });

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      destination: "Boracay Luxury Escape",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-06-04"),
      travelers: 2,
      totalPrice: 25000.00,
      type: BookingType.CUSTOMIZED,
      status: BookingStatus.PENDING, // Pending Admin Approval
      tourType: TourType.PRIVATE,
      
      // Nested Create: Itinerary & Activities
      itinerary: {
        create: [
          {
            dayNumber: 1,
            activities: {
              create: [
                { time: "08:00 AM", title: "Arrival at Caticlan", icon: "Plane", order: 1 },
                { time: "02:00 PM", title: "Check-in at Shangri-La", icon: "Hotel", order: 2 },
                { time: "05:00 PM", title: "Sunset Sailing", icon: "Boat", order: 3 },
              ]
            }
          },
          {
            dayNumber: 2,
            activities: {
              create: [
                { time: "09:00 AM", title: "Island Hopping Tour", icon: "Boat", order: 1 },
                { time: "12:00 PM", title: "Lunch at Puka Beach", icon: "Utensils", order: 2 },
              ]
            }
          }
        ]
      }
    }
  });

  console.log("✅ Created Nested Booking for User:", booking.id);

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