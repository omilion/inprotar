import { timingSafeEqual } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { GitHubStore, type Store } from "./github-store";
import { crearServidor } from "./server";

export interface McpEnv {
  MCP_ACCESS_TOKEN?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

const respuesta = (status: number, error: string, headers = {}) =>
  Response.json({ error }, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Stateless: cada solicitud crea su servidor; no depende de memoria entre invocaciones. */
export async function atenderMcp(request: Request, env: McpEnv, storeOverride?: Store): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/mcp" && url.pathname !== "/mcp/") return respuesta(404, "No encontrado");
  if (!env.MCP_ACCESS_TOKEN || env.MCP_ACCESS_TOKEN.length < 32 || !env.GITHUB_TOKEN ||
      !env.GITHUB_REPO || !/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPO)) {
    return respuesta(503, "MCP sin configurar");
  }
  // Claude realiza llamadas servidor a servidor. Rechazar orígenes de navegador ajenos.
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return respuesta(403, "Origen no permitido");
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${env.MCP_ACCESS_TOKEN}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return respuesta(401, "No autorizado", { "WWW-Authenticate": 'Bearer realm="inprotar-mcp"' });
  }
  // Sin sesiones ni suscripciones SSE: solamente solicitudes POST.
  if (request.method !== "POST") return respuesta(405, "Método no permitido", { Allow: "POST" });
  const server = crearServidor(storeOverride ?? new GitHubStore(env.GITHUB_REPO, env.GITHUB_TOKEN, env.GITHUB_BRANCH || "main"));
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    maxRequestBodySize: 4 * 1024 * 1024,
  });
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return respuesta(500, "No se pudo procesar la solicitud MCP");
  } finally {
    await server.close();
  }
}
