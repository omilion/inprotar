import { notFound } from "next/navigation";
import { marked } from "marked";
import Bloques from "@/blocks/Bloques";
import PageHero from "@/components/PageHero";
import { getArticulo, getArticulos, getPagina, getPaginas } from "@/lib/content";
import { metadataFromContent } from "@/lib/seo";
import { fechaArticulo } from "@/lib/content/blog";
import a from "./articulo.module.css";

/**
 * Ruta única para todo el contenido administrable (/content):
 * páginas de unidades de negocio, líneas de producto, institucionales y artículos del blog.
 * Las páginas protegidas con diseño propio (ej. Decreto Supremo 1) tienen su propia carpeta y no pasan por aquí.
 */

type Params = { slug: string[] };
export const dynamicParams = false;

const toRuta = (slug: string[]) => `/${slug.join("/")}/`;

export function generateStaticParams(): Params[] {
  return [...getPaginas().map((p) => p.ruta), ...getArticulos().map((x) => x.ruta)].map((r) => ({
    slug: r.split("/").filter(Boolean),
  }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const ruta = toRuta((await params).slug);
  const p = getPagina(ruta);
  if (p) return metadataFromContent(ruta, p.seo);
  const art = getArticulo(ruta);
  return art ? metadataFromContent(ruta, {
    ...art.seo, imagen: art.seo.imagen ?? art.imagen, publicado: art.seo.publicado ?? art.fecha,
  }) : {};
}

function JsonLdRaw({ data }: { data?: Record<string, unknown> }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default async function ContenidoPage({ params }: { params: Promise<Params> }) {
  const ruta = toRuta((await params).slug);

  const pagina = getPagina(ruta);
  if (pagina) {
    return (
      <>
        <JsonLdRaw data={pagina.seo.jsonld} />
        <Bloques bloques={pagina.bloques} />
        <div style={{ height: 140 }} />
      </>
    );
  }

  const art = getArticulo(ruta);
  if (!art) notFound();
  return (
    <>
      <JsonLdRaw data={art.seo.jsonld} />
      <PageHero image={art.imagen.src} height={304} overlayOpacity={0.7} spacer={163} imagePosition="center">
        <h1 className={a.title}>{art.titulo}</h1>
      </PageHero>
      <section className={a.body}>
        <article className={a.card}>
          <nav aria-label="Navegación del artículo"><a href="/noticias/">← Todas las noticias</a></nav>
          <time dateTime={art.fecha}>{fechaArticulo(art.fecha)}</time>
          {art.resumen && <p className={a.summary}>{art.resumen}</p>}
          <div className={a.featured}>
            <img src={art.imagen.src} alt={art.imagen.alt} width={art.imagen.ancho} height={art.imagen.alto} fetchPriority="high" />
            {art.imagen.pie && <p>{art.imagen.pie}</p>}
          </div>
          <div className={a.content} dangerouslySetInnerHTML={{ __html: marked.parse(art.cuerpo_md, { async: false }) as string }} />
        </article>
      </section>
      <div className={a.bottom} />
    </>
  );
}
