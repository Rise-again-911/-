import { NextRequest, NextResponse } from "next/server";
import { searchTrips } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

  if (!q) {
    return NextResponse.json(
      { error: { code: "MISSING_QUERY", message: "请提供搜索关键词 q" } },
      { status: 400 }
    );
  }

  const { trips, total } = await searchTrips(q, page, pageSize);

  const data = trips.map((trip) => ({
    id: trip.id,
    title: trip.title,
    summary: trip.summary,
    theme: trip.theme,
    emoji: trip.emoji,
    likeCount: trip.likeCount,
    favoriteCount: trip.favoriteCount,
    tags: trip.tripTags.map((tt) => ({
      id: tt.tag.id,
      name: tt.tag.name,
      type: tt.tag.type,
    })),
    author: trip.author,
    createdAt: trip.createdAt,
  }));

  if (total === 0) {
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page,
        pageSize,
        suggestions: ["孤独", "星空", "废墟", "没人", "刺激", "节日"],
        message: "没有找到相关内容，试试以下关键词",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { data, total, page, pageSize, message: "ok" },
    { status: 200 }
  );
}
