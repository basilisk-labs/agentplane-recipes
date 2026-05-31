# Hermes Agentplane Worker Lane

Use this skill when a Hermes Kanban worker lane executes Agentplane tasks.

## Authority Boundary

- Hermes owns dispatch/run lifecycle: queue, assignee, claim, run id, retries, crash detection, comments, dashboard, and human handoff.
- Agentplane owns engineering task lifecycle: task README/frontmatter, plan approval, branch/worktree, verification, PR/integration, finish, and ACR evidence.
- Hermes `done` is only an orchestration job result. It must not be treated as Agentplane `DONE`.
- Complete a Hermes root card only after Agentplane terminal evidence validates.

## Worker Protocol

1. Read the current Hermes card and resolve the Agentplane task id from card metadata or idempotency key.
2. Run `agentplane hermes doctor --json` and stop if the repository is not ready for the adapter.
3. Run `agentplane task brief <task-id> --json` and `agentplane task next-action <task-id> --explain --json`.
4. Classify the route output; do not execute raw shell copied from route text.
5. Execute at most one allowlisted Agentplane route step per Hermes claim with `agentplane hermes supervise <task-id> --execute-step --json`.
6. Read `hermes_comment_projection` from `agentplane hermes enqueue` or `agentplane hermes supervise`; this is the structured status packet for Hermes comments.
7. Before blocking or completing Hermes, write that structured projection with `agentplane hermes lifecycle comment --body '<projection-json>'`.
8. Use runner visibility commands from the projection when users need execution detail: `agentplane task run status`, `agentplane task run inspect`, and `agentplane task run logs --stream events`.
9. Use `agentplane hermes lifecycle block` when Agentplane route reports a blocker, review handoff, unsupported route action, stale claim, or missing policy.
10. Use `agentplane hermes lifecycle complete` only after Agentplane task status is `DONE`, verification is `ok`, branch_pr integration/finish is complete, and ACR validation passes.

## Guardrails

- Prefer `branch_pr` for multi-agent Hermes work.
- Set `AGENTPLANE_HERMES_LANE_REGISTRY` for lane-registry reads.
- Never mutate `~/.hermes/kanban.db` directly.
- Never edit `.agentplane/tasks/**` directly to simulate lifecycle transitions.
- Never place secrets, raw logs, tokens, or credentials in Hermes comments or metadata.
- Treat Hermes board state as projection-only during reconcile.
- On retry, recompute Agentplane route from current task truth before mutating anything.
