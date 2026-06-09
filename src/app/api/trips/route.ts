import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { tripCreateSchema } from "@/lib/validations";
import { handleZodError, apiSuccess, apiError } from "@/lib/api-utils";

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

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "请先登录", 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "请求体格式错误", 400);
  }

  const parsed = tripCreateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { tagIds, ...tripData } = parsed.data;
  const userId = (session.user as { id: string }).id;

  // Validate all tagIds exist
  const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
  if (tags.length !== tagIds.length) {
    return apiError("INVALID_TAGS", "部分标签 ID 不存在", 400);
  }

  const trip = await prisma.trip.create({
    data: {
      ...tripData,
      highlights: JSON.stringify(tripData.highlights),
      authorId: userId,
      status: "PENDING",
      isOfficial: false,
      tripTags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: {
      tripTags: { include: { tag: true } },
    },
  });

  return apiSuccess(
    {
      id: trip.id,
      title: trip.title,
      status: trip.status,
    },
    "投稿成功，等待审核",
    201
  );
}
