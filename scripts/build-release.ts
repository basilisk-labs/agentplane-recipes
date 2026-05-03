import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

type Manifest = {
  schema_version: string;
  kind: string;
  id: string;
  version: string;
  name: string;
  summary: string;
  description: string;
  tags?: string[];
  compatibility?: {
    min_agentplane_version?: string;
    manifest_api_version?: string;
    scenario_api_version?: string;
    runtime_api_version?: string;
    platforms?: string[];
    repo_types?: string[];
  };
  skills?: { id: string; summary?: string }[];
  agents?: { id: string; display_name?: string; role?: string; summary?: string }[];
  scenarios?: { id: string; name?: string; summary?: string; required_inputs?: string[]; artifacts?: string[] }[];
  prompt_modules?: { id: string; summary?: string }[];
  prompt_mutation_sets?: { id: string; summary?: string }[];
};

type Catalog = {
  schema_version: number;
  recipes: string[];
};

const repoRoot = path.resolve(process.cwd(), path.dirname(new URL(import.meta.url).pathname), "..");
const recipesDir = path.join(repoRoot, "recipes");
const distDir = path.join(repoRoot, "dist");
const indexPath = path.join(repoRoot, "index.json");
const catalogPath = path.join(repoRoot, "catalog.json");

const args = process.argv.slice(2);
const tagFlagIndex = args.indexOf("--tag");
const tag =
  (tagFlagIndex >= 0 ? args[tagFlagIndex + 1] : null) ??
  process.env.RELEASE_TAG ??
  process.env.GITHUB_REF_NAME ??
  "v0.0.0";
const repo =
  process.env.GITHUB_REPOSITORY ??
  "basilisk-labs/agentplane-recipes";
const archiveBaseUrl =
  process.env.RECIPE_ARCHIVE_BASE_URL ??
  `https://raw.githubusercontent.com/${repo}/main/dist`;

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
if (catalog.schema_version !== 1) {
  throw new Error(`Unsupported catalog schema_version: ${catalog.schema_version}`);
}
const publishedRecipeIds = catalog.recipes.map((id) => id.trim()).filter(Boolean);
if (publishedRecipeIds.length !== new Set(publishedRecipeIds).size) {
  throw new Error("catalog.json contains duplicate recipe ids");
}
for (const recipeId of publishedRecipeIds) {
  if (recipeId.includes("/") || recipeId.includes("\\") || recipeId === "." || recipeId === "..") {
    throw new Error(`Invalid recipe id in catalog.json: ${recipeId}`);
  }
}

const recipes = [];
const recipeDirsWithManifests = new Set(
  readdirSync(recipesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);
for (const recipeId of publishedRecipeIds) {
  const manifestPath = path.join(recipesDir, recipeId, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  if (manifest.id !== recipeId) {
    throw new Error(`Recipe id mismatch: catalog=${recipeId}, manifest=${manifest.id}`);
  }
  const filename = `${manifest.id}-${manifest.version}.tar.gz`;
  const outPath = path.join(distDir, filename);
  execFileSync("tar", ["-czf", outPath, "-C", recipesDir, manifest.id], {
    stdio: "inherit",
  });
  const sha256 = createHash("sha256").update(readFileSync(outPath)).digest("hex");
  const url = `${archiveBaseUrl.replace(/\/+$/u, "")}/${filename}`;
  recipes.push({
    id: manifest.id,
    name: manifest.name,
    kind: manifest.kind,
    summary: manifest.summary,
    description: manifest.description,
    tags: manifest.tags ?? [],
    compatibility: manifest.compatibility ?? {},
    assets: {
      skills: manifest.skills ?? [],
      agents: manifest.agents ?? [],
      scenarios: manifest.scenarios ?? [],
      prompt_modules: manifest.prompt_modules ?? [],
      prompt_mutation_sets: manifest.prompt_mutation_sets ?? [],
    },
    versions: [
      {
        version: manifest.version,
        url,
        sha256,
        min_agentplane_version: manifest.compatibility?.min_agentplane_version,
        tags: manifest.tags ?? [],
      },
    ],
  });
  writeFileSync(path.join(distDir, `${filename}.sha256`), `${sha256}  ${filename}\n`);
}
for (const recipeId of recipeDirsWithManifests) {
  if (!publishedRecipeIds.includes(recipeId)) {
    console.warn(`Skipping unpublished recipe directory: ${recipeId}`);
  }
}

const index = { schema_version: 1, recipes };
writeFileSync(indexPath, JSON.stringify(index, null, 2));
writeFileSync(path.join(distDir, "index.json"), JSON.stringify(index, null, 2));
