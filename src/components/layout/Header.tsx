"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur" role="banner">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-wide text-white/90 transition-colors duration-200 hover:text-white"
        >
          100种不可思议旅行
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
          >
            首页
          </Link>
          {session ? (
            <>
              <Link
                href="/create"
                className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
              >
                发帖
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
              >
                {(session.user as { name?: string })?.name ?? "个人中心"}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
