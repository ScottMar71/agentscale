import { test, expect } from "@playwright/test";

test.describe("AgentScale smoke", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("AgentScale");
  });

  test("pricing section is reachable", async ({ page }) => {
    await page.goto("/#pricing", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#pricing")).toBeVisible();
    await expect(page.getByText(/Starter|Growth|Enterprise/i).first()).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("dashboard route responds", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const url = page.url();
    if (url.includes("/login")) {
      await expect(page.getByLabel(/email/i)).toBeVisible();
    } else {
      await expect(page.getByText(/Executive Dashboard/i)).toBeVisible();
    }
  });

  test("demo dashboard route responds", async ({ page }) => {
    await page.goto("/dashboard/demo", { waitUntil: "domcontentloaded" });
    const url = page.url();
    if (url.includes("/login")) {
      await expect(page.getByLabel(/email/i)).toBeVisible();
    } else {
      await expect(page.getByText(/Executive Dashboard/i)).toBeVisible();
    }
  });
});
