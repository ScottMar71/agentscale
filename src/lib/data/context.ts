import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import { DEMO_ORG_ID } from "@/lib/demo-data";

export type DataMode = "demo" | "live";

export async function resolveDataContext(): Promise<{
  mode: DataMode;
  organizationId: string | null;
}> {
  if (!isAuthEnabled()) {
    return { mode: "demo", organizationId: DEMO_ORG_ID };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { mode: "demo", organizationId: DEMO_ORG_ID };
  }

  return { mode: "live", organizationId };
}
