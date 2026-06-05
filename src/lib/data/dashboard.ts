import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import type { DashboardStats } from "@/types";

export function emptyDashboardStats(): DashboardStats {
  return {
    totalAgents: 0,
    certifiedAgents: 0,
    expiringCerts: 0,
    failedAssessments: 0,
    highRiskAgents: 0,
    avgHealthScore: 0,
    utilization: 0,
    estimatedSavings: 0,
  };
}

/** Live workspace metrics only — never returns fictional demo numbers. */
export async function getLiveDashboardStats(): Promise<DashboardStats> {
  if (!isAuthEnabled()) {
    return emptyDashboardStats();
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return emptyDashboardStats();
  }

  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("status, certification_status, risk_level, health_score, deployment_status")
    .eq("organization_id", organizationId);

  const rows = agents ?? [];
  const totalAgents = rows.length;
  const certifiedAgents = rows.filter((a) => a.certification_status === "certified").length;
  const highRiskAgents = rows.filter(
    (a) => a.risk_level === "high" || a.risk_level === "critical"
  ).length;
  const activeProduction = rows.filter(
    (a) => a.status === "active" && a.deployment_status === "production"
  ).length;
  const avgHealthScore =
    totalAgents > 0
      ? Math.round(
          rows.reduce((sum, a) => sum + (a.health_score ?? 0), 0) / totalAgents
        )
      : 0;
  const utilization =
    totalAgents > 0 ? Math.round((activeProduction / totalAgents) * 100) : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: failedAssessments } = await supabase
    .from("scenario_runs")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("result", "fail")
    .gte("created_at", sevenDaysAgo.toISOString());

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const { count: expiringCerts } = await supabase
    .from("agent_certifications")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "certified")
    .lte("expires_at", thirtyDaysFromNow.toISOString());

  return {
    totalAgents,
    certifiedAgents,
    expiringCerts: expiringCerts ?? 0,
    failedAssessments: failedAssessments ?? 0,
    highRiskAgents,
    avgHealthScore,
    utilization,
    estimatedSavings: 0,
  };
}
