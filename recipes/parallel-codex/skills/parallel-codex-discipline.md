# Parallel Codex Discipline

Use this discipline when an approved AgentPlane goal can be split into several independent Codex runner tasks.

## Hard Gates

- Do not parallelize work that writes the same files, changes shared policy, changes release/publication state, or needs a single owner to reason across the whole diff.
- Keep lifecycle authority in the parent workflow. Child runners may implement their assigned slice, but they must not open PRs, merge, release, publish, clean worktrees, or close parent tasks unless explicitly delegated.
- Give every child a narrow task description with owned paths, forbidden paths, expected evidence, and result manifest requirements.
- Launch children only after their task plans are approved and their start-ready state is valid for the repository workflow.

## Runner Launch

For each safe child task:

1. Create or reuse a task for exactly one independent slice.
2. Record owned paths and forbidden paths in the task description or Verify Steps.
3. Start the task through the normal AgentPlane route.
4. Run `agentplane task run <task-id>`.
5. Record the selected `run_id` from `agentplane task run status <task-id>`.

## Monitoring Loop

Use these commands while children run:

```bash
agentplane task run status <task-id>
agentplane task run inspect <task-id> --events 20
agentplane task run logs <task-id> --stream events --tail 50
agentplane task run logs <task-id> --stream events --follow
```

Prefer `status` for dashboards, `inspect` for state/result manifests, and `logs` for live event tails. If a run is only `prepared`, do not wait on it as if it were executing; launch or resume it through the parent route.

## Reconciliation

- Treat any child that reports likely sibling-owned files as blocked, not partially successful.
- Integrate children one at a time after evidence is verified.
- If two successful children touch overlapping files, stop and make the parent choose an integration order or a consolidation task.
- The parent final report must include child task ids, run ids, final status, evidence commands, and unresolved blockers.
