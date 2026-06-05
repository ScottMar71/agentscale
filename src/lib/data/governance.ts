import { createClient } from "@/lib/supabase/server";
import { demoAuditLogs, demoStats } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import { getLiveDashboardStats } from "@/lib/data/dashboard";
import type { AuditLogEntry, DashboardStats } from "@/types";

export async function getGovernanceOverview(): Promise<{
  stats: DashboardStats;
  auditLogs: AuditLogEntry[];
  isDemo: boolean;
}> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return {
      stats: demoStats,
      auditLogs: demoAuditLogs,
      isDemo: true,
    };
  }

  const [stats, auditLogs] = await Promise.all([
    getLiveDashboardStats(),
    listOrganizationAuditLogs(organizationId, 50),
  ]);

  return { stats, auditLogs, isDemo: false };
}

export async function listOrganizationAuditLogs(
  organizationId: string,
  limit = 50
): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      entity_type,
      action,
      metadata,
      created_at,
      profiles:actor_id (full_name, email)
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const profile = row.profiles as
      | { full_name: string | null; email: string }
      | { full_name: string | null; email: string }[]
      | null;
    const actor = Array.isArray(profile) ? profile[0] : profile;
    return {
      id: row.id,
      entity_type: row.entity_type,
      action: row.action,
      actor_name: actor?.full_name ?? actor?.email ?? null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      created_at: row.created_at,
    };
  });
}

export async function listAuditLogsForExport(
  organizationId: string
): Promise<AuditLogEntry[]> {
  return listOrganizationAuditLogs(organizationId, 500);
}
