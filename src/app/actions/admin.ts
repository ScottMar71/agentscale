"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_ORG_COOKIE, CURRENT_ORG_COOKIE_OPTIONS } from "@/lib/auth/org-cookie";
import { getIsSuperAdmin } from "@/lib/auth/session";
import { agentLimitForPlan, type SubscriptionPlan } from "@/lib/billing/plans";

const updatePlanSchema = z.object({
  organizationId: z.string().uuid(),
  plan: z.enum(["starter", "growth", "enterprise"]),
  agentLimit: z.coerce.number().int().min(1).max(10_000).optional(),
});

export type UpdateOrganizationPlanState = {
  error?: string;
  success?: boolean;
};

async function requireSuperAdmin() {
  if (!(await getIsSuperAdmin())) {
    redirect("/dashboard");
  }
}

export async function updateOrganizationPlan(
  _prev: UpdateOrganizationPlanState,
  formData: FormData
): Promise<UpdateOrganizationPlanState> {
  await requireSuperAdmin();

  const parsed = updatePlanSchema.safeParse({
    organizationId: formData.get("organizationId"),
    plan: formData.get("plan"),
    agentLimit: formData.get("agentLimit") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid plan update request." };
  }

  const plan = parsed.data.plan as SubscriptionPlan;
  const agent_limit = parsed.data.agentLimit ?? agentLimitForPlan(plan);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ plan, agent_limit })
    .eq("id", parsed.data.organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function adminSwitchOrganization(orgId: string) {
  await requireSuperAdmin();

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .maybeSingle();

  if (!org) {
    return { error: "Organization not found." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, orgId, CURRENT_ORG_COOKIE_OPTIONS);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
