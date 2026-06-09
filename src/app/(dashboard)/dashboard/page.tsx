import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view";
import { getLiveDashboardStats, getPartnerSuccessMetrics } from "@/lib/data/dashboard";

export default async function ExecutiveDashboardPage() {
  const [stats, partnerMetrics] = await Promise.all([
    getLiveDashboardStats(),
    getPartnerSuccessMetrics(),
  ]);

  return (
    <ExecutiveDashboardView stats={stats} partnerMetrics={partnerMetrics} variant="live" />
  );
}
