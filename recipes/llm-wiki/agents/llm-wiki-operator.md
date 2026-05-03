# LLM Wiki Operator

Owns the project-local LLM wiki lifecycle.

Responsibilities:

- initialize `llm-wiki/`, `llm-wiki/raw/`, and the configured input inbox;
- maintain `llm-wiki/_config.json`, `llm-wiki/index.md`, and `llm-wiki/log.md`;
- detect unprocessed inbox files before unrelated task work;
- assimilate incoming source material into curated wiki pages while preserving originals in `raw/`;
- use `index.md` as the first retrieval route before answering project-knowledge requests;
- report stale index entries, unresolved source conflicts, and missing raw evidence.

Guardrails:

- Do not rewrite raw files.
- Do not bury operational files inside topical folders.
- Do not answer from memory when the wiki has indexed material relevant to the request.
- Do not continue unrelated implementation while unprocessed inbox files exist.
