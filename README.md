# agentplane-recipes

Single source of truth for distributable AgentPlane recipes and catalog metadata (`index.json` + `index.json.sig`).

AgentPlane scales when reusable practices are bundled as recipes. This repository stores those recipes as installable, reviewable packages. The public catalog is intentionally narrower than the repository tree: only recipes listed in `catalog.json` are published to `index.json`.

## Why use this repository

- Keep operational practices in versioned assets instead of tribal knowledge.
- Make onboarding of new contributors reproducible.
- Enable fast rollout of workflow improvements through signed catalog releases.
- Improve discoverability with clear metadata, compatibility, and runtime-contract fields.

## Repository layout

```text
catalog.json
index.json
index.json.sig
keys/
schemas/
recipes/
scripts/
```

## What is a recipe here

A recipe is a compact package that defines:

- `schema_version: "2"` and `kind: "project_overlay"` manifest metadata;
- markdown agent and skill assets;
- executable scenario files with `task_template`;
- prompt module assets with recipe-owned provenance;
- prompt mutation sets that register managed graph bindings/validators instead of direct prompt-file edits;
- `run_profile` runner-local hints such as `mode`, `sandbox`, and `writes_artifacts_to`.

Use recipes to enforce consistency before implementation, during verification, and after release.

## Release workflow

Run locally for a release build:

```bash
node scripts/build-release.ts --tag v0.1.0
```

This generates `dist/*.tar.gz`, updates `index.json`, and writes checksums. By default archive URLs point to tracked `dist/` files on `main` so the catalog remains installable after the commit is published.

Set `RECIPE_ARCHIVE_BASE_URL` only for alternative hosting.

`catalog.json` is the explicit publication allowlist. `scripts/build-release.ts` only publishes recipe ids listed there, even if old, experimental, or internal recipe directories exist under `recipes/`.

## Index signature

The catalog must be signed before publishing. The active production key id is `2026-06`.
Public keys are kept in `keys/` and signing keys are never stored in repository files.

For emergency local signing only:

```bash
node scripts/sign-index.ts --key /path/to/private-key.pem --key-id 2026-06
```

Do not store recipes signing private keys in `.env`, repository files, shell history, release artifacts, or local long-lived key paths. Rotate by creating a new Ed25519 key, storing the private key as the GitHub Actions secret, adding the public key to AgentPlane's trusted recipes keyring, signing `index.json` with the new `key_id`, and publishing a new AgentPlane CLI release before making that signature the default catalog signature.

## Discoverability schema

Each published recipe entry can include:

- `compatibility` — minimum AgentPlane/runtime API and supported platform metadata.
- `assets` — recipe-owned skills, agents, scenarios, prompt modules, and mutation sets.
- `tags` — practical filtering keywords.

Keep non-production recipe ideas outside `catalog.json` until they are installable and signed.

## Contribution checklist

1. Keep manifest fields complete and explicit.
2. Prefer small, composable recipes with clear scenario boundaries.
3. Include compatibility constraints for non-trivial runtime requirements.
4. Add only production-ready recipe ids to `catalog.json`.
5. Rebuild catalog assets and commit resulting tarballs and checksums.
6. Validate that description and examples are written for actual users, not just maintainers.
