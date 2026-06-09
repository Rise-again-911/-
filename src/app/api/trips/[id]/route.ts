import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      tripTags: { include: { tag: true } },
      author: { select: { id: true, username: true } },
    },
  });

  if (!trip || trip.status !== "APPROVED") {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Trip 不存在" } },
      { status: 404 }
    );
  }

  const highlights = (() => {
    try {
      return JSON.parse(trip.highlights) as string[];
    } catch {
      return [];
    }
  })();

  return NextResponse.json(
    {
      data: {
        id: trip.id,
        title: trip.title,
        summary: trip.summary,
        story: trip.story,
        theme: trip.theme,
        location: trip.location,
        bestTime: trip.bestTime,
        difficulty: trip.difficulty,
        budget: trip.budget,
        safety: trip.safety,
        highlights,
        emoji: trip.emoji,
        imageUrl: trip.imageUrl,
        isOfficial: trip.isOfficial,
        status: trip.status,
        likeCount: trip.likeCount,
        favoriteCount: trip.favoriteCount,
        tags: trip.tripTags.map((tt) => ({
          id: tt.tag.id,
          name: tt.tag.name,
          type: tt.tag.type,
        })),
        author: trip.author,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      },
      message: "ok",
    },
    { status: 200 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: { code: "NOT_IMPLEMENTED", message: "PATCH 暂未实现" } },
    { status: 501 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: { code: "NOT_IMPLEMENTED", message: "DELETE 暂未实现" } },
    { status: 501 }
  );
}
