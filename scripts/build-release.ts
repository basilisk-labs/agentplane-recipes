import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

type Manifest = {
  schema_version: string;
  id: string;
  version: string;
  name: string;
  summary: string;
  description: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  category?: string;
  tags?: string[];
  status?: string;
  min_agentplane_version?: string;
};

const repoRoot = path.resolve(process.cwd(), path.dirname(new URL(import.meta.url).pathname), "..");
const recipesDir = path.join(repoRoot, "recipes");
const distDir = path.join(repoRoot, "dist");
const indexPath = path.join(repoRoot, "index.json");

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

const recipes = [];
for (const entry of readdirSync(recipesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = path.join(recipesDir, entry.name, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  const filename = `${manifest.id}-${manifest.version}.tar.gz`;
  const outPath = path.join(distDir, filename);
  execFileSync("tar", ["-czf", outPath, "-C", recipesDir, manifest.id], {
    stdio: "inherit",
  });
  const sha256 = createHash("sha256").update(readFileSync(outPath)).digest("hex");
  const url = `${archiveBaseUrl.replace(/\/+$/u, "")}/${filename}`;
  recipes.push({
    id: manifest.id,
    version: manifest.version,
    name: manifest.name,
    summary: manifest.summary,
    description: manifest.description,
    homepage: manifest.homepage,
    repository: manifest.repository,
    license: manifest.license,
    keywords: manifest.keywords,
    category: manifest.category,
    tags: manifest.tags,
    status: manifest.status,
    min_agentplane_version: manifest.min_agentplane_version,
    versions: [{ version: manifest.version, url, sha256, tags: manifest.tags }],
  });
  writeFileSync(path.join(distDir, `${filename}.sha256`), `${sha256}  ${filename}\n`);
}

const index = { schema_version: 1, recipes };
writeFileSync(indexPath, JSON.stringify(index, null, 2));
writeFileSync(path.join(distDir, "index.json"), JSON.stringify(index, null, 2));
