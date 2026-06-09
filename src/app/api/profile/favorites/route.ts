import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      trip: {
        include: {
          tripTags: { include: { tag: true } },
          author: { select: { id: true, username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = favorites.map((fav) => ({
    id: fav.trip.id,
    title: fav.trip.title,
    summary: fav.trip.summary,
    theme: fav.trip.theme,
    emoji: fav.trip.emoji,
    imageUrl: fav.trip.imageUrl,
    status: fav.trip.status,
    likeCount: fav.trip.likeCount,
    favoriteCount: fav.trip.favoriteCount,
    tags: fav.trip.tripTags.map((tt) => ({
      id: tt.tag.id,
      name: tt.tag.name,
      type: tt.tag.type,
    })),
    author: fav.trip.author,
    createdAt: fav.trip.createdAt,
  }));

  return NextResponse.json({ data, message: "ok" }, { status: 200 });
}
