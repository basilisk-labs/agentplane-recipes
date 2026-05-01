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

The catalog must be signed. Generate `index.json.sig` after updating `index.json`:

```bash
node scripts/sign-index.ts --key /path/to/private-key.pem
```

The checked-in development signature uses `key_id=2026-05-dev`. To validate it with AgentPlane,
provide the public key through the runtime key override:

```bash
AGENTPLANE_RECIPES_INDEX_PUBLIC_KEYS='{"2026-05-dev":"-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAYsslSiTpetaWiCmvj7SW7ILfsWyp85Mx62ZgDBTe2Bs=\n-----END PUBLIC KEY-----"}' \
  agentplane recipes list-remote --index agentplane-recipes/index.json --refresh --yes
```

Production releases should be re-signed with the trusted production key before publishing the remote
catalog as the default AgentPlane recipes index.
