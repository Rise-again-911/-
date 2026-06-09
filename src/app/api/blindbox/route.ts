import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const approvedIds = await prisma.trip.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });

  if (approvedIds.length === 0) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "暂无可用灵感" } },
      { status: 404 }
    );
  }

  const randomIndex = Math.floor(Math.random() * approvedIds.length);
  const randomId = approvedIds[randomIndex].id;

  const trip = await prisma.trip.findUnique({
    where: { id: randomId },
    include: {
      tripTags: { include: { tag: true } },
    },
  });

  if (!trip) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Trip 不存在" } },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      data: {
        id: trip.id,
        title: trip.title,
        theme: trip.theme,
        emoji: trip.emoji,
        tags: trip.tripTags.map((tt) => ({
          id: tt.tag.id,
          name: tt.tag.name,
          type: tt.tag.type,
        })),
      },
      message: "ok",
    },
    { status: 200 }
  );
}
