#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSET_PATH="${SCRIPT_DIR}/../assets/backend.json"
TARGET_DIR="${ROOT}/.agentplane/backends/redmine"
TARGET_PATH="${TARGET_DIR}/backend.json"

if [[ -f "${TARGET_PATH}" ]]; then
  echo "Backend config already exists: ${TARGET_PATH}"
  exit 0
fi

mkdir -p "${TARGET_DIR}"
cp "${ASSET_PATH}" "${TARGET_PATH}"
echo "Wrote ${TARGET_PATH}"
echo "Edit the file to set Redmine URL, API key, project_id, and custom field ids."
