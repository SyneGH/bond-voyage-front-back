import {
  BookingStatus,
  BookingType,
  ItineraryStatus,
  ItineraryType,
  Prisma,
  TourType,
} from "@prisma/client";
import { Role } from "@/constants/constants";
import { prisma } from "@/config/database";
import { logAudit } from "@/services/activity-log.service";
import { NotificationService } from "@/services/notification.service";
import { toISO } from "@/utils/serialize";

const BOOKING_CODE_PREFIX = "BV";
const BOOKING_CODE_PADDING = 3;

const buildBookingCode = (year: number, sequence: number) =>
  `${BOOKING_CODE_PREFIX}-${year}-${String(sequence).padStart(BOOKING_CODE_PADDING, "0")}`;

const buildItinerarySnapshot = (itinerary: {
  id: string;
  userId: string;
  title?: string | null;
  destination: string;
  startDate?: Date | null;
  endDate?: Date | null;
  travelers: number;
  estimatedCost?: Prisma.Decimal | number | null;
  travelPace?: string | null;
  preferences?: string[] | null;
  type: ItineraryType;
  status: ItineraryStatus;
  tourType: TourType;
  days?: { dayNumber: number; title?: string | null; date?: Date | null; activities?: { time: string; title: string; description?: string | null; location?: string | null; icon?: string | null; order: number }[] }[];
}) => ({
  id: itinerary.id,
  userId: itinerary.userId,
  title: itinerary.title ?? null,
  destination: itinerary.destination,
  startDate: toISO(itinerary.startDate),
  endDate: toISO(itinerary.endDate),
  travelers: itinerary.travelers,
  estimatedCost:
    itinerary.estimatedCost !== null && itinerary.estimatedCost !== undefined
      ? Number((itinerary.estimatedCost as any).toString?.() ?? itinerary.estimatedCost)
      : null,
  travelPace: itinerary.travelPace ?? null,
  preferences: itinerary.preferences ?? [],
  type: itinerary.type,
  status: itinerary.status,
  tourType: itinerary.tourType,
  days:
    itinerary.days?.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title ?? null,
      date: toISO(day.date),
      activities:
        day.activities?.map((activity) => ({
          time: activity.time,
          title: activity.title,
          description: activity.description ?? null,
          location: activity.location ?? null,
          icon: activity.icon ?? null,
          order: activity.order,
        })) ?? [],
    })) ?? [],
});

const ensureBookingSequence = async (
  tx: Prisma.TransactionClient,
  year: number
) => {
  const latestBookingForYear = await tx.booking.findFirst({
    where: { bookingCode: { startsWith: `${BOOKING_CODE_PREFIX}-${year}-` } },
    orderBy: { bookingCode: "desc" },
    select: { bookingCode: true },
  });

  const latestNumber = latestBookingForYear?.bookingCode?.split("-").at(2);
  const seedNumber = latestNumber ? Number.parseInt(latestNumber, 10) || 0 : 0;

  const sequence = await tx.bookingSequence.upsert({
    where: { year },
    update: {},
    create: {
      year,
      currentNumber: seedNumber,
      lastIssuedCode: latestBookingForYear?.bookingCode,
    },
    select: { id: true, currentNumber: true, lastIssuedCode: true },
  });

  const targetNumber = Math.max(sequence.currentNumber ?? 0, seedNumber);
  const shouldRefreshSeed =
    sequence.currentNumber < targetNumber ||
    (!sequence.lastIssuedCode && latestBookingForYear?.bookingCode);

  if (!shouldRefreshSeed) {
    return sequence;
  }

  return tx.bookingSequence.update({
    where: { id: sequence.id },
    data: {
      currentNumber: targetNumber,
      lastIssuedCode: latestBookingForYear?.bookingCode ?? sequence.lastIssuedCode,
    },
  });
};

const generateBookingCode = async (tx: Prisma.TransactionClient) => {
  const year = new Date().getFullYear();
  const sequence = await ensureBookingSequence(tx, year);

  const incremented = await tx.bookingSequence.update({
    where: { id: sequence.id },
    data: { currentNumber: { increment: 1 } },
    select: { currentNumber: true },
  });

  const bookingCode = buildBookingCode(year, incremented.currentNumber);

  await tx.bookingSequence.update({
    where: { id: sequence.id },
    data: { lastIssuedCode: bookingCode },
  });

  return bookingCode;
};

interface CreateBookingDTO {
  userId: string;
  role: string;
  itineraryId?: string;
  tourPackageId?: string;
  itinerary?: InlineItineraryDTO;
  itineraryType?: ItineraryType;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: number;
  travelPace?: string;
  preferences?: string[];
  itineraryData?: SmartTripDayInput[];
  totalPrice: number;
  userBudget?: number;
  type?: BookingType;
  tourType?: TourType;

  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
}

interface SmartTripActivityInput {
  time: string;
  title: string;
  iconKey: string;
  location?: string;
  description?: string;
}

interface SmartTripDayInput {
  day: number;
  title: string;
  activities: SmartTripActivityInput[];
}

interface InlineItineraryDTO {
  title?: string | null;
  destination: string;
  startDate?: Date | null;
  endDate?: Date | null;
  travelers: number;
  type?: ItineraryType;
  tourType?: TourType;
  days?: {
    dayNumber: number;
    title?: string | null;
    date?: Date | null;
    activities: {
      time: string;
      title: string;
      description?: string | null;
      location?: string | null;
      icon?: string | null;
      order: number;
    }[];
  }[];
}

interface UpdateBookingItineraryDTO {
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  totalPrice: number;
  userBudget?: number;
  version: number;
  itinerary: {
    dayNumber: number;
    title?: string | null;
    date?: Date | null;
    activities: {
      time: string;
      title: string;
      description?: string | null;
      location?: string | null;
      icon?: string | null;
      order: number;
    }[];
  }[];
}

export const BookingService = {
  async createBooking(data: CreateBookingDTO) {
    return prisma.$transaction(async (tx) => {
      const bookingInclude = {
        itinerary: {
          include: {
            collaborators: true,
            days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
          },
        },
      } as const;

      const isSmartTrip =
        data.itineraryType === ItineraryType.SMART_TRIP || data.itineraryData;

      if (isSmartTrip) {
        const startDate = data.startDate ? new Date(data.startDate) : undefined;
        const endDate = data.endDate ? new Date(data.endDate) : undefined;

        const itinerary = await tx.itinerary.create({
          data: {
            userId: data.userId,
            title:
              data.destination && data.destination.trim().length > 0
                ? `Smart Trip: ${data.destination}`
                : "Smart Trip",
            destination: data.destination ?? "",
            startDate,
            endDate,
            travelers: data.travelers ?? 1,
            estimatedCost: data.budget as unknown as Prisma.Decimal,
            type: ItineraryType.SMART_TRIP,
            status: ItineraryStatus.DRAFT,
            tourType: data.tourType ?? TourType.PRIVATE,
            travelPace: data.travelPace ?? undefined,
            preferences: data.preferences ?? [],
          },
        });

        const sortedDays = [...(data.itineraryData ?? [])].sort(
          (a, b) => a.day - b.day
        );

        for (const day of sortedDays) {
          const itineraryDay = await tx.itineraryDay.create({
            data: {
              itineraryId: itinerary.id,
              dayNumber: day.day,
              title: day.title,
            },
          });

          if (day.activities.length > 0) {
            await tx.activity.createMany({
              data: day.activities.map((activity, idx) => ({
                itineraryDayId: itineraryDay.id,
                time: activity.time,
                title: activity.title,
                description: activity.description ?? null,
                location: activity.location ?? null,
                icon: activity.iconKey,
                order: idx,
              })),
            });
          }
        }

        const itineraryWithRelations = await tx.itinerary.findUnique({
          where: { id: itinerary.id },
          include: bookingInclude.itinerary.include,
        });

        if (itineraryWithRelations) {
          await tx.itineraryVersion.create({
            data: {
              itineraryId: itineraryWithRelations.id,
              version: itineraryWithRelations.version,
              snapshot: buildItinerarySnapshot(itineraryWithRelations),
              createdById: data.userId,
            },
          });
        }

        const bookingCode = await generateBookingCode(tx);

        const booking = await tx.booking.create({
          data: {
            bookingCode,
            userId: data.userId,
            itineraryId: itinerary.id,
            destination: itinerary.destination,
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            travelers: data.travelers ?? 1,
            totalPrice: data.totalPrice as unknown as Prisma.Decimal,
            userBudget:
              data.userBudget !== undefined
                ? (data.userBudget as unknown as Prisma.Decimal)
                : undefined,
            type: data.type ?? BookingType.CUSTOMIZED,
            tourType: data.tourType ?? TourType.PRIVATE,
            status: BookingStatus.DRAFT,
            customerName: data.customerName ?? undefined,
            customerEmail: data.customerEmail ?? undefined,
            customerMobile: data.customerMobile ?? undefined,
          },
          include: bookingInclude,
        });

        await logAudit(tx, {
          actorUserId: data.userId,
          action: "BOOKING_CREATED",
          entityType: "BOOKING",
          entityId: booking.id,
          metadata: {
            bookingCode: booking.bookingCode,
            destination: booking.destination,
            status: booking.status,
          },
          message: `Created booking ${booking.id} for ${booking.destination}`,
        });

        await NotificationService.create(
          {
            userId: data.userId,
            type: "BOOKING",
            title: "Booking created",
            message: `Your booking to ${booking.destination} has been created.`,
            data: {
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              status: booking.status,
              itineraryId: booking.itineraryId,
              destination: booking.destination ?? undefined,
            },
          },
          tx
        );

        await NotificationService.notifyAdmins({
          type: "BOOKING",
          title: "New booking created",
          message: `Booking ${booking.bookingCode} requires review`,
          data: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: booking.status,
            itineraryId: booking.itineraryId,
            destination: booking.destination ?? undefined,
          },
        });

        return booking;
      }

      if (data.tourPackageId) {
        const tourPackage = await tx.tourPackage.findUnique({
          where: { id: data.tourPackageId },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { activities: { orderBy: { order: "asc" } } },
            },
          },
        });

        if (!tourPackage) {
          throw new Error("TOUR_PACKAGE_NOT_FOUND");
        }

        const startDate = data.startDate ? new Date(data.startDate) : undefined;
        const endDate = data.endDate ? new Date(data.endDate) : undefined;

        // Create itinerary from tour package
        const itinerary = await tx.itinerary.create({
          data: {
            userId: data.userId,
            title: tourPackage.title,
            destination: tourPackage.destination,
            startDate,
            endDate,
            travelers: data.travelers ?? 1,
            estimatedCost: tourPackage.price,
            type: ItineraryType.STANDARD,
            status: ItineraryStatus.DRAFT,
            tourType: data.tourType ?? TourType.PRIVATE,
            days: {
              create: tourPackage.days.map((day, dayIndex) => ({
                dayNumber: day.dayNumber,
                title: day.title,
                date: startDate
                  ? new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000)
                  : undefined,
                activities: {
                  create: day.activities.map((activity) => ({
                    time: activity.time,
                    title: activity.title,
                    description: activity.description,
                    location: activity.location,
                    icon: activity.icon,
                    order: activity.order,
                  })),
                },
              })),
            },
          },
          include: {
            collaborators: true,
            days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
          },
        });

        await tx.itineraryVersion.create({
          data: {
            itineraryId: itinerary.id,
            version: itinerary.version,
            snapshot: buildItinerarySnapshot(itinerary),
            createdById: data.userId,
          },
        });

        const bookingCode = await generateBookingCode(tx);

        const booking = await tx.booking.create({
          data: {
            bookingCode,
            userId: data.userId,
            itineraryId: itinerary.id,
            destination: itinerary.destination,
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            travelers: data.travelers ?? 1,
            totalPrice: data.totalPrice as unknown as Prisma.Decimal,
            userBudget:
              data.userBudget !== undefined
                ? (data.userBudget as unknown as Prisma.Decimal)
                : undefined,
            type: BookingType.STANDARD,
            tourType: data.tourType ?? TourType.PRIVATE,
            status: BookingStatus.DRAFT,
            customerName: data.customerName ?? undefined,
            customerEmail: data.customerEmail ?? undefined,
            customerMobile: data.customerMobile ?? undefined,
          },
          include: bookingInclude,
        });

        await logAudit(tx, {
          actorUserId: data.userId,
          action: "BOOKING_CREATED",
          entityType: "BOOKING",
          entityId: booking.id,
          metadata: {
            bookingCode: booking.bookingCode,
            destination: booking.destination,
            status: booking.status,
            tourPackageId: data.tourPackageId,
          },
          message: `Created STANDARD booking ${booking.id} from tour package ${tourPackage.title}`,
        });

        await NotificationService.create(
          {
            userId: data.userId,
            type: "BOOKING",
            title: "Booking created",
            message: `Your booking for ${tourPackage.title} has been created.`,
            data: {
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              status: booking.status,
              itineraryId: booking.itineraryId,
              destination: booking.destination ?? undefined,
            },
          },
          tx
        );

        await NotificationService.notifyAdmins({
          type: "BOOKING",
          title: "New booking created",
          message: `Booking ${booking.bookingCode} requires review`,
          data: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: booking.status,
            itineraryId: booking.itineraryId,
            destination: booking.destination ?? undefined,
          },
        });

        return booking;
      }

      const shouldCreateItinerary = !data.itineraryId && data.itinerary;

      const itinerary = shouldCreateItinerary
        ? await tx.itinerary.create({
            // Deprecated inline creation path; kept for backward compatibility with legacy clients
            data: {
              userId: data.userId,
              title: data.itinerary?.title ?? "Itinerary",
              destination: data.itinerary?.destination ?? "",

              startDate: data.itinerary?.startDate ? new Date(data.itinerary.startDate) : undefined,
              endDate: data.itinerary?.endDate ? new Date(data.itinerary.endDate) : undefined,

              travelers: data.itinerary?.travelers ?? 1,
              type: data.itinerary?.type ?? ItineraryType.CUSTOMIZED,
              tourType: data.itinerary?.tourType ?? data.tourType ?? TourType.PRIVATE,
              days: data.itinerary?.days
                ? {
                    create: data.itinerary.days.map((day) => ({
                      dayNumber: day.dayNumber,
                      title: day.title ?? null,
                      date: day.date ? new Date(day.date) : undefined,
                      activities: { create: day.activities },
                    })),
                  }
                : undefined,
            },
            include: {
              collaborators: true,
              days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
            },
          })
        : await tx.itinerary.findUnique({
            where: { id: data.itineraryId },
            include: {
              collaborators: true,
              days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
            },
          });

      if (!itinerary) {
        throw new Error("ITINERARY_NOT_FOUND");
      }

      if (shouldCreateItinerary) {
        await tx.itineraryVersion.create({
          data: {
            itineraryId: itinerary.id,
            version: itinerary.version,
            snapshot: buildItinerarySnapshot(itinerary),
            createdById: data.userId,
          },
        });
      }

      const isOwner = itinerary.userId === data.userId;
      const isAdmin = data.role === Role.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new Error("ITINERARY_FORBIDDEN");
      }

      if (
        data.itineraryId &&
        itinerary.type === ItineraryType.REQUESTED &&
        itinerary.requestedStatus !== "CONFIRMED"
      ) {
        throw new Error("ITINERARY_NOT_CONFIRMED");
      }

      const bookingCode = await generateBookingCode(tx);

      // ✅ CORRECT FIX: Use undefined fallback to match Prisma's optional fields
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId: data.userId,
          itineraryId: itinerary.id,
          destination: itinerary.destination,
          startDate: itinerary.startDate ?? undefined,  // ✅ undefined for optional Date
          endDate: itinerary.endDate ?? undefined,      // ✅ undefined for optional Date
          travelers: itinerary.travelers,

          totalPrice: data.totalPrice as unknown as Prisma.Decimal,
          userBudget:
            data.userBudget !== undefined
              ? (data.userBudget as unknown as Prisma.Decimal)
              : undefined,
          type: data.type ?? (itinerary.type as BookingType),
          tourType: data.tourType ?? itinerary.tourType ?? TourType.PRIVATE,
          status: BookingStatus.DRAFT,

          // ✅ FIX: Use undefined fallback (not null)
          customerName: data.customerName ?? undefined,
          customerEmail: data.customerEmail ?? undefined,
          customerMobile: data.customerMobile ?? undefined,
        },
        include: {
          itinerary: {
            include: {
              collaborators: true,
              days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
            },
          },
        },
      });

      await logAudit(tx, {
        actorUserId: data.userId,
        action: "BOOKING_CREATED",
        entityType: "BOOKING",
        entityId: booking.id,
        metadata: {
          bookingCode: booking.bookingCode,
          destination: booking.destination,
          status: booking.status,
        },
        message: `Created booking ${booking.id} for ${booking.destination}`,
      });
      await NotificationService.create(
        {
          userId: data.userId,
          type: "BOOKING",
          title: "Booking created",
          message: `Your booking to ${booking.destination} has been created.`,
          data: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: booking.status,
            itineraryId: booking.itineraryId,
            destination: booking.destination ?? undefined,
          },
        },
        tx
      );

      await NotificationService.notifyAdmins({
        type: "BOOKING",
        title: "New booking created",
        message: `Booking ${booking.bookingCode} requires review`,
        data: {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          status: booking.status,
          itineraryId: booking.itineraryId,
          destination: booking.destination ?? undefined,
        },
      });

      return booking;
    });
  },

  async getBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, mobile: true } },
        payments: true,
        itinerary: {
          include: {
            collaborators: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true, mobile: true},
                },
              },
            },
            days: {
              orderBy: { dayNumber: "asc" },
              include: { activities: { orderBy: { order: "asc" } } },
            },
          },
        },
      },
    });
  },

  async getBookingOwner(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    });
  },

  async updateItinerary(
    bookingId: string,
    userId: string,
    data: UpdateBookingItineraryDTO
  ) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          itinerary: {
            include: { collaborators: true, days: { include: { activities: true } } },
          },
        },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      const isOwner = booking.userId === userId;
      const isCollaborator = booking.itinerary.collaborators.some(
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

      const destination = data.destination ?? booking.destination ?? undefined;
      const travelers = data.travelers ?? booking.travelers ?? undefined;

      const itineraryUpdateResult = await tx.itinerary.updateMany({
        where: { id: booking.itineraryId, version: data.version },
        data: {
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          travelers: data.travelers,
          version: { increment: 1 },
        },
      });

      if (itineraryUpdateResult.count === 0) {
        throw new Error("ITINERARY_VERSION_CONFLICT");
      }

      await tx.itineraryDay.deleteMany({ where: { itineraryId: booking.itineraryId } });

      for (const day of data.itinerary) {
        await tx.itineraryDay.create({
          data: {
            itineraryId: booking.itineraryId,
            dayNumber: day.dayNumber,
            title: day.title ?? undefined,
            date: day.date ?? undefined,
            activities: { create: day.activities },
          },
        });
      }

      const refreshedItinerary = await tx.itinerary.findUnique({
        where: { id: booking.itineraryId },
        include: { collaborators: true, days: { include: { activities: true } } },
      });

      if (refreshedItinerary) {
        await tx.itineraryVersion.create({
          data: {
            itineraryId: refreshedItinerary.id,
            version: refreshedItinerary.version,
            snapshot: buildItinerarySnapshot(refreshedItinerary),
            createdById: userId,
          },
        });
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          travelers: data.travelers,
          totalPrice: data.totalPrice as unknown as Prisma.Decimal,
          isResolved: false,
          ...(data.userBudget !== undefined && {
            userBudget: data.userBudget as unknown as Prisma.Decimal,
          }),

          ...(data.customerName !== undefined && { customerName: data.customerName }),
          ...(data.customerEmail !== undefined && { customerEmail: data.customerEmail }),
          ...(data.customerMobile !== undefined && { customerMobile: data.customerMobile }),
        },
      });

      await logAudit(tx, {
        actorUserId: userId,
        action: "BOOKING_UPDATED",
        entityType: "BOOKING",
        entityId: bookingId,
        metadata: {
          destination,
          travelers,
          customerUpdated: !!(data.customerName || data.customerEmail || data.customerMobile),
        },
        message: `Updated itinerary for booking ${bookingId}`,
      });

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
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { status: true, userId: true, bookingCode: true, itineraryId: true, destination: true },
      });

      if (!booking) {
        throw new Error("BOOKING_NOT_FOUND");
      }

      const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
        DRAFT: ["PENDING", "CANCELLED"],
        PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
        CONFIRMED: ["COMPLETED", "CANCELLED"],
        REJECTED: ["PENDING", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: [],
      };

      if (
        booking.status !== status &&
        !allowedTransitions[booking.status].includes(status)
      ) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status,
          rejectionReason: status === "REJECTED" ? reason : null,
          rejectionResolution: status === "REJECTED" ? resolution : null,
          isResolved: ["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].includes(
            status
          ),
        },
      });

      if (actorId) {
        const action =
          status === "CONFIRMED"
            ? "BOOKING_APPROVED"
            : status === "REJECTED"
              ? "BOOKING_REJECTED"
              : status === "COMPLETED"
                ? "BOOKING_COMPLETED"
                : "BOOKING_STATUS_UPDATED";
        await logAudit(tx, {
          actorUserId: actorId,
          action,
          entityType: "BOOKING",
          entityId: bookingId,
          metadata: { status },
          message: `Status set to ${status} for booking ${bookingId}`,
        });
      }

      await NotificationService.create(
        {
          userId: booking.userId,
          type: "BOOKING",
          title: "Booking status updated",
          message:
            status === "REJECTED"
              ? `Your booking ${booking.bookingCode} was rejected.`
              : `Your booking ${booking.bookingCode} status is now ${status}.`,
          data: {
            bookingId: bookingId,
            bookingCode: booking.bookingCode ?? undefined,
            status,
            itineraryId: booking.itineraryId ?? undefined,
            destination: booking.destination ?? undefined,
          },
        },
        tx
      );

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
        include: {
          itinerary: {
            include: {
              collaborators: true,
              days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
            },
          },
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

  async getSharedBookingsPaginated(
    userId: string,
    page = 1,
    limit = 10,
    status?: BookingStatus
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.BookingWhereInput = {
      userId: { not: userId },
      itinerary: { collaborators: { some: { userId } } },
    };

    if (status) {
      whereClause.status = status;
    }

    const [items, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          itinerary: {
            include: {
              collaborators: true,
              days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
            },
          },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
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
          itinerary: {
            include: {
              collaborators: true,
              days: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
            },
          },
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
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      });
      const userName = `${user?.firstName} ${user?.lastName}`;

      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        select: {
          id: true,
          status: true,
          bookingCode: true,
          itinerary: {
            select: {
              days: {
                select: {
                  activities: { select: { id: true } },
                },
              },
            },
          },
        },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");
      if (!["DRAFT", "REJECTED"].includes(booking.status)) {
        throw new Error("CANNOT_SUBMIT");
      }

      const days = booking.itinerary?.days ?? [];
      const hasEmptyActivities =
        days.length === 0 || days.some((day) => day.activities.length === 0);
      if (hasEmptyActivities) {
        throw new Error("BOOKING_ACTIVITIES_REQUIRED");
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "PENDING",
          rejectionReason: null,
          rejectionResolution: null,
          isResolved: false,
        },
      });

      await logAudit(tx, {
        actorUserId: userId,
        action: "BOOKING_SUBMITTED",
        entityType: "BOOKING",
        entityId: bookingId,
        metadata: { status: updated.status },
        message: `Submitted booking ${bookingId} for approval`,
      });
      await NotificationService.create(
        {
          userId,
          type: "BOOKING",
          title: "Booking submitted",
          message: `Your booking ${bookingId} has been submitted for approval.`,
          data: { bookingId },
        },
        tx
      );
      await NotificationService.notifyAdmins({
        type: "BOOKING",
        title: "Booking Submitted",
        message: `${userName} submitted booking ${booking.bookingCode} for approval`,
        data: { bookingId, status: "PENDING" }
      });
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

      await logAudit(tx, {
        actorUserId: userId,
        action: "BOOKING_CANCELLED",
        entityType: "BOOKING",
        entityId: bookingId,
        metadata: { status: updated.status },
        message: `Cancelled booking ${bookingId}`,
      });

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
        select: { id: true, itineraryId: true, userId: true },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      if (booking.userId === collaboratorId) {
        throw new Error("CANNOT_ADD_OWNER");
      }

      const existing = await tx.itineraryCollaborator.findUnique({
        where: {
          itineraryId_userId: {
            itineraryId: booking.itineraryId,
            userId: collaboratorId,
          },
        },
      });

      if (existing) {
        throw new Error("COLLABORATOR_EXISTS");
      }

      const collaborator = await tx.itineraryCollaborator.create({
        data: {
          itineraryId: booking.itineraryId,
          userId: collaboratorId,
        },
      });

      await logAudit(tx, {
        actorUserId: ownerId,
        action: "BOOKING_COLLABORATOR_ADDED",
        entityType: "BOOKING",
        entityId: bookingId,
        metadata: { collaboratorId },
        message: `Added collaborator ${collaboratorId} to booking ${bookingId}`,
      });

      return collaborator;
    });
  },

  async listCollaborators(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        itinerary: {
          include: {
            collaborators: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    const isOwner = booking.userId === userId;
    const isCollaborator = booking.itinerary.collaborators.some(
      (collab) => collab.userId === userId
    );

    if (!isOwner && !isCollaborator) {
      throw new Error("BOOKING_FORBIDDEN");
    }

    return booking.itinerary.collaborators;
  },

  async removeCollaborator(
    bookingId: string,
    ownerId: string,
    collaboratorUserId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId: ownerId },
        select: { id: true, itineraryId: true, userId: true },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      const removed = await tx.itineraryCollaborator.deleteMany({
        where: {
          userId: collaboratorUserId,
          itineraryId: booking.itineraryId,
        },
      });

      await logAudit(tx, {
        actorUserId: ownerId,
        action: "BOOKING_COLLABORATOR_REMOVED",
        entityType: "BOOKING",
        entityId: bookingId,
        metadata: { collaboratorId: collaboratorUserId },
        message: `Removed collaborator ${collaboratorUserId} from booking ${bookingId}`,
      });

      return removed;
    });
  },
};
