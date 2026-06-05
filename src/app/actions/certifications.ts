"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization, getAuthUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/data/audit";
import { toggleOnboardingItem } from "@/lib/data/onboarding";
import {
  requestAgentCertification,
  approveAgentCertification,
  rejectAgentCertification,
} from "@/lib/data/certifications";
import {
  requestCertificationSchema,
  reviewCertificationSchema,
} from "@/lib/schemas/certification";

export type CertificationActionState = {
  error?: string;
  message?: string;
};

export async function requestCertification(
  _prev: CertificationActionState,
  formData: FormData
): Promise<CertificationActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to request certifications." };
  }

  const parsed = requestCertificationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Select an agent and certification." };
  }

  const org = await getCurrentOrganization();
  if (!org) return { error: "No workspace selected." };
  if (org.role === "viewer") {
    return { error: "Viewers cannot request certifications." };
  }

  const { record, error } = await requestAgentCertification(
    org.id,
    parsed.data.agent_id,
    parsed.data.certification_id
  );

  if (error || !record) {
    return { error: error ?? "Request failed" };
  }

  await writeAuditLog({
    organizationId: org.id,
    entityType: "agent_certification",
    entityId: record.id,
    action: "create",
    metadata: {
      agent: record.agent_name,
      certification: record.certification_name,
      status: "in_progress",
    },
  });

  revalidatePath("/dashboard/certifications");
  revalidatePath(`/dashboard/agents/${parsed.data.agent_id}`);
  return {
    message: `Certification request submitted for ${record.agent_name}. Awaiting approver.`,
  };
}

async function reviewCertificationInternal(
  formData: FormData
): Promise<CertificationActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to review certifications." };
  }

  const parsed = reviewCertificationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid review request." };
  }

  const org = await getCurrentOrganization();
  if (!org) return { error: "No workspace selected." };
  if (org.role !== "org_admin") {
    return { error: "Only organisation admins can approve or reject certifications." };
  }

  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated." };

  if (parsed.data.decision === "approve") {
    const { record, error } = await approveAgentCertification(
      org.id,
      parsed.data.agent_certification_id,
      user.id
    );

    if (error || !record) {
      return { error: error ?? "Approval failed" };
    }

    await toggleOnboardingItem(org.id, record.agent_id, "certification", true);

    await writeAuditLog({
      organizationId: org.id,
      entityType: "agent_certification",
      entityId: record.id,
      action: "approve",
      metadata: {
        agent: record.agent_name,
        certification: record.certification_name,
        certificate_number: record.certificate_number,
      },
    });

    revalidatePath("/dashboard/certifications");
    revalidatePath("/dashboard/governance");
    revalidatePath(`/dashboard/agents/${record.agent_id}`);
    revalidatePath("/dashboard/onboarding");
    return {
      message: `Issued ${record.certification_name} to ${record.agent_name} (${record.certificate_number}).`,
    };
  }

  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("agent_certifications")
    .select("agent_id")
    .eq("id", parsed.data.agent_certification_id)
    .maybeSingle();

  const { error } = await rejectAgentCertification(
    org.id,
    parsed.data.agent_certification_id
  );

  if (error) return { error };

  await writeAuditLog({
    organizationId: org.id,
    entityType: "agent_certification",
    entityId: parsed.data.agent_certification_id,
    action: "reject",
    metadata: { decision: "rejected" },
  });

  revalidatePath("/dashboard/certifications");
  if (pending?.agent_id) {
    revalidatePath(`/dashboard/agents/${pending.agent_id}`);
  }
  return { message: "Certification request rejected." };
}

/** Form action for approve/reject buttons (void return). */
export async function submitCertificationReview(formData: FormData): Promise<void> {
  await reviewCertificationInternal(formData);
}
