import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as string | null;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

  const where: Record<string, unknown> = { authorId: userId };
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    where.status = status;
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      include: {
        tripTags: { include: { tag: true } },
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
    imageUrl: trip.imageUrl,
    status: trip.status,
    likeCount: trip.likeCount,
    favoriteCount: trip.favoriteCount,
    isOfficial: trip.isOfficial,
    tags: trip.tripTags.map((tt) => ({
      id: tt.tag.id,
      name: tt.tag.name,
      type: tt.tag.type,
    })),
    createdAt: trip.createdAt,
  }));

  return NextResponse.json({ data, total, page, pageSize, message: "ok" }, { status: 200 });
}
