"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  user: { id: string; username: string; avatar: string };
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export function CommentSection({ tripId }: { tripId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.data);
      }
    } catch {}
  }, [tripId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/trips/${tripId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        await fetchComments();
      } else {
        const d = await res.json();
        setError(d?.error?.message || "发表失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">
        评论 ({comments.length})
      </p>

      {comments.length > 0 && (
        <div className="mb-6">
          {comments.map((c, i) => (
            <div
              key={c.id}
              className={`py-3 ${i > 0 ? "border-t border-[#181818]" : ""}`}
            >
              <p className="text-sm font-medium text-gray-300">{c.user.username}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">{c.content}</p>
              <p className="mt-1 text-xs text-gray-600">{timeAgo(c.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      {session ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor={`comment-${tripId}`} className="sr-only">发表评论</label>
          <textarea
            id={`comment-${tripId}`}
            name="comment"
            className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-[#555]"
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写一条评论..."
          />
          {error && <p className="mt-1 text-sm text-red-400" role="alert">{error}</p>}
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "发表中..." : "发表评论"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          请先
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
            登录
          </Link>
          后才能发表评论
        </p>
      )}
    </div>
  );
}
