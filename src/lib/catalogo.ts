import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { categoria, producto, type Producto } from "@/lib/content/schema";

export type { Producto } from "@/lib/content/schema";
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
