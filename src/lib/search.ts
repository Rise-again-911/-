import { prisma } from "./prisma";
import { KEYWORD_MAP } from "./constants";
import { Prisma } from "@prisma/client";

export function mapKeyword(query: string) {
  const lower = query.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        return {
          themes: [...entry.mapToThemes],
          moods: [...entry.mapToMoods],
          levels: [...entry.mapToLevels],
        };
      }
    }
  }
  return null;
}

export async function searchTrips(query: string, page: number, pageSize: number) {
  const mapped = mapKeyword(query);
  const lower = query.toLowerCase();

  /* Build filter conditions */
  const andConditions: Prisma.TripWhereInput[] = [{ status: "APPROVED" }];

  if (mapped) {
    const tagConditions: Prisma.TripWhereInput[] = [];
    if (mapped.themes.length > 0) {
      andConditions.push({ theme: { in: mapped.themes } });
    }
    if (mapped.moods.length > 0 || mapped.levels.length > 0) {
      const mappedTags = [...mapped.moods, ...mapped.levels];
      tagConditions.push({ tripTags: { some: { tag: { name: { in: mappedTags } } } } });
      andConditions.push(...tagConditions);
    }
  } else {
    /* Plain text search across multiple fields */
    andConditions.push({
      OR: [
        { title: { contains: lower } },
        { summary: { contains: lower } },
        { location: { contains: lower } },
        { highlights: { contains: lower } },
        { tripTags: { some: { tag: { name: { contains: lower } } } } },
      ],
    });
  }

  const where: Prisma.TripWhereInput = { AND: andConditions };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      include: {
        tripTags: { include: { tag: true } },
        author: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips, total, page, pageSize };
}
