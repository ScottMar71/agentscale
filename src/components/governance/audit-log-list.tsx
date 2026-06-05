import { format } from "date-fns";
import type { AuditLogEntry } from "@/types";

export function AuditLogList({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No audit events yet. Agent changes, certifications, and scenario runs will appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex flex-col border-b border-border pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium capitalize text-foreground">
              {log.action.replace(/_/g, " ")} — {log.entity_type.replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {log.actor_name ?? "System"} ·{" "}
              {JSON.stringify(log.metadata).slice(0, 120)}
              {JSON.stringify(log.metadata).length > 120 ? "…" : ""}
            </p>
          </div>
          <span className="mt-1 text-xs text-muted-foreground/70 sm:mt-0">
            {format(new Date(log.created_at), "dd MMM yyyy HH:mm")}
          </span>
        </li>
      ))}
    </ul>
  );
}
