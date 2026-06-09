"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "数据概览" },
  { href: "/admin/posts", label: "帖子审核" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/comments", label: "评论管理" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 flex-shrink-0 border-r border-[#1e1e1e] py-6">
      <p className="mb-4 px-4 text-xs font-medium uppercase tracking-[0.2em] text-[#4a4a4a]">管理后台</p>
      <nav aria-label="后台导航" className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-2.5 py-2 text-sm transition-colors duration-200 ${
                active
                  ? "bg-white/8 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
