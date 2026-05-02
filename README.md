# agentplane-recipes

Single source of truth for distributable AgentPlane recipes and catalog metadata (`index.json` + `index.json.sig`).

AgentPlane scales when reusable practices are bundled as recipes. This repository stores those recipes as installable, reviewable packages.
If you use AgentPlane, adding one recipe can reduce repetitive setup and make agent behavior more predictable across team members.

## Why use this repository

- Keep operational practices in versioned assets instead of tribal knowledge.
- Make onboarding of new contributors reproducible.
- Enable fast rollout of workflow improvements through signed catalog releases.
- Improve discoverability with clear metadata (`category`, `tags`, `status`, `min_agentplane_version`).

## Repository layout

```text
index.json
index.json.sig
keys/
schemas/
recipes/
scripts/
```

## What is a recipe here

A recipe is a compact package that defines:

- metadata for discoverability,
- scenario-level behavior,
- optional prompts/skills/tools used during execution,
- compatibility and safety constraints.

Use recipes to enforce consistency before implementation, during verification, and after release.

## Release workflow

Run locally for a release build:

```bash
node scripts/build-release.ts --tag v0.1.0
```

This generates `dist/*.tar.gz`, updates `index.json`, and writes checksums. By default archive URLs point to tracked `dist/` files on `main` so the catalog remains installable after the commit is published.

Set `RECIPE_ARCHIVE_BASE_URL` only for alternative hosting.

## Index signature

The catalog is signed before publishing.
Active production key id: `2026-05`.
Public keys are kept in `keys/` and signing keys are never stored in repository files.

For emergency local signing only:

```bash
node scripts/sign-index.ts --key /path/to/private-key.pem --key-id 2026-05
```

## Discoverability schema

Each recipe entry can include:

- `category` — broad topic bucket (`integration`, `observability`, `workflow`, etc.)
- `tags` — practical filtering keywords
- `keywords` — taxonomic hints
- `status` — `active` / `stub` / other lifecycle states
- `min_agentplane_version` — minimum compatible AgentPlane version

Use these fields consistently so operators can filter recipes by stack, maturity, and compatibility.

## Contribution checklist

1. Keep manifest fields complete and explicit.
2. Prefer small, composable recipes with clear scenario boundaries.
3. Include compatibility constraints for non-trivial runtime requirements.
4. Rebuild catalog assets and commit resulting tarballs and checksums.
5. Validate that description and examples are written for actual users, not just maintainers.
