import fs from "node:fs";
import path from "node:path";
import { articulo, marca, pagina, redireccion, unidad, type Articulo, type Marca, type Pagina, type Redireccion, type Unidad } from "./schema";
import { z } from "zod";

/** Lectura y validación del contenido en /content (solo en tiempo de build/servidor). */

const ROOT = path.join(process.cwd(), "content");

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

let cache: Pagina[] | null = null;

export function getPaginas(): Pagina[] {
  if (cache) return cache;
  const dir = path.join(ROOT, "paginas");
  if (!fs.existsSync(dir)) return (cache = []);
  cache = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const r = pagina.safeParse(readJson(path.join(dir, f)));
      if (!r.success) throw new Error(`Contenido inválido en content/paginas/${f}:\n${r.error.message}`);
      return r.data;
    });
  return cache;
}

export function getPagina(ruta: string): Pagina | undefined {
  return getPaginas().find((p) => p.ruta === ruta);
}

export function getUnidades(): Unidad[] {
  return z.array(unidad).parse(readJson(path.join(ROOT, "unidades.json")));
}

export function getMarcas(): Marca[] {
  return z.array(marca).parse(readJson(path.join(ROOT, "marcas.json")));
}

export function getRedirecciones(): Redireccion[] {
  const f = path.join(ROOT, "redirecciones.json");
  return fs.existsSync(f) ? z.array(redireccion).parse(readJson(f)) : [];
}

let cacheArt: Articulo[] | null = null;

export function getArticulos(): Articulo[] {
  if (cacheArt) return cacheArt;
  const dir = path.join(ROOT, "blog");
  if (!fs.existsSync(dir)) return (cacheArt = []);
  cacheArt = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const r = articulo.safeParse(readJson(path.join(dir, f)));
      if (!r.success) throw new Error(`Contenido inválido en content/blog/${f}:
${r.error.message}`);
      return r.data;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  return cacheArt;
}

export function getArticulo(ruta: string): Articulo | undefined {
  return getArticulos().find((a) => a.ruta === ruta);
}
