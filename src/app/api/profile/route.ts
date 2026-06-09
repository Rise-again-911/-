import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";
import { handleZodError, apiSuccess, apiError } from "@/lib/api-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "请先登录", 401);
  }

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true, avatar: true, bio: true, createdAt: true },
  });

  if (!user) {
    return apiError("NOT_FOUND", "用户不存在", 404);
  }

  const tripCount = await prisma.trip.count({ where: { authorId: userId } });

  return apiSuccess({ ...user, tripCount });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "请先登录", 401);
  }

  const userId = (session.user as { id: string }).id;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "请求体格式错误", 400);
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { id: true, username: true, role: true, avatar: true, bio: true, createdAt: true },
  });

  return apiSuccess(updated, "资料已更新");
}
