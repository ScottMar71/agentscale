"use client";

import { useActionState, useTransition } from "react";
import { format } from "date-fns";
import { Building2, ExternalLink } from "lucide-react";
import { adminSwitchOrganization, updateOrganizationPlan } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAgentLimit, type SubscriptionPlan } from "@/lib/billing/plans";
import type { PlatformOrganization } from "@/lib/data/admin-types";
import { PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PLANS_LIST: SubscriptionPlan[] = ["starter", "growth", "enterprise"];

function planLabel(plan: SubscriptionPlan): string {
  return PLANS[plan]?.name ?? plan;
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function OrgPlanForm({ org }: { org: PlatformOrganization }) {
  const [state, formAction, pending] = useActionState(updateOrganizationPlan, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="organizationId" value={org.id} />
      <div className="space-y-1">
        <Label htmlFor={`plan-${org.id}`} className="sr-only">
          Plan for {org.name}
        </Label>
        <select
          id={`plan-${org.id}`}
          name="plan"
          defaultValue={org.plan}
          className={cn(selectClass, "w-[120px]")}
        >
          {PLANS_LIST.map((plan) => (
            <option key={plan} value={plan}>
              {planLabel(plan)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`limit-${org.id}`} className="sr-only">
          Agent limit for {org.name}
        </Label>
        <input
          id={`limit-${org.id}`}
          name="agentLimit"
          type="number"
          min={1}
          max={10000}
          defaultValue={org.agent_limit >= 10_000 ? 10000 : org.agent_limit}
          className="h-8 w-20 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`Agent limit for ${org.name}`}
        />
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </Button>
      {state.error && (
        <p role="alert" className="w-full text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="w-full text-xs text-success">
          Plan updated
        </p>
      )}
    </form>
  );
}

export function PlatformOrgTable({ organizations }: { organizations: PlatformOrganization[] }) {
  const [pending, startTransition] = useTransition();

  if (organizations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No organizations on the platform yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organisation</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Agents</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Billing</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((org) => (
          <TableRow key={org.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.slug}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <OrgPlanForm org={org} />
            </TableCell>
            <TableCell>
              {org.agent_count} / {formatAgentLimit(org.agent_limit)}
            </TableCell>
            <TableCell>{org.member_count}</TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(org.created_at), "dd MMM yyyy")}
            </TableCell>
            <TableCell>
              {org.has_subscription ? (
                <Badge className="bg-success-subtle text-success">Subscribed</Badge>
              ) : (
                <Badge variant="outline">Free / trial</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await adminSwitchOrganization(org.id);
                  });
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open workspace
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
