"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TagChip, type TagType } from "@/components/ui/TagChip";

interface TripItem {
  id: string;
  title: string;
  summary: string;
  theme: string;
  emoji: string;
  imageUrl: string;
  status?: string;
  likeCount: number;
  favoriteCount: number;
  tags: { id: string; name: string; type: TagType }[];
  createdAt: string;
}

type TabKey = "trips" | "favorites";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "审核中", className: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20" },
  APPROVED: { label: "已发布", className: "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20" },
  REJECTED: { label: "未通过", className: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20" },
};

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("trips");
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [favorites, setFavorites] = useState<TripItem[]>([]);
  const [summary, setSummary] = useState({ tripCount: 0, username: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus !== "authenticated") return;

    async function load() {
      try {
        const [profileRes, tripsRes, favRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/profile/trips"),
          fetch("/api/profile/favorites"),
        ]);
        if (profileRes.ok) {
          const d = await profileRes.json();
          setSummary({ tripCount: d.data.tripCount, username: d.data.username });
        }
        if (tripsRes.ok) {
          const d = await tripsRes.json();
          setTrips(d.data);
        }
        if (favRes.ok) {
          const d = await favRes.json();
          setFavorites(d.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 pt-24 pb-12">
        <p className="text-sm text-gray-500">加载中...</p>
      </main>
    );
  }

  if (!session) return null;

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: "trips", label: "我的帖子", count: trips.length },
    { key: "favorites", label: "我的收藏", count: favorites.length },
  ];

  const activeItems = tab === "trips" ? trips : favorites;

  return (
    <main className="mx-auto max-w-2xl px-5 pt-24 pb-12">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">个人中心</p>
        <h1 className="mt-1 text-xl font-semibold text-white">{summary.username}</h1>
        <p className="mt-1 text-sm text-gray-500">共 {summary.tripCount} 篇投稿</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-0 border-b border-[#1e1e1e]" role="tablist" aria-label="个人内容分类">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm transition-colors duration-200 ${
              tab === t.key
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-gray-600">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeItems.length === 0 ? (
        <p className="text-sm text-gray-500">
          {tab === "trips" ? "还没有发布过帖子" : "还没有收藏任何帖子"}
        </p>
      ) : (
        <div className="space-y-3">
          {activeItems.map((item) => (
            <Link
              key={item.id}
              href={`/trips/${item.id}`}
              className="flex items-start gap-3 rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 transition-colors hover:border-[#333] cursor-pointer"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#141414] text-xl">
                {item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-200">{item.title}</p>
                  {item.status && STATUS_LABEL[item.status] && (
                    <span
                      className={`flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${STATUS_LABEL[item.status].className}`}
                    >
                      {STATUS_LABEL[item.status].label}
                    </span>
                  )}
                </div>
                {item.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <TagChip key={tag.id} name={tag.name} type={tag.type} />
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-[10px] text-gray-600 leading-5">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-600">
                  <span>
                    <span aria-hidden="true">❤</span> {item.likeCount}
                  </span>
                  <span>
                    <span aria-hidden="true">★</span> {item.favoriteCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
