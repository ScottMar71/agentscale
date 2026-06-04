"use client";

import { useActionState } from "react";
import {
  createAgent,
  updateAgent,
  type AgentFormState,
} from "@/app/actions/agents";
import {
  formatTagsForInput,
  formatToolStackForInput,
} from "@/lib/schemas/agent";
import type { Agent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const inputClass =
  "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const initial: AgentFormState = {};

interface AgentFormProps {
  mode: "create" | "edit";
  agent?: Agent;
}

export function AgentForm({ mode, agent }: AgentFormProps) {
  const action =
    mode === "create"
      ? createAgent
      : updateAgent.bind(null, agent!.id);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Agent name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={agent?.name}
            placeholder="Customer Support Agent"
          />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            className={inputClass}
            defaultValue={agent?.description ?? ""}
            placeholder="What this agent does in production"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            defaultValue={agent?.department ?? ""}
            placeholder="Support"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="business_function">Business function</Label>
          <Input
            id="business_function"
            name="business_function"
            defaultValue={agent?.business_function ?? ""}
            placeholder="Customer service"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={agent?.status ?? "draft"}
            className={selectClass}
          >
            <option value="draft">Draft</option>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="risk_level">Risk level</Label>
          <select
            id="risk_level"
            name="risk_level"
            defaultValue={agent?.risk_level ?? "medium"}
            className={selectClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deployment_status">Deployment</Label>
          <select
            id="deployment_status"
            name="deployment_status"
            defaultValue={agent?.deployment_status ?? "development"}
            className={selectClass}
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model_provider">Model provider</Label>
          <Input
            id="model_provider"
            name="model_provider"
            defaultValue={agent?.model_provider ?? ""}
            placeholder="OpenAI"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model_version">Model version</Label>
          <Input
            id="model_version"
            name="model_version"
            defaultValue={agent?.model_version ?? ""}
            placeholder="gpt-4.1"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prompt_version">Prompt version</Label>
          <Input
            id="prompt_version"
            name="prompt_version"
            defaultValue={agent?.prompt_version ?? "1.0.0"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="knowledge_base_connected">Knowledge base</Label>
          <select
            id="knowledge_base_connected"
            name="knowledge_base_connected"
            defaultValue={agent?.knowledge_base_connected ? "true" : "false"}
            className={selectClass}
          >
            <option value="false">Not connected</option>
            <option value="true">Connected</option>
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={agent ? formatTagsForInput(agent.tags) : ""}
            placeholder="support, tier-1"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="tool_stack">Tools (comma-separated)</Label>
          <Input
            id="tool_stack"
            name="tool_stack"
            defaultValue={agent ? formatToolStackForInput(agent.tool_stack) : ""}
            placeholder="Zendesk, Knowledge Base"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Registering…"
              : "Saving…"
            : mode === "create"
              ? "Register agent"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.[0]) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}
