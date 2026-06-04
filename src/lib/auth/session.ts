import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { CURRENT_ORG_COOKIE } from "@/lib/auth/org-cookie";
import type { OrgRole } from "@/types";

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
}

export async function getAuthUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserOrganizations(): Promise<UserOrganization[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      role,
      organizations (
        id,
        name,
        slug
      )
    `
    )
    .eq("user_id", user.id);

  if (error || !data) return [];

  return data
    .map((row) => {
      const org = row.organizations as
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null;
      const resolved = Array.isArray(org) ? org[0] : org;
      if (!resolved) return null;
      return {
        id: resolved.id,
        name: resolved.name,
        slug: resolved.slug,
        role: row.role as OrgRole,
      };
    })
    .filter((o): o is UserOrganization => o !== null);
}

export async function getCurrentOrganizationId(
  organizations?: UserOrganization[]
): Promise<string | null> {
  const orgs = organizations ?? (await getUserOrganizations());
  if (orgs.length === 0) return null;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(CURRENT_ORG_COOKIE)?.value;
  if (fromCookie && orgs.some((o) => o.id === fromCookie)) {
    return fromCookie;
  }

  return orgs[0]?.id ?? null;
}

export async function getCurrentOrganization() {
  const orgs = await getUserOrganizations();
  const id = await getCurrentOrganizationId(orgs);
  return orgs.find((o) => o.id === id) ?? null;
}
