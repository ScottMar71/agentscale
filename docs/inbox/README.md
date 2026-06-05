# Inbox

Drop new `.md` notes here. They are **auto-filed** into the right folder when you:

- Run `npm run file:notes` from the repo, or
- Save the file in Cursor (hook), or
- Use the **Auto Note Mover** plugin in Obsidian (vault `inbox/`)

## Add tags so filing works

```yaml
---
tags:
  - business
---
```

| Tag(s) | Destination |
|--------|-------------|
| `business`, `idea` | Vault → Business Ideas |
| `customer` | Customers |
| `requirement`, `req` | Requirements |
| `prompt` | Prompts |
| `marketing`, `gtm` | Marketing |
| `agentscale`, `product` | `docs/product/` (git) |
| `architecture`, `engineering` | `docs/` (git) |

**Filename shortcuts:** `IDEA-`, `REQ-`, `PROMPT-`, `CUST-`, `MKT-` prefixes.

See **Documentation/OBSIDIAN_FILING** in Obsidian.
