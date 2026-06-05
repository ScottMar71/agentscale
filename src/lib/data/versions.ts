import { createClient } from "@/lib/supabase/server";
import { demoVersions } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import type { AgentVersion } from "@/types";

type VersionRow = {
  id: string;
  agent_id: string;
  version_label: string;
  is_current: boolean;
  model_provider: string | null;
  model_version: string | null;
  prompt_content: string | null;
  created_at: string;
};

function mapVersion(row: VersionRow): AgentVersion {
  return {
    id: row.id,
    agent_id: row.agent_id,
    version_label: row.version_label,
    is_current: row.is_current,
    model_provider: row.model_provider,
    model_version: row.model_version,
    created_at: row.created_at,
  };
}

export async function listAgentVersions(agentId: string): Promise<{
  versions: AgentVersion[];
  isDemo: boolean;
}> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return {
      versions: demoVersions.filter((v) => v.agent_id === agentId),
      isDemo: true,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_versions")
    .select("id, agent_id, version_label, is_current, model_provider, model_version, prompt_content, created_at")
    .eq("organization_id", organizationId)
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { versions: [], isDemo: false };
  }

  return {
    versions: data.map((row) => mapVersion(row as VersionRow)),
    isDemo: false,
  };
}

export async function createAgentVersionSnapshot(params: {
  organizationId: string;
  agentId: string;
  versionLabel: string;
  modelProvider?: string | null;
  modelVersion?: string | null;
  promptContent?: string | null;
  createdBy?: string | null;
  isCurrent?: boolean;
}): Promise<void> {
  const supabase = await createClient();

  if (params.isCurrent !== false) {
    await supabase
      .from("agent_versions")
      .update({ is_current: false })
      .eq("organization_id", params.organizationId)
      .eq("agent_id", params.agentId);
  }

  await supabase.from("agent_versions").insert({
    organization_id: params.organizationId,
    agent_id: params.agentId,
    version_label: params.versionLabel,
    model_provider: params.modelProvider ?? null,
    model_version: params.modelVersion ?? null,
    prompt_content: params.promptContent ?? null,
    is_current: params.isCurrent !== false,
    created_by: params.createdBy ?? null,
  });
}

export async function rollbackAgentVersion(
  organizationId: string,
  agentId: string,
  versionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: version, error: fetchError } = await supabase
    .from("agent_versions")
    .select("id, version_label, model_provider, model_version, prompt_content")
    .eq("organization_id", organizationId)
    .eq("agent_id", agentId)
    .eq("id", versionId)
    .maybeSingle();

  if (fetchError || !version) {
    return { error: "Version not found." };
  }

  await supabase
    .from("agent_versions")
    .update({ is_current: false })
    .eq("organization_id", organizationId)
    .eq("agent_id", agentId);

  await supabase
    .from("agent_versions")
    .update({ is_current: true })
    .eq("id", versionId);

  const { error: agentError } = await supabase
    .from("agents")
    .update({
      prompt_version: version.version_label,
      model_provider: version.model_provider,
      model_version: version.model_version,
    })
    .eq("organization_id", organizationId)
    .eq("id", agentId);

  if (agentError) {
    return { error: agentError.message };
  }

  return {};
}
