#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_DIR="${SCRIPT_DIR}/../assets"

TARGET_SCRIPT_DIR="${ROOT}/.github/scripts"
TARGET_WORKFLOW_DIR="${ROOT}/.github/workflows"

mkdir -p "${TARGET_SCRIPT_DIR}" "${TARGET_WORKFLOW_DIR}"

cp "${ASSETS_DIR}/.github/scripts/sync_tasks.py" "${TARGET_SCRIPT_DIR}/sync_tasks.py"
cp "${ASSETS_DIR}/.github/workflows/sync-tasks.yml" "${TARGET_WORKFLOW_DIR}/sync-tasks.yml"

ENV_PATH="${ROOT}/.env"
WORKFLOW_PATH="${TARGET_WORKFLOW_DIR}/sync-tasks.yml"

if [[ -f "${ENV_PATH}" ]]; then
  ROOT="${ROOT}" python3 - <<'PY'
from pathlib import Path
import os

root = Path(os.environ["ROOT"])
workflow = root / ".github" / "workflows" / "sync-tasks.yml"
if not workflow.exists():
    raise SystemExit(0)

env_path = root / ".env"
values = {}
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value

text = workflow.read_text(encoding="utf-8")
replacements = {
    "__GITHUB_OWNER__": values.get("GITHUB_OWNER", ""),
    "__GITHUB_REPO__": values.get("GITHUB_REPO", ""),
    "__GITHUB_PROJECT_NUMBER__": values.get("GITHUB_PROJECT_NUMBER", ""),
}

for placeholder, value in replacements.items():
    if value:
        text = text.replace(placeholder, value)

workflow.write_text(text, encoding="utf-8")
PY
fi

echo "Installed GitHub sync workflow and script."
echo "Set the GitHub Actions secret TASKS_SYNC_TOKEN with repo/project access."
