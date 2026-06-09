"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  tripId: string;
  initialFavorited: boolean;
  initialCount: number;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function FavoriteButton({
  tripId,
  initialFavorited,
  initialCount,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;

    setLoading(true);
    const method = favorited ? "DELETE" : "POST";
    const prevFavorited = favorited;
    const prevCount = count;

    // Optimistic update
    setFavorited(!favorited);
    setCount(favorited ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/trips/${tripId}/favorite`, { method });
      if (!res.ok) {
        setFavorited(prevFavorited);
        setCount(prevCount);
      }
    } catch {
      setFavorited(prevFavorited);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-pressed={favorited}
      aria-label={favorited ? "取消收藏" : "收藏"}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 min-h-[44px] cursor-pointer ${
        favorited
          ? "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24] hover:border-[#fbbf24]/50"
          : "border-[#2a2a2a] bg-transparent text-gray-500 hover:border-[#444] hover:text-gray-300"
      }`}
    >
      <StarIcon filled={favorited} />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
