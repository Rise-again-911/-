import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TagChip, type TagType } from "@/components/ui/TagChip";
import { TravelInfo } from "@/components/ui/TravelInfo";
import { CommentSection } from "@/components/ui/CommentSection";
import { LikeButton } from "@/components/ui/LikeButton";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const HIGHLIGHT_ICONS = ["📷", "🌊", "🤫", "🎯", "📍"];

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      tripTags: { include: { tag: true } },
      author: { select: { id: true, username: true } },
    },
  });

  if (!trip || trip.status !== "APPROVED") {
    notFound();
  }

  let isLiked = false;
  let isFavorited = false;
  if (userId) {
    const [like, favorite] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_tripId: { userId, tripId: id } },
      }),
      prisma.favorite.findUnique({
        where: { userId_tripId: { userId, tripId: id } },
      }),
    ]);
    isLiked = !!like;
    isFavorited = !!favorite;
  }

  const tags: { id: string; name: string; type: TagType }[] = trip.tripTags.map((tt) => ({
    id: tt.tag.id,
    name: tt.tag.name,
    type: tt.tag.type as TagType,
  }));

  const moodTags = tags.filter((t) => t.type === "MOOD");

  const highlights: string[] = (() => {
    try {
      return JSON.parse(trip.highlights) as string[];
    } catch {
      return [];
    }
  })();

  const hookSentence = trip.summary.split("。")[0] + "。";

  const similarTrips = await prisma.trip.findMany({
    where: { theme: trip.theme, id: { not: trip.id }, status: "APPROVED" },
    include: { tripTags: { include: { tag: true } } },
    take: 3,
  });

  return (
    <main className="mx-auto max-w-2xl pb-12">
      {/* Hero */}
      <section className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#141e30] via-[#1a2332] to-[#1e3a4d]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        <span className="text-7xl" aria-hidden="true">
          {trip.emoji}
        </span>
        <Link
          href="/"
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
          aria-label="返回首页"
        >
          ←
        </Link>
        <div className="absolute bottom-6 left-5 right-5 z-10">
          <TagChip name={trip.theme} type="THEME" />
          <h1
            className="mt-2 text-2xl font-semibold leading-tight text-white"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            {trip.title}
          </h1>
          {moodTags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {moodTags.map((t) => (
                <TagChip key={t.id} name={t.name} type="MOOD" />
              ))}
            </div>
          )}
          <p
            className="mt-1.5 text-sm italic text-gray-400"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            {hookSentence}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="px-5 pt-8 pb-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">
          关于这份体验
        </p>
        <p className="text-base leading-relaxed text-gray-300/90">{trip.story}</p>
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="px-5 pt-4 pb-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">
            玩法亮点
          </p>
          <div className="space-y-2.5">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base flex-shrink-0" aria-hidden="true">
                  {HIGHLIGHT_ICONS[i] || "•"}
                </span>
                <span className="text-sm leading-relaxed text-gray-300">{h}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar */}
      {similarTrips.length > 0 && (
        <section className="px-5 pt-4 pb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">
            如果你喜欢这个
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {similarTrips.map((st) => {
              const stMood = st.tripTags.find((tt) => tt.tag.type === "MOOD");
              return (
                <Link
                  key={st.id}
                  href={`/trips/${st.id}`}
                  className="w-36 flex-shrink-0 overflow-hidden rounded-lg border border-[#1e1e1e] bg-[#141414] transition-colors hover:border-[#333] cursor-pointer"
                >
                  <div className="flex h-20 items-center justify-center bg-[#181818] text-2xl">
                    {st.emoji}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="line-clamp-2 text-xs leading-snug text-gray-300">
                      {st.title}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-600">
                      {st.theme}
                      {stMood ? ` · ${stMood.tag.name}` : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <LikeButton
            tripId={trip.id}
            initialLiked={isLiked}
            initialCount={trip.likeCount}
          />
          <FavoriteButton
            tripId={trip.id}
            initialFavorited={isFavorited}
            initialCount={trip.favoriteCount}
          />
        </div>
      </section>

      {/* Travel Info */}
      <section className="px-5 pt-2">
        <TravelInfo
          location={trip.location}
          bestTime={trip.bestTime}
          difficulty={trip.difficulty}
          budget={trip.budget}
          safety={trip.safety}
        />
      </section>

      {/* Comments */}
      <section className="px-5 pt-6 pb-12">
        <CommentSection tripId={trip.id} />
      </section>
    </main>
  );
}
