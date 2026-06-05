"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_ORG_COOKIE, CURRENT_ORG_COOKIE_OPTIONS } from "@/lib/auth/org-cookie";
import { getIsSuperAdmin } from "@/lib/auth/session";
import { slugifyOrganizationName } from "@/lib/utils/slug";

const createOrgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
});

export type CreateOrganizationState = {
  error?: string;
  fieldErrors?: { name?: string[]; slug?: string[] };
};

export async function createOrganization(
  _prev: CreateOrganizationState,
  formData: FormData
): Promise<CreateOrganizationState> {
  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugifyOrganizationName(String(formData.get("name") ?? "")),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error: "Please fix the errors below.",
      fieldErrors: {
        name: fieldErrors.name,
        slug: fieldErrors.slug,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/setup");
  }

  const { data: orgId, error } = await supabase.rpc("create_organization", {
    org_name: parsed.data.name,
    org_slug: parsed.data.slug,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "That workspace URL is already taken. Try a different slug."
        : error.message;
    return { error: message };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, orgId as string, CURRENT_ORG_COOKIE_OPTIONS);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function switchOrganization(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!(await getIsSuperAdmin())) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!membership) {
      return { error: "You do not have access to that organization." };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, orgId, CURRENT_ORG_COOKIE_OPTIONS);

  revalidatePath("/dashboard");
  return { success: true };
}
