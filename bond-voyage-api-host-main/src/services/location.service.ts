import { prisma } from "@/config/database";

export const LocationService = {
  search: async (query: string, normalizedQuery: string) => {
    return prisma.location.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            alias: {
              has: normalizedQuery,
            },
          },
        ],
      },
      take: 5,
      orderBy: {
        name: "asc",
      },
    });
  },
};
