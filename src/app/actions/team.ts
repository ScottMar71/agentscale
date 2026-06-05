"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getCurrentOrganization } from "@/lib/auth/session";
import { isAuthEnabled } from "@/lib/auth/config";
import { isOrgAdmin } from "@/lib/auth/permissions";
import { sendOrgInviteEmail } from "@/lib/resend";
import { CURRENT_ORG_COOKIE, CURRENT_ORG_COOKIE_OPTIONS } from "@/lib/auth/org-cookie";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["org_admin", "manager", "viewer"]),
});

const roleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["org_admin", "manager", "viewer"]),
});

export type TeamActionState = {
  error?: string;
  success?: string;
  fieldErrors?: { email?: string[]; role?: string[] };
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function inviteTeamMember(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to invite team members." };
  }

  const org = await getCurrentOrganization();
  if (!org || !isOrgAdmin(org.role)) {
    return { error: "Only organisation admins can invite team members." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "viewer",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error: "Please fix the errors below.",
      fieldErrors: {
        email: fieldErrors.email,
        role: fieldErrors.role,
      },
    };
  }

  const supabase = await createClient();
  const user = await getAuthUser();
  const email = parsed.data.email.toLowerCase().trim();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("organization_invites").upsert(
    {
      organization_id: org.id,
      email,
      role: parsed.data.role,
      token,
      invited_by: user?.id ?? null,
      expires_at: expiresAt,
      accepted_at: null,
    },
    { onConflict: "organization_id,email" }
  );

  if (error) {
    return { error: error.message };
  }

  const inviterName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "A team admin";

  await sendOrgInviteEmail({
    to: email,
    organizationName: org.name,
    inviterName,
    role: parsed.data.role,
    inviteUrl: `${appUrl()}/invite/${token}`,
  });

  revalidatePath("/dashboard/settings");
  return { success: `Invitation sent to ${email}` };
}

export async function revokeInvite(inviteId: string): Promise<TeamActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to manage invites." };
  }

  const org = await getCurrentOrganization();
  if (!org || !isOrgAdmin(org.role)) {
    return { error: "Only organisation admins can revoke invites." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_invites")
    .delete()
    .eq("id", inviteId)
    .eq("organization_id", org.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: "Invite revoked" };
}

export async function updateMemberRole(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to manage team roles." };
  }

  const org = await getCurrentOrganization();
  if (!org || !isOrgAdmin(org.role)) {
    return { error: "Only organisation admins can change roles." };
  }

  const parsed = roleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Invalid role update." };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("id", parsed.data.memberId)
    .eq("organization_id", org.id)
    .maybeSingle();

  if (!member) {
    return { error: "Member not found." };
  }

  if (member.user_id === (await getAuthUser())?.id && parsed.data.role !== "org_admin") {
    return { error: "You cannot demote yourself. Ask another admin." };
  }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.memberId)
    .eq("organization_id", org.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: "Role updated" };
}

export async function acceptInvite(token: string): Promise<TeamActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to accept invites." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  const { data: orgId, error } = await supabase.rpc("accept_organization_invite", {
    invite_token: token,
  });

  if (error) {
    return { error: error.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, orgId as string, CURRENT_ORG_COOKIE_OPTIONS);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function acceptInviteFromForm(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  await acceptInvite(token);
}

export async function revokeInviteFromForm(formData: FormData): Promise<void> {
  const inviteId = String(formData.get("inviteId") ?? "");
  await revokeInvite(inviteId);
}
