import { createClient } from "@/lib/supabase/server";
import { getIsSuperAdmin } from "@/lib/auth/session";
import type { SubscriptionPlan } from "@/lib/billing/plans";
import type { PlatformOrganization } from "@/lib/data/admin-types";

export type { PlatformOrganization } from "@/lib/data/admin-types";

export async function listPlatformOrganizations(): Promise<PlatformOrganization[]> {
  if (!(await getIsSuperAdmin())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(
      `
      id,
      name,
      slug,
      plan,
      agent_limit,
      stripe_customer_id,
      stripe_subscription_id,
      created_at,
      organization_members ( count ),
      agents ( count )
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("listPlatformOrganizations:", error?.message);
    return [];
  }

  return data.map((row) => {
    const members = row.organization_members as { count: number }[] | { count: number } | null;
    const agents = row.agents as { count: number }[] | { count: number } | null;
    const memberCount = Array.isArray(members)
      ? (members[0]?.count ?? 0)
      : (members?.count ?? 0);
    const agentCount = Array.isArray(agents) ? (agents[0]?.count ?? 0) : (agents?.count ?? 0);
    const plan = (row.plan as SubscriptionPlan) ?? "starter";

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan,
      agent_limit: row.agent_limit,
      member_count: memberCount,
      agent_count: agentCount,
      stripe_customer_id: row.stripe_customer_id,
      has_subscription: Boolean(row.stripe_subscription_id),
      created_at: row.created_at,
    };
  });
}
