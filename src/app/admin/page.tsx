"use client";

import { useState, useEffect } from "react";

interface Stats {
  trips: { total: number; approved: number; pending: number; rejected: number };
  users: { total: number; admin: number };
  comments: { total: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data))
      .catch(() => {});
  }, []);

  if (!stats) {
    return <p className="text-sm text-gray-500">加载中...</p>;
  }

  const cards = [
    { label: "帖子总数", value: stats.trips.total },
    { label: "待审核", value: stats.trips.pending, highlight: stats.trips.pending > 0 },
    { label: "已发布", value: stats.trips.approved },
    { label: "未通过", value: stats.trips.rejected },
    { label: "用户总数", value: stats.users.total },
    { label: "管理员", value: stats.users.admin },
    { label: "评论总数", value: stats.comments.total },
  ];

  return (
    <div>
      <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">数据概览</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3"
          >
            <p className="text-xs text-gray-500">{card.label}</p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                card.highlight ? "text-[#fbbf24]" : "text-white"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
