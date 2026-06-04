import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoPrograms } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const moduleExamples: Record<string, string[]> = {
  "Customer Support Certification": [
    "Product Knowledge",
    "Customer Communications",
    "Escalation Handling",
    "Compliance",
  ],
  "Sales Agent Certification": [
    "Product Knowledge",
    "Qualification",
    "Discovery",
    "Objection Handling",
  ],
  "GDPR & Data Privacy": [
    "Data Processing Principles",
    "Subject Access Requests",
    "Breach Response",
  ],
};

export default function AcademyPage() {
  return (
    <>
      <DashboardHeader
        title="Training Academy"
        description="LMS programmes, modules, and knowledge paths for AI agents"
        action={{ label: "Create programme" }}
      />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoPrograms.map((program) => (
            <Card key={program.id} className="border-slate-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="h-5 w-5 text-[#2563EB]" />
                  {program.is_published && (
                    <Badge className="bg-emerald-50 text-emerald-700">Published</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{program.title}</CardTitle>
                <p className="text-sm text-slate-500">{program.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  {program.module_count} modules · Cert: {program.certification_type}
                </p>
                <ol className="space-y-1 text-sm">
                  {(moduleExamples[program.title] ?? []).map((m, i) => (
                    <li key={m} className="text-slate-600">
                      Module {i + 1}: {m}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
