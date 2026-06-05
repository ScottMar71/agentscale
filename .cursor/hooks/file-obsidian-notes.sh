#!/usr/bin/env bash
# After markdown edits, file loose notes into the correct folder.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
input=$(cat)

file=""
if command -v node >/dev/null 2>&1; then
  file=$(printf '%s' "$input" | node -e "
    let d='';
    process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{
      try {
        const j=JSON.parse(d||'{}');
        const p=j.file_path||j.path||j.filePath||'';
        process.stdout.write(p);
      } catch { process.stdout.write(''); }
    });
  ")
fi

if [[ -z "$file" || "$file" != *.md ]]; then
  exit 0
fi

case "$file" in
  *"/docs/"*|*"/Obsidian Vault/"*|*"/docs/inbox/"*|*"/inbox/"*)
    node "$ROOT/scripts/file-obsidian-notes.mjs" --file "$file" 2>/dev/null || true
    ;;
esac

exit 0
