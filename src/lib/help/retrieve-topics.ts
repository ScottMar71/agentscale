import { HELP_TOPICS, getHelpTopic, searchHelpTopics } from "@/lib/help/topics";
import type { HelpTopic } from "@/lib/help/types";

const ROUTE_TOPIC_IDS: Record<string, string[]> = {
  "/dashboard": [
    "metric.ai_workforce",
    "metric.certified",
    "metric.utilisation",
    "metric.avg_health",
    "metric.at_risk",
    "metric.expiring_certs",
    "metric.failed_assessments",
    "metric.governance_posture",
    "pilot.days_since_first_agent",
    "pilot.days_to_first_cert",
    "pilot.avg_onboarding",
    "pilot.scenario_pass_rate",
  ],
  "/dashboard/demo": [
    "metric.ai_workforce",
    "metric.certified",
    "metric.est_savings",
    "metric.governance_posture",
  ],
  "/dashboard/performance": ["metric.avg_health"],
  "/dashboard/governance": [
    "metric.governance_posture",
    "metric.certified",
    "metric.at_risk",
    "metric.expiring_certs",
    "metric.failed_assessments",
  ],
  "/dashboard/onboarding": ["pilot.avg_onboarding"],
  "/dashboard/scenarios": ["pilot.scenario_pass_rate", "metric.failed_assessments"],
  "/dashboard/certifications": ["metric.certified", "metric.expiring_certs", "pilot.days_to_first_cert"],
};

function uniqueTopics(topics: HelpTopic[]): HelpTopic[] {
  const seen = new Set<string>();
  return topics.filter((topic) => {
    if (seen.has(topic.id)) return false;
    seen.add(topic.id);
    return true;
  });
}

function topicsForPathname(pathname: string | undefined): HelpTopic[] {
  if (!pathname) return [];

  const exact = ROUTE_TOPIC_IDS[pathname];
  if (exact) {
    return exact.map((id) => getHelpTopic(id)).filter((topic): topic is HelpTopic => Boolean(topic));
  }

  const prefix = Object.keys(ROUTE_TOPIC_IDS)
    .filter((route) => route !== "/dashboard" && pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (!prefix) return [];

  return ROUTE_TOPIC_IDS[prefix]
    .map((id) => getHelpTopic(id))
    .filter((topic): topic is HelpTopic => Boolean(topic));
}

export function retrieveCoachTopics({
  message,
  topicId,
  pathname,
  limit = 5,
}: {
  message: string;
  topicId?: string;
  pathname?: string;
  limit?: number;
}): HelpTopic[] {
  const collected: HelpTopic[] = [];

  if (topicId) {
    const primary = getHelpTopic(topicId);
    if (primary) {
      collected.push(primary);
      for (const relatedId of primary.relatedIds ?? []) {
        const related = getHelpTopic(relatedId);
        if (related) collected.push(related);
      }
    }
  }

  collected.push(...topicsForPathname(pathname));

  const query = message.trim();
  if (query) {
    collected.push(...searchHelpTopics(query));
  }

  if (collected.length === 0) {
    collected.push(...HELP_TOPICS.slice(0, limit));
  }

  return uniqueTopics(collected).slice(0, limit);
}
