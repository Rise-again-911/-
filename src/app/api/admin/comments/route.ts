import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      include: {
        user: { select: { id: true, username: true } },
        trip: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comment.count(),
  ]);

  const data = comments.map((c) => ({
    id: c.id,
    content: c.content,
    user: c.user,
    trip: c.trip,
    createdAt: c.createdAt,
  }));

  return NextResponse.json({ data, total, page, pageSize, message: "ok" }, { status: 200 });
}
