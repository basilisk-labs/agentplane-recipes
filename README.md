# agentplane-recipes

Repository for Agent Plane recipes and the remote catalog (`index.json`).

## Layout

```
index.json
schemas/
recipes/
scripts/
.github/workflows/
```

## Release workflow

Run the release build locally:

```bash
node scripts/build-release.ts --tag v0.1.0
```

This creates `dist/*.tar.gz`, updates `index.json`, and writes checksums.
