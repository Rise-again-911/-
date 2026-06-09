import { RegisterForm } from "@/components/forms/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-xl font-semibold text-white">注册</h1>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          已有账号？
          <Link href="/login" className="text-gray-300 hover:text-white ml-1 transition-colors">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
