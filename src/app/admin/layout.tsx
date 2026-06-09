import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-2xl px-5 pt-24 pb-12">
        <h1 className="text-xl font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-500">需要管理员权限才能访问此页面</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen pt-14">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
