import { z } from "zod";
import { THEME_VALUES } from "./constants";

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "仅允许字母数字下划线"),
  password: z.string().min(6).max(100, "密码不能超过100字符"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const tripCreateSchema = z.object({
  title: z.string().min(1).max(60),
  summary: z.string().min(1).max(200),
  story: z.string().min(1).max(500),
  theme: z.enum(THEME_VALUES),
  tagIds: z.array(z.string()).min(1).max(6),
  location: z.string().min(1),
  bestTime: z.string().min(1),
  difficulty: z.string().min(1),
  budget: z.string().min(1),
  safety: z.string().min(1),
  highlights: z.array(z.string().min(1).max(100)).min(3).max(5),
  emoji: z.string().optional().default("📍"),
  imageUrl: z.string().optional().default(""),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const profileUpdateSchema = z.object({
  bio: z.string().max(200).optional(),
  avatar: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TripCreateInput = z.infer<typeof tripCreateSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
