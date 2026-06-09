import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const status = searchParams.get("status") as string | null;

  const where: Record<string, unknown> = {};
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    where.status = status;
  }

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

  const data = trips.map((trip) => ({
    id: trip.id,
    title: trip.title,
    summary: trip.summary,
    theme: trip.theme,
    emoji: trip.emoji,
    status: trip.status,
    likeCount: trip.likeCount,
    favoriteCount: trip.favoriteCount,
    isOfficial: trip.isOfficial,
    tags: trip.tripTags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, type: tt.tag.type })),
    author: trip.author,
    createdAt: trip.createdAt,
  }));

  return NextResponse.json({ data, total, page, pageSize, message: "ok" }, { status: 200 });
}
