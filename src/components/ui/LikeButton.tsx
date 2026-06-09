"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  tripId: string;
  initialLiked: boolean;
  initialCount: number;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function LikeButton({ tripId, initialLiked, initialCount }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;

    setLoading(true);
    const method = liked ? "DELETE" : "POST";
    const prevLiked = liked;
    const prevCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/trips/${tripId}/like`, { method });
      if (!res.ok) {
        // Rollback
        setLiked(prevLiked);
        setCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
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
      aria-pressed={liked}
      aria-label={liked ? "取消点赞" : "点赞"}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 min-h-[44px] cursor-pointer ${
        liked
          ? "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171] hover:border-[#f87171]/50"
          : "border-[#2a2a2a] bg-transparent text-gray-500 hover:border-[#444] hover:text-gray-300"
      }`}
    >
      <HeartIcon filled={liked} />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
