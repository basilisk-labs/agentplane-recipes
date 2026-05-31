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
6. Before blocking or completing Hermes, write a structured `agentplane hermes lifecycle comment` projection with task id, task revision, run id, command digest, verification pointers, and residual risk.
7. Use `agentplane hermes lifecycle block` when Agentplane route reports a blocker, review handoff, unsupported route action, stale claim, or missing policy.
8. Use `agentplane hermes lifecycle complete` only after Agentplane task status is `DONE`, verification is `ok`, branch_pr integration/finish is complete, and ACR validation passes.

## Guardrails

- Prefer `branch_pr` for multi-agent Hermes work.
- Never mutate `~/.hermes/kanban.db` directly.
- Never edit `.agentplane/tasks/**` directly to simulate lifecycle transitions.
- Never place secrets, raw logs, tokens, or credentials in Hermes comments or metadata.
- Treat Hermes board state as projection-only during reconcile.
- On retry, recompute Agentplane route from current task truth before mutating anything.
