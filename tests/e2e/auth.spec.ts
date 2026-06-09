import { test, expect } from "@playwright/test";

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("h1, h2")).toContainText("登录");
  // Should have username and password fields
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("admin login flows through", async ({ page }) => {
  await page.goto("/login");
  await page.locator('input[name="username"]').fill("admin");
  await page.locator('input[name="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  // Should redirect to home
  await page.waitForURL("**/", { timeout: 10000 });
  // After login, header should show admin-specific links
  await expect(page.locator("nav")).toContainText("后台");
});

test("create page requires auth", async ({ page }) => {
  // If not logged in, should redirect to /login
  await page.goto("/create");
  await page.waitForURL(/\/login/, { timeout: 5000 });
  expect(page.url()).toContain("/login");
});

test("register page renders", async ({ page }) => {
  await page.goto("/register");
  await expect(page.locator("h1, h2")).toContainText("注册");
});
