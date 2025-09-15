#!/bin/bash
set -euo pipefail

TARGET="$1"

if ! git remote | grep -q '^backend-template$'; then
  git remote add backend-template git@github.com:wenex-org/backend-template.git
fi

git fetch backend-template main

# Check out only the subdirectory from the remote
if [ -d "$TARGET" ]; then
  tmpdir=$(mktemp -d)

  # 1. Create a temporary worktree with the remote branch
  git worktree add --detach "$tmpdir" backend-template/main

  # 2. Rsync the target folder from that worktree into the current repo,
  #    but DO NOT touch any .git directory that already exists
  rsync -a --delete --exclude='.git' "$tmpdir/$TARGET/" "$TARGET/"

  # 3. Clean up
  git worktree remove "$tmpdir" && rm -rf "$tmpdir"
else
  echo "Error: '$TARGET' is not an existing directory."
  exit 1
fi
