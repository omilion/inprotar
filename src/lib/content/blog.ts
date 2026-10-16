import type { Articulo } from "./schema";

export function fechaArticulo(fecha: string): string {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(`${fecha.slice(0, 10)}T12:00:00Z`));
}

export function articuloParaTarjeta(articulo: Articulo) {
  return {
    title: articulo.titulo,
    href: articulo.ruta,
    img: articulo.imagen.src,
    alt: articulo.imagen.alt,
    date: fechaArticulo(articulo.fecha),
    excerpt: articulo.resumen ?? articulo.seo.descripcion,
  };
}
