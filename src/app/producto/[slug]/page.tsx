import { notFound } from "next/navigation";
import { marked } from "marked";
import CatalogoLayout from "@/components/CatalogoLayout";
import { getCategorias, getProductos } from "@/lib/catalogo";
import { metadataFromContent } from "@/lib/seo";
import { CONTACT } from "@/data/site";
import s from "@/components/CatalogoLayout.module.css";

type Params = { slug: string };
export const dynamicParams = false;
export const generateStaticParams = () => getProductos().map((p) => ({ slug: p.ruta.split("/")[2] }));
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProductos().find((p) => p.ruta === `/producto/${slug}/`);
  return p ? metadataFromContent(p.ruta, { titulo: `${p.nombre} | INPROTAR`, descripcion: `Consulta las características de ${p.nombre} y solicita asesoría a INPROTAR.`, imagen: p.imagenes[0] }, "website") : {};
}
export default async function ProductoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProductos().find((p) => p.ruta === `/producto/${slug}/`);
  if (!p) notFound();
  const categorias = getCategorias().filter((c) => p.categorias.includes(c.ruta));
  return <CatalogoLayout titulo={p.nombre}>
    <nav className={s.breadcrumbs} aria-label="Navegación del producto">
      <a href="/tienda/">← Todo el catálogo</a>
      {categorias.map((c) => <a key={c.ruta} href={c.ruta}>{c.nombre}</a>)}
    </nav>
    <div className={s.product}>
      <div className={s.gallery}>{p.imagenes.map((img, i) => <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} loading={i ? "lazy" : "eager"} />)}</div>
      <div>
        {p.sku && <p>Código: {p.sku}</p>}
        <div className={s.text} dangerouslySetInnerHTML={{ __html: marked.parse(p.resumen_md, { async: false }) }} />
        {!!p.atributos.length && <><h2>Características y opciones</h2><dl className={s.attributes}>
          {p.atributos.map((a) => <div key={a.nombre}><dt>{a.nombre}</dt><dd>{a.valores.join(", ")}</dd></div>)}
        </dl></>}
        <a className={s.cta} href={`${CONTACT.whatsapp}?text=${encodeURIComponent(`Hola, quisiera cotizar ${p.nombre}.`)}`}>Solicitar cotización</a>
      </div>
    </div>
    {p.descripcion_md && <section className={`${s.description} ${s.text}`}><h2>Descripción del producto</h2>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(p.descripcion_md, { async: false }) }} />
    </section>}
  </CatalogoLayout>;
}
