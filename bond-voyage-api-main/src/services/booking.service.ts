import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/config/database";

interface CreateBookingDTO {
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  totalPrice: number;
  type: "STANDARD" | "CUSTOMIZED" | "REQUESTED";
  tourType: "JOINER" | "PRIVATE";
  itinerary: {
    dayNumber: number;
    date?: Date;
    activities: {
      time: string;
      title: string;
      description?: string;
      location?: string;
      icon?: string;
      order: number;
    }[];
  }[];
}

export const BookingService = {
  async createBooking(data: CreateBookingDTO) {
    return prisma.$transaction(async (tx) => {
      return tx.booking.create({
        data: {
          userId: data.userId,
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          travelers: data.travelers,
          // Prisma Decimal accepts number for many common setups; keep as-is for MVP
          totalPrice: data.totalPrice as unknown as Prisma.Decimal,
          type: data.type,
          tourType: data.tourType,
          status: "DRAFT",

          itinerary: {
            create: data.itinerary.map((day) => ({
              dayNumber: day.dayNumber,
              date: day.date,
              activities: {
                create: day.activities,
              },
            })),
          },
        },
        include: {
          itinerary: { include: { activities: true } },
        },
      });
    });
  },

  async getBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        payments: true,
        collaborators: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        itinerary: {
          orderBy: { dayNumber: "asc" },
          include: { activities: { orderBy: { order: "asc" } } },
        },
      },
    });
  },

  async updateItinerary(
    bookingId: string,
    userId: string,
    data: Omit<CreateBookingDTO, "userId" | "type" | "tourType">
  ) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { collaborators: true },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      const isOwner = booking.userId === userId;
      const isCollaborator = booking.collaborators.some(
        (collab) => collab.userId === userId
      );

      if (!isOwner && !isCollaborator) {
        throw new Error("BOOKING_FORBIDDEN");
      }

      if (isCollaborator && booking.status !== "DRAFT") {
        throw new Error("BOOKING_COLLABORATOR_NOT_ALLOWED");
      }

      if (isOwner && !["DRAFT", "PENDING", "REJECTED"].includes(booking.status)) {
        throw new Error("BOOKING_NOT_EDITABLE");
      }

      await tx.itineraryDay.deleteMany({ where: { bookingId } });

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          travelers: data.travelers,
          totalPrice: data.totalPrice as unknown as Prisma.Decimal,

          // If it was rejected and user edits, you may want to mark unresolved again
          isResolved: false,

          itinerary: {
            create: data.itinerary.map((day) => ({
              dayNumber: day.dayNumber,
              date: day.date,
              activities: { create: day.activities },
            })),
          },
        },
      });
    });
  },

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    reason?: string,
    resolution?: string
  ) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? reason : null,
        rejectionResolution: status === "REJECTED" ? resolution : null,
        isResolved: ["CONFIRMED", "REJECTED", "CANCELLED"].includes(status),
      },
    });
  },

  // =========================
  // MVP NAVIGATION ENDPOINTS
  // =========================

  async getUserBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      select: {
        id: true,
        destination: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        status: true,
        type: true,
        tourType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getUserBookingsPaginated(
    userId: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: { userId },
        select: {
          id: true,
          destination: true,
          startDate: true,
          endDate: true,
          totalPrice: true,
          status: true,
          type: true,
          tourType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllBookingsPaginated(
    status?: BookingStatus,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const whereClause = status ? { status } : undefined;

    const [items, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async deleteBookingDraft(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      select: { id: true, status: true },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    if (booking.status !== "DRAFT") throw new Error("CANNOT_DELETE_NON_DRAFT");

    return prisma.booking.delete({ where: { id: bookingId } });
  },

  async submitBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      select: { id: true, status: true },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    if (booking.status !== "DRAFT") throw new Error("CANNOT_SUBMIT");

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "PENDING",
      },
    });
  },

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      select: { id: true, status: true },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    // common rule: allow cancel if not completed
    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new Error("CANNOT_CANCEL");
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", isResolved: true },
    });
  },

  async addCollaborator(
    bookingId: string,
    ownerId: string,
    collaboratorId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId: ownerId },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      if (booking.userId === collaboratorId) {
        throw new Error("CANNOT_ADD_OWNER");
      }

      const existing = await tx.bookingCollaborator.findUnique({
        where: {
          bookingId_userId: {
            bookingId,
            userId: collaboratorId,
          },
        },
      });

      if (existing) {
        throw new Error("COLLABORATOR_EXISTS");
      }

      return tx.bookingCollaborator.create({
        data: {
          bookingId,
          userId: collaboratorId,
        },
      });
    });
  },

  async listCollaborators(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        collaborators: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    const isOwner = booking.userId === userId;
    const isCollaborator = booking.collaborators.some(
      (collab) => collab.userId === userId
    );

    if (!isOwner && !isCollaborator) {
      throw new Error("BOOKING_FORBIDDEN");
    }

    return booking.collaborators;
  },

  async removeCollaborator(
    bookingId: string,
    ownerId: string,
    collaboratorId: string
  ) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: ownerId },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    return prisma.bookingCollaborator.deleteMany({
      where: {
        bookingId,
        userId: collaboratorId,
      },
    });
  },
};
