import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "请先登录", 401);
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const userRole = (session.user as { role: string }).role;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return apiError("NOT_FOUND", "评论不存在", 404);
  }

  if (comment.userId !== userId && userRole !== "ADMIN") {
    return apiError("FORBIDDEN", "无权删除此评论", 403);
  }

  await prisma.comment.delete({ where: { id } });

  return apiSuccess(null, "评论已删除");
}
