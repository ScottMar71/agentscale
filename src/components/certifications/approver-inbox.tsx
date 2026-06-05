"use client";

import { submitCertificationReview } from "@/app/actions/certifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentCertification } from "@/types";

export function ApproverInbox({
  pending,
  isAdmin,
}: {
  pending: AgentCertification[];
  isAdmin: boolean;
}) {
  if (pending.length === 0) {
    return null;
  }

  return (
    <Card className="border-warning/30 bg-warning-subtle/30">
      <CardHeader>
        <CardTitle className="text-base">
          Approver inbox ({pending.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {pending.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{cert.agent_name}</p>
                <p className="text-sm text-muted-foreground">{cert.certification_name}</p>
              </div>
              {isAdmin ? (
                <div className="flex gap-2">
                  <form action={submitCertificationReview}>
                    <input type="hidden" name="agent_certification_id" value={cert.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={submitCertificationReview}>
                    <input type="hidden" name="agent_certification_id" value={cert.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Awaiting org admin approval</p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
