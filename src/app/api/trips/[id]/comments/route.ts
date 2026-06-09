import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";
import { handleZodError, apiSuccess, apiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip || trip.status !== "APPROVED") {
    return apiError("NOT_FOUND", "Trip 不存在", 404);
  }

  const comments = await prisma.comment.findMany({
    where: { tripId: id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(
    comments.map((c) => ({
      id: c.id,
      content: c.content,
      user: c.user,
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "请先登录", 401);
  }

  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip || trip.status !== "APPROVED") {
    return apiError("NOT_FOUND", "Trip 不存在", 404);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "请求体格式错误", 400);
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const userId = (session.user as { id: string }).id;

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      userId,
      tripId: id,
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return apiSuccess(
    {
      id: comment.id,
      content: comment.content,
      user: comment.user,
      createdAt: comment.createdAt,
    },
    "评论发表成功",
    201
  );
}
