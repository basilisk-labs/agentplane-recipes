import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const recipeDir = path.resolve(path.dirname(__filename), "..");

function findRepoRoot(startDir) {
  let current = path.resolve(startDir);
  for (let i = 0; i < 8; i += 1) {
    const candidate = path.join(current, ".agentplane");
    if (existsSync(candidate)) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

const repoRoot = findRepoRoot(recipeDir);
const assetsDir = path.join(recipeDir, "assets");
const tasksHtmlPath = path.join(assetsDir, "tasks.html");
const tasksJsonPath = path.join(repoRoot, ".agentplane", "tasks.json");

function send(res, status, body, contentType) {
  res.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store" });
  res.end(body);
}

function sendJson(res, payload, status = 200) {
  send(res, status, JSON.stringify(payload, null, 2), "application/json; charset=utf-8");
}

function refreshTasksJson() {
  try {
    execFileSync("agentplane", ["task", "export"], { cwd: repoRoot, stdio: "ignore" });
  } catch {
    // Ignore export failures and fall back to existing file.
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname === "/" || url.pathname === "/tasks.html") {
    if (!existsSync(tasksHtmlPath)) {
      send(res, 404, "tasks.html not found", "text/plain; charset=utf-8");
      return;
    }
    send(res, 200, readFileSync(tasksHtmlPath, "utf-8"), "text/html; charset=utf-8");
    return;
  }

  if (url.pathname.startsWith("/viewer/")) {
    const rel = url.pathname.replace("/viewer/", "");
    const target = path.join(assetsDir, rel);
    if (!target.startsWith(assetsDir) || !existsSync(target)) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const ext = path.extname(target);
    const contentType = ext === ".css"
      ? "text/css; charset=utf-8"
      : ext === ".js"
        ? "application/javascript; charset=utf-8"
        : ext === ".html"
          ? "text/html; charset=utf-8"
          : "application/octet-stream";
    send(res, 200, readFileSync(target, "utf-8"), contentType);
    return;
  }

  if (url.pathname === "/api/health") {
    sendJson(res, { ok: true });
    return;
  }

  if (url.pathname === "/api/tasks") {
    refreshTasksJson();
    if (!existsSync(tasksJsonPath)) {
      sendJson(res, { error: "tasks.json not found" }, 404);
      return;
    }
    send(res, 200, readFileSync(tasksJsonPath, "utf-8"), "application/json; charset=utf-8");
    return;
  }

  if (url.pathname.startsWith("/api/tasks/") && url.pathname.endsWith("/status")) {
    sendJson(res, { error: "Status updates are not supported by this viewer." }, 501);
    return;
  }

  send(res, 404, "Not found", "text/plain; charset=utf-8");
});

const port = Number(process.env.PORT || 4317);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Viewer running at http://localhost:${port}`);
});
