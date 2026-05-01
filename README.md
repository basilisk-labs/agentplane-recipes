# agentplane-recipes

Repository for Agent Plane recipes and the remote catalog (`index.json` + `index.json.sig`).

## Layout

```
index.json
index.json.sig
keys/
schemas/
recipes/
scripts/
```

## Compatibility contract

Recipes in this repository target the current AgentPlane project-overlay runtime:

- recipe manifests use `schema_version: "2"` and `kind: "project_overlay"`;
- recipe agent and skill assets are markdown files;
- executable scenario files include `task_template`;
- prompt module assets use `schema_version: 1` and recipe-owned provenance;
- `run_profile` is limited to runner-local hints such as `mode`, `sandbox`, and
  `writes_artifacts_to`.

## Release workflow

Run the release build locally:

```bash
node scripts/build-release.ts --tag v0.1.0
```

This creates `dist/*.tar.gz`, updates `index.json`, and writes checksums. By default, archive URLs
point at tracked `dist/` assets on the repository `main` branch so the catalog remains installable
from the default remote index after the commit is published. Set `RECIPE_ARCHIVE_BASE_URL` when a
release should point somewhere else, for example a GitHub Release asset base URL.

### Index signature

The catalog must be signed before publishing. The active production key id is `2026-05`.
The public key is checked in under `keys/`; the private key must exist only as the
`RECIPES_INDEX_SIGNING_PRIVATE_KEY` GitHub Actions secret in this repository.

For emergency local validation only, generate a signature with a temporary private-key file:

```bash
node scripts/sign-index.ts --key /path/to/private-key.pem --key-id 2026-05
```

Do not store recipes signing private keys in `.env`, repository files, shell history, release
artifacts, or local long-lived key paths. Rotate by creating a new Ed25519 key, storing the private
key as the GitHub Actions secret, adding the public key to AgentPlane's trusted recipes keyring,
signing `index.json` with the new `key_id`, and publishing a new AgentPlane CLI release before making
that signature the default catalog signature.
