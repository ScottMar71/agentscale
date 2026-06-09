import { test, expect } from "@playwright/test";

/**
 * Pilot journey — validates the core product narrative without auth.
 * Runs in demo mode when Supabase is not configured (local dev / CI).
 */
test.describe("Pilot journey (demo mode)", () => {
  test("landing → demo dashboard → registry → scenarios → certifications → governance", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("AgentScale");

    await page.goto("/dashboard/demo", { waitUntil: "domcontentloaded" });

    const url = page.url();
    if (url.includes("/login")) {
      test.skip(true, "Auth required — set PLAYWRIGHT_TEST_EMAIL for authenticated runs");
      return;
    }

    await expect(page.getByRole("heading", { name: /Executive Dashboard/i })).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/Demo dashboard/i);

    await page.getByRole("link", { name: "Agent Registry" }).click();
    await expect(page.getByRole("heading", { name: /Agent Registry/i })).toBeVisible();
    await expect(page.locator("body")).toContainText(/agent/i);

    await page.getByRole("link", { name: "View Sales SDR Agent" }).click();
    await expect(page.getByText("Agent profile")).toBeVisible();
    await expect(page.getByText("Back to registry")).toBeVisible();

    await page.getByRole("link", { name: "Scenario Testing" }).click();
    await expect(page.getByRole("heading", { name: /Scenario Testing/i })).toBeVisible();

    await page.getByRole("link", { name: "Certifications" }).click();
    await expect(page.getByRole("heading", { name: /Certifications/i })).toBeVisible();

    await page.getByRole("link", { name: "Governance" }).click();
    await expect(page.getByRole("heading", { name: /Governance/i })).toBeVisible();
  });

  test("demo mode banner shows when Supabase is not configured", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const url = page.url();
    if (url.includes("/login")) {
      test.skip(true, "Auth enabled — demo banner not shown on live dashboard");
      return;
    }

    await expect(page.getByRole("status").first()).toContainText(/Demo mode/i);
  });
});

test.describe("Pilot journey (authenticated)", () => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  test.skip(!email || !password, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");

  test("landing → login → dashboard → agent detail", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("AgentScale");

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Executive Dashboard/i })).toBeVisible();

    await page.getByRole("link", { name: "Agent Registry" }).click();
    await expect(page.getByRole("heading", { name: /Agent Registry/i })).toBeVisible();

    const agentLink = page.getByRole("link", { name: /^View / }).first();
    await agentLink.click();
    await expect(page.getByText("Agent profile")).toBeVisible();
    await expect(page.getByText("Back to registry")).toBeVisible();
  });
});

test.describe("Health check", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("agentscale");
    expect(body.checks).toBeDefined();
  });
});
