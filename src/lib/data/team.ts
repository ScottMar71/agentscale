import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import type { OrgRole } from "@/types";

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: OrgRole;
  created_at: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: OrgRole;
  expires_at: string;
  created_at: string;
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  if (!isAuthEnabled()) return [];

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      id,
      user_id,
      role,
      created_at,
      profiles (
        email,
        full_name
      )
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const profile = row.profiles as
      | { email: string; full_name: string | null }
      | { email: string; full_name: string | null }[]
      | null;
    const resolved = Array.isArray(profile) ? profile[0] : profile;
    return {
      id: row.id,
      user_id: row.user_id,
      email: resolved?.email ?? "Unknown",
      full_name: resolved?.full_name ?? null,
      role: row.role as OrgRole,
      created_at: row.created_at,
    };
  });
}

export async function listPendingInvites(): Promise<PendingInvite[]> {
  if (!isAuthEnabled()) return [];

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invites")
    .select("id, email, role, expires_at, created_at")
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role as OrgRole,
    expires_at: row.expires_at,
    created_at: row.created_at,
  }));
}

export async function getInviteByToken(token: string): Promise<{
  id: string;
  email: string;
  role: OrgRole;
  organization_name: string;
  expires_at: string;
  accepted_at: string | null;
} | null> {
  if (!isAuthEnabled()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invites")
    .select(
      `
      id,
      email,
      role,
      expires_at,
      accepted_at,
      organizations (
        name
      )
    `
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  const org = data.organizations as { name: string } | { name: string }[] | null;
  const resolved = Array.isArray(org) ? org[0] : org;

  return {
    id: data.id,
    email: data.email,
    role: data.role as OrgRole,
    organization_name: resolved?.name ?? "Workspace",
    expires_at: data.expires_at,
    accepted_at: data.accepted_at,
  };
}
