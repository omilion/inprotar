import type { MetadataRoute } from "next";
import { seo } from "@/data/seo";
import { SITE_URL } from "@/lib/seo";
import { getArticulos, getPaginas } from "@/lib/content";

// Páginas con diseño a medida (código). El resto sale de /content.
const PAGINAS_CODIGO = ["/", "/decreto-supremo-uno-contaminacion-luminica-2024/", "/que-es-el-decreto-supremo-1/", "/noticias/", "/tienda/", "/tienda/page/2/", "/contacto/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGINAS_CODIGO.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: seo[p]?.modifiedTime ?? undefined })),
    ...getPaginas().map((p) => ({ url: `${SITE_URL}${p.ruta}`, lastModified: p.seo.modificado })),
    ...getArticulos().map((a) => ({ url: `${SITE_URL}${a.ruta}`, lastModified: a.seo.modificado ?? a.fecha })),
  ];
}
