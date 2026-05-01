# Code Map Discipline

Use this skill when a development task needs repository orientation before edits.

## Process

1. Look for an existing code map in `docs/code-map.md`, `CODEMAP.md`, or `.agentplane/code-map.md`.
2. If no map exists and the task touches multiple files or runtime surfaces, create `docs/code-map.md`.
3. Keep the map compact and factual:
   - entry points and commands;
   - core modules and ownership boundaries;
   - data, state, or config surfaces;
   - verification commands used by agents;
   - hotspots discovered during the current task.
4. Before editing, compare the planned change with the map and note any stale or missing area.
5. Before finishing, update only the affected map section and report whether the map was consulted or changed.

## Guardrails

- Do not turn the map into a design document or tutorial.
- Do not rewrite unrelated map sections.
- Prefer stable file paths and command names over prose summaries.
- If the map is absent and the task is narrow, state that no map update was needed.
