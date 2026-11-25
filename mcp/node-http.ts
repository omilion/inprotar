import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { atenderMcp, type McpEnv } from "./http";

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const PORT = Number(process.env.PORT || 3101);
const HOST = process.env.HOST || "0.0.0.0";

function leerCuerpo(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Cuerpo demasiado grande"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function manejar(req: IncomingMessage, res: ServerResponse) {
  const method = req.method || "GET";
  const rawUrl = req.url || "/";
  if (method === "GET" && (rawUrl === "/health" || rawUrl === "/health/")) {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const protoHeader = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader)?.split(",")[0]?.trim() || "http";
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(rawUrl, `${proto}://${host}`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      for (const item of v) headers.append(k, item);
    } else {
      headers.set(k, v);
    }
  }

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const buf = await leerCuerpo(req);
      if (buf.length > 0) body = new Uint8Array(buf);
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode === 413 ? 413 : 400;
      res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" });
      res.end(JSON.stringify({ error: code === 413 ? "Solicitud demasiado grande" : "Error al leer el cuerpo" }));
      return;
    }
  }

  const env: McpEnv = {
    MCP_ACCESS_TOKEN: process.env.MCP_ACCESS_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_REPO: process.env.GITHUB_REPO,
    GITHUB_BRANCH: process.env.GITHUB_BRANCH || "main",
  };

  const webRes = await atenderMcp(new Request(url, { method, headers, body }), env);
  const outHeaders: Record<string, string> = {};
  webRes.headers.forEach((v, k) => {
    outHeaders[k] = v;
  });
  res.writeHead(webRes.status, outHeaders);
  res.end(Buffer.from(await webRes.arrayBuffer()));
}

const server = createServer((req, res) => {
  manejar(req, res).catch(() => {
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "application/json", "cache-control": "no-store" });
      res.end(JSON.stringify({ error: "Error interno del servidor MCP" }));
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`inprotar-mcp escuchando en http://${HOST}:${PORT}/mcp`);
});

for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
