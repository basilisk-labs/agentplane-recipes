# LLM Wiki Discipline

Use this skill when a repository has the `llm-wiki` recipe active or when the task asks to ingest, query, lint, or initialize project knowledge.

## Storage model

- Wiki root: `llm-wiki/` by default.
- Input inbox: `llm-wiki/_input/` by default. A project may override this through `llm-wiki/_config.json` using `input_dir`.
- Raw archive: `llm-wiki/raw/`.
- Retrieval index: `llm-wiki/index.md`.
- Change log: `llm-wiki/log.md`.
- Optional schema/rules page: `llm-wiki/_schema.md`.

Keep service files prefixed with `_` so topical wiki pages and folders can scale without colliding with operational state.

## Startup guard

At task start:

1. Read `llm-wiki/_config.json` if it exists.
2. Resolve the input inbox as `llm-wiki/<input_dir>`, defaulting to `llm-wiki/_input`.
3. If the inbox contains any non-hidden file or non-empty directory, stop unrelated work.
4. Report the pending inputs and propose an assimilation task before continuing.

This guard does not apply when the active task is the assimilation task itself.

## Assimilation

When assimilating input:

1. Inventory every pending input file with path, kind, size, and a short content summary.
2. Preserve each original under `llm-wiki/raw/`, preferably grouped by date or source batch.
3. Convert only reusable knowledge into structured wiki pages under `llm-wiki/`.
4. Update `llm-wiki/index.md` with links, topics, source references, and freshness notes.
5. Append `llm-wiki/log.md` with date, processed inputs, created or changed pages, and unresolved gaps.
6. Empty the input inbox only after the raw originals and structured wiki updates are complete.

Do not treat the wiki as a dump. Keep raw evidence in `raw/`; keep the wiki layer curated, deduplicated, and queryable.

## Query

Before answering a project-knowledge request:

1. Read `llm-wiki/index.md` first when it exists.
2. Open only the indexed pages relevant to the request.
3. Cite wiki file paths in the answer when facts come from the wiki.
4. If the index is missing or stale, say so and inspect the smallest relevant wiki subset.

## Lint

During verification, check that:

- `index.md` links to maintained topical pages.
- `log.md` is append-only and date-prefixed.
- Raw originals remain under `raw/`.
- The input inbox is empty after assimilation.
- Pages distinguish facts, inferences, and open gaps when source material is ambiguous.
