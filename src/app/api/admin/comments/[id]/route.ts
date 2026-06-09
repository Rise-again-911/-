import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const { id } = await params;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "评论不存在" } },
      { status: 404 }
    );
  }

  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ data: null, message: "评论已删除" }, { status: 200 });
}
