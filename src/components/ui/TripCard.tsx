"use client";

import Link from "next/link";
import { TagChip, type TagType } from "./TagChip";

interface TripTag {
  id: string;
  name: string;
  type: TagType;
}

interface TripCardProps {
  id: string;
  title: string;
  theme: string;
  emoji: string;
  tags: TripTag[];
}

export function TripCard({ id, title, theme, emoji, tags }: TripCardProps) {
  const moodTags = tags.filter((t) => t.type === "MOOD");
  const levelTag = tags.find((t) => t.type === "LEVEL");

  return (
    <Link
      href={`/trips/${id}`}
      className="flex cursor-pointer gap-4 rounded-xl border border-[#1e1e1e] bg-[#181818] p-4 transition-colors duration-200 hover:border-[#333]"
    >
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-[#1e1e1e] bg-[#141414] text-3xl"
        aria-hidden="true"
      >
        {emoji}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-base font-medium leading-snug text-gray-200">
            {title}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <TagChip name={theme} type="THEME" />
            {moodTags.map((t) => (
              <TagChip key={t.id} name={t.name} type="MOOD" />
            ))}
          </div>
        </div>
        {levelTag && (
          <p className="mt-2 text-xs text-emerald-500/60">{levelTag.name}</p>
        )}
      </div>
    </Link>
  );
}
