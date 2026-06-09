import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/create", label: "发帖" },
  { href: "/login", label: "登录" },
  { href: "/profile", label: "个人中心" },
  { href: "/admin", label: "后台" },
] as const;

export function Header() {
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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-gray-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
