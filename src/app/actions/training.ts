"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import {
  insertTrainingProgram,
  insertTrainingModule,
  updateModuleContent,
  assignProgramToAgent,
} from "@/lib/data/training";
import { writeAuditLog } from "@/lib/data/audit";
import {
  programFormSchema,
  moduleFormSchema,
  assignProgramSchema,
} from "@/lib/schemas/training";

const TRAINING_BUCKET = "training-content";

export type FormState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createTrainingProgram(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to create training programmes." };
  }

  const parsed = programFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const { program, error } = await insertTrainingProgram(organizationId, {
    title: parsed.data.title,
    description: parsed.data.description?.trim() || null,
    certification_type: parsed.data.certification_type?.trim() || null,
    is_published: parsed.data.is_published ?? false,
  });

  if (error || !program) return { error: error ?? "Failed to create programme" };

  await writeAuditLog({
    organizationId,
    entityType: "training_program",
    entityId: program.id,
    action: "create",
    metadata: { title: program.title },
  });

  revalidatePath("/dashboard/academy");
  redirect(`/dashboard/academy/${program.id}`);
}

export async function addTrainingModule(
  programId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to add modules." };
  }

  const parsed = moduleFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const { module, error } = await insertTrainingModule(organizationId, programId, {
    title: parsed.data.title,
    description: parsed.data.description?.trim() || null,
    body: parsed.data.body?.trim(),
  });

  if (error || !module) return { error: error ?? "Failed to add module" };

  revalidatePath(`/dashboard/academy/${programId}`);
  return { message: `Module "${module.title}" added.` };
}

export async function uploadModuleContent(
  programId: string,
  moduleId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to upload module content." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload (PDF, text, or markdown)." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be 10 MB or smaller." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${organizationId}/${programId}/${moduleId}/${safeName}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(TRAINING_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    return {
      error:
        uploadError.message.includes("Bucket not found")
          ? "Storage bucket missing. Apply migration 20240604000002_training_storage.sql."
          : uploadError.message,
    };
  }

  const { error: updateError } = await updateModuleContent(organizationId, moduleId, {
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type || undefined,
  });

  if (updateError) return { error: updateError };

  revalidatePath(`/dashboard/academy/${programId}`);
  return { message: `Uploaded ${file.name}` };
}

export async function assignTrainingProgram(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to assign programmes." };
  }

  const parsed = assignProgramSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Select an agent and programme." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const { assignment, error } = await assignProgramToAgent(
    organizationId,
    parsed.data.agent_id,
    parsed.data.program_id
  );

  if (error || !assignment) {
    return { error: error ?? "Assignment failed" };
  }

  await writeAuditLog({
    organizationId,
    entityType: "agent",
    entityId: parsed.data.agent_id,
    action: "update",
    metadata: {
      assigned_program: assignment.program_title,
      program_id: parsed.data.program_id,
    },
  });

  revalidatePath("/dashboard/academy");
  revalidatePath(`/dashboard/agents/${parsed.data.agent_id}`);
  return {
    message: `Assigned "${assignment.program_title}" to ${assignment.agent_name}.`,
  };
}
