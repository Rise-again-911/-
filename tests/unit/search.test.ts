import { describe, it, expect } from "vitest";
import { mapKeyword } from "@/lib/search";

describe("mapKeyword", () => {
  it('"没人" should map to theme "反向小城"', () => {
    const result = mapKeyword("没人");
    expect(result).not.toBeNull();
    expect(result!.themes).toContain("反向小城");
  });

  it('"没人" should map to mood "孤独" or "松弛"', () => {
    const result = mapKeyword("没人");
    expect(result).not.toBeNull();
    const hasMood = result!.moods.includes("孤独") || result!.moods.includes("松弛");
    expect(hasMood).toBe(true);
  });

  it('"星空" should map to theme "暗夜星旅"', () => {
    const result = mapKeyword("星空");
    expect(result).not.toBeNull();
    expect(result!.themes).toContain("暗夜星旅");
  });

  it('"废墟" should map to theme "废墟美学"', () => {
    const result = mapKeyword("废墟");
    expect(result).not.toBeNull();
    expect(result!.themes).toContain("废墟美学");
  });

  it('"完全无关词" should return null, not throw', () => {
    expect(() => mapKeyword("完全无关词")).not.toThrow();
    const result = mapKeyword("完全无关词");
    expect(result).toBeNull();
  });

  it('"人少" should map to theme "反向小城"', () => {
    const result = mapKeyword("人少");
    expect(result).not.toBeNull();
    expect(result!.themes).toContain("反向小城");
  });

  it('"拍照" should map to "废墟美学" or "暗夜星旅"', () => {
    const result = mapKeyword("拍照");
    expect(result).not.toBeNull();
    const hasTheme =
      result!.themes.includes("废墟美学") || result!.themes.includes("暗夜星旅");
    expect(hasTheme).toBe(true);
  });
});
