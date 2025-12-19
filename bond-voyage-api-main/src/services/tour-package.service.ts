import { prisma } from "@/config/database";
import { Prisma } from "@prisma/client";

interface TourPackageActivityInput {
  time: string;
  title: string;
  description?: string | null;
  location?: string | null;
  icon?: string | null;
  order: number;
}

interface TourPackageDayInput {
  dayNumber: number;
  title?: string | null;
  activities?: TourPackageActivityInput[];
}

interface CreateTourPackageInput {
  title: string;
  destination: string;
  category?: string | null;
  description?: string | null;
  price: number;
  duration: number;
  thumbUrl?: string | null;
  isActive?: boolean;
  days?: TourPackageDayInput[];
}

interface UpdateTourPackageInput extends Partial<CreateTourPackageInput> {}

export const TourPackageService = {
  async create(data: CreateTourPackageInput) {
    return prisma.tourPackage.create({
      data: {
        title: data.title,
        destination: data.destination,
        category: data.category ?? null,
        description: data.description ?? null,
        price: data.price as unknown as Prisma.Decimal,
        duration: data.duration,
        thumbUrl: data.thumbUrl ?? null,
        isActive: data.isActive ?? true,
        days: data.days
          ? {
              create: data.days.map((day) => ({
                dayNumber: day.dayNumber,
                title: day.title ?? null,
                activities: day.activities
                  ? {
                      create: day.activities.map((activity) => ({
                        time: activity.time,
                        title: activity.title,
                        description: activity.description ?? null,
                        location: activity.location ?? null,
                        icon: activity.icon ?? null,
                        order: activity.order,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: { activities: { orderBy: { order: "asc" } } },
        },
      },
    });
  },

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TourPackageWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    const [items, total] = await prisma.$transaction([
      prisma.tourPackage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { activities: { orderBy: { order: "asc" } } },
          },
        },
      }),
      prisma.tourPackage.count({ where }),
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

  async getById(id: string) {
    return prisma.tourPackage.findUnique({
      where: { id },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: { activities: { orderBy: { order: "asc" } } },
        },
      },
    });
  },

  async update(id: string, data: UpdateTourPackageInput) {
    return prisma.$transaction(async (tx) => {
      if (data.days) {
        await tx.tourPackageDay.deleteMany({ where: { tourPackageId: id } });
      }

      return tx.tourPackage.update({
        where: { id },
        data: {
          title: data.title,
          destination: data.destination,
          category: data.category ?? undefined,
          description: data.description ?? undefined,
          price: data.price ? (data.price as unknown as Prisma.Decimal) : undefined,
          duration: data.duration,
          thumbUrl: data.thumbUrl ?? undefined,
          isActive: data.isActive,
          days: data.days
            ? {
                create: data.days.map((day) => ({
                  dayNumber: day.dayNumber,
                  title: day.title ?? null,
                  activities: day.activities
                    ? {
                        create: day.activities.map((activity) => ({
                          time: activity.time,
                          title: activity.title,
                          description: activity.description ?? null,
                          location: activity.location ?? null,
                          icon: activity.icon ?? null,
                          order: activity.order,
                        })),
                      }
                    : undefined,
                })),
              }
            : undefined,
        },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { activities: { orderBy: { order: "asc" } } },
          },
        },
      });
    });
  },

  async remove(id: string) {
    return prisma.tourPackage.delete({ where: { id } });
  },
};
