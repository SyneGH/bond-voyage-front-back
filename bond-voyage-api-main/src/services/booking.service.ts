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
      const booking = await tx.booking.create({
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

      await logActivity(
        tx,
        data.userId,
        "Created Booking",
        `Created booking ${booking.id} for ${booking.destination}`
      );

      return booking;
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

      const updated = await tx.booking.update({
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

      await logActivity(
        tx,
        userId,
        "Updated Booking",
        `Updated itinerary for booking ${bookingId}`
      );

      return updated;
    });
  },

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    reason?: string,
    resolution?: string,
    actorId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status,
          rejectionReason: status === "REJECTED" ? reason : null,
          rejectionResolution: status === "REJECTED" ? resolution : null,
          isResolved: ["CONFIRMED", "REJECTED", "CANCELLED"].includes(status),
        },
      });

      if (actorId) {
        const action =
          status === "CONFIRMED"
            ? "Approved Booking"
            : status === "REJECTED"
              ? "Rejected Booking"
              : status === "COMPLETED"
                ? "Completed Booking"
                : "Updated Booking Status";
        await logActivity(
          tx,
          actorId,
          action,
          `Status set to ${status} for booking ${bookingId}`
        );
      }

      return updated;
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
    limit = 10,
    status?: BookingStatus
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.BookingWhereInput = { userId };

    if (status) {
      whereClause.status = status;
    }

    const [items, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: whereClause,
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

  async getAllBookingsPaginated(
    filters: {
      status?: BookingStatus;
      type?: "STANDARD" | "CUSTOMIZED" | "REQUESTED";
      dateFrom?: Date;
      dateTo?: Date;
      q?: string;
      sort?: "createdAt:asc" | "createdAt:desc" | "startDate:asc" | "startDate:desc";
    },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.BookingWhereInput = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.startDate = {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      };
    }

    if (filters.q) {
      whereClause.OR = [
        { destination: { contains: filters.q, mode: "insensitive" } },
        {
          user: {
            firstName: { contains: filters.q, mode: "insensitive" },
          },
        },
        {
          user: {
            lastName: { contains: filters.q, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: filters.q, mode: "insensitive" },
          },
        },
      ];
    }

    const orderBy = (() => {
      switch (filters.sort) {
        case "createdAt:asc":
          return { createdAt: "asc" } as const;
        case "startDate:asc":
          return { startDate: "asc" } as const;
        case "startDate:desc":
          return { startDate: "desc" } as const;
        default:
          return { createdAt: "desc" } as const;
      }
    })();

    const [items, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy,
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
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        select: { id: true, status: true },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");
      if (booking.status !== "DRAFT") throw new Error("CANNOT_SUBMIT");

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "PENDING",
        },
      });

      await logActivity(
        tx,
        userId,
        "Submitted Booking",
        `Submitted booking ${bookingId} for approval`
      );

      return updated;
    });
  },

  async cancelBooking(bookingId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        select: { id: true, status: true },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      // common rule: allow cancel if not completed
      if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
        throw new Error("CANNOT_CANCEL");
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", isResolved: true },
      });

      await logActivity(
        tx,
        userId,
        "Cancelled Booking",
        `Cancelled booking ${bookingId}`
      );

      return updated;
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

      const collaborator = await tx.bookingCollaborator.create({
        data: {
          bookingId,
          userId: collaboratorId,
        },
      });

      await logActivity(
        tx,
        ownerId,
        "Added Collaborator",
        `Added collaborator ${collaboratorId} to booking ${bookingId}`
      );

      return collaborator;
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
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId: ownerId },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      const removed = await tx.bookingCollaborator.deleteMany({
        where: {
          id: collaboratorId,
          bookingId,
        },
      });

      await logActivity(
        tx,
        ownerId,
        "Removed Collaborator",
        `Removed collaborator ${collaboratorId} from booking ${bookingId}`
      );

      return removed;
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
        id: collaboratorId,
      },
    });
  },
};
