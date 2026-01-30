#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

function usage() {
  return "Usage: dokploy <list-projects|deploy> [--application-id <id>]";
}

const endpointRaw =
  process.env.DOKPLOY_API_BASE ||
  process.env.DOKPLOY_API_ENDPOINTS ||
  process.env.DOKPLOY_API_ENDPOINT ||
  process.env.DOKPLOY_API_URL ||
  "";
const apiKey = process.env.DOKPLOY_API_KEY || "";

if (!endpointRaw) {
  console.error("Missing DOKPLOY_API_ENDPOINTS (or DOKPLOY_API_BASE). See .env.");
  process.exit(2);
}
if (!apiKey) {
  console.error("Missing DOKPLOY_API_KEY. See .env.");
  process.exit(2);
}

function resolveBase(input) {
  let trimmed = String(input).trim().replace(/\/+$/u, "");
  if (trimmed.endsWith("/swagger")) {
    trimmed = trimmed.slice(0, -8);
  } else if (trimmed.endsWith("/swagger.json")) {
    trimmed = trimmed.slice(0, -13);
  }
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

const baseUrl = resolveBase(endpointRaw);

async function requestJson(path, opts = {}) {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const method = opts.method || "GET";
  const headers = {
    accept: "application/json",
    "x-api-key": apiKey,
  };
  let body;
  if (opts.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  const resp = await fetch(url, { method, headers, body });
  const text = await resp.text();
  if (!resp.ok) {
    const message = text || `${resp.status} ${resp.statusText}`;
    throw new Error(message);
  }
  return text ? JSON.parse(text) : null;
}

function parseFlag(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  const value = args[idx + 1];
  if (!value) return null;
  return value;
}

async function main() {
  if (!command || command === "--help" || command === "-h") {
    console.log(usage());
    return;
  }

  if (command === "list-projects") {
    const data = await requestJson("/project.all");
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (command === "deploy") {
    const applicationId =
      parseFlag("--application-id") ||
      process.env.DOKPLOY_APPLICATION_ID ||
      "";
    if (!applicationId) {
      console.error("Missing application id. Use --application-id or DOKPLOY_APPLICATION_ID.");
      process.exit(2);
    }
    const data = await requestJson("/application.deploy", {
      method: "POST",
      body: { applicationId },
    });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.error(usage());
  process.exit(2);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
