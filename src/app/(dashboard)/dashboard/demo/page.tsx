import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view";
import { demoStats } from "@/lib/demo-data";

export default function DemoDashboardPage() {
  return <ExecutiveDashboardView stats={demoStats} variant="demo" />;
}
