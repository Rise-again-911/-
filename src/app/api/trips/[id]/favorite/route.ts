import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const { id: tripId } = await params;
  const userId = (session.user as { id: string }).id;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.status !== "APPROVED") {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Trip 不存在" } },
      { status: 404 }
    );
  }

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "已经收藏过了" } },
      { status: 409 }
    );
  }

  const [_, updatedTrip] = await prisma.$transaction([
    prisma.favorite.create({ data: { userId, tripId } }),
    prisma.trip.update({
      where: { id: tripId },
      data: { favoriteCount: { increment: 1 } },
      select: { favoriteCount: true },
    }),
  ]);

  return NextResponse.json(
    { data: { favorited: true, favoriteCount: updatedTrip.favoriteCount }, message: "收藏成功" },
    { status: 200 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const { id: tripId } = await params;
  const userId = (session.user as { id: string }).id;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Trip 不存在" } },
      { status: 404 }
    );
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "尚未收藏" } },
      { status: 404 }
    );
  }

  const [_, updatedTrip] = await prisma.$transaction([
    prisma.favorite.delete({ where: { userId_tripId: { userId, tripId } } }),
    prisma.trip.update({
      where: { id: tripId },
      data: { favoriteCount: { decrement: 1 } },
      select: { favoriteCount: true },
    }),
  ]);

  return NextResponse.json(
    { data: { favorited: false, favoriteCount: updatedTrip.favoriteCount }, message: "已取消收藏" },
    { status: 200 }
  );
}
