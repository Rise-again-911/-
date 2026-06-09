import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "请先登录", 401);
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return apiError("NOT_FOUND", "用户不存在", 404);
  }

  return apiSuccess({
    id: user.id,
    username: user.username,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  });
}
