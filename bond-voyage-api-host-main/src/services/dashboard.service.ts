import { prisma } from "@/config/database";
import { BookingStatus, BookingType, Prisma } from "@prisma/client";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ACTIVE_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const buildTrendLabels = (year: number) => {
  const historical = MONTH_LABELS.map((label) => `${label} ${year}`);
  const future = MONTH_LABELS.slice(0, 6).map(
    (label) => `${label} ${year + 1}`
  );
  return [...historical, ...future];
};

const computeLinearRegression = (values: number[]) => {
  const n = values.length;
  const sumX = values.reduce((acc, _, index) => acc + (index + 1), 0);
  const sumY = values.reduce((acc, value) => acc + value, 0);
  const sumXY = values.reduce(
    (acc, value, index) => acc + value * (index + 1),
    0
  );
  const sumXX = values.reduce(
    (acc, _, index) => acc + (index + 1) * (index + 1),
    0
  );
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n || 0 };
  }
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

export const DashboardService = {
  async getStats(year: number, userId: string) {
    const [totalUsers, pendingApprovals, activeBookings, completedTrips] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.count({ where: { status: "COMPLETED" } }),
      ]);

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, avatarUrl: true, email: true }
    });

    const yearStart = new Date(Date.UTC(year, 0, 1));
    const nextYearStart = new Date(Date.UTC(year + 1, 0, 1));

    const bookingsInYear = await prisma.booking.findMany({
      where: {
        startDate: {
          gte: yearStart,
          lt: nextYearStart,
        },
      },
      select: { startDate: true },
    });

    const historical = Array.from({ length: 12 }, () => 0);
    bookingsInYear.forEach((booking) => {
      if (!booking.startDate) return;

      const monthIndex = booking.startDate.getUTCMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        historical[monthIndex] += 1;
      }
    });

    const { slope, intercept } = computeLinearRegression(historical);
    const predicted = Array.from({ length: 6 }, (_, index) => {
      const xValue = 13 + index;
      const value = slope * xValue + intercept;
      return Math.max(0, Math.round(value));
    });

    const statusGroups = await prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: {
        status: { in: ACTIVE_STATUSES },
      },
    });

    const statusDistribution = {
      completed: 0,
      pending: 0,
      active: 0,
      cancelled: 0,
    };

    statusGroups.forEach((group) => {
      switch (group.status) {
        case "COMPLETED":
          statusDistribution.completed = group._count._all;
          break;
        case "PENDING":
          statusDistribution.pending = group._count._all;
          break;
        case "CONFIRMED":
          statusDistribution.active = group._count._all;
          break;
        case "CANCELLED":
          statusDistribution.cancelled = group._count._all;
          break;
        default:
          break;
      }
    });

    const typeGroups = await prisma.booking.groupBy({
      by: ["type"],
      _count: { _all: true },
      where: {
        status: { in: ACTIVE_STATUSES },
      },
    });

    const typeDistribution: Record<
      "standard" | "requested" | "customized",
      number
    > = {
      standard: 0,
      requested: 0,
      customized: 0,
    };

    typeGroups.forEach((group) => {
      switch (group.type) {
        case "STANDARD":
          typeDistribution.standard = group._count._all;
          break;
        case "REQUESTED":
          typeDistribution.requested = group._count._all;
          break;
        case "CUSTOMIZED":
          typeDistribution.customized = group._count._all;
          break;
        default:
          break;
      }
    });

    return {
      user: userProfile,
      cards: {
        totalUsers,
        pendingApprovals,
        activeBookings,
        completedTrips,
        faqsCard: 0
      },
      trends: {
        year,
        labels: buildTrendLabels(year),
        historical,
        predicted,
      },
      distributions: {
        status: statusDistribution,
        type: typeDistribution,
      },
    };
  },

async getSelfStats(year: number, userId: string) {
    const userScope: Prisma.BookingWhereInput = {
      OR: [
        { userId },
        { itinerary: { collaborators: { some: { userId } } } },
      ],
    };

    const itineraryScope: Prisma.ItineraryWhereInput = {
      OR: [
        { userId },
        { collaborators: { some: { userId } } },
      ],
    };

    // Compute actual card values for the user
    const [travelPlans, pendingBookings, activeBookings, completedTrips] =
      await prisma.$transaction([
        // Travel Plans: Count itineraries in DRAFT status (not yet converted to booking)
        prisma.itinerary.count({
          where: {
            ...itineraryScope,
            status: "DRAFT",
          },
        }),
        // Pending: Bookings awaiting approval
        prisma.booking.count({
          where: {
            ...userScope,
            status: "PENDING",
          },
        }),
        // Active Bookings: Confirmed bookings
        prisma.booking.count({
          where: {
            ...userScope,
            status: "CONFIRMED",
          },
        }),
        // Completed Trips: Finished bookings
        prisma.booking.count({
          where: {
            ...userScope,
            status: "COMPLETED",
          },
        }),
      ]);

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, avatarUrl: true, email: true },
    });

    const yearStart = new Date(Date.UTC(year, 0, 1));
    const nextYearStart = new Date(Date.UTC(year + 1, 0, 1));

    const bookingsInYear = await prisma.booking.findMany({
      where: {
        ...userScope,
        startDate: {
          gte: yearStart,
          lt: nextYearStart,
        },
      },
      select: { startDate: true },
    });

    const historical = Array.from({ length: 12 }, () => 0);
    bookingsInYear.forEach((booking) => {
      if (!booking.startDate) return;

      const monthIndex = booking.startDate.getUTCMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        historical[monthIndex] += 1;
      }
    });

    const { slope, intercept } = computeLinearRegression(historical);
    const predicted = Array.from({ length: 6 }, (_, index) => {
      const xValue = 13 + index;
      const value = slope * xValue + intercept;
      return Math.max(0, Math.round(value));
    });

    const statusGroups = await prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: {
        ...userScope,
        status: { in: ACTIVE_STATUSES },
      },
    });

    const statusDistribution: { completed: number; pending: number; active: number; cancelled: number } = {
      completed: 0,
      pending: 0,
      active: 0,
      cancelled: 0,
    };

    const extractCount = (group: { _count?: unknown }): number => {
      if (typeof group._count === "object" && group._count !== null) {
        const maybeCount = (group._count as { _all?: number })._all;
        return typeof maybeCount === "number" ? maybeCount : 0;
      }
      return 0;
    };

    statusGroups.forEach((group) => {
      const count = extractCount(group);
      switch (group.status) {
        case "COMPLETED":
          statusDistribution.completed = count;
          break;
        case "PENDING":
          statusDistribution.pending = count;
          break;
        case "CONFIRMED":
          statusDistribution.active = count;
          break;
        case "CANCELLED":
          statusDistribution.cancelled = count;
          break;
        default:
          break;
      }
    });

    const typeGroups = await prisma.booking.groupBy({
      by: ["type"],
      _count: { _all: true },
      where: {
        ...userScope,
        status: { in: ACTIVE_STATUSES },
      },
    });

    const typeDistribution: { standard: number; requested: number; customized: number } = {
      standard: 0,
      requested: 0,
      customized: 0,
    };

    typeGroups.forEach((group) => {
      const count = extractCount(group);
      switch (group.type) {
        case "STANDARD":
          typeDistribution.standard = count;
          break;
        case "REQUESTED":
          typeDistribution.requested = count;
          break;
        case "CUSTOMIZED":
          typeDistribution.customized = count;
          break;
        default:
          break;
      }
    });

    return {
      user: userProfile,
      cards: {
        travelPlans,
        pending: pendingBookings,
        activeBookings,
        completedTrips,
      },
      trends: {
        year,
        labels: buildTrendLabels(year),
        historical,
        predicted,
      },
      distributions: {
        status: statusDistribution,
        type: typeDistribution,
      },
    };
  },
};
