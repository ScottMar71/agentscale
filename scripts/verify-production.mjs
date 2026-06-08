#!/usr/bin/env node
/**
 * Verify production deployment health and key routes.
 * Usage: npm run verify:production
 *        VERIFY_URL=https://agentscale.vercel.app node scripts/verify-production.mjs
 */

const BASE_URL = (process.env.VERIFY_URL ?? "https://agentscale.vercel.app").replace(/\/$/, "");

const checks = [];
let failed = 0;

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  failed++;
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "follow" });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { res, json, text };
}

async function fetchHead(path, { allowRedirect = true } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    redirect: allowRedirect ? "follow" : "manual",
  });
  return res;
}

async function main() {
  console.log(`Verifying production: ${BASE_URL}\n`);

  // Health endpoint
  try {
    const { res, json } = await fetchJson("/api/health");
    if (!res.ok || json?.status !== "ok") {
      fail("Health API", `status ${res.status}`);
    } else {
      pass("Health API", `env=${json.environment}`);
      for (const [key, value] of Object.entries(json.checks ?? {})) {
        if (value) {
          pass(`Health check: ${key}`);
        } else {
          fail(`Health check: ${key}`, "not configured");
        }
      }
    }
  } catch (err) {
    fail("Health API", err.message);
  }

  // Public pages
  for (const path of ["/", "/login", "/signup", "/#pricing"]) {
    try {
      const res = await fetchHead(path);
      if (res.ok) {
        pass(`Route ${path}`, `HTTP ${res.status}`);
      } else {
        fail(`Route ${path}`, `HTTP ${res.status}`);
      }
    } catch (err) {
      fail(`Route ${path}`, err.message);
    }
  }

  // Dashboard should require auth (redirect to login)
  try {
    const res = await fetchHead("/dashboard", { allowRedirect: false });
    if (res.status === 307 || res.status === 308 || res.status === 302) {
      const location = res.headers.get("location") ?? "";
      if (location.includes("/login")) {
        pass("Dashboard auth guard", `redirects to login (${res.status})`);
      } else {
        fail("Dashboard auth guard", `redirects to ${location}`);
      }
    } else if (res.ok) {
      pass("Dashboard auth guard", "demo mode (no redirect)");
    } else {
      fail("Dashboard auth guard", `HTTP ${res.status}`);
    }
  } catch (err) {
    fail("Dashboard auth guard", err.message);
  }

  // Sentry example API (should return 500 by design — confirms route exists)
  try {
    const res = await fetch(`${BASE_URL}/api/sentry-example-api`);
    if (res.status === 500) {
      pass("Sentry example API", "route reachable (throws test error)");
    } else {
      fail("Sentry example API", `expected 500, got ${res.status}`);
    }
  } catch (err) {
    fail("Sentry example API", err.message);
  }

  console.log(`\n${checks.length - failed}/${checks.length} checks passed`);

  if (failed > 0) {
    console.error("\nProduction verification failed.");
    process.exit(1);
  }

  console.log("\nProduction verification passed.");
}

main();
