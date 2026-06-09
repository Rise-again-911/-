import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "100种不可思议旅行",
  description: "找到一种属于你的感觉",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
