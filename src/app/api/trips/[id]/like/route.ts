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

  // Check if already liked
  const existing = await prisma.like.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "已经点过赞了" } },
      { status: 409 }
    );
  }

  const [_, updatedTrip] = await prisma.$transaction([
    prisma.like.create({ data: { userId, tripId } }),
    prisma.trip.update({
      where: { id: tripId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    }),
  ]);

  return NextResponse.json(
    { data: { liked: true, likeCount: updatedTrip.likeCount }, message: "点赞成功" },
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

  const existing = await prisma.like.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "尚未点赞" } },
      { status: 404 }
    );
  }

  const [_, updatedTrip] = await prisma.$transaction([
    prisma.like.delete({ where: { userId_tripId: { userId, tripId } } }),
    prisma.trip.update({
      where: { id: tripId },
      data: { likeCount: { decrement: 1 } },
      select: { likeCount: true },
    }),
  ]);

  return NextResponse.json(
    { data: { liked: false, likeCount: updatedTrip.likeCount }, message: "已取消点赞" },
    { status: 200 }
  );
}
