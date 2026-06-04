import { LinearClient } from "@linear/sdk";

import type { LinearTask } from "./tasks";

export function getLinearClient(): LinearClient | null {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return null;
  return new LinearClient({ apiKey });
}

export function formatLinearTaskTitle(task: LinearTask): string {
  return `[${task.id}] ${task.title}`;
}

export function formatLinearTaskDescription(task: LinearTask): string {
  return [
    `**Sprint:** ${task.sprint}`,
    "",
    "_Synced from AgentScale `docs/IMPLEMENTATION_PLAN.md`_",
  ].join("\n");
}

export async function resolveTeamId(
  client: LinearClient,
  teamIdOrKey = process.env.LINEAR_TEAM_ID
): Promise<string> {
  if (!teamIdOrKey) {
    throw new Error("Set LINEAR_TEAM_ID to your team UUID or team key (e.g. ENG).");
  }

  const { nodes: teams } = await client.teams();
  const needle = teamIdOrKey.toLowerCase();
  const match =
    teams.find((team) => team.id === teamIdOrKey) ??
    teams.find((team) => team.key.toUpperCase() === teamIdOrKey.toUpperCase()) ??
    teams.find((team) => team.name.toLowerCase() === needle);

  if (!match) {
    const available = teams.map((team) => `${team.key} (${team.name})`).join(", ");
    throw new Error(`Team "${teamIdOrKey}" not found. Available: ${available || "none"}`);
  }

  return match.id;
}

/** Map exact issue title → issue id for idempotent sync. */
export async function loadExistingIssuesByTitle(
  client: LinearClient,
  teamId: string
): Promise<Map<string, string>> {
  const byTitle = new Map<string, string>();
  const team = await client.team(teamId);
  let cursor: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const connection = await team.issues({ first: 100, after: cursor });
    for (const issue of connection.nodes) {
      byTitle.set(issue.title, issue.id);
    }
    hasNextPage = connection.pageInfo.hasNextPage;
    cursor = connection.pageInfo.endCursor ?? undefined;
  }

  return byTitle;
}

export type SyncLinearTaskResult =
  | { status: "created"; issueId: string }
  | { status: "skipped"; issueId: string };

export async function syncLinearTask(
  client: LinearClient,
  teamId: string,
  existingByTitle: Map<string, string>,
  task: LinearTask
): Promise<SyncLinearTaskResult> {
  const title = formatLinearTaskTitle(task);
  const existingId = existingByTitle.get(title);
  if (existingId) {
    return { status: "skipped", issueId: existingId };
  }

  const payload = await client.createIssue({
    teamId,
    title,
    description: formatLinearTaskDescription(task),
  });

  const issue = await payload.issue;
  if (!issue) {
    throw new Error(`Linear did not return an issue for task ${task.id}`);
  }

  existingByTitle.set(title, issue.id);
  return { status: "created", issueId: issue.id };
}

/** @deprecated Use syncLinearTask for idempotent behavior */
export async function createLinearTask(
  client: LinearClient,
  teamId: string,
  task: LinearTask
): Promise<string> {
  const result = await syncLinearTask(client, teamId, new Map(), task);
  return result.issueId;
}
