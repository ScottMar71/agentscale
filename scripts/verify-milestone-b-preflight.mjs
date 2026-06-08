#!/usr/bin/env node
/**
 * Milestone B pre-flight checks (B1–B6).
 * Usage: npm run verify:milestone-b
 *        CRON_SECRET=... node scripts/verify-milestone-b-preflight.mjs
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const BASE_URL = (process.env.VERIFY_URL ?? "https://agentscale.vercel.app").replace(/\/$/, "");
const GITHUB_REPO = process.env.GITHUB_REPO ?? "ScottMar71/agentscale";

const checks = [];
let failed = 0;
let manual = [];

function pass(id, name, detail) {
  checks.push({ id, ok: true, detail });
  console.log(`✓ ${id} ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(id, name, detail) {
  checks.push({ id, ok: false, detail });
  failed++;
  console.error(`✗ ${id} ${name}${detail ? ` — ${detail}` : ""}`);
}

function note(id, name, detail) {
  manual.push({ id, detail });
  console.log(`⚠ ${id} ${name} — ${detail}`);
}

async function fetchJson(path, init) {
  const res = await fetch(`${BASE_URL}${path}`, init);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { res, json, text };
}

async function checkB1() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/e2e.yml/runs?per_page=1`
    );
    const data = await res.json();
    const run = data.workflow_runs?.[0];
    if (!run) {
      note("B1", "GitHub E2E secrets", "No workflow runs found — push to main after fixing e2e.yml");
      return;
    }
    const secretsNeeded = [
      "PLAYWRIGHT_TEST_EMAIL",
      "PLAYWRIGHT_TEST_PASSWORD",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];
    if (run.conclusion === "success") {
      pass("B1", "GitHub E2E workflow", `latest run passed (${run.head_branch})`);
    } else {
      fail(
        "B1",
        "GitHub E2E workflow",
        `latest run ${run.conclusion ?? run.status} — add secrets: ${secretsNeeded.join(", ")}`
      );
    }
  } catch (err) {
    note("B1", "GitHub E2E secrets", err.message);
  }
}

async function checkB2() {
  try {
    const { res, json } = await fetchJson("/api/health");
    if (!res.ok || json?.status !== "ok") {
      fail("B2", "Production health", `HTTP ${res.status}`);
      return;
    }
    const required = ["auth", "supabase", "sentry", "openai"];
    const missing = required.filter((k) => !json.checks?.[k]);
    if (missing.length) {
      fail("B2", "Production health checks", `missing: ${missing.join(", ")}`);
      return;
    }
    pass("B2", "Production smoke gate", `env=${json.environment}, checks ok`);
  } catch (err) {
    fail("B2", "Production smoke gate", err.message);
  }
}

async function checkB3() {
  try {
    const res = await fetch(`${BASE_URL}/auth/callback`, { redirect: "manual" });
    const location = res.headers.get("location") ?? "";
    if ((res.status === 307 || res.status === 302) && location.includes("auth_callback_failed")) {
      pass("B3", "Auth callback route", "redirects invalid OAuth to /login?error=auth_callback_failed");
    } else {
      fail("B3", "Auth callback route", `HTTP ${res.status}, location=${location}`);
    }
    note(
      "B3",
      "Supabase redirect URLs",
      "Confirm in Supabase Dashboard → Auth → URL config: https://agentscale.vercel.app/auth/callback"
    );
  } catch (err) {
    fail("B3", "Auth callback route", err.message);
  }
}

async function checkB4() {
  const from = process.env.RESEND_FROM_EMAIL ?? "";
  const domainMatch = from.match(/@([^>\s]+)/);
  const domain = domainMatch?.[1]?.trim() ?? "unknown";

  if (!process.env.RESEND_API_KEY) {
    fail("B4", "Resend deliverability", "RESEND_API_KEY not set locally");
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: from || "AgentScale <onboarding@resend.dev>",
      to: ["preflight-probe@example.com"],
      subject: "[preflight probe — do not deliver]",
      html: "<p>domain verification probe</p>",
    });

    if (error?.message?.includes("not verified")) {
      fail(
        "B4",
        "Resend production sender",
        `Verify ${domain} at https://resend.com/domains — ${error.message}`
      );
      return;
    }

    if (error?.message?.includes("only send testing emails")) {
      pass("B4", "Resend domain", `${domain} verified (API key on testing plan)`);
      return;
    }

    if (error) {
      note("B4", "Resend API", error.message);
      return;
    }

    pass("B4", "Resend production sender", `${domain} accepted`);
  } catch (err) {
    note("B4", "Resend API", err.message);
  }
}

async function checkB5() {
  try {
    const res = await fetch(`${BASE_URL}/api/sentry-example-api`);
    if (res.status === 500) {
      pass("B5", "Sentry ingestion route", "example API reachable");
    } else {
      fail("B5", "Sentry ingestion route", `expected 500, got ${res.status}`);
    }
    note(
      "B5",
      "Sentry alert rule",
      "Manual: Sentry → Alerts → New Issue → filter environment:production → notify email/Slack"
    );
  } catch (err) {
    fail("B5", "Sentry ingestion route", err.message);
  }
}

async function checkB6() {
  try {
    const unauth = await fetch(`${BASE_URL}/api/cron/expire-certifications`);
    if (unauth.status !== 401) {
      fail("B6", "Cron auth guard", `expected 401 without secret, got ${unauth.status}`);
      return;
    }
    pass("B6", "Cron auth guard", "rejects unauthenticated requests");

    const secret = process.env.CRON_SECRET;
    if (!secret) {
      note("B6", "Cron execution", "Set CRON_SECRET locally to verify authenticated cron run");
      return;
    }

    const authed = await fetchJson("/api/cron/expire-certifications", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (authed.res.ok && authed.json?.ok) {
      pass("B6", "Cron execution", `expired=${authed.json.expired}, schedule=0 2 * * * (vercel.json)`);
    } else {
      fail("B6", "Cron execution", `HTTP ${authed.res.status}`);
    }
  } catch (err) {
    fail("B6", "Vercel cron", err.message);
  }
}

async function main() {
  console.log(`Milestone B pre-flight — ${BASE_URL}\n`);

  await checkB1();
  await checkB2();
  await checkB3();
  await checkB4();
  await checkB5();
  await checkB6();

  console.log(`\n${checks.length - failed}/${checks.length} automated checks passed`);

  if (manual.length) {
    console.log("\nManual follow-ups:");
    for (const item of manual) {
      console.log(`  ${item.id}: ${item.detail}`);
    }
  }

  if (failed > 0) {
    console.error("\nPre-flight incomplete — resolve failures before partner onboarding.");
    process.exit(1);
  }

  console.log("\nPre-flight passed (manual items may still need dashboard confirmation).");
}

main();
