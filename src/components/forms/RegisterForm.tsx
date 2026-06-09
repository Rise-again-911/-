"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (username.length < 3 || username.length > 30) {
      errs.username = "用户名需 3-30 个字符";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errs.username = "仅允许字母、数字、下划线";
    }
    if (password.length < 6) {
      errs.password = "密码至少 6 个字符";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "两次密码不一致";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data?.error?.message;
        if (msg?.includes("用户名已被注册")) {
          setErrors({ username: "用户名已被注册" });
        } else {
          setServerError(msg || "注册失败，请稍后重试");
        }
        return;
      }

      await signIn("credentials", { username, password, redirectTo: "/" });
    } catch {
      setServerError("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="register-username" className="mb-1.5 block text-xs font-medium text-gray-500">
          用户名
        </label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-[#555]"
          placeholder="3-30 位字母、数字或下划线"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-xs font-medium text-gray-500">
          密码
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-[#555]"
          placeholder="至少 6 个字符"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-medium text-gray-500">
          确认密码
        </label>
        <input
          id="register-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-[#555]"
          placeholder="再次输入密码"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.confirmPassword}</p>
        )}
      </div>

      {serverError && (
        <p className="flex items-center gap-1.5 text-sm text-red-400" role="alert">
          <span aria-hidden="true">⚠</span>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-lg bg-white py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "注册中..." : "注册"}
      </button>
    </form>
  );
}
