"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Bot, X } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AgentCard } from "@/components/agents/agent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-[160px]";

interface AgentRegistryProps {
  agents: Agent[];
  departments: string[];
  filters: {
    q: string;
    status: string;
    department: string;
  };
}

export function AgentRegistry({ agents, departments, filters }: AgentRegistryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const hasFilters =
    filters.q !== "" || filters.status !== "all" || filters.department !== "all";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/dashboard/agents?${qs}` : "/dashboard/agents");
      });
    },
    [router, searchParams]
  );

  const clearFilters = () => updateParams({ q: null, status: null, department: null });

  const resultLabel = useMemo(
    () => `${agents.length} ${agents.length === 1 ? "agent" : "agents"}`,
    [agents.length]
  );

  return (
    <>
      <DashboardHeader
        title="Agent Registry"
        description="Complete directory of AI agents across your organisation"
        action={{ label: "Register agent", href: "/dashboard/agents/new" }}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div
          className={cn(
            "mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end",
            pending && "opacity-70"
          )}
        >
          <div className="flex-1 sm:min-w-[200px] sm:max-w-md">
            <Label htmlFor="agent-search" className="sr-only">
              Search agents
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="agent-search"
                placeholder="Search agents, tags…"
                className="pl-9"
                defaultValue={filters.q}
                onChange={(e) => updateParams({ q: e.target.value || null })}
              />
            </div>
          </div>
          <select
            aria-label="Filter by status"
            className={selectClass}
            value={filters.status}
            onChange={(e) => updateParams({ status: e.target.value })}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
          <select
            aria-label="Filter by department"
            className={selectClass}
            value={filters.department}
            onChange={(e) => updateParams({ department: e.target.value })}
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {hasFilters && (
            <Button variant="ghost" size="lg" onClick={clearFilters}>
              <X aria-hidden />
              Clear
            </Button>
          )}
        </div>
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {resultLabel}
        </p>
        {agents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bot}
            title={hasFilters ? "No agents match your filters" : "No agents yet"}
            description={
              hasFilters
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Register your first AI agent to start onboarding, training, and certifying it."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Link href="/dashboard/agents/new" className={buttonVariants({ size: "lg" })}>
                  Register agent
                </Link>
              )
            }
          />
        )}
      </div>
    </>
  );
}
