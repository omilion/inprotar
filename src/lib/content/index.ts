import fs from "node:fs";
import path from "node:path";
import { articulo, marca, pagina, portada, redireccion, unidad, type Articulo, type Marca, type Pagina, type Portada, type Redireccion, type Unidad } from "./schema";
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

const PORTADA_DEFAULT: Portada = {
  hero: {
    titulo: "Soluciones en Iluminación LED, Electricidad y Conectividad Digital, Innovación y eficiencia para tus proyectos",
    botonTexto: "Solicita una Consulta Gratuita",
    botonUrl: "https://wa.me/56990894601?text=Necesito%20más%20información",
    fondo: "/wp-content/uploads/2024/07/fondo1.jpg",
  },
};

export function getPortada(): Portada {
  const f = path.join(ROOT, "home.json");
  if (!fs.existsSync(f)) return PORTADA_DEFAULT;
  return portada.parse(readJson(f));
}
