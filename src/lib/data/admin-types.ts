import type { SubscriptionPlan } from "@/lib/billing/plans";

export type PlatformOrganization = {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  agent_limit: number;
  member_count: number;
  agent_count: number;
  stripe_customer_id: string | null;
  has_subscription: boolean;
  created_at: string;
};
