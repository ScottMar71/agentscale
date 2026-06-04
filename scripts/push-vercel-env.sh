#!/usr/bin/env bash
# Push non-empty vars from .env.local to Vercel (production + preview + development)
set -euo pipefail

ENV_FILE="${1:-.env.local}"
cd "$(dirname "$0")/.."

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy from .env.example first."
  exit 1
fi

for env in production preview development; do
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "${line// }" ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      val="${BASH_REMATCH[2]}"
      val="${val%\"}"
      val="${val#\"}"
      val="${val%\'}"
      val="${val#\'}"
      [ -z "$val" ] && continue
      if [ "$env" = "preview" ]; then
        vercel env add "$key" preview --value "$val" --yes --force 2>/dev/null || true
      else
        vercel env add "$key" "$env" --value "$val" --yes --force 2>/dev/null || true
      fi
      echo "Set $key ($env)"
    fi
  done < "$ENV_FILE"
done

echo "Done. Verify: vercel env list"
