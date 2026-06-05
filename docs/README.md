# AgentScale documentation

Single source of truth for **GitHub**, **Cursor**, and **Obsidian**.

## Layout

| Path | Purpose | In Obsidian |
|------|---------|-------------|
| `ARCHITECTURE.md`, `MVP_ROADMAP.md`, etc. | Engineering & delivery | `Documentation/` (symlink) |
| `product/` | Product, GTM, fundraising | `Products/Agent Scale/` (symlink) |
| `CONNECTIONS.md`, `DEPLOYMENT.md`, … | Ops & integrations | `Documentation/` |

## How the three tools connect

```
GitHub (agentscale repo)
    └── docs/                    ← commit & push markdown here
            ↑
            ├── Cursor           ← edit files; MCP reads docs/
            └── Obsidian Vault   ← symlinks into docs/ (read/write same files)
```

1. **Edit in Cursor or Obsidian** — both touch the same files on disk.
2. **Commit from the repo** — `git add docs/ && git commit` ships docs to GitHub.
3. **Cursor Agent** — Obsidian MCP is pointed at `docs/`; ask it to search or update notes.
4. **Obsidian-only folders** (`Business Ideas/`, `Marketing/`, etc.) stay in the vault and are **not** in git unless you add them later.

## Obsidian vault symlinks

| Vault folder | Points to |
|--------------|-----------|
| `Documentation/` | `agent/docs/` |
| `Products/Agent Scale/` | `agent/docs/product/` |

Reload Obsidian if a folder looks empty after a symlink change.

## MCP (Cursor)

Global config: `~/.cursor/mcp.json` → vault path `…/agent/docs`.

Toggle **obsidian** off/on in **Settings → MCP** after path changes.

## Auto-filing markdown

New notes in **`inbox/`** (vault or `docs/inbox/`) are moved by tags or prefixes (`IDEA-`, `REQ-`, …).

- **Obsidian:** install community plugin **Auto Note Mover** (rules in vault `.obsidian/plugins/auto-note-mover/`)
- **CLI:** `npm run file:notes`
- **Cursor:** `afterFileEdit` hook runs the filer on `.md` saves

Full guide: [OBSIDIAN_FILING.md](./OBSIDIAN_FILING.md) · rules: [filing-rules.json](./filing-rules.json)

## Conventions

- Product wikilinks: `[[Vision]]`, `[[Features]]` (under `product/`)
- Engineering: `[[Documentation/ARCHITECTURE]]` or open from `Documentation/` in Obsidian
- Prefer updating `docs/product/` for product truth; keep `docs/*.md` for build/deploy architecture
