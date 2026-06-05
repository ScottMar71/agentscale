#!/usr/bin/env node
/**
 * Move loose markdown notes into folders based on docs/filing-rules.json
 * (tags, filename prefixes). Used by npm run file:notes and Cursor afterFileEdit hook.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const RULES_PATH = path.join(REPO_ROOT, "docs", "filing-rules.json");

function expand(value, vars) {
  return value.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

function loadRules() {
  const raw = JSON.parse(fs.readFileSync(RULES_PATH, "utf8"));
  const vars = {
    vaultRoot: raw.vaultRoot,
    docsRoot: raw.docsRoot,
  };
  return {
    ...raw,
    vars,
    inboxes: raw.inboxes.map((p) => expand(p, vars)),
    rules: raw.rules.map((r) => ({
      ...r,
      folder: expand(r.folder, vars),
    })),
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { tags: [] };
  const block = match[1];
  const tags = [];
  const tagLine = block.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (tagLine) {
    for (const line of tagLine[1].split("\n")) {
      const t = line.match(/^\s+-\s+(.+)$/);
      if (t) tags.push(t[1].trim().toLowerCase());
    }
  }
  const inline = block.match(/^tags:\s*\[(.+)\]/m);
  if (inline) {
    inline[1].split(",").forEach((t) => tags.push(t.trim().replace(/^['"]|['"]$/g, "").toLowerCase()));
  }
  return { tags };
}

function parseTitle(content) {
  const line = content.split("\n").find((l) => l.startsWith("# "));
  return line ? line.slice(2).trim().toLowerCase() : "";
}

function resolveTarget(filePath, rulesConfig) {
  const base = path.basename(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const { tags } = parseFrontmatter(content);
  const title = parseTitle(content);
  const nameLower = base.toLowerCase();

  for (const rule of rulesConfig.rules) {
    if (rule.filenamePrefix && nameLower.startsWith(rule.filenamePrefix.toLowerCase())) {
      return rule.folder;
    }
    if (rule.tags?.some((t) => tags.includes(t.toLowerCase()))) {
      return rule.folder;
    }
    if (rule.titleIncludes?.some((phrase) => title.includes(phrase.toLowerCase()))) {
      return rule.folder;
    }
  }
  return null;
}

function isProtected(filePath, protectedFiles) {
  return protectedFiles.includes(path.basename(filePath));
}

function isSymlink(filePath) {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

function shouldSkip(filePath, rulesConfig) {
  if (!filePath.endsWith(".md")) return true;
  if (isProtected(filePath, rulesConfig.protectedFiles)) return true;
  if (isSymlink(filePath)) return true;
  if (filePath.includes(`${path.sep}.obsidian${path.sep}`)) return true;
  if (filePath.includes(`${path.sep}node_modules${path.sep}`)) return true;
  return false;
}

function listMarkdownInDir(dir, depth = 0) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isSymbolicLink()) continue;
    if (ent.isDirectory()) {
      if (depth === 0 && ent.name !== "inbox") continue;
      if (depth === 0 && ent.isDirectory()) continue;
    }
    if (ent.isFile() && ent.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function collectLooseFiles(rulesConfig) {
  const found = new Set();
  for (const inbox of rulesConfig.inboxes) {
    if (!fs.existsSync(inbox)) continue;
    const stat = fs.statSync(inbox);
    if (stat.isDirectory()) {
      for (const f of listMarkdownInDir(inbox, 0)) {
        if (path.dirname(f) === inbox) found.add(path.resolve(f));
      }
    }
  }
  return [...found];
}

function fileNote(filePath, rulesConfig, { dryRun = false } = {}) {
  if (shouldSkip(filePath, rulesConfig)) return null;

  const targetDir = resolveTarget(filePath, rulesConfig);
  if (!targetDir) return null;

  const currentDir = path.resolve(path.dirname(filePath));
  const resolvedTarget = path.resolve(targetDir);
  if (currentDir === resolvedTarget) return null;

  if (!fs.existsSync(resolvedTarget)) {
    fs.mkdirSync(resolvedTarget, { recursive: true });
  }

  const dest = path.join(resolvedTarget, path.basename(filePath));
  if (path.resolve(dest) === path.resolve(filePath)) return null;
  if (fs.existsSync(dest)) {
    console.warn(`skip (exists): ${dest}`);
    return null;
  }

  if (dryRun) {
    console.log(`would move: ${filePath} -> ${dest}`);
  } else {
    fs.renameSync(filePath, dest);
    console.log(`moved: ${filePath} -> ${dest}`);
  }
  return dest;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => a.startsWith("--file="))?.slice("--file=".length)
    ?? (args.includes("--file") ? args[args.indexOf("--file") + 1] : null);

  const rulesConfig = loadRules();
  const files = fileArg ? [path.resolve(fileArg)] : collectLooseFiles(rulesConfig);

  let moved = 0;
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const result = fileNote(f, rulesConfig, { dryRun });
    if (result) moved += 1;
  }

  if (!fileArg && files.length === 0) {
    console.log("No loose notes in inbox / vault root.");
  } else if (moved === 0 && !dryRun) {
    console.log("No notes filed (add tags or use inbox/).");
  }
}

main();
