"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { switchOrganization } from "@/app/actions/organization";
import type { UserOrganization } from "@/lib/auth/session";

interface OrgSwitcherProps {
  organizations: UserOrganization[];
  currentOrgId: string;
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = organizations.find((o) => o.id === currentOrgId) ?? organizations[0];

  if (!current || organizations.length <= 1) {
    return current ? (
      <p className="truncate text-xs text-brand-foreground/70">{current.name}</p>
    ) : null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            aria-label="Switch organization"
            className="h-8 max-w-[180px] gap-1.5 px-2 text-brand-foreground hover:bg-white/10 hover:text-brand-foreground"
          />
        }
      >
        <span className="truncate text-xs font-medium">{current.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => {
              startTransition(async () => {
                await switchOrganization(org.id);
                router.refresh();
              });
            }}
          >
            <span className="font-medium">{org.name}</span>
            {org.id === currentOrgId && (
              <span className="ml-auto text-xs text-muted-foreground">Active</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
