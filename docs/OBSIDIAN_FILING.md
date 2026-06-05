# Auto-filing markdown in Obsidian

Notes are filed by **tags** or **filename prefixes** into vault folders or `docs/`.

## 1. Obsidian plugin (instant on save)

1. **Settings → Community plugins → Browse** → install **Auto Note Mover**
2. Enable the plugin
3. Rules are preconfigured in your vault: `.obsidian/plugins/auto-note-mover/data.json`
4. Reload Obsidian if needed

The plugin moves notes when tags change or on save (per plugin settings).

## 2. Inbox + npm script

| Inbox | Use |
|-------|-----|
| `Obsidian Vault/inbox/` | Quick captures in Obsidian |
| `docs/inbox/` | Captures from Cursor (synced to git) |

```bash
npm run file:notes        # file loose notes
npm run file:notes:dry    # preview only
```

## 3. Cursor hook

After any Agent/Tab **Write** to a `.md` file under `docs/` or your vault, `.cursor/hooks/file-obsidian-notes.sh` runs the filer.

## 4. Tag cheat sheet

```yaml
---
tags:
  - business    # → Business Ideas/
  - product     # → docs/product/ (Products/Agent Scale in Obsidian)
  - requirement # → Requirements/
  - prompt      # → Prompts/
  - marketing   # → Marketing/
  - engineering # → docs/ (Documentation/)
---
```

Edit rules in `docs/filing-rules.json`.

## Protected (never moved)

`Welcome.md`, `README.md`, notes already inside their target folder.
