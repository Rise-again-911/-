"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminTrip {
  id: string;
  title: string;
  theme: string;
  status: string;
  author: { id: string; username: string };
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20",
  APPROVED: "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  REJECTED: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已发布",
  REJECTED: "未通过",
};

export default function AdminPostsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trips?status=${filter}&pageSize=50`);
      const d = await res.json();
      setTrips(d.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  async function handleAction(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/trips/${id}/${action}`, { method: "PATCH" });
    fetchTrips();
  }

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">帖子审核</p>
      <div className="mb-4 flex gap-2">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs transition-colors ${
              filter === s
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">加载中...</p>
      ) : trips.length === 0 ? (
        <p className="text-sm text-gray-500">暂无帖子</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-xs text-gray-500">
                <th className="pb-2 pr-3 font-medium">标题</th>
                <th className="pb-2 pr-3 font-medium">作者</th>
                <th className="pb-2 pr-3 font-medium">主题</th>
                <th className="pb-2 pr-3 font-medium">状态</th>
                <th className="pb-2 pr-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-[#141414]">
                  <td className="py-2.5 pr-3 text-gray-300 max-w-xs truncate">{trip.title}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{trip.author.username}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{trip.theme}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${STATUS_STYLE[trip.status] || ""}`}>
                      {STATUS_LABEL[trip.status] || trip.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {trip.status === "PENDING" && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAction(trip.id, "approve")}
                          className="cursor-pointer rounded border border-[#34d399]/20 px-2 py-1 text-[10px] text-[#34d399] hover:bg-[#34d399]/10 transition-colors"
                        >
                          通过
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(trip.id, "reject")}
                          className="cursor-pointer rounded border border-[#f87171]/20 px-2 py-1 text-[10px] text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                        >
                          拒绝
                        </button>
                      </div>
                    )}
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
