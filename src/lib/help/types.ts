import type { OrgRole } from "@/types";

export type HelpTopicId = string;

export interface HelpImproveStep {
  label: string;
  href: string;
  roles?: OrgRole[];
}

export interface HelpTopic {
  id: HelpTopicId;
  title: string;
  summary: string;
  definition?: string;
  formula?: string;
  dataSource?: string;
  appearsOn?: string[];
  targets?: string;
  improveSteps?: HelpImproveStep[];
  relatedIds?: HelpTopicId[];
  category: "metric" | "module" | "pilot";
}
