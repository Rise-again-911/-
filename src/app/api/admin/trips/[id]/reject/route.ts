import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
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

  const updated = await prisma.trip.update({
    where: { id },
    data: { status: "REJECTED" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ data: updated, message: "审核不通过" }, { status: 200 });
}
