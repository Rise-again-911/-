import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  tripCreateSchema,
  commentSchema,
  profileUpdateSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  it("should fail when username is shorter than 3 characters", () => {
    const result = registerSchema.safeParse({ username: "ab", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("should pass with valid username and password", () => {
    const result = registerSchema.safeParse({ username: "validUser_1", password: "pass123" });
    expect(result.success).toBe(true);
  });

  it("should fail when username contains invalid characters", () => {
    const result = registerSchema.safeParse({ username: "invalid user", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("should fail when password is shorter than 6 characters", () => {
    const result = registerSchema.safeParse({ username: "validUser", password: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should fail when username is empty", () => {
    const result = loginSchema.safeParse({ username: "", password: "pass123" });
    expect(result.success).toBe(false);
  });

  it("should fail when password is empty", () => {
    const result = loginSchema.safeParse({ username: "user", password: "" });
    expect(result.success).toBe(false);
  });

  it("should pass with valid credentials", () => {
    const result = loginSchema.safeParse({ username: "user", password: "pass123" });
    expect(result.success).toBe(true);
  });
});

describe("tripCreateSchema", () => {
  const validTrip = {
    title: "测试投稿",
    summary: "测试摘要",
    story: "这是一个测试故事内容，描述了旅行体验。",
    theme: "废墟美学" as const,
    tagIds: ["tag-1"],
    location: "测试地点",
    bestTime: "清晨",
    difficulty: "简单",
    budget: "免费",
    safety: "安全",
    highlights: ["亮点1", "亮点2", "亮点3"],
    emoji: "📍",
    imageUrl: "",
  };

  it("should fail when highlights has fewer than 3 items", () => {
    const result = tripCreateSchema.safeParse({
      ...validTrip,
      highlights: ["仅一个亮点"],
    });
    expect(result.success).toBe(false);
  });

  it("should pass with a complete valid trip", () => {
    const result = tripCreateSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
  });

  it("should fail when theme is invalid", () => {
    const result = tripCreateSchema.safeParse({
      ...validTrip,
      theme: "不存在的主题",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when title exceeds 60 characters", () => {
    const result = tripCreateSchema.safeParse({
      ...validTrip,
      title: "x".repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it("should fail when tagIds is empty", () => {
    const result = tripCreateSchema.safeParse({
      ...validTrip,
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("should fail when content is empty", () => {
    const result = commentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("should pass with valid content", () => {
    const result = commentSchema.safeParse({ content: "这是一条评论" });
    expect(result.success).toBe(true);
  });

  it("should fail when content exceeds 500 characters", () => {
    const result = commentSchema.safeParse({ content: "x".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("profileUpdateSchema", () => {
  it("should fail when bio exceeds 200 characters", () => {
    const result = profileUpdateSchema.safeParse({ bio: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should pass with valid bio", () => {
    const result = profileUpdateSchema.safeParse({ bio: "简短自我介绍" });
    expect(result.success).toBe(true);
  });

  it("should pass with empty bio (optional)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
