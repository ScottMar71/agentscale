import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import {
  getLinearClient,
  loadExistingIssuesByTitle,
  resolveTeamId,
  syncLinearTask,
} from "../src/lib/linear/client";
import { AGENTSCALE_LINEAR_TASKS } from "../src/lib/linear/tasks";

function loadEnvFile(path: string, override: boolean) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!override && process.env[key]) continue;
    process.env[key] = value;
  }
}

/** Global ~/.cursor/linear.env, then project .env.local (project wins). */
function loadLinearEnv() {
  loadEnvFile(join(homedir(), ".cursor", "linear.env"), false);
  loadEnvFile(join(process.cwd(), ".env.local"), true);
}

async function main() {
  loadLinearEnv();

  const client = getLinearClient();
  if (!client) {
    console.error(
      "Missing LINEAR_API_KEY. Add it to ~/.cursor/linear.env or .env.local (see ~/.cursor/linear.env.example)."
    );
    process.exit(1);
  }

  const teamId = await resolveTeamId(client);
  const existingByTitle = await loadExistingIssuesByTitle(client, teamId);

  console.log(
    `Syncing ${AGENTSCALE_LINEAR_TASKS.length} tasks to Linear team ${teamId} (${existingByTitle.size} existing issues loaded)…`
  );

  let created = 0;
  let skipped = 0;

  for (const task of AGENTSCALE_LINEAR_TASKS) {
    const result = await syncLinearTask(client, teamId, existingByTitle, task);
    if (result.status === "skipped") {
      skipped += 1;
      console.log(`  ⊘ #${task.id} → ${result.issueId} (exists)`);
    } else {
      created += 1;
      console.log(`  ✓ #${task.id} → ${result.issueId}`);
    }
  }

  console.log(`Done. Created ${created}, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
