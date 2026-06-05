import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import type { AuditLogEntry } from "@/types";

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "certify"
  | "approve"
  | "reject"
  | "revoke";

export async function writeAuditLog(params: {
  organizationId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!isAuthEnabled()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("audit_logs").insert({
    organization_id: params.organizationId,
    actor_id: user?.id ?? null,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("audit_log insert failed:", error.message);
  }
}

export async function listAuditLogsForEntity(
  organizationId: string,
  entityType: string,
  entityId: string
): Promise<AuditLogEntry[]> {
  if (!isAuthEnabled()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, entity_type, action, metadata, created_at, actor_id")
    .eq("organization_id", organizationId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    entity_type: row.entity_type,
    action: row.action,
    actor_name: null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at,
  }));
}
