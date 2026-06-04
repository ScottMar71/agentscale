#!/usr/bin/env node
import { readFileSync } from "fs";
import { execSync } from "child_process";

const file = process.argv[2] || ".env.local";
const envs = ["production", "preview", "development"];

const lines = readFileSync(file, "utf8").split("\n");
for (const env of envs) {
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!val) continue;
    try {
      const args =
        env === "preview"
          ? `env add ${key} preview --value ${JSON.stringify(val)} --yes --force`
          : `env add ${key} ${env} --value ${JSON.stringify(val)} --yes --force`;
      execSync(`vercel ${args}`, { stdio: "pipe", cwd: new URL("..", import.meta.url).pathname });
      console.log(`ok ${key} (${env})`);
    } catch {
      console.log(`skip ${key} (${env})`);
    }
  }
}
