#!/usr/bin/env node
/**
 * Provision (or reset) a dedicated Playwright test user with org + agent.
 * Usage: npm run provision:e2e-user
 *        E2E_TEST_EMAIL=e2e@agentscale.info npm run provision:e2e-user
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Prints PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD for .env.local and GitHub Actions secrets.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { randomBytes } from "node:crypto";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.E2E_TEST_EMAIL ?? "e2e-test@agentscale.info";
const password =
  process.env.E2E_TEST_PASSWORD ?? `E2e-${randomBytes(12).toString("base64url")}!`;
const orgSlug = "e2e-test-org";
const agentName = "E2E Test Agent";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;
    page++;
  }
}

async function ensureUser() {
  const existing = await findUserByEmail(email);
  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`✓ Reset password for existing user ${email}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "E2E Test User" },
  });
  if (error) throw error;
  console.log(`✓ Created user ${email}`);
  return data.user.id;
}

async function ensureOrgAndAgent(userId) {
  const { data: membership, error: memberErr } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, slug)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (memberErr) throw memberErr;

  let orgId = membership?.organization_id;

  if (!orgId) {
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: "E2E Test Org", slug: orgSlug })
      .select("id")
      .single();
    if (orgErr) throw orgErr;
    orgId = org.id;

    const { error: linkErr } = await supabase.from("organization_members").insert({
      organization_id: orgId,
      user_id: userId,
      role: "org_admin",
    });
    if (linkErr) throw linkErr;
    console.log(`✓ Created org ${orgSlug}`);
  } else {
    console.log(`✓ User already in org (${membership.organizations?.slug ?? orgId})`);
  }

  const { data: agents, error: agentsErr } = await supabase
    .from("agents")
    .select("id, name")
    .eq("organization_id", orgId)
    .limit(5);

  if (agentsErr) throw agentsErr;

  if (!agents?.length) {
    const { error: agentErr } = await supabase.from("agents").insert({
      organization_id: orgId,
      name: agentName,
      description: "Seeded for Playwright authenticated E2E",
      department: "Engineering",
      status: "active",
      owner_id: userId,
    });
    if (agentErr) throw agentErr;
    console.log(`✓ Created agent "${agentName}"`);
  } else {
    console.log(`✓ Org has ${agents.length} agent(s) — using "${agents[0].name}"`);
  }
}

async function main() {
  console.log(`Provisioning E2E user: ${email}\n`);
  const userId = await ensureUser();
  await ensureOrgAndAgent(userId);

  console.log("\nAdd to .env.local and GitHub Actions secrets:\n");
  console.log(`PLAYWRIGHT_TEST_EMAIL=${email}`);
  console.log(`PLAYWRIGHT_TEST_PASSWORD=${password}`);
  console.log("\nThen run:");
  console.log("  PLAYWRIGHT_BASE_URL=https://www.agentscale.info npm run test:e2e");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
