#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$REPO_ROOT/tools/excel-to-markdown"

node "$TOOLS_DIR/src/xls2md.js" \
  "$REPO_ROOT/AMAS Standards List Data.xlsx" \
  "$REPO_ROOT/output/StandardsList.docx"
