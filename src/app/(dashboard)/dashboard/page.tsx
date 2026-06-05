import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view";
import { getLiveDashboardStats } from "@/lib/data/dashboard";

export default async function ExecutiveDashboardPage() {
  const stats = await getLiveDashboardStats();

  return <ExecutiveDashboardView stats={stats} variant="live" />;
}
