"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminUser {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?pageSize=50");
      const d = await res.json();
      setUsers(d.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleRole(id: string, newRole: "USER" | "ADMIN") {
    await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
  }

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">用户管理</p>
      {loading ? (
        <p className="text-sm text-gray-500">加载中...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-xs text-gray-500">
                <th className="pb-2 pr-3 font-medium">用户名</th>
                <th className="pb-2 pr-3 font-medium">角色</th>
                <th className="pb-2 pr-3 font-medium">注册时间</th>
                <th className="pb-2 pr-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#141414]">
                  <td className="py-2.5 pr-3 text-gray-300">{u.username}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] ${
                        u.role === "ADMIN"
                          ? "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20"
                          : "text-gray-500 bg-white/5 border-[#222]"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="py-2.5">
                    {u.role === "USER" ? (
                      <button
                        type="button"
                        onClick={() => toggleRole(u.id, "ADMIN")}
                        className="cursor-pointer rounded border border-[#fbbf24]/20 px-2 py-1 text-[10px] text-[#fbbf24] hover:bg-[#fbbf24]/10 transition-colors"
                      >
                        提升为管理员
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleRole(u.id, "USER")}
                        className="cursor-pointer rounded border border-[#888]/20 px-2 py-1 text-[10px] text-gray-400 hover:bg-white/5 transition-colors"
                      >
                        降级为普通用户
                      </button>
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
