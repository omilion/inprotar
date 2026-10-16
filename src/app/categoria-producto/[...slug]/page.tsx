import { notFound } from "next/navigation";
import { marked } from "marked";
import CatalogoLayout from "@/components/CatalogoLayout";
import ProductGrid from "@/components/widgets/ProductGrid";
import { getCategorias, getProductosCategoria, productoParaTarjeta } from "@/lib/catalogo";
import { metadataFromContent } from "@/lib/seo";
import s from "@/components/CatalogoLayout.module.css";

type Params = { slug: string[] };
export const dynamicParams = false;
const ruta = (slug: string[]) => `/categoria-producto/${slug.join("/")}/`;
export const generateStaticParams = () => getCategorias().map((c) => ({ slug: c.ruta.split("/").filter(Boolean).slice(1) }));
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const path = ruta((await params).slug);
  const c = getCategorias().find((c) => c.ruta === path);
  return c ? metadataFromContent(c.ruta, { titulo: `${c.nombre} | INPROTAR`, descripcion: `Catálogo de ${c.nombre}. Consulta a INPROTAR por especificaciones y disponibilidad.` }, "website") : {};
}
export default async function CategoriaPage({ params }: { params: Promise<Params> }) {
  const path = ruta((await params).slug);
  const categoria = getCategorias().find((c) => c.ruta === path);
  if (!categoria) notFound();
  const productos = getProductosCategoria(path);
  return <CatalogoLayout titulo={categoria.nombre}>
    <nav className={s.breadcrumbs} aria-label="Navegación del catálogo"><a href="/tienda/">← Todo el catálogo</a></nav>
    {categoria.descripcion_md && <div className={s.text} dangerouslySetInnerHTML={{ __html: marked.parse(categoria.descripcion_md, { async: false }) }} />}
    {productos.length ? <ProductGrid items={productos.map(productoParaTarjeta)} total={productos.length} perPage={productos.length} /> :
      <div className={s.empty}><p>Actualmente no hay productos publicados en esta categoría.</p><a className={s.cta} href="/contacto/">Consultar con un especialista</a></div>}
  </CatalogoLayout>;
}
