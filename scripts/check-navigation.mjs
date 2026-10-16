// Ejecutar después de npm run build. Opcional: NAV_CHECK_BASE_URL para verificar HTTP.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(".next/server/app");
const json = (name) => JSON.parse(fs.readFileSync(`content/catalogo/${name}.json`, "utf8"));
const products = json("productos");
const categories = json("categorias");
const file = (route) => path.join(root, route === "/" ? "index.html" : `${route.replace(/^\/|\/$/g, "")}.html`);
const read = (route) => fs.readFileSync(file(route), "utf8");
const links = (html) => [...html.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)].map((m) => m[1]).filter((p) => p.startsWith("/") && !p.startsWith("//"));
const home = read("/");
const header = home.match(/<header\b[\s\S]*?<\/header>/)?.[0];
assert.ok(header, "No se encontró el encabezado");
const routes = new Set([...links(header), "/tienda/", "/tienda/page/2/", ...products.map((p) => p.ruta), ...categories.map((c) => c.ruta)]);
for (const route of routes) assert.ok(fs.existsSync(file(route)), `Ruta sin generar: ${route}`);
for (const p of products) {
  for (const c of p.categorias) assert.ok(categories.some((cat) => cat.ruta === c), `Categoría desconocida: ${c}`);
  for (const img of p.imagenes) assert.ok(fs.existsSync(path.join("public", img.src)), `Imagen ausente: ${img.src}`);
}
for (const route of ["/tienda/", "/tienda/page/2/", ...categories.map((c) => c.ruta), ...products.map((p) => p.ruta)]) {
  const html = read(route);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Debe haber un H1: ${route}`);
  for (const target of links(html).filter((p) => p.startsWith("/producto/") || p.startsWith("/categoria-producto/") || p.startsWith("/tienda/"))) {
    assert.ok(fs.existsSync(file(target)), `Enlace roto desde ${route}: ${target}`);
  }
}
if (process.env.NAV_CHECK_BASE_URL) {
  for (const route of routes) {
    const response = await fetch(new URL(route, process.env.NAV_CHECK_BASE_URL), { redirect: "follow" });
    assert.equal(response.status, 200, `HTTP ${response.status}: ${route}`);
    await response.arrayBuffer();
  }
}
console.log(`OK: ${routes.size} destinos; ${categories.length} categorías y ${products.length} productos. Menú y catálogo sin enlaces a rutas ausentes.`);
