import Link from "next/link";
import {
  submitCustomerPortal,
  startStarterCheckout,
  startGrowthCheckout,
} from "@/app/actions/billing";
import { formatAgentLimit } from "@/lib/billing/plans";
import { PLANS } from "@/lib/constants";
import type { OrganizationBilling } from "@/lib/data/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function BillingPanel({
  billing,
  isAdmin,
  checkoutSuccess,
}: {
  billing: OrganizationBilling | null;
  isAdmin: boolean;
  checkoutSuccess?: boolean;
}) {
  if (!billing) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Billing information unavailable.
        </CardContent>
      </Card>
    );
  }

  const usagePercent =
    billing.agent_limit >= 10_000
      ? Math.min(100, billing.agent_count > 0 ? 8 : 0)
      : billing.agent_limit > 0
        ? Math.round((billing.agent_count / billing.agent_limit) * 100)
        : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkoutSuccess && (
          <p role="status" className="rounded-lg bg-success-subtle px-3 py-2 text-sm text-success">
            Subscription updated successfully.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge>{billing.plan_name}</Badge>
          {billing.has_subscription && (
            <span className="text-xs text-muted-foreground">Active subscription</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Agent usage</span>
            <span className="font-medium text-foreground">
              {billing.agent_count} / {formatAgentLimit(billing.agent_limit)}
            </span>
          </div>
          <Progress value={usagePercent} />
          {!billing.can_add_agent && (
            <p className="text-xs text-destructive">
              Agent limit reached. Upgrade your plan to register more agents.
            </p>
          )}
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            {billing.stripe_customer_id ? (
              <form action={submitCustomerPortal}>
                <Button type="submit" variant="default">
                  Manage billing
                </Button>
              </form>
            ) : (
              <>
                <form action={startStarterCheckout}>
                  <Button type="submit" variant="outline">
                    Subscribe — {PLANS.starter.priceLabel}
                  </Button>
                </form>
                <form action={startGrowthCheckout}>
                  <Button type="submit">Subscribe — {PLANS.growth.priceLabel}</Button>
                </form>
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Contact your organisation admin to change plan or billing.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Enterprise plans:{" "}
          <Link href="/#pricing" className="text-primary underline-offset-2 hover:underline">
            contact sales
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
