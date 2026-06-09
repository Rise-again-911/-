import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const [tripsTotal, tripsByStatus, usersTotal, adminCount, commentsTotal] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.groupBy({ by: ["status"], _count: true }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.comment.count(),
  ]);

  const statusMap: Record<string, number> = {};
  for (const s of tripsByStatus) {
    statusMap[s.status] = s._count;
  }

  return NextResponse.json({
    data: {
      trips: {
        total: tripsTotal,
        approved: statusMap.APPROVED || 0,
        pending: statusMap.PENDING || 0,
        rejected: statusMap.REJECTED || 0,
      },
      users: { total: usersTotal, admin: adminCount },
      comments: { total: commentsTotal },
    },
    message: "ok",
  });
}
