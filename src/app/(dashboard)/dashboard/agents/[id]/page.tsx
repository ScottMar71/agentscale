import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoAgents, demoVersions } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = demoAgents.find((a) => a.id === id);
  if (!agent) notFound();

  const versions = demoVersions.filter((v) => v.agent_id === id);

  return (
    <>
      <DashboardHeader title={agent.name} description={agent.description ?? undefined} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Link
          href="/dashboard/agents"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2 inline-flex")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to registry
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Agent profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Department</dt>
                      <dd className="font-medium">{agent.department}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Owner</dt>
                      <dd className="font-medium">{agent.owner_name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Business function</dt>
                      <dd className="font-medium">{agent.business_function}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Deployment</dt>
                      <dd className="font-medium capitalize">{agent.deployment_status}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    {agent.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="config" className="mt-4 space-y-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Model:</span>{" "}
                    {agent.model_provider} {agent.model_version}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Prompt version:</span> v
                    {agent.prompt_version}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Tools:</span>{" "}
                    {agent.tool_stack.join(", ")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Knowledge base:</span>{" "}
                    {agent.knowledge_base_connected ? "Connected" : "Not connected"}
                  </p>
                </TabsContent>
                <TabsContent value="training" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Assign training programmes from the Training Academy.
                  </p>
                  <Link
                    href="/dashboard/academy"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 inline-flex")}
                  >
                    View programmes
                  </Link>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Health score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-semibold text-foreground">{agent.health_score}</p>
                <Progress value={agent.health_score} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="capitalize">{agent.certification_status}</Badge>
                <p className="mt-2 text-xs text-muted-foreground">Risk: {agent.risk_level}</p>
              </CardContent>
            </Card>
            {versions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Versions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {versions.map((v) => (
                    <div key={v.id} className="flex justify-between">
                      <span>v{v.version_label}</span>
                      {v.is_current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
