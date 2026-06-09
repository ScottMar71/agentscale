#!/usr/bin/env node
/**
 * Update Supabase Auth URL config for agentscale.info.
 * Requires SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run configure:supabase-auth
 */

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "rffhcgakipfispuqbhpg";
const SITE_URL = process.env.SITE_URL ?? "https://www.agentscale.info";
const REDIRECT_URLS = [
  "https://www.agentscale.info/auth/callback",
  "https://agentscale.info/auth/callback",
  "https://agentscale.vercel.app/auth/callback",
  "http://localhost:3000/auth/callback",
];

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN.");
  console.error("Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

async function main() {
  const getRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!getRes.ok) {
    console.error("GET auth config failed:", getRes.status, await getRes.text());
    process.exit(1);
  }
  const current = await getRes.json();
  console.log("Current site_url:", current.site_url);

  const existing = (current.uri_allow_list ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const merged = [...new Set([...existing, ...REDIRECT_URLS])];

  const patchRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_url: SITE_URL,
        uri_allow_list: merged.join(","),
      }),
    }
  );

  if (!patchRes.ok) {
    console.error("PATCH auth config failed:", patchRes.status, await patchRes.text());
    process.exit(1);
  }

  const updated = await patchRes.json();
  console.log("Updated site_url:", updated.site_url);
  console.log("Updated uri_allow_list:", updated.uri_allow_list);
}

main();
