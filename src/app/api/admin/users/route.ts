import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (admin.error) return admin.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const role = searchParams.get("role") as string | null;

  const where: Record<string, unknown> = {};
  if (role === "USER" || role === "ADMIN") where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data: users, total, page, pageSize, message: "ok" }, { status: 200 });
}
