import { NextResponse } from "next/server";
import { format } from "date-fns";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";
import { listAuditLogsForExport } from "@/lib/data/governance";

export async function GET() {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const org = await getCurrentOrganization();
  const organizationId = await getCurrentOrganizationId();

  if (!organizationId || !org) {
    return NextResponse.json({ error: "No workspace selected" }, { status: 401 });
  }

  if (!canWriteOrg(org.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await listAuditLogsForExport(organizationId);
  const generatedAt = format(new Date(), "yyyy-MM-dd HH:mm:ss 'UTC'");

  const lines = [
    "AgentScale — Governance Audit Pack",
    `Generated: ${generatedAt}`,
    `Organization: ${organizationId}`,
    `Events: ${logs.length}`,
    "",
    "---",
    "",
    ...logs.map((log) => {
      const when = format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss");
      const actor = log.actor_name ?? "System";
      const meta = JSON.stringify(log.metadata);
      return `[${when}] ${actor} | ${log.action} | ${log.entity_type} | ${meta}`;
    }),
  ];

  const body = lines.join("\n");
  const filename = `agentscale-audit-${format(new Date(), "yyyy-MM-dd")}.txt`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
