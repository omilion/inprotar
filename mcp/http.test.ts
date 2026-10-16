import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { atenderMcp, type McpEnv } from "./http";
import type { Store } from "./github-store";
import { articuloParaTarjeta } from "../src/lib/content/blog";
import { articulo } from "../src/lib/content/schema";

const env: McpEnv = {
  MCP_ACCESS_TOKEN: "test-only-secret-01234567890123456789",
  GITHUB_TOKEN: "test-only-github",
  GITHUB_REPO: "test/site",
};
const store: Store = {
  leer: async (ruta) => ruta === "content/marcas.json" ? "[]" : null,
  listar: async () => [],
  commit: async () => { throw new Error("Esta prueba no debe escribir"); },
};
const request = (headers: Record<string, string> = {}, method = "POST") => new Request("https://example.com/mcp", {
  method, headers: { authorization: `Bearer ${env.MCP_ACCESS_TOKEN}`, ...headers },
});

test("single post: crear, editar, listar y borrar con redirección; protege la URL", async () => {
  const files = new Map<string, string>([
    ["content/unidades.json", JSON.stringify([{ id: "iluminacion", nombre: "Iluminación", pagina: "/iluminacion/" }])],
    ["content/marcas.json", "[]"],
  ]);
  const memory: Store = {
    leer: async (ruta) => files.get(ruta) ?? null,
    listar: async (dir) => [...files.keys()].filter((ruta) => ruta.startsWith(`${dir}/`)),
    commit: async (cambios) => {
      for (const c of cambios) {
        if (c.contenido === null) files.delete(c.ruta);
        else files.set(c.ruta, c.contenido);
      }
      return "test-commit";
    },
  };
  const client = new Client({ name: "blog-test", version: "1" });
  const transport = new StreamableHTTPClientTransport(new URL("https://example.com/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${env.MCP_ACCESS_TOKEN}` } },
    fetch: async (input, init) => atenderMcp(new Request(input, init), env, memory),
  });
  const data = {
    ruta: "/2026/10/15/prueba/", titulo: "Artículo de prueba", fecha: "2026-10-15",
    imagen: { src: "/foto.jpg", alt: "Luminaria" }, unidad: "iluminacion", marcas: [],
    cuerpo_md: "## Detalles\n\nContenido de prueba.",
    seo: { titulo: "Prueba | INPROTAR", descripcion: "Resumen SEO" },
  };
  try {
    await client.connect(transport);
    const save = (datos: Record<string, unknown>) => client.callTool({ name: "guardar_articulo", arguments: { articulo: datos } });
    assert.equal((await save({ ...data, fecha: "2026-02-30" })).isError, true);
    assert.equal((await save({ ...data, unidad: "inexistente" })).isError, true);
    assert.ok(!(await save(data)).isError);
    assert.ok(!(await save({ ruta: data.ruta, resumen: "Resumen actualizado" })).isError);
    const saved = articulo.parse(JSON.parse(files.get("content/blog/prueba.json")!));
    assert.equal(saved.cuerpo_md, data.cuerpo_md);
    assert.equal(articuloParaTarjeta(saved).excerpt, "Resumen actualizado");
    assert.equal(articuloParaTarjeta(saved).href, data.ruta);
    const otherRoute = "/2026/10/16/prueba/";
    assert.equal((await save({ ...data, ruta: otherRoute, fecha: "2026-10-16" })).isError, true);
    assert.equal((await client.callTool({ name: "ver_articulo", arguments: { ruta: otherRoute } })).isError, true);
    assert.equal((await client.callTool({ name: "borrar_articulo", arguments: { ruta: otherRoute, confirmar: true } })).isError, true);
    const listed = await client.callTool({ name: "listar_articulos", arguments: {} });
    assert.match(JSON.stringify(listed), /Artículo de prueba/);
    await client.callTool({ name: "borrar_articulo", arguments: { ruta: data.ruta } });
    assert.ok(files.has("content/blog/prueba.json"));
    await client.callTool({ name: "borrar_articulo", arguments: { ruta: data.ruta, confirmar: true } });
    assert.ok(!files.has("content/blog/prueba.json"));
    assert.equal(JSON.parse(files.get("content/redirecciones.json")!)[0].desde, data.ruta);
    assert.equal((await save(data)).isError, true);
  } finally { await client.close(); }
});

test("rechaza credenciales ausentes, incorrectas y orígenes ajenos", async () => {
  assert.equal((await atenderMcp(request({ authorization: "" }), env, store)).status, 401);
  assert.equal((await atenderMcp(request({ authorization: "Bearer incorrecto" }), env, store)).status, 401);
  assert.equal((await atenderMcp(request({ origin: "https://otro.example" }), env, store)).status, 403);
});

test("falla cerrado si faltan secretos y no permite métodos de sesión", async () => {
  assert.equal((await atenderMcp(request(), {}, store)).status, 503);
  assert.equal((await atenderMcp(request(), { ...env, GITHUB_TOKEN: undefined }, store)).status, 503);
  assert.equal((await atenderMcp(request(), { ...env, MCP_ACCESS_TOKEN: "corto" }, store)).status, 503);
  for (const method of ["GET", "DELETE", "PUT"]) {
    const response = await atenderMcp(request({}, method), env, store);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST");
  }
});

test("cliente MCP real inicializa, lista herramientas y lee contenido sin sesión persistente", async () => {
  const client = new Client({ name: "http-test", version: "1" });
  const transport = new StreamableHTTPClientTransport(new URL("https://example.com/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${env.MCP_ACCESS_TOKEN}` } },
    fetch: async (input, init) => atenderMcp(new Request(input, init), env, store),
  });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.ok(tools.some((tool) => tool.name === "editar_pagina"));
    assert.ok(tools.some((tool) => tool.name === "listar_marcas"));
    const result = await client.callTool({ name: "listar_marcas", arguments: {} });
    assert.ok(!result.isError);
    assert.equal(transport.sessionId, undefined);
  } finally {
    await client.close();
  }
});

test("catálogo: guardar producto valida y borrar_marca elimina sus productos con redirección", async () => {
  const prod = (ruta: string, marcas: string[], cat: string) => ({
    ruta, nombre: ruta, sku: "", unidad: "iluminacion", marcas, resumen_md: "", descripcion_md: "",
    imagenes: [{ src: "/a.jpg", alt: "" }], categorias: [cat], atributos: [],
  });
  const files = new Map<string, string>([
    ["content/unidades.json", JSON.stringify([{ id: "iluminacion", nombre: "Iluminación", pagina: "/iluminacion/" }])],
    ["content/marcas.json", JSON.stringify([{ id: "philips", nombre: "Philips", unidad: "iluminacion" }, { id: "otra", nombre: "Otra", unidad: "iluminacion" }])],
    ["content/catalogo/categorias.json", JSON.stringify([
      { ruta: "/categoria-producto/campanas/", nombre: "Campanas", descripcion_md: "" },
      { ruta: "/categoria-producto/mixta/", nombre: "Mixta", descripcion_md: "" },
    ])],
    ["content/catalogo/productos.json", JSON.stringify([
      prod("/producto/a/", ["philips"], "/categoria-producto/campanas/"),
      prod("/producto/b/", ["philips", "otra"], "/categoria-producto/mixta/"),
      prod("/producto/c/", ["otra"], "/categoria-producto/mixta/"),
    ])],
  ]);
  const memory: Store = {
    leer: async (ruta) => files.get(ruta) ?? null,
    listar: async (dir) => [...files.keys()].filter((ruta) => ruta.startsWith(`${dir}/`)),
    commit: async (cambios) => {
      for (const c of cambios) {
        if (c.contenido === null) files.delete(c.ruta);
        else files.set(c.ruta, c.contenido);
      }
      return "test-commit";
    },
  };
  const client = new Client({ name: "catalogo-test", version: "1" });
  const transport = new StreamableHTTPClientTransport(new URL("https://example.com/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${env.MCP_ACCESS_TOKEN}` } },
    fetch: async (input, init) => atenderMcp(new Request(input, init), env, memory),
  });
  try {
    await client.connect(transport);
    const call = (name: string, args: Record<string, unknown>) => client.callTool({ name, arguments: args });
    assert.equal((await call("guardar_producto", { producto: { ...prod("/producto/d/", ["philips"], "/categoria-producto/no-existe/") } })).isError, true);
    assert.equal((await call("guardar_producto", { producto: { ...prod("/producto/d/", ["fantasma"], "/categoria-producto/campanas/") } })).isError, true);
    assert.ok(!(await call("guardar_producto", { producto: { ruta: "/producto/c/", nombre: "C renombrado" } })).isError);

    const preview = await call("borrar_marca", { id: "philips" });
    assert.match((preview.content as { text: string }[])[0].text, /Productos a BORRAR \(1\)/);
    assert.ok(files.get("content/catalogo/productos.json")!.includes("/producto/a/"), "la vista previa no debe borrar");

    assert.ok(!(await call("borrar_marca", { id: "philips", confirmar: true })).isError);
    const productos = JSON.parse(files.get("content/catalogo/productos.json")!) as { ruta: string; nombre: string; marcas: string[] }[];
    assert.deepEqual(productos.map((p) => p.ruta), ["/producto/b/", "/producto/c/"]);
    assert.deepEqual(productos[0].marcas, ["otra"]);
    assert.equal(productos[1].nombre, "C renombrado");
    const red = JSON.parse(files.get("content/redirecciones.json")!) as { desde: string; hacia: string }[];
    assert.deepEqual(red.find((r) => r.desde === "/producto/a/")?.hacia, "/iluminacion/");

    assert.ok(!(await call("borrar_producto", { ruta: "/producto/c/", confirmar: true })).isError);
    const red2 = JSON.parse(files.get("content/redirecciones.json")!) as { desde: string; hacia: string }[];
    assert.equal(red2.find((r) => r.desde === "/producto/c/")?.hacia, "/categoria-producto/mixta/");
    assert.equal((await call("guardar_producto", { producto: prod("/producto/c/", ["otra"], "/categoria-producto/mixta/") })).isError, true);
  } finally {
    await client.close();
  }
});
