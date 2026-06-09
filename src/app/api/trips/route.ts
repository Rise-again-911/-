import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const theme = searchParams.get("theme");
  const sortBy = searchParams.get("sortBy") || "createdAt";

  const where: Record<string, unknown> = { status: "APPROVED" };
  if (theme) {
    where.theme = theme;
  }

  const orderBy: Record<string, string> = {};
  if (sortBy === "likeCount" || sortBy === "favoriteCount") {
    orderBy[sortBy] = "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      include: {
        tripTags: { include: { tag: true } },
        author: { select: { id: true, username: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trip.count({ where }),
  ]);

  const data = trips.map((trip) => ({
    id: trip.id,
    title: trip.title,
    summary: trip.summary,
    theme: trip.theme,
    emoji: trip.emoji,
    imageUrl: trip.imageUrl,
    likeCount: trip.likeCount,
    favoriteCount: trip.favoriteCount,
    isOfficial: trip.isOfficial,
    tags: trip.tripTags.map((tt) => ({
      id: tt.tag.id,
      name: tt.tag.name,
      type: tt.tag.type,
    })),
    author: trip.author,
    createdAt: trip.createdAt,
  }));

  return NextResponse.json(
    { data, total, page, pageSize, message: "ok" },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: { code: "NOT_IMPLEMENTED", message: "POST /api/trips 将在阶段 6 实现" } },
    { status: 501 }
  );
}
