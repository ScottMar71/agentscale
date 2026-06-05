import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import { isAuthEnabled } from "@/lib/auth/config";
import { buttonVariants } from "@/components/ui/button";
import { ExecutiveChartsFromData } from "@/components/dashboard/executive-charts-from-data";

export async function ExecutiveChartsLive() {
  if (!isAuthEnabled()) {
    return <ChartsEmpty message="Connect Supabase to see live charts." />;
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return (
      <ChartsEmpty message="Complete workspace setup to see live charts." />
    );
  }

  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("department, certification_status, health_score, created_at")
    .eq("organization_id", organizationId);

  if (!agents?.length) {
    return (
      <ChartsEmpty
        message="Charts populate once you register agents."
        action={{ label: "View demo charts", href: "/dashboard/demo" }}
      />
    );
  }

  const deptMap = new Map<string, { certified: number; total: number }>();
  for (const agent of agents) {
    const dept = agent.department?.trim() || "Unassigned";
    const entry = deptMap.get(dept) ?? { certified: 0, total: 0 };
    entry.total += 1;
    if (agent.certification_status === "certified") entry.certified += 1;
    deptMap.set(dept, entry);
  }

  const certByDept = [...deptMap.entries()].map(([dept, v]) => ({
    dept,
    certified: v.certified,
    total: v.total,
  }));

  const healthTrend = buildHealthTrend(agents);

  return (
    <ExecutiveChartsFromData healthTrend={healthTrend} certByDept={certByDept} />
  );
}

function buildHealthTrend(
  agents: { health_score: number | null; created_at: string }[]
) {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const agent of agents) {
    const month = new Date(agent.created_at).toLocaleString("en-GB", {
      month: "short",
    });
    const entry = buckets.get(month) ?? { sum: 0, count: 0 };
    entry.sum += agent.health_score ?? 0;
    entry.count += 1;
    buckets.set(month, entry);
  }

  return [...buckets.entries()].map(([month, v]) => ({
    month,
    score: Math.round(v.sum / v.count),
  }));
}

function ChartsEmpty({
  message,
  action,
}: {
  message: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <Link href={action.href} className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
