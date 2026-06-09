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

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "帖子不存在" } },
      { status: 404 }
    );
  }

  await prisma.trip.delete({ where: { id } });

  return NextResponse.json({ data: null, message: "帖子已删除" }, { status: 200 });
}
