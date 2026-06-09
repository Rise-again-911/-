import { test, expect } from "@playwright/test";

test("home page loads with trip cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("找到一种属于你的感觉");
  // Should have trip cards
  const cards = page.locator("a[href^='/trips/']");
  await expect(cards.first()).toBeVisible({ timeout: 10000 });
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

test("search bar is visible and can type", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill("没人");
  // Wait for debounce
  await page.waitForTimeout(500);
  // Should see result count indicator
  const resultBar = page.locator("text=个结果");
  await expect(resultBar).toBeVisible({ timeout: 5000 });
});

test("filter cloud tags are visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=主题")).toBeVisible();
  await expect(page.locator("text=情绪")).toBeVisible();
  await expect(page.locator("text=小众等级")).toBeVisible();
});

test("blind box button navigates to a trip", async ({ page }) => {
  await page.goto("/");
  const blindBtn = page.locator('button[aria-label="随机发现一个旅行灵感"]');
  await expect(blindBtn).toBeVisible();
  await blindBtn.click();
  // Should navigate to /trips/[id]
  await page.waitForURL(/\/trips\//, { timeout: 10000 });
  expect(page.url()).toContain("/trips/");
});

test("tag chip click filters results", async ({ page }) => {
  await page.goto("/");
  // Click a theme tag
  await page.locator('span[role="button"]:has-text("反向小城")').first().click();
  // Should show result count bar
  await expect(page.locator("text=个结果")).toBeVisible({ timeout: 5000 });
  // Clear all
  await page.locator("button:has-text('清除全部')").click();
  // Results should be back
  await expect(page.locator("a[href^='/trips/']").first()).toBeVisible({ timeout: 5000 });
});

test("header shows login/register when not logged in", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav")).toContainText("首页");
  await expect(page.locator("nav")).toContainText("登录");
  await expect(page.locator("nav")).toContainText("注册");
});
