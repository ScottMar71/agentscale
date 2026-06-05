import { createClient } from "@/lib/supabase/server";
import {
  demoCertifications,
  demoAgentCerts,
} from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import { getOnboardingForAgent } from "@/lib/data/onboarding";
import { countPassingRunsForAgent } from "@/lib/data/scenarios";
import {
  parseCertificationRules,
  type CertificationRules,
} from "@/lib/schemas/certification";
import type { AgentCertification, Certification } from "@/types";

type CertDefRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  validity_days: number;
  rules: Record<string, unknown>;
};

function mapCertDef(row: CertDefRow): Certification & { rules: CertificationRules } {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    validity_days: row.validity_days ?? 365,
    rules: parseCertificationRules(row.rules ?? {}),
  };
}

export async function listCertificationDefinitions(): Promise<
  (Certification & { rules: CertificationRules })[]
> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoCertifications.map((c) => ({
      ...c,
      rules: parseCertificationRules({ min_scenario_passes: 1 }),
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certification_definitions")
    .select("*")
    .or(`is_global.eq.true,organization_id.eq.${organizationId}`)
    .order("name");

  if (error || !data) {
    return demoCertifications.map((c) => ({
      ...c,
      rules: parseCertificationRules({ min_scenario_passes: 1 }),
    }));
  }

  return data.map((row) => mapCertDef(row as CertDefRow));
}

export async function listAgentCertifications(): Promise<AgentCertification[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoAgentCerts;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_certifications")
    .select(
      `
      id,
      agent_id,
      status,
      earned_at,
      expires_at,
      certificate_number,
      agents!inner(name),
      certification_definitions!inner(name)
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const agents = row.agents as { name: string } | { name: string }[];
    const defs = row.certification_definitions as { name: string } | { name: string }[];
    return {
      id: row.id,
      agent_id: row.agent_id,
      agent_name: (Array.isArray(agents) ? agents[0]?.name : agents?.name) ?? "Agent",
      certification_name:
        (Array.isArray(defs) ? defs[0]?.name : defs?.name) ?? "Certification",
      status: row.status,
      earned_at: row.earned_at,
      expires_at: row.expires_at,
      certificate_number: row.certificate_number,
    };
  });
}

export async function listPendingApprovals(): Promise<AgentCertification[]> {
  const certs = await listAgentCertifications();
  return certs.filter((c) => c.status === "in_progress");
}

export async function checkCertificationEligibility(
  organizationId: string,
  agentId: string,
  certificationId: string
): Promise<{ eligible: boolean; reasons: string[] }> {
  const supabase = await createClient();
  const { data: def } = await supabase
    .from("certification_definitions")
    .select("*")
    .eq("id", certificationId)
    .maybeSingle();

  if (!def) {
    return { eligible: false, reasons: ["Certification definition not found"] };
  }

  const rules = parseCertificationRules((def.rules as Record<string, unknown>) ?? {});
  const reasons: string[] = [];

  const passCount = await countPassingRunsForAgent(organizationId, agentId);
  const minPasses = rules.min_scenario_passes ?? 1;
  if (passCount < minPasses) {
    reasons.push(`Need ${minPasses} passing scenario run(s) (have ${passCount})`);
  }

  if (rules.require_onboarding_complete) {
    const onboarding = await getOnboardingForAgent(agentId);
    if (!onboarding || onboarding.progress_percent < 100) {
      reasons.push("Onboarding checklist must be 100% complete");
    }
  }

  if (rules.min_training_percent != null) {
    const { data: progress } = await supabase
      .from("agent_training_progress")
      .select("percent_complete")
      .eq("organization_id", organizationId)
      .eq("agent_id", agentId);

    const maxPercent = Math.max(0, ...(progress ?? []).map((p) => p.percent_complete ?? 0));
    if (maxPercent < rules.min_training_percent) {
      reasons.push(
        `Training must be at least ${rules.min_training_percent}% (best: ${maxPercent}%)`
      );
    }
  }

  const { data: existing } = await supabase
    .from("agent_certifications")
    .select("status")
    .eq("organization_id", organizationId)
    .eq("agent_id", agentId)
    .eq("certification_id", certificationId)
    .maybeSingle();

  if (existing?.status === "certified") {
    reasons.push("Agent already holds this certification");
  }
  if (existing?.status === "in_progress") {
    reasons.push("A certification request is already pending approval");
  }

  return { eligible: reasons.length === 0, reasons };
}

export async function requestAgentCertification(
  organizationId: string,
  agentId: string,
  certificationId: string
): Promise<{ record: AgentCertification | null; error?: string }> {
  const eligibility = await checkCertificationEligibility(
    organizationId,
    agentId,
    certificationId
  );
  if (!eligibility.eligible) {
    return {
      record: null,
      error: eligibility.reasons.join(". "),
    };
  }

  const supabase = await createClient();
  const { data: agent } = await supabase
    .from("agents")
    .select("name")
    .eq("id", agentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  const { data: def } = await supabase
    .from("certification_definitions")
    .select("name")
    .eq("id", certificationId)
    .maybeSingle();

  if (!agent || !def) {
    return { record: null, error: "Agent or certification not found" };
  }

  const { data, error } = await supabase
    .from("agent_certifications")
    .upsert(
      {
        agent_id: agentId,
        certification_id: certificationId,
        organization_id: organizationId,
        status: "in_progress",
        earned_at: null,
        expires_at: null,
        certificate_number: null,
        approved_by: null,
      },
      { onConflict: "agent_id,certification_id" }
    )
    .select()
    .single();

  if (error || !data) {
    return { record: null, error: error?.message ?? "Request failed" };
  }

  await supabase
    .from("agents")
    .update({ certification_status: "in_progress" })
    .eq("id", agentId)
    .eq("organization_id", organizationId);

  return {
    record: {
      id: data.id,
      agent_id: agentId,
      agent_name: agent.name,
      certification_name: def.name,
      status: "in_progress",
      earned_at: null,
      expires_at: null,
      certificate_number: null,
    },
  };
}

function generateCertificateNumber(slug: string): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ASC-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${year}-${suffix}`;
}

export async function approveAgentCertification(
  organizationId: string,
  agentCertificationId: string,
  approverId: string
): Promise<{ record: AgentCertification | null; error?: string }> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("agent_certifications")
    .select(
      `
      *,
      agents!inner(name),
      certification_definitions!inner(name, slug, validity_days)
    `
    )
    .eq("organization_id", organizationId)
    .eq("id", agentCertificationId)
    .maybeSingle();

  if (!row || row.status !== "in_progress") {
    return { record: null, error: "Pending certification request not found" };
  }

  const defs = row.certification_definitions as
    | { name: string; slug: string; validity_days: number }
    | { name: string; slug: string; validity_days: number }[];
  const def = Array.isArray(defs) ? defs[0] : defs;
  const agents = row.agents as { name: string } | { name: string }[];
  const agentName = Array.isArray(agents) ? agents[0]?.name : agents?.name;

  const earnedAt = new Date();
  const expiresAt = new Date(earnedAt);
  expiresAt.setDate(expiresAt.getDate() + (def?.validity_days ?? 365));
  const certificateNumber = generateCertificateNumber(def?.slug ?? "CERT");

  const { data, error } = await supabase
    .from("agent_certifications")
    .update({
      status: "certified",
      earned_at: earnedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      certificate_number: certificateNumber,
      approved_by: approverId,
    })
    .eq("id", agentCertificationId)
    .select()
    .single();

  if (error || !data) {
    return { record: null, error: error?.message ?? "Approval failed" };
  }

  await supabase
    .from("agents")
    .update({ certification_status: "certified" })
    .eq("id", row.agent_id)
    .eq("organization_id", organizationId);

  return {
    record: {
      id: data.id,
      agent_id: row.agent_id,
      agent_name: agentName ?? "Agent",
      certification_name: def?.name ?? "Certification",
      status: "certified",
      earned_at: data.earned_at,
      expires_at: data.expires_at,
      certificate_number: data.certificate_number,
    },
  };
}

export async function rejectAgentCertification(
  organizationId: string,
  agentCertificationId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("agent_certifications")
    .select("agent_id, status")
    .eq("organization_id", organizationId)
    .eq("id", agentCertificationId)
    .maybeSingle();

  if (!row || row.status !== "in_progress") {
    return { error: "Pending certification request not found" };
  }

  const { error } = await supabase
    .from("agent_certifications")
    .update({ status: "revoked" })
    .eq("id", agentCertificationId);

  if (error) return { error: error.message };

  await supabase
    .from("agents")
    .update({ certification_status: "none" })
    .eq("id", row.agent_id)
    .eq("organization_id", organizationId);

  return {};
}

/** Expire certifications past their expiry date (cron / service role). */
export async function expireCertifications(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any }
): Promise<{ expired: number }> {
  const now = new Date().toISOString();

  const { data: rows } = await supabase
    .from("agent_certifications")
    .select("id, agent_id, organization_id")
    .eq("status", "certified")
    .lt("expires_at", now);

  const expiredRows = (rows ?? []) as {
    id: string;
    agent_id: string;
    organization_id: string;
  }[];

  if (expiredRows.length === 0) return { expired: 0 };

  const ids = expiredRows.map((r) => r.id);
  await supabase
    .from("agent_certifications")
    .update({ status: "expired" })
    .in("id", ids);

  for (const row of expiredRows) {
    await supabase
      .from("agents")
      .update({ certification_status: "expired" })
      .eq("id", row.agent_id)
      .eq("organization_id", row.organization_id);
  }

  return { expired: expiredRows.length };
}
