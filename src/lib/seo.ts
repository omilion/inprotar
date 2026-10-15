import type { Metadata } from "next";
import { seo } from "@/data/seo";

export const SITE_URL = "https://inprotar.cl";
export const SITE_NAME = "INPROTAR";

export type PageSeo = {
  path: string;
  title: string;
  description: string | null;
  ogType: string;
  updatedTime: string | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  section: string | null;
  twitter: string[][];
  jsonld: Record<string, unknown> | null;
  image?: { url: string; width: number; height: number; alt: string | null; type: string | null };
};

/** Construye los metadatos de Next.js replicando exactamente las etiquetas de Rank Math. */
export function buildMetadata(path: string): Metadata {
  const s = seo[path];
  if (!s) throw new Error(`SEO no definido para ${path}`);

  const other: Record<string, string> = {};
  if (s.updatedTime) other["og:updated_time"] = s.updatedTime;
  if (s.image) other["og:image:secure_url"] = s.image.url;
  s.twitter.forEach(([label, data], i) => {
    other[`twitter:label${i + 1}`] = label;
    other[`twitter:data${i + 1}`] = data;
  });

  const images = s.image
    ? [
        {
          url: s.image.url,
          width: s.image.width || undefined,
          height: s.image.height || undefined,
          alt: s.image.alt ?? undefined,
          type: s.image.type ?? undefined,
        },
      ]
    : undefined;

  return {
    title: { absolute: s.title },
    description: s.description ?? undefined,
    alternates: { canonical: `${SITE_URL}${s.path}` },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
    openGraph: {
      locale: "es_ES",
      type: s.ogType === "website" ? "website" : "article",
      title: s.title,
      description: s.description ?? undefined,
      url: `${SITE_URL}${s.path}`,
      siteName: SITE_NAME,
      images,
      publishedTime: s.publishedTime ?? undefined,
      modifiedTime: s.modifiedTime ?? undefined,
      section: s.section ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: s.title,
      description: s.description ?? undefined,
      images: s.image ? [s.image.url] : undefined,
    },
    other,
  };
}

export function getJsonLd(path: string) {
  return seo[path]?.jsonld ?? null;
}

type ContentSeo = {
  titulo: string;
  descripcion: string;
  imagen?: { src: string; alt: string; ancho?: number; alto?: number };
  publicado?: string;
  modificado?: string;
};

/** Metadatos para páginas administradas desde /content (mismas etiquetas que Rank Math). */
export function metadataFromContent(path: string, s: ContentSeo, type: "article" | "website" = "article"): Metadata {
  const img = s.imagen
    ? [{ url: s.imagen.src.startsWith("http") ? s.imagen.src : `${SITE_URL}${s.imagen.src}`, width: s.imagen.ancho, height: s.imagen.alto, alt: s.imagen.alt }]
    : undefined;
  return {
    title: { absolute: s.titulo },
    description: s.descripcion,
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: { index: true, follow: true, "max-snippet": -1, "max-video-preview": -1, "max-image-preview": "large" },
    openGraph: {
      locale: "es_ES",
      type,
      title: s.titulo,
      description: s.descripcion,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      images: img,
      publishedTime: s.publicado,
      modifiedTime: s.modificado,
    },
    twitter: { card: "summary_large_image", title: s.titulo, description: s.descripcion, images: img?.map((i) => i.url) },
  };
}
