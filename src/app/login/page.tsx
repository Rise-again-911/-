import { LoginForm } from "@/components/forms/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-xl font-semibold text-white">登录</h1>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          还没有账号？
          <Link href="/register" className="text-gray-300 hover:text-white ml-1 transition-colors">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
