import { auth } from "./auth";
import { apiError } from "./api-utils";

export async function requireAdmin() {
  const session = await auth();
  if (!session) return { error: apiError("UNAUTHORIZED", "请先登录", 401) };
  if ((session.user as { role?: string }).role !== "ADMIN")
    return { error: apiError("FORBIDDEN", "需要管理员权限", 403) };
  return { session };
}
