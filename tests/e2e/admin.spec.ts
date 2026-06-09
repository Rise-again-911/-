import { test, expect } from "@playwright/test";

test("admin dashboard loads with stats", async ({ page }) => {
  // Login as admin first
  await page.goto("/login");
  await page.locator('input[name="username"]').fill("admin");
  await page.locator('input[name="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 10000 });

  // Navigate to admin
  await page.goto("/admin");
  // Should show dashboard cards
  await expect(page.locator("text=数据概览")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=帖子总数")).toBeVisible();
  await expect(page.locator("text=待审核")).toBeVisible();
  await expect(page.locator("text=用户总数")).toBeVisible();
  await expect(page.locator("text=评论总数")).toBeVisible();
});

test("admin sidebar navigation works", async ({ page }) => {
  await page.goto("/login");
  await page.locator('input[name="username"]').fill("admin");
  await page.locator('input[name="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 10000 });

  await page.goto("/admin");
  await page.locator("text=帖子审核").click();
  await expect(page.locator("text=帖子审核")).toBeVisible({ timeout: 5000 });

  await page.locator("text=用户管理").click();
  await expect(page.locator("text=用户管理")).toBeVisible({ timeout: 5000 });

  await page.locator("text=评论管理").click();
  await expect(page.locator("text=评论管理")).toBeVisible({ timeout: 5000 });
});

test("non-admin cannot access admin panel", async ({ page }) => {
  await page.goto("/admin");
  // Should see Access Denied or redirect
  const denied =
    (await page.locator("text=Access Denied").isVisible()) ||
    page.url().includes("/login");
  expect(denied).toBeTruthy();
});
