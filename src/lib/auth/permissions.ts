import type { OrgRole } from "@/types";

export function canWriteOrg(role: OrgRole | null | undefined): boolean {
  return role === "org_admin" || role === "manager";
}

export function isOrgAdmin(role: OrgRole | null | undefined): boolean {
  return role === "org_admin";
}
