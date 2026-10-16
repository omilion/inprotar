import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const categoria = z.object({
  ruta: z.string().regex(/^\/categoria-producto\/[a-z0-9/-]+\/$/),
  nombre: z.string().min(1), descripcion_md: z.string(),
});
const producto = z.object({
  ruta: z.string().regex(/^\/producto\/[a-z0-9-]+\/$/),
  nombre: z.string().min(1), sku: z.string(), resumen_md: z.string(), descripcion_md: z.string(),
  imagenes: z.array(z.object({ src: z.string(), alt: z.string() })).min(1),
  categorias: z.array(z.string()),
  atributos: z.array(z.object({ nombre: z.string(), valores: z.array(z.string()) })),
});
export type Producto = z.infer<typeof producto>;
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/catalogo", `${name}.json`), "utf8"));
export const getProductos = () => z.array(producto).parse(read("productos"));
export const getCategorias = () => z.array(categoria).parse(read("categorias"));
export const getProductosCategoria = (ruta: string) => getProductos().filter((p) =>
  p.categorias.some((c) => c === ruta || c.startsWith(ruta)));
export function productoParaTarjeta(p: Producto) {
  const cat = getCategorias().find((c) => c.ruta === p.categorias[0]);
  return { title: p.nombre, href: p.ruta, img: p.imagenes[0].src, alt: p.imagenes[0].alt,
    category: cat ? { name: cat.nombre, href: cat.ruta } : undefined };
}
