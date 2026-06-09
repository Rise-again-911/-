import { prisma } from "@/lib/prisma";
import { TripCard } from "@/components/ui/TripCard";
import type { TagType } from "@/components/ui/TagChip";

export default async function HomePage() {
  const trips = await prisma.trip.findMany({
    where: { status: "APPROVED" },
    include: {
      tripTags: { include: { tag: true } },
      author: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <main className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gray-600">
        探索不可思议的旅行
      </p>

      {trips.length === 0 ? (
        <p className="text-sm text-gray-500">暂无内容</p>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => {
            const tags: { id: string; name: string; type: TagType }[] =
              trip.tripTags.map((tt) => ({
                id: tt.tag.id,
                name: tt.tag.name,
                type: tt.tag.type as TagType,
              }));

            return (
              <TripCard
                key={trip.id}
                id={trip.id}
                title={trip.title}
                theme={trip.theme}
                emoji={trip.emoji}
                tags={tags}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
