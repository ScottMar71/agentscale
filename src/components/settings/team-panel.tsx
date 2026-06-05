"use client";

import { useActionState } from "react";
import { inviteTeamMember, revokeInviteFromForm, updateMemberRole, type TeamActionState } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { PendingInvite, TeamMember } from "@/lib/data/team";
import type { OrgRole } from "@/types";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface TeamPanelProps {
  members: TeamMember[];
  invites: PendingInvite[];
  isAdmin: boolean;
}

export function TeamPanel({ members, invites, isAdmin }: TeamPanelProps) {
  const [inviteState, inviteAction, invitePending] = useActionState<TeamActionState, FormData>(
    inviteTeamMember,
    {}
  );

  if (!isAdmin) {
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Team members in this workspace:</p>
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="font-medium text-foreground">
                  {member.full_name ?? member.email}
                </p>
                <p className="text-xs">{member.email}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {member.role.replace("_", " ")}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={inviteAction} className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-foreground">Invite team member</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder="colleague@company.com"
              required
            />
            {inviteState.fieldErrors?.email && (
              <p className="text-xs text-destructive">{inviteState.fieldErrors.email[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <select id="invite-role" name="role" className={selectClass} defaultValue="viewer">
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="org_admin">Org admin</option>
            </select>
          </div>
          <Button type="submit" disabled={invitePending}>
            Send invite
          </Button>
        </div>
        {inviteState.error && (
          <p role="alert" className="text-sm text-destructive">
            {inviteState.error}
          </p>
        )}
        {inviteState.success && (
          <p role="status" className="text-sm text-success">
            {inviteState.success}
          </p>
        )}
      </form>

      {invites.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Pending invites</p>
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{invite.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {invite.role.replace("_", " ")} · expires{" "}
                    {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <form action={revokeInviteFromForm}>
                  <input type="hidden" name="inviteId" value={invite.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Revoke
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Members</p>
        <ul className="space-y-2">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: TeamMember }) {
  const [state, action, pending] = useActionState<TeamActionState, FormData>(updateMemberRole, {});

  return (
    <li className="rounded-lg border border-border px-3 py-2">
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">{member.full_name ?? member.email}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            name="role"
            className={selectClass + " sm:w-[140px]"}
            defaultValue={member.role}
          >
            {(["viewer", "manager", "org_admin"] as OrgRole[]).map((role) => (
              <option key={role} value={role}>
                {role.replace("_", " ")}
              </option>
            ))}
          </select>
          <input type="hidden" name="memberId" value={member.id} />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            Save
          </Button>
        </div>
      </form>
      {state.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
      {state.success && <p className="mt-2 text-xs text-success">{state.success}</p>}
    </li>
  );
}
