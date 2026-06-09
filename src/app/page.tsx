"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TripCard } from "@/components/ui/TripCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterCloud } from "@/components/ui/FilterCloud";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TagType } from "@/components/ui/TagChip";

interface TripItem {
  id: string;
  title: string;
  theme: string;
  emoji: string;
  tags: { id: string; name: string; type: TagType }[];
}

interface FilterTag {
  id: string;
  name: string;
  type: TagType;
}

const ALL_TRIPS = 50;

export default function HomePage() {
  const router = useRouter();
  const [allTrips, setAllTrips] = useState<TripItem[]>([]);
  const [filterTags, setFilterTags] = useState<FilterTag[]>([]);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blindLoading, setBlindLoading] = useState(false);
  const [blindError, setBlindError] = useState("");
  const initialLoadDone = useRef(false);

  // Initial load of all trips
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    async function load() {
      try {
        const res = await fetch(`/api/trips?pageSize=${ALL_TRIPS}`);
        if (!res.ok) throw new Error("加载失败");
        const d = await res.json();
        setAllTrips(d.data);
      } catch {
        setError("加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Fetch filter tags
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => {
        const all: FilterTag[] = [];
        for (const type of ["THEME", "MOOD", "LEVEL"] as const) {
          if (d.data?.[type]) {
            for (const t of d.data[type]) {
              all.push({ id: t.id, name: t.name, type: type as TagType });
            }
          }
        }
        setFilterTags(all);
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      const trimmed = query.trim();

      if (!trimmed && activeTags.size === 0) {
        // No filter at all — reload all
        setLoading(true);
        setError("");
        try {
          const res = await fetch(`/api/trips?pageSize=${ALL_TRIPS}`);
          if (!res.ok) throw new Error("");
          const d = await res.json();
          setAllTrips(d.data);
        } catch {
          setError("加载失败，请稍后重试");
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/trips/search?q=${encodeURIComponent(trimmed)}&pageSize=${ALL_TRIPS}`
        );
        const d = await res.json();
        if (!res.ok) {
          setError(d.error?.message || "搜索失败");
          return;
        }
        setAllTrips(d.data);
      } catch {
        setError("加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
    [activeTags]
  );

  const handleToggleTag = useCallback(
    (tagName: string) => {
      setActiveTags((prev) => {
        const next = new Set(prev);
        if (next.has(tagName)) {
          next.delete(tagName);
        } else {
          next.add(tagName);
        }
        return next;
      });
    },
    []
  );

  const clearAll = () => {
    setSearchQuery("");
    setActiveTags(new Set());
    setError("");
    setLoading(true);
    fetch(`/api/trips?pageSize=${ALL_TRIPS}`)
      .then((r) => r.json())
      .then((d) => {
        setAllTrips(d.data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败");
        setLoading(false);
      });
  };

  // Theme filters that the backend supports via ?theme=
  const themeFiltered = (() => {
    const activeTheme = Array.from(activeTags).find((name) =>
      filterTags.find((t) => t.name === name && t.type === "THEME")
    );
    if (!activeTheme) return allTrips;
    return allTrips.filter((trip) => trip.theme === activeTheme);
  })();

  // Mood/Level filters applied client-side
  const moodLevelTags = Array.from(activeTags).filter((name) =>
    filterTags.find((t) => t.name === name && t.type !== "THEME")
  );

  const filteredTrips = themeFiltered.filter((trip) => {
    if (moodLevelTags.length === 0) return true;
    const tripTagNames = new Set(trip.tags.map((t) => t.name));
    return moodLevelTags.every((tag) => tripTagNames.has(tag));
  });

  const hasActiveFilters = activeTags.size > 0 || searchQuery.trim().length > 0;

  return (
    <main className="mx-auto max-w-2xl px-5 pt-24 pb-12">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          找到一种属于你的感觉
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          不是找景点，是找一种还没被发现的体验
        </p>
      </section>

      {/* Search + Blind Box */}
      <section className="mb-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="搜索旅行灵感..."
            />
          </div>
          <button
            type="button"
            disabled={blindLoading}
            onClick={async () => {
              setBlindLoading(true);
              setBlindError("");
              try {
                const res = await fetch("/api/blindbox");
                if (!res.ok) throw new Error("");
                const d = await res.json();
                router.push(`/trips/${d.data.id}`);
              } catch {
                setBlindError("请稍后重试");
                setBlindLoading(false);
              }
            }}
            className="flex h-[50px] flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#1e1e1e] bg-[#181818] px-4 text-sm text-gray-400 transition-colors hover:border-[#444] hover:text-gray-200 disabled:cursor-wait disabled:opacity-60"
            aria-label="随机发现一个旅行灵感"
          >
            {blindLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    opacity="0.25"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="hidden sm:inline">寻找中...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 8.25h15m-16.5 7.5h15M10.5 2.25L8.25 21.75m7.5-19.5L13.5 21.75"
                  />
                </svg>
                <span className="hidden sm:inline">随机发现</span>
              </>
            )}
          </button>
        </div>
        {blindError && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {blindError}
          </p>
        )}
      </section>

      {/* Filter Cloud */}
      <section className="mb-6">
        <FilterCloud
          tags={filterTags}
          activeTags={activeTags}
          onToggle={handleToggleTag}
        />
      </section>

      {/* Active filters bar */}
      {hasActiveFilters && (
        <div className="mb-5 flex items-center gap-2">
          <p className="text-xs text-gray-500">
            {filteredTrips.length} 个结果
            {searchQuery.trim() && ` · 「${searchQuery.trim()}」`}
            {activeTags.size > 0 &&
              ` · ${Array.from(activeTags).join(" · ")}`}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer rounded-full border border-[#2a2a2a] px-3 py-1 text-xs text-gray-500 transition-colors hover:border-[#555] hover:text-gray-300"
          >
            清除全部
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse gap-4 rounded-xl border border-[#1e1e1e] bg-[#181818] p-4"
            >
              <div className="h-16 w-16 rounded-lg bg-[#1f1f1f]" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-3 w-3/4 rounded bg-[#1f1f1f]" />
                <div className="h-2.5 w-1/2 rounded bg-[#1f1f1f]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="⚠"
          message={error}
          suggestions={["重试"]}
          onSuggestionClick={() => {
            clearAll();
          }}
        />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          icon="🔮"
          message="还没有找到匹配的旅行灵感"
          suggestions={["孤独", "废墟", "星空", "没人", "节日", "刺激"]}
          onSuggestionClick={(s) => {
            setSearchQuery(s);
            handleSearch(s);
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              title={trip.title}
              theme={trip.theme}
              emoji={trip.emoji}
              tags={trip.tags}
            />
          ))}
        </div>
      )}
    </main>
  );
}
