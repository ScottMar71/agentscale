import { NextResponse } from "next/server";
import { format } from "date-fns";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";
import { listAuditLogsForExport } from "@/lib/data/governance";
import { buildAuditPackPdf } from "@/lib/pdf/audit-pack";

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
  const pdfBytes = await buildAuditPackPdf({
    organizationName: org.name,
    organizationId,
    logs,
  });

  const filename = `agentscale-audit-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
