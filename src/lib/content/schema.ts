import { z } from "zod";

/**
 * Esquema del contenido editable del sitio.
 * Todo lo que el cliente (vía MCP) puede crear o modificar se valida contra estos esquemas
 * antes de guardarse, para que un cambio nunca rompa el diseño ni el SEO.
 *
 * Campos de texto "md": aceptan Markdown (negritas, listas, enlaces).
 */

const imagen = z.object({
  src: z.string().describe("Ruta de la imagen, ej: /wp-content/uploads/2025/03/foto.jpg"),
  alt: z.string().default(""),
  ancho: z.number().optional(),
  alto: z.number().optional(),
  pie: z.string().optional().describe("Pie de foto opcional"),
});

const boton = z.object({
  texto: z.string(),
  url: z.string(),
  estilo: z.enum(["primario", "contorno", "contornoClaro", "oscuro"]).default("primario"),
});

const titulo = z.object({
  texto: z.string(),
  nivel: z.enum(["h1", "h2", "h3"]).default("h2"),
});

// ---------------- Bloques ----------------

export const bloqueHero = z.object({
  tipo: z.literal("hero"),
  titulo: z.string().describe("H1 de la página"),
  fondo: z.string().describe("Imagen de fondo"),
  oscurecer: z.number().min(0).max(1).default(0.6),
  alto: z.number().default(390),
});

export const bloqueHeroDividido = z.object({
  tipo: z.literal("heroDividido"),
  antetitulo: z.string().optional(),
  titulo: z.string().describe("H1 de la página"),
  texto_md: z.string().optional(),
  boton: boton.optional(),
  imagen: imagen,
});

export const bloqueTitulo = z.object({
  tipo: z.literal("titulo"),
  titulo: titulo,
  bajada_md: z.string().optional(),
  alineacion: z.enum(["centro", "izquierda"]).default("centro"),
});

export const bloqueTexto = z.object({
  tipo: z.literal("texto"),
  titulo: titulo.optional(),
  texto_md: z.string(),
});

export const bloqueTextoImagen = z.object({
  tipo: z.literal("textoImagen"),
  titulo: titulo.optional(),
  texto_md: z.string().optional(),
  imagen: imagen,
  imagenAlLado: z.enum(["izquierda", "derecha"]).default("derecha"),
  botones: z.array(boton).default([]),
});

export const bloqueColumnas = z.object({
  tipo: z.literal("columnas"),
  titulo: titulo.optional(),
  columnas: z
    .array(
      z.object({
        titulo: z.string().optional(),
        subtitulo: z.string().optional(),
        imagen: imagen.optional(),
        texto_md: z.string().optional(),
      })
    )
    .min(1)
    .max(4),
});

export const bloqueIntroIconos = z.object({
  tipo: z.literal("introIconos"),
  imagenes: z.array(imagen).max(2).default([]),
  texto_md: z.string(),
  iconos: z.array(z.object({ icono: z.string().describe("Ruta del ícono (svg/png)"), texto: z.string() })).max(9),
});

export const bloqueBannerImagen = z.object({
  tipo: z.literal("bannerImagen"),
  fondo: z.string(),
  oscurecer: z.number().min(0).max(1).default(0.4),
  ladoTexto: z.enum(["izquierda", "derecha"]).default("izquierda"),
  antetitulo: z.string().optional(),
  titulo: z.string(),
  colorTitulo: z.string().default("#ffffff"),
  texto_md: z.string().optional(),
  botones: z.array(boton).default([]),
});

export const bloqueFichas = z.object({
  tipo: z.literal("fichas"),
  titulo: titulo.optional(),
  fichas: z
    .array(
      z.object({
        nombre: z.string(),
        imagen: imagen,
        especificaciones_md: z.string().describe("Lista Markdown de especificaciones técnicas"),
        boton: boton.optional(),
      })
    )
    .min(1),
});

export const bloqueProductos = z.object({
  tipo: z.literal("productos"),
  titulo: titulo.optional(),
  productos: z
    .array(
      z.object({
        nombre: z.string(),
        url: z.string().optional(),
        imagen: imagen,
        puntos: z.array(z.string()).default([]),
      })
    )
    .min(1),
});

export const bloqueBandaCta = z.object({
  tipo: z.literal("bandaCta"),
  titulo: z.string(),
  texto_md: z.string().optional(),
  boton: boton,
  tema: z.enum(["oscuro", "azul", "claro"]).default("oscuro"),
});

export const bloqueFaq = z.object({
  tipo: z.literal("faq"),
  titulo: z.string().default("Preguntas frecuentes"),
  preguntas: z.array(z.object({ pregunta: z.string(), respuesta_md: z.string() })).min(1),
});

export const bloqueGaleria = z.object({
  tipo: z.literal("galeria"),
  titulo: titulo.optional(),
  columnas: z.number().min(1).max(4).default(3),
  imagenes: z.array(imagen).min(1),
});

export const bloqueTarjetas = z.object({
  tipo: z.literal("tarjetas"),
  titulo: titulo.optional(),
  columnas: z.number().min(2).max(4).default(3),
  tarjetas: z
    .array(
      z.object({
        titulo: z.string(),
        imagen: z.string().describe("Imagen de fondo de la tarjeta"),
        texto: z.string().optional().describe("Texto que aparece al pasar el mouse"),
        url: z.string().optional(),
        textoBoton: z.string().optional(),
      })
    )
    .min(1),
});

export const bloqueCierre = z.object({
  tipo: z.literal("cierre"),
  texto: z.string(),
});

export const bloque = z.discriminatedUnion("tipo", [
  bloqueHero,
  bloqueHeroDividido,
  bloqueTitulo,
  bloqueTexto,
  bloqueTextoImagen,
  bloqueColumnas,
  bloqueIntroIconos,
  bloqueBannerImagen,
  bloqueFichas,
  bloqueProductos,
  bloqueBandaCta,
  bloqueFaq,
  bloqueGaleria,
  bloqueTarjetas,
  bloqueCierre,
]);

// ---------------- SEO y página ----------------

export const seo = z.object({
  titulo: z.string().describe("Etiqueta <title>"),
  descripcion: z.string().describe("Meta descripción (idealmente 120-160 caracteres)"),
  imagen: imagen.optional().describe("Imagen para redes sociales (og:image)"),
  publicado: z.string().optional(),
  modificado: z.string().optional(),
  jsonld: z.record(z.any()).optional().describe("Schema JSON-LD original (Rank Math). No modificar."),
});

export const pagina = z.object({
  ruta: z.string().regex(/^\/[a-z0-9\-/]*\/$/, "La ruta debe empezar y terminar con / y usar minúsculas, números y guiones"),
  plantilla: z.enum(["unidad", "lineaProducto", "institucional"]),
  unidad: z.string().describe("Id de la unidad de negocio (ver content/unidades.json)"),
  marcas: z.array(z.string()).default([]).describe("Ids de marcas relacionadas (ver content/marcas.json)"),
  protegida: z.boolean().default(false).describe("Páginas clave para SEO: el MCP no las modifica sin autorización"),
  seo: seo,
  bloques: z.array(bloque).min(1),
});

export const articulo = z.object({
  ruta: z.string().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/$/, "Formato de ruta: /AAAA/MM/DD/slug/"),
  titulo: z.string().describe("H1 del artículo"),
  fecha: z.string().refine((s) => /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(s) &&
    Number.isFinite(Date.parse(s)) && new Date(`${s.slice(0, 10)}T12:00:00Z`).toISOString().slice(0, 10) === s.slice(0, 10),
    "Usa una fecha ISO válida").describe("Fecha de publicación ISO"),
  resumen: z.string().max(400).optional().describe("Resumen para Noticias, portada y cabecera del artículo; si falta, las tarjetas usan seo.descripcion"),
  imagen: imagen.describe("Imagen destacada"),
  unidad: z.string(),
  marcas: z.array(z.string()).default([]),
  cuerpo_md: z.string().describe("Contenido del artículo en Markdown"),
  seo: seo,
});

export const unidad = z.object({
  id: z.string(),
  nombre: z.string(),
  pagina: z.string().describe("Ruta de la página principal de la unidad (destino de redirecciones)"),
});

export const marca = z.object({
  id: z.string(),
  nombre: z.string(),
  unidad: z.string(),
});

export const redireccion = z.object({
  desde: z.string(),
  hacia: z.string(),
  motivo: z.string().optional(),
});

// ---------------- Catálogo ----------------

export const categoria = z.object({
  ruta: z.string().regex(/^\/categoria-producto\/[a-z0-9/-]+\/$/, "Formato: /categoria-producto/slug/"),
  nombre: z.string().min(1),
  descripcion_md: z.string(),
});

export const producto = z.object({
  ruta: z.string().regex(/^\/producto\/[a-z0-9-]+\/$/, "Formato: /producto/slug/"),
  nombre: z.string().min(1),
  sku: z.string().default(""),
  unidad: z.string().describe("Id de la unidad de negocio"),
  marcas: z.array(z.string()).default([]).describe("Ids de marcas (borrar una marca borra sus productos)"),
  resumen_md: z.string().default(""),
  descripcion_md: z.string().default(""),
  imagenes: z.array(z.object({ src: z.string(), alt: z.string() })).min(1),
  categorias: z.array(z.string()).min(1).describe("Rutas de categorías existentes"),
  atributos: z.array(z.object({ nombre: z.string(), valores: z.array(z.string()) })).default([]),
});

export type Bloque = z.infer<typeof bloque>;
export type Categoria = z.infer<typeof categoria>;
export type Producto = z.infer<typeof producto>;
export type Pagina = z.infer<typeof pagina>;
export type Articulo = z.infer<typeof articulo>;
export type Unidad = z.infer<typeof unidad>;
export type Marca = z.infer<typeof marca>;
export type Redireccion = z.infer<typeof redireccion>;
