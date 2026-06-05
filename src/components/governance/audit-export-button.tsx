import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuditExportButton({ disabled }: { disabled?: boolean }) {
  if (disabled) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "pointer-events-none opacity-50"
        )}
      >
        <Download className="h-4 w-4" aria-hidden />
        Export audit pack
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/api/governance/audit-export/pdf"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-2")}
      >
        <Download className="h-4 w-4" aria-hidden />
        Export PDF
      </Link>
      <Link
        href="/api/governance/audit-export"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex gap-2")}
      >
        Text
      </Link>
    </div>
  );
}
