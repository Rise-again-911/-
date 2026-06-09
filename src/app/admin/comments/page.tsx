"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminComment {
  id: string;
  content: string;
  user: { id: string; username: string };
  trip: { id: string; title: string };
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments?pageSize=50");
      const d = await res.json();
      setComments(d.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleDelete(id: string) {
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    fetchComments();
  }

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">评论管理</p>
      {loading ? (
        <p className="text-sm text-gray-500">加载中...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">暂无评论</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-xs text-gray-500">
                <th className="pb-2 pr-3 font-medium">内容</th>
                <th className="pb-2 pr-3 font-medium">评论者</th>
                <th className="pb-2 pr-3 font-medium">所属帖子</th>
                <th className="pb-2 pr-3 font-medium">时间</th>
                <th className="pb-2 pr-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-b border-[#141414]">
                  <td className="py-2.5 pr-3 text-gray-300 max-w-[200px] truncate">{c.content}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{c.user.username}</td>
                  <td className="py-2.5 pr-3 text-gray-500 max-w-[150px] truncate">{c.trip.title}</td>
                  <td className="py-2.5 pr-3 text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="cursor-pointer rounded border border-[#f87171]/20 px-2 py-1 text-[10px] text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
