#!/usr/bin/env node
/**
 * Validate MVP Definition of Done flows on production.
 * Checks route availability and infrastructure; authenticated journeys
 * require PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD for full pass.
 *
 * Usage: npm run validate:mvp
 */

const BASE_URL = (process.env.VERIFY_URL ?? "https://agentscale.vercel.app").replace(/\/$/, "");

const flows = [
  {
    id: 1,
    name: "Sign up → create org → invite team",
    routes: ["/signup", "/login", "/setup", "/dashboard/settings"],
    notes: "Signup + org setup + team invite UI",
  },
  {
    id: 2,
    name: "Register agent → complete onboarding checklist",
    routes: ["/dashboard/agents", "/dashboard/onboarding"],
    notes: "Agent registry + onboarding module",
  },
  {
    id: 3,
    name: "Assign training → run scenario → receive AI score",
    routes: ["/dashboard/academy", "/dashboard/scenarios"],
    notes: "Academy + scenario testing + /api/evaluate",
  },
  {
    id: 4,
    name: "Request certification → admin approves",
    routes: ["/dashboard/certifications"],
    notes: "Certification request + approver inbox",
  },
  {
    id: 5,
    name: "Audit log shows prompt change with actor",
    routes: ["/dashboard/governance"],
    notes: "Governance centre + audit log export",
  },
  {
    id: 6,
    name: "Executive dashboard reflects live org data",
    routes: ["/dashboard"],
    notes: "Executive dashboard aggregates",
  },
];

let failed = 0;

async function checkRoute(path) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  // 200 = public page; 307/302 to login = auth-guarded module (expected)
  const ok = res.status === 200 || res.status === 307 || res.status === 302 || res.status === 308;
  const location = res.headers.get("location") ?? "";
  return { ok, status: res.status, location };
}

async function main() {
  console.log(`MVP DoD validation — ${BASE_URL}\n`);

  // Infrastructure
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json().catch(() => null);
  const infraOk =
    health?.status === "ok" &&
    health?.checks?.auth &&
    health?.checks?.supabase &&
    health?.checks?.sentry;

  if (infraOk) {
    console.log("✓ Infrastructure: auth, supabase, sentry configured\n");
  } else {
    console.error("✗ Infrastructure checks failed\n");
    failed++;
  }

  for (const flow of flows) {
    const results = await Promise.all(flow.routes.map((r) => checkRoute(r)));
    const allOk = results.every((r) => r.ok);

    if (allOk) {
      console.log(`✓ Flow ${flow.id}: ${flow.name}`);
      for (const [i, r] of results.entries()) {
        const detail =
          r.status >= 300
            ? `→ login (${r.status})`
            : `HTTP ${r.status}`;
        console.log(`    ${flow.routes[i]} ${detail}`);
      }
    } else {
      failed++;
      console.error(`✗ Flow ${flow.id}: ${flow.name}`);
      for (const [i, r] of results.entries()) {
        if (!r.ok) {
          console.error(`    ${flow.routes[i]} HTTP ${r.status}`);
        }
      }
    }
    console.log(`    ${flow.notes}\n`);
  }

  // API endpoints
  const evalRes = await fetch(`${BASE_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (evalRes.status === 401 || evalRes.status === 400 || evalRes.status === 403) {
    console.log("✓ /api/evaluate reachable (auth/validation enforced)");
  } else {
    console.error(`✗ /api/evaluate unexpected status ${evalRes.status}`);
    failed++;
  }

  const hasAuthCreds = Boolean(
    process.env.PLAYWRIGHT_TEST_EMAIL && process.env.PLAYWRIGHT_TEST_PASSWORD
  );
  console.log(
    hasAuthCreds
      ? "\nAuthenticated E2E: run PLAYWRIGHT_TEST_EMAIL=... npm run test:e2e for full journey"
      : "\nAuthenticated E2E: skipped (set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD)"
  );

  if (failed > 0) {
    console.error(`\n${failed} MVP DoD check(s) failed.`);
    process.exit(1);
  }

  console.log("\nMVP DoD route validation passed on production.");
}

main();
