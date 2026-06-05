import { createClient } from "@/lib/supabase/server";
import { resolveDataContext } from "@/lib/data/context";
import {
  agentLimitForPlan,
  isWithinAgentLimit,
  type SubscriptionPlan,
} from "@/lib/billing/plans";
import { PLANS } from "@/lib/constants";

export type OrganizationBilling = {
  organization_id: string;
  plan: SubscriptionPlan;
  plan_name: string;
  agent_limit: number;
  agent_count: number;
  can_add_agent: boolean;
  stripe_customer_id: string | null;
  has_subscription: boolean;
};

export async function getOrganizationBilling(): Promise<OrganizationBilling | null> {
  const { mode, organizationId } = await resolveDataContext();
  if (mode === "demo" || !organizationId) {
    return {
      organization_id: organizationId ?? "demo",
      plan: "growth",
      plan_name: PLANS.growth.name,
      agent_limit: PLANS.growth.agents,
      agent_count: 0,
      can_add_agent: true,
      stripe_customer_id: null,
      has_subscription: false,
    };
  }

  const supabase = await createClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, plan, agent_limit, stripe_customer_id, stripe_subscription_id")
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !org) return null;

  const { count } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const plan = (org.plan as SubscriptionPlan) ?? "starter";
  const agent_limit = org.agent_limit ?? agentLimitForPlan(plan);
  const agent_count = count ?? 0;

  return {
    organization_id: org.id,
    plan,
    plan_name: PLANS[plan]?.name ?? plan,
    agent_limit,
    agent_count,
    can_add_agent: isWithinAgentLimit(agent_count, agent_limit),
    stripe_customer_id: org.stripe_customer_id,
    has_subscription: Boolean(org.stripe_subscription_id),
  };
}

export async function checkAgentCreateAllowed(
  organizationId: string
): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("plan, agent_limit")
    .eq("id", organizationId)
    .maybeSingle();

  const plan = (org?.plan as SubscriptionPlan) ?? "starter";
  const limit = org?.agent_limit ?? agentLimitForPlan(plan);

  const { count } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const current = count ?? 0;
  const allowed = isWithinAgentLimit(current, limit);

  return {
    allowed,
    current,
    limit,
    message: allowed
      ? undefined
      : `Agent limit reached (${current}/${limit >= 10_000 ? "∞" : limit}). Upgrade your plan in Settings.`,
  };
}
