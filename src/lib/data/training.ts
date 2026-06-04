import { createClient } from "@/lib/supabase/server";
import { demoPrograms, demoModules, demoAgents } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import type {
  AgentTrainingAssignment,
  TrainingModule,
  TrainingProgram,
  TrainingProgramDetail,
} from "@/types";

function mapModule(row: Record<string, unknown>): TrainingModule {
  const content = (row.content as TrainingModule["content"]) ?? {};
  return {
    id: row.id as string,
    program_id: row.program_id as string,
    organization_id: row.organization_id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    sort_order: (row.sort_order as number) ?? 0,
    content,
  };
}

export async function listTrainingPrograms(): Promise<TrainingProgram[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoPrograms;
  }

  const supabase = await createClient();
  const { data: programs, error } = await supabase
    .from("training_programs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error || !programs) {
    console.error("listTrainingPrograms:", error?.message);
    return demoPrograms;
  }

  const { data: moduleCounts } = await supabase
    .from("training_modules")
    .select("program_id")
    .eq("organization_id", organizationId);

  const counts = (moduleCounts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.program_id] = (acc[row.program_id] ?? 0) + 1;
    return acc;
  }, {});

  return programs.map((p) => ({
    id: p.id,
    organization_id: p.organization_id,
    title: p.title,
    description: p.description,
    certification_type: p.certification_type,
    module_count: counts[p.id] ?? 0,
    is_published: p.is_published ?? false,
  }));
}

export async function getTrainingProgram(
  programId: string
): Promise<TrainingProgramDetail | null> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    const program = demoPrograms.find((p) => p.id === programId);
    if (!program) return null;
    return {
      ...program,
      modules: demoModules[programId] ?? [],
    };
  }

  const supabase = await createClient();
  const { data: program, error } = await supabase
    .from("training_programs")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", programId)
    .maybeSingle();

  if (error || !program) return null;

  const { data: modules } = await supabase
    .from("training_modules")
    .select("*")
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });

  return {
    id: program.id,
    organization_id: program.organization_id,
    title: program.title,
    description: program.description,
    certification_type: program.certification_type,
    module_count: modules?.length ?? 0,
    is_published: program.is_published ?? false,
    modules: (modules ?? []).map((m) => mapModule(m)),
  };
}

export async function insertTrainingProgram(
  organizationId: string,
  payload: {
    title: string;
    description?: string | null;
    certification_type?: string | null;
    is_published: boolean;
  }
): Promise<{ program: TrainingProgram | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_programs")
    .insert({
      organization_id: organizationId,
      title: payload.title,
      description: payload.description ?? null,
      certification_type: payload.certification_type ?? null,
      is_published: payload.is_published,
    })
    .select()
    .single();

  if (error || !data) {
    return { program: null, error: error?.message ?? "Failed to create programme" };
  }

  return {
    program: {
      id: data.id,
      organization_id: data.organization_id,
      title: data.title,
      description: data.description,
      certification_type: data.certification_type,
      module_count: 0,
      is_published: data.is_published ?? false,
    },
  };
}

export async function insertTrainingModule(
  organizationId: string,
  programId: string,
  payload: {
    title: string;
    description?: string | null;
    body?: string;
  }
): Promise<{ module: TrainingModule | null; error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("training_modules")
    .select("sort_order")
    .eq("program_id", programId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("training_modules")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      title: payload.title,
      description: payload.description ?? null,
      sort_order: nextOrder,
      content: payload.body ? { body: payload.body } : {},
    })
    .select()
    .single();

  if (error || !data) {
    return { module: null, error: error?.message ?? "Failed to create module" };
  }

  return { module: mapModule(data) };
}

export async function updateModuleContent(
  organizationId: string,
  moduleId: string,
  content: TrainingModule["content"]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_modules")
    .update({ content })
    .eq("organization_id", organizationId)
    .eq("id", moduleId);

  if (error) return { error: error.message };
  return {};
}

export async function assignProgramToAgent(
  organizationId: string,
  agentId: string,
  programId: string
): Promise<{ assignment: AgentTrainingAssignment | null; error?: string }> {
  const supabase = await createClient();

  const program = await getTrainingProgram(programId);
  if (!program) return { assignment: null, error: "Programme not found" };

  const total = program.modules.length;

  const { data: agent } = await supabase
    .from("agents")
    .select("name")
    .eq("id", agentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!agent) return { assignment: null, error: "Agent not found" };

  const { data, error } = await supabase
    .from("agent_training_progress")
    .upsert(
      {
        agent_id: agentId,
        program_id: programId,
        organization_id: organizationId,
        modules_completed: 0,
        total_modules: total,
        percent_complete: 0,
        completed_at: null,
      },
      { onConflict: "agent_id,program_id" }
    )
    .select()
    .single();

  if (error || !data) {
    return { assignment: null, error: error?.message ?? "Assignment failed" };
  }

  return {
    assignment: {
      id: data.id,
      agent_id: agentId,
      agent_name: agent.name,
      program_id: programId,
      program_title: program.title,
      modules_completed: data.modules_completed ?? 0,
      total_modules: data.total_modules ?? total,
      percent_complete: data.percent_complete ?? 0,
    },
  };
}

export async function listAgentTrainingAssignments(
  agentId: string
): Promise<AgentTrainingAssignment[]> {
  const { mode, organizationId } = await resolveDataContext();
  if (mode === "demo" || !organizationId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_training_progress")
    .select(
      `
      id,
      agent_id,
      program_id,
      modules_completed,
      total_modules,
      percent_complete,
      agents!inner(name),
      training_programs!inner(title)
    `
    )
    .eq("agent_id", agentId)
    .eq("organization_id", organizationId);

  if (error || !data) return [];

  return data.map((row) => {
    const agents = row.agents as { name: string } | { name: string }[];
    const programs = row.training_programs as { title: string } | { title: string }[];
    const agentName = Array.isArray(agents) ? agents[0]?.name : agents?.name;
    const programTitle = Array.isArray(programs) ? programs[0]?.title : programs?.title;
    return {
      id: row.id,
      agent_id: row.agent_id,
      agent_name: agentName ?? "Agent",
      program_id: row.program_id,
      program_title: programTitle ?? "Programme",
      modules_completed: row.modules_completed ?? 0,
      total_modules: row.total_modules ?? 0,
      percent_complete: row.percent_complete ?? 0,
    };
  });
}

export async function listAgentsForAssignment(): Promise<
  { id: string; name: string }[]
> {
  const { mode, organizationId } = await resolveDataContext();
  if (mode === "demo" || !organizationId) {
    return demoAgents.map((a) => ({ id: a.id, name: a.name }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");

  return data ?? [];
}
