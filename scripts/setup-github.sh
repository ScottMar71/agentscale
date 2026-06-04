#!/usr/bin/env bash
# Create GitHub repo and push AgentScale (requires GitHub CLI or manual repo URL)
set -euo pipefail

REPO_NAME="${1:-agentscale}"
GITHUB_USER="${2:-}"

cd "$(dirname "$0")/.."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository."
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already exists:"
  git remote get-url origin
  echo "Push with: git push -u origin main"
  exit 0
fi

if command -v gh >/dev/null 2>&1; then
  if [ -n "$GITHUB_USER" ]; then
    gh repo create "$GITHUB_USER/$REPO_NAME" --private --source=. --remote=origin --push
  else
    gh repo create "$REPO_NAME" --private --source=. --remote=origin --push
  fi
  echo "Done. Connect Vercel: https://vercel.com/qfjcfc82cq-6912s-projects/agentscale/settings/git"
  exit 0
fi

echo "GitHub CLI (gh) not installed."
echo ""
echo "Manual steps:"
echo "  1. Create repo: https://github.com/new?name=$REPO_NAME"
echo "  2. Do NOT initialize with README"
echo "  3. Run:"
if [ -n "$GITHUB_USER" ]; then
  echo "     git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
  echo "     git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
fi
echo "     git push -u origin main"
echo ""
echo "  4. Vercel → Project agentscale → Settings → Git → Connect repository"
