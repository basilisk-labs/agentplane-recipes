# agentplane-recipes

Repository for Agent Plane recipes and the remote catalog (`index.json` + `index.json.sig`).

## Layout

```
index.json
index.json.sig
schemas/
recipes/
scripts/
```

## Release workflow

Run the release build locally:

```bash
node scripts/build-release.ts --tag v0.1.0
```

This creates `dist/*.tar.gz`, updates `index.json`, and writes checksums.

### Index signature

The catalog must be signed. Generate `index.json.sig` after updating `index.json`:

```bash
node scripts/sign-index.ts --key /path/to/private-key.pem
```
