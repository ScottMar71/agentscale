"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AgentCard } from "@/components/agents/agent-card";
import { demoAgents } from "@/lib/demo-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Bot, X } from "lucide-react";

export default function AgentRegistryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return demoAgents.filter((a) => {
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchDept = deptFilter === "all" || a.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [search, statusFilter, deptFilter]);

  const departments = [...new Set(demoAgents.map((a) => a.department).filter(Boolean))];
  const hasFilters = search !== "" || statusFilter !== "all" || deptFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDeptFilter("all");
  }

  return (
    <>
      <DashboardHeader
        title="Agent Registry"
        description="Complete directory of AI agents across your organisation"
        action={{ label: "Register agent" }}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by department">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d!}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="lg" onClick={clearFilters}>
              <X aria-hidden />
              Clear
            </Button>
          )}
        </div>
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "agent" : "agents"}
        </p>
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bot}
            title={hasFilters ? "No agents match your filters" : "No agents yet"}
            description={
              hasFilters
                ? "Try adjusting your search or filters to find what you’re looking for."
                : "Register your first AI agent to start onboarding, training, and certifying it."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button>Register agent</Button>
              )
            }
          />
        )}
      </div>
    </>
  );
}
