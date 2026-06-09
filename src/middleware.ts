import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;

  // 未登录 → 重定向 /login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 已登录但非 ADMIN → 重定向 / （仅对 admin 路径）
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ADMIN 访问 /admin → 放行
  return NextResponse.next();
});

export const config = {
  matcher: ["/create", "/profile", "/admin/:path*"],
};
