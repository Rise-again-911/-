import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { apiError, apiSuccess, handleZodError } from "@/lib/api-utils";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { username, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return apiError("USERNAME_TAKEN", "用户名已被注册", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, passwordHash, role: "USER" },
    });

    return apiSuccess(
      { id: user.id, username: user.username, role: user.role, createdAt: user.createdAt },
      "注册成功",
      201
    );
  } catch {
    return apiError("INTERNAL_ERROR", "服务器错误", 500);
  }
}
