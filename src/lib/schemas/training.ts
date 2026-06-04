import { z } from "zod";

export const programFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(2000).optional(),
  certification_type: z.string().max(100).optional(),
  is_published: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const moduleFormSchema = z.object({
  title: z.string().min(2, "Module title is required").max(120),
  description: z.string().max(2000).optional(),
  body: z.string().max(50000).optional(),
});

export const assignProgramSchema = z.object({
  agent_id: z.string().uuid("Select an agent"),
  program_id: z.string().uuid("Select a programme"),
});
