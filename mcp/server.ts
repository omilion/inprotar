#!/usr/bin/env node
/**
 * MCP de administración del sitio INPROTAR.
 * Permite que el cliente edite su web conversando con Claude: páginas, bloques, marcas,
 * artículos del blog e imágenes. Todo cambio se valida contra los esquemas del sitio
 * (src/lib/content/schema.ts) y se guarda como un commit (Vercel publica automáticamente).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { articulo, bloque, categoria, marca, pagina, producto, redireccion, unidad } from "../src/lib/content/schema";
import type { Store, Cambio } from "./github-store";

export function crearServidor(store: Store) {

// Páginas con diseño a medida (código), de solo lectura para el MCP.
const PAGINAS_CODIGO: Record<string, string> = {
  "/decreto-supremo-uno-contaminacion-luminica-2024/": "Decreto Supremo 1 (página mejor posicionada, diseño a medida)",
  "/que-es-el-decreto-supremo-1/": "¿Qué es el Decreto Supremo 1? (diseño a medida)",
  "/": "Portada",
  "/noticias/": "Listado de noticias",
  "/tienda/": "Catálogo",
  "/contacto/": "Contacto",
};

const archivoPagina = (ruta: string) => `content/paginas/${ruta.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "inicio"}.json`;
const archivoArticulo = (ruta: string) => `content/blog/${ruta.replace(/\/$/, "").split("/").pop()}.json`;
const json = (x: unknown) => JSON.stringify(x, null, 2) + "\n";
const ok = (texto: string) => ({ content: [{ type: "text" as const, text: texto }] });
const err = (texto: string) => ({ content: [{ type: "text" as const, text: "⚠️ " + texto }], isError: true });

async function leerJson<T>(ruta: string): Promise<T | null> {
  const t = await store.leer(ruta);
  return t ? (JSON.parse(t) as T) : null;
}

async function todasLasPaginas() {
  const files = (await store.listar("content/paginas")).filter((f) => f.endsWith(".json"));
  const out: z.infer<typeof pagina>[] = [];
  for (const f of files) {
    const p = await leerJson<z.infer<typeof pagina>>(f);
    if (p) out.push(p);
  }
  return out;
}

async function todosLosArticulos() {
  const files = (await store.listar("content/blog")).filter((f) => f.endsWith(".json"));
  const out: z.infer<typeof articulo>[] = [];
  for (const f of files) {
    const a = await leerJson<z.infer<typeof articulo>>(f);
    if (a) out.push(a);
  }
  return out;
}

const leerUnidades = async () => z.array(unidad).parse(await leerJson("content/unidades.json"));
const leerMarcas = async () => z.array(marca).parse((await leerJson("content/marcas.json")) ?? []);
const ARCH_PRODUCTOS = "content/catalogo/productos.json";
const leerProductos = async () => z.array(producto).parse((await leerJson(ARCH_PRODUCTOS)) ?? []);
const leerCategorias = async () => z.array(categoria).parse((await leerJson("content/catalogo/categorias.json")) ?? []);
const leerRedirecciones = async () => z.array(redireccion).parse((await leerJson("content/redirecciones.json")) ?? []);

function validar<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, error: r.error.issues.map((i) => `• ${i.path.join(".")}: ${i.message}`).join("\n") };
}

function protegidaMsg(ruta: string) {
  return `La página ${ruta} está PROTEGIDA porque es clave para el posicionamiento en Google. Solo se puede modificar si el usuario lo pide explícitamente para esta página; en ese caso repite la llamada con autorizar_protegida: true.`;
}

const server = new McpServer({ name: "inprotar-web", version: "1.0.0" });

// ---------------------------------------------------------------- Guía
server.registerTool(
  "guia_del_sitio",
  {
    title: "Guía del sitio",
    description:
      "Explica cómo está organizado el sitio de INPROTAR (unidades de negocio, marcas, plantillas, tipos de bloque y sus campos) y las reglas de edición. Úsala SIEMPRE antes de crear o modificar contenido por primera vez en la conversación.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const tipos = (bloque as unknown as { options: z.ZodObject<z.ZodRawShape>[] }).options.map((o) => ({
      tipo: (o.shape.tipo as z.ZodLiteral<string>).value,
      esquema: zodToJsonSchema(o, { $refStrategy: "none" }),
    }));
    return ok(
      [
        "# Sitio inprotar.cl",
        "Cada página es un archivo JSON con: ruta, plantilla, unidad, marcas, protegida, seo y una lista de BLOQUES que se muestran en orden.",
        "",
        "## Unidades de negocio",
        ...(await leerUnidades()).map((u) => `- ${u.id}: ${u.nombre} (página principal ${u.pagina})`),
        "",
        "## Marcas",
        ...(await leerMarcas()).map((m) => `- ${m.id}: ${m.nombre} [unidad: ${m.unidad}]`),
        "",
        "## Catálogo",
        "Productos en /producto/slug/ agrupados en categorías /categoria-producto/.... Cada producto tiene unidad y marcas: al borrar una marca se borran sus productos (con redirección 301). Usa listar_productos, ver_producto, guardar_producto y borrar_producto.",
        "",
        "## Plantillas",
        "- unidad: página principal de una unidad de negocio.",
        "- lineaProducto: landing de una línea de productos (hero, intro, fichas técnicas, banners, FAQ).",
        "- institucional: Quiénes somos, políticas, etc.",
        "- articulo (single post): content/blog/*.json, URL /AAAA/MM/DD/slug/. Usar guardar_articulo, no crear_pagina. El contenido aparece en Noticias y los cinco más recientes en portada después del despliegue.",
        "## Esquema del artículo",
        JSON.stringify(zodToJsonSchema(articulo, { $refStrategy: "none" }), null, 1),
        "",
        "## Reglas",
        "1. Textos en español de Chile, tono profesional. Los campos terminados en _md aceptan Markdown.",
        "2. Cada página tiene UN solo H1 (normalmente en el bloque hero o heroDividido).",
        "3. SEO: seo.titulo de 50-60 caracteres y seo.descripcion de 120-160 caracteres, ambos con la palabra clave principal. NUNCA modificar seo.jsonld.",
        "4. No cambiar la ruta (URL) de una página existente: perdería su posicionamiento.",
        "5. Páginas protegidas: no modificarlas salvo pedido explícito del usuario sobre esa página.",
        "6. Antes de borrar, muestra al usuario exactamente qué se borrará y espera su confirmación.",
        "7. Imágenes: primero súbelas con subir_imagen y usa la ruta que devuelve.",
        "",
        "## Páginas de diseño a medida (solo lectura)",
        ...Object.entries(PAGINAS_CODIGO).map(([r, d]) => `- ${r}: ${d}`),
        "",
        "## Tipos de bloque (esquemas JSON)",
        JSON.stringify(tipos, null, 1),
      ].join("\n")
    );
  }
);

// ---------------------------------------------------------------- Páginas
server.registerTool(
  "listar_paginas",
  {
    title: "Listar páginas",
    description: "Lista las páginas editables del sitio, con su unidad de negocio, marcas y si están protegidas. Se puede filtrar por unidad o marca.",
    inputSchema: { unidad: z.string().optional(), marca: z.string().optional() },
    annotations: { readOnlyHint: true },
  },
  async ({ unidad: u, marca: m }) => {
    const ps = (await todasLasPaginas()).filter((p) => (!u || p.unidad === u) && (!m || p.marcas.includes(m)));
    const lineas = ps.map(
      (p) => `- ${p.ruta} | ${p.seo.titulo} | unidad: ${p.unidad} | marcas: ${p.marcas.join(", ") || "—"}${p.protegida ? " | 🔒 PROTEGIDA" : ""}`
    );
    return ok(`${ps.length} páginas editables:\n${lineas.join("\n")}\n\nDiseño a medida (solo lectura): ${Object.keys(PAGINAS_CODIGO).join(", ")}`);
  }
);

server.registerTool(
  "ver_pagina",
  {
    title: "Ver página",
    description: "Devuelve el contenido completo (SEO y bloques numerados) de una página.",
    inputSchema: { ruta: z.string().describe("Ej: /campanas-led-industriales/") },
    annotations: { readOnlyHint: true },
  },
  async ({ ruta }) => {
    if (PAGINAS_CODIGO[ruta]) return err(`${ruta} es una página de diseño a medida y no se edita desde aquí.`);
    const p = await leerJson(archivoPagina(ruta));
    return p ? ok(json(p)) : err(`No existe la página ${ruta}. Usa listar_paginas.`);
  }
);

async function guardarPagina(ruta: string, nueva: unknown, mensaje: string, autorizar = false) {
  const actual = await leerJson<z.infer<typeof pagina>>(archivoPagina(ruta));
  if (!actual) return err(`No existe la página ${ruta}.`);
  if (actual.protegida && !autorizar) return err(protegidaMsg(ruta));
  const v = validar(pagina, nueva);
  if (!v.ok) return err(`El cambio no es válido, no se guardó:\n${v.error}`);
  if (v.data.ruta !== actual.ruta) return err("No se puede cambiar la ruta (URL) de una página existente: perdería su posicionamiento.");
  if (actual.seo.jsonld) v.data.seo.jsonld = actual.seo.jsonld; // el schema original se conserva siempre
  const unos = v.data.bloques.filter(
    (b) => b.tipo === "hero" || b.tipo === "heroDividido" || ("titulo" in b && typeof b.titulo === "object" && b.titulo?.nivel === "h1")
  );
  if (unos.length !== 1) return err(`La página debe tener exactamente un H1 (tiene ${unos.length}). Revisa los bloques hero/titulo.`);
  v.data.seo.modificado = new Date().toISOString();
  const sha = await store.commit([{ ruta: archivoPagina(ruta), contenido: json(v.data) }], mensaje);
  return ok(`✅ Guardado (${sha}). El sitio se publicará en 1-2 minutos.`);
}

server.registerTool(
  "editar_pagina",
  {
    title: "Editar página",
    description:
      "Reemplaza campos de una página: seo, bloques, marcas o unidad. Para cambios pequeños prefiere editar_bloque. Lee la página antes con ver_pagina.",
    inputSchema: {
      ruta: z.string(),
      seo: z.record(z.any()).optional().describe("Objeto seo completo (titulo, descripcion, imagen...)"),
      bloques: z.array(z.record(z.any())).optional().describe("Lista COMPLETA de bloques en el nuevo orden"),
      marcas: z.array(z.string()).optional(),
      unidad: z.string().optional(),
      autorizar_protegida: z.boolean().optional(),
      resumen: z.string().describe("Descripción breve del cambio (queda en el historial)"),
    },
  },
  async ({ ruta, seo, bloques, marcas, unidad: u, autorizar_protegida, resumen }) => {
    const actual = await leerJson<Record<string, unknown>>(archivoPagina(ruta));
    if (!actual) return err(`No existe la página ${ruta}.`);
    const nueva = { ...actual, ...(seo ? { seo: { ...(actual.seo as object), ...seo } } : {}), ...(bloques ? { bloques } : {}), ...(marcas ? { marcas } : {}), ...(u ? { unidad: u } : {}) };
    return guardarPagina(ruta, nueva, `Editar ${ruta}: ${resumen}`, autorizar_protegida);
  }
);

server.registerTool(
  "editar_bloque",
  {
    title: "Editar bloque",
    description: "Modifica, agrega o quita UN bloque de una página. accion: 'reemplazar' (indice + bloque), 'agregar' (bloque y opcional indice donde insertarlo) o 'quitar' (indice).",
    inputSchema: {
      ruta: z.string(),
      accion: z.enum(["reemplazar", "agregar", "quitar"]),
      indice: z.number().int().min(0).optional().describe("Posición del bloque (0 = el primero)"),
      bloque: z.record(z.any()).optional().describe("Bloque completo con su campo 'tipo'"),
      autorizar_protegida: z.boolean().optional(),
      resumen: z.string(),
    },
  },
  async ({ ruta, accion, indice, bloque: b, autorizar_protegida, resumen }) => {
    const actual = await leerJson<{ bloques: unknown[] } & Record<string, unknown>>(archivoPagina(ruta));
    if (!actual) return err(`No existe la página ${ruta}.`);
    const bl = [...actual.bloques];
    if (accion !== "quitar" && !b) return err("Falta el bloque.");
    if (accion === "reemplazar") {
      if (indice === undefined || !bl[indice]) return err("Índice inválido.");
      bl[indice] = b;
    } else if (accion === "agregar") {
      bl.splice(indice ?? bl.length, 0, b);
    } else {
      if (indice === undefined || !bl[indice]) return err("Índice inválido.");
      bl.splice(indice, 1);
    }
    return guardarPagina(ruta, { ...actual, bloques: bl }, `${accion} bloque en ${ruta}: ${resumen}`, autorizar_protegida);
  }
);

server.registerTool(
  "crear_pagina",
  {
    title: "Crear página",
    description:
      "Crea una página nueva. Para mantener el diseño, lo ideal es partir de una página parecida (copiar_desde) y luego reemplazar textos e imágenes. La ruta debe ser única, en minúsculas y con guiones, ej: /luminarias-viales-led/.",
    inputSchema: {
      ruta: z.string(),
      copiar_desde: z.string().optional().describe("Ruta de una página existente cuya estructura se copiará"),
      pagina: z.record(z.any()).optional().describe("Página completa (si no se usa copiar_desde) o campos a sobrescribir"),
    },
  },
  async ({ ruta, copiar_desde, pagina: datos }) => {
    if (PAGINAS_CODIGO[ruta] || (await store.leer(archivoPagina(ruta)))) return err(`Ya existe una página en ${ruta}.`);
    let base: Record<string, unknown> = {};
    if (copiar_desde) {
      const o = await leerJson<Record<string, unknown>>(archivoPagina(copiar_desde));
      if (!o) return err(`No existe ${copiar_desde}.`);
      base = { ...o, protegida: false, seo: { ...(o.seo as object), jsonld: undefined, publicado: new Date().toISOString() } };
    }
    const nueva = { ...base, ...(datos ?? {}), ruta };
    const v = validar(pagina, nueva);
    if (!v.ok) return err(`La página no es válida:\n${v.error}`);
    if (copiar_desde && v.data.seo.titulo === (base.seo as { titulo: string }).titulo) return err("Debes definir un seo.titulo distinto al de la página copiada (contenido duplicado perjudica el SEO).");
    const sha = await store.commit([{ ruta: archivoPagina(ruta), contenido: json(v.data) }], `Crear página ${ruta}`);
    return ok(`✅ Página creada (${sha}). Estará en https://inprotar.cl${ruta} en 1-2 minutos.`);
  }
);

server.registerTool(
  "borrar_pagina",
  {
    title: "Borrar página",
    description:
      "Borra una página y crea una redirección 301 hacia otra (por defecto, la página de su unidad de negocio) para no perder posicionamiento. Primero llama sin confirmar para ver qué pasará; solo con confirmar: true se ejecuta, y únicamente tras la confirmación del usuario.",
    inputSchema: {
      ruta: z.string(),
      redirigir_a: z.string().optional(),
      confirmar: z.boolean().default(false),
      autorizar_protegida: z.boolean().optional(),
    },
    annotations: { destructiveHint: true },
  },
  async ({ ruta, redirigir_a, confirmar, autorizar_protegida }) => {
    if (PAGINAS_CODIGO[ruta]) return err(`${ruta} es una página de diseño a medida y no se puede borrar desde aquí.`);
    const p = await leerJson<z.infer<typeof pagina>>(archivoPagina(ruta));
    if (!p) return err(`No existe ${ruta}.`);
    if (p.protegida && !autorizar_protegida) return err(protegidaMsg(ruta));
    if ((await leerUnidades()).some((u) => u.pagina === ruta))
      return err(`${ruta} es la página principal de una unidad de negocio (destino de las redirecciones). No se puede borrar; edítala en su lugar.`);
    const destino = redirigir_a ?? (await leerUnidades()).find((u) => u.id === p.unidad)?.pagina ?? "/";
    if (!confirmar) return ok(`Se borrará "${p.seo.titulo}" (${ruta}) y se redirigirá a ${destino}. Pide confirmación al usuario y repite con confirmar: true.`);
    const red = (await leerRedirecciones()).filter((r) => r.desde !== ruta).map((r) => (r.hacia === ruta ? { ...r, hacia: destino } : r));
    red.push({ desde: ruta, hacia: destino, motivo: `Página borrada ${new Date().toISOString().slice(0, 10)}` });
    const sha = await store.commit(
      [
        { ruta: archivoPagina(ruta), contenido: null },
        { ruta: "content/redirecciones.json", contenido: json(red) },
      ],
      `Borrar página ${ruta} (redirige a ${destino})`
    );
    return ok(`🗑️ Página borrada (${sha}). ${ruta} ahora redirige a ${destino}.`);
  }
);

// ---------------------------------------------------------------- Marcas
server.registerTool(
  "listar_marcas",
  { title: "Listar marcas", description: "Lista las marcas y cuántas páginas y artículos usan cada una.", inputSchema: {}, annotations: { readOnlyHint: true } },
  async () => {
    const [ms, ps, as] = [await leerMarcas(), await todasLasPaginas(), await todosLosArticulos()];
    return ok(ms.map((m) => `- ${m.id}: ${m.nombre} | unidad ${m.unidad} | ${ps.filter((p) => p.marcas.includes(m.id)).length} páginas, ${as.filter((a) => a.marcas.includes(m.id)).length} artículos`).join("\n"));
  }
);

server.registerTool(
  "crear_marca",
  {
    title: "Crear marca",
    description: "Registra una marca nueva para poder asociarla a páginas y artículos.",
    inputSchema: { id: z.string().regex(/^[a-z0-9-]+$/), nombre: z.string(), unidad: z.string() },
  },
  async (m) => {
    const ms = await leerMarcas();
    if (ms.some((x) => x.id === m.id)) return err(`Ya existe la marca ${m.id}.`);
    if (!(await leerUnidades()).some((u) => u.id === m.unidad)) return err(`No existe la unidad ${m.unidad}.`);
    const sha = await store.commit([{ ruta: "content/marcas.json", contenido: json([...ms, m]) }], `Crear marca ${m.id}`);
    return ok(`✅ Marca creada (${sha}).`);
  }
);

server.registerTool(
  "borrar_marca",
  {
    title: "Borrar marca",
    description:
      "Elimina TODO lo de una marca: borra las páginas, artículos y productos del catálogo dedicados solo a ella (con redirección 301 a la página de su unidad) y la quita de los que comparte con otras marcas. Las páginas protegidas nunca se borran: se informan para revisión manual. Primero llama sin confirmar para mostrar el detalle al usuario.",
    inputSchema: { id: z.string(), confirmar: z.boolean().default(false) },
    annotations: { destructiveHint: true },
  },
  async ({ id, confirmar }) => {
    const ms = await leerMarcas();
    const m = ms.find((x) => x.id === id);
    if (!m) return err(`No existe la marca ${id}.`);
    const unidades = await leerUnidades();
    const destinoDe = (u: string) => unidades.find((x) => x.id === u)?.pagina ?? "/";
    const ps = (await todasLasPaginas()).filter((p) => p.marcas.includes(id));
    const as = (await todosLosArticulos()).filter((a) => a.marcas.includes(id));
    const paginasUnidad = new Set(unidades.map((u) => u.pagina));
    const borrar = ps.filter((p) => p.marcas.length === 1 && !p.protegida && !paginasUnidad.has(p.ruta));
    const protegidas = ps.filter((p) => p.protegida);
    const compartidas = ps.filter((p) => (p.marcas.length > 1 || paginasUnidad.has(p.ruta)) && !p.protegida);
    const artBorrar = as.filter((a) => a.marcas.length === 1);
    const artCompartidos = as.filter((a) => a.marcas.length > 1);
    const productos = await leerProductos();
    const prodBorrar = productos.filter((x) => x.marcas.length === 1 && x.marcas[0] === id);
    const prodCompartidos = productos.filter((x) => x.marcas.length > 1 && x.marcas.includes(id));
    const quedan = productos.filter((x) => !prodBorrar.includes(x));
    const categoriasVacias = (await leerCategorias()).filter(
      (c) => prodBorrar.some((x) => x.categorias.includes(c.ruta)) && !quedan.some((x) => x.categorias.some((k) => k === c.ruta || k.startsWith(c.ruta)))
    );
    const resumen = [
      `Marca: ${m.nombre}`,
      `Páginas a BORRAR (${borrar.length}): ${borrar.map((p) => p.ruta).join(", ") || "—"}`,
      `Artículos a BORRAR (${artBorrar.length}): ${artBorrar.map((a) => a.ruta).join(", ") || "—"}`,
      `Productos a BORRAR (${prodBorrar.length}): ${prodBorrar.map((x) => x.nombre).join("; ") || "—"}`,
      `Categorías que quedarán sin productos (no se borran; revisar el menú): ${categoriasVacias.map((c) => c.nombre).join(", ") || "—"}`,
      `Se quitará la marca de (${compartidas.length + artCompartidos.length + prodCompartidos.length}): ${[...compartidas, ...artCompartidos, ...prodCompartidos].map((p) => p.ruta).join(", ") || "—"}`,
      `Protegidas, NO se tocan (revisar a mano el contenido de la marca): ${protegidas.map((p) => p.ruta).join(", ") || "—"}`,
    ].join("\n");
    if (!confirmar) return ok(`${resumen}\n\nTodas las URLs borradas redirigirán (301) a la página de su unidad de negocio. Muestra este detalle al usuario y, si confirma, repite con confirmar: true.`);
    const cambios: Cambio[] = [];
    let red = await leerRedirecciones();
    for (const x of [...borrar, ...artBorrar]) {
      const destino = destinoDe(x.unidad);
      cambios.push({ ruta: "titulo" in x ? archivoArticulo(x.ruta) : archivoPagina(x.ruta), contenido: null });
      red = red.filter((r) => r.desde !== x.ruta).map((r) => (r.hacia === x.ruta ? { ...r, hacia: destino } : r));
      red.push({ desde: x.ruta, hacia: destino, motivo: `Marca ${id} eliminada` });
    }
    for (const x of prodBorrar) {
      const destino = [...x.categorias].reverse().find((c) => !categoriasVacias.some((v) => v.ruta === c)) ?? destinoDe(x.unidad);
      red = red.filter((r) => r.desde !== x.ruta).map((r) => (r.hacia === x.ruta ? { ...r, hacia: destino } : r));
      red.push({ desde: x.ruta, hacia: destino, motivo: `Marca ${id} eliminada` });
    }
    if (prodBorrar.length || prodCompartidos.length) {
      const nuevos = quedan.map((x) => (x.marcas.includes(id) ? { ...x, marcas: x.marcas.filter((k) => k !== id) } : x));
      cambios.push({ ruta: ARCH_PRODUCTOS, contenido: json(nuevos) });
    }
    for (const p of compartidas) cambios.push({ ruta: archivoPagina(p.ruta), contenido: json({ ...p, marcas: p.marcas.filter((x) => x !== id) }) });
    for (const a of artCompartidos) cambios.push({ ruta: archivoArticulo(a.ruta), contenido: json({ ...a, marcas: a.marcas.filter((x) => x !== id) }) });
    cambios.push({ ruta: "content/redirecciones.json", contenido: json(red) });
    cambios.push({ ruta: "content/marcas.json", contenido: json(ms.filter((x) => x.id !== id)) });
    const sha = await store.commit(cambios, `Eliminar marca ${id}`);
    return ok(`🗑️ Marca ${m.nombre} eliminada en un solo cambio (${sha}).\n${resumen}`);
  }
);

// ---------------------------------------------------------------- Catálogo
server.registerTool(
  "listar_productos",
  {
    title: "Listar productos",
    description: "Lista los productos del catálogo (/producto/...) y las categorías disponibles. Se puede filtrar por marca, unidad o ruta de categoría.",
    inputSchema: { marca: z.string().optional(), unidad: z.string().optional(), categoria: z.string().optional() },
    annotations: { readOnlyHint: true },
  },
  async ({ marca: m, unidad: u, categoria: c }) => {
    const ps = (await leerProductos()).filter(
      (x) => (!m || x.marcas.includes(m)) && (!u || x.unidad === u) && (!c || x.categorias.some((k) => k === c || k.startsWith(c)))
    );
    const cats = await leerCategorias();
    const nombreCat = (k: string) => cats.find((y) => y.ruta === k)?.nombre ?? k;
    return ok(
      `${ps.length} productos:\n` +
        ps.map((x) => `- ${x.ruta} | ${x.nombre} | marcas: ${x.marcas.join(", ") || "—"} | ${x.categorias.map(nombreCat).join(", ")}`).join("\n") +
        `\n\nCategorías disponibles:\n${cats.map((y) => `- ${y.ruta} | ${y.nombre}`).join("\n")}`
    );
  }
);

server.registerTool(
  "ver_producto",
  {
    title: "Ver producto",
    description: "Devuelve la ficha completa de un producto del catálogo.",
    inputSchema: { ruta: z.string().describe("Ej: /producto/luminaria-solar-inprotar-sun-stay/") },
    annotations: { readOnlyHint: true },
  },
  async ({ ruta }) => {
    const x = (await leerProductos()).find((p) => p.ruta === ruta);
    return x ? ok(json(x)) : err(`No existe el producto ${ruta}. Usa listar_productos.`);
  }
);

server.registerTool(
  "guardar_producto",
  {
    title: "Crear o editar producto",
    description:
      "Crea un producto nuevo o actualiza uno existente (envía la ruta y los campos a cambiar; el resto se conserva). Campos: nombre, sku, unidad, marcas, resumen_md, descripcion_md (Markdown), imagenes [{src, alt}] (subirlas antes con subir_imagen), categorias (rutas existentes) y atributos [{nombre, valores}]. La ruta de un producto nuevo es /producto/slug-descriptivo/ y no se cambia después.",
    inputSchema: { producto: z.record(z.any()) },
  },
  async ({ producto: datos }) => {
    const ps = await leerProductos();
    const i = ps.findIndex((x) => x.ruta === datos.ruta);
    const v = validar(producto, { ...(i >= 0 ? ps[i] : {}), ...datos });
    if (!v.ok) return err(`El producto no es válido:\n${v.error}`);
    const cats = await leerCategorias();
    const faltan = v.data.categorias.filter((c) => !cats.some((y) => y.ruta === c));
    if (faltan.length) return err(`No existen estas categorías: ${faltan.join(", ")}. Usa listar_productos para ver las disponibles.`);
    if (!(await leerUnidades()).some((u) => u.id === v.data.unidad)) return err(`No existe la unidad ${v.data.unidad}.`);
    const ms = await leerMarcas();
    const sinMarca = (v.data.marcas ?? []).filter((k) => !ms.some((m) => m.id === k));
    if (sinMarca.length) return err(`No existen estas marcas: ${sinMarca.join(", ")}. Créalas antes con crear_marca.`);
    if (i < 0 && (await leerRedirecciones()).some((r) => r.desde === v.data.ruta))
      return err(`La URL ${v.data.ruta} fue usada por contenido borrado y hoy redirige; usa otro slug.`);
    const nuevos = i >= 0 ? ps.map((x, k) => (k === i ? v.data : x)) : [...ps, v.data];
    const sha = await store.commit([{ ruta: ARCH_PRODUCTOS, contenido: json(nuevos) }], `${i >= 0 ? "Editar" : "Crear"} producto ${v.data.ruta}`);
    return ok(`✅ Producto guardado (${sha}). Estará en https://inprotar.cl${v.data.ruta} cuando termine el despliegue.`);
  }
);

server.registerTool(
  "borrar_producto",
  {
    title: "Borrar producto",
    description: "Borra un producto del catálogo y redirige su URL (301) a su categoría. Primero llama sin confirmar; solo con confirmar: true tras confirmación del usuario.",
    inputSchema: { ruta: z.string(), confirmar: z.boolean().default(false) },
    annotations: { destructiveHint: true },
  },
  async ({ ruta, confirmar }) => {
    const ps = await leerProductos();
    const x = ps.find((p) => p.ruta === ruta);
    if (!x) return err(`No existe el producto ${ruta}.`);
    const destino = x.categorias[x.categorias.length - 1] ?? "/tienda/";
    if (!confirmar) return ok(`Se borrará "${x.nombre}" (${ruta}) y se redirigirá a ${destino}. Confirma con el usuario y repite con confirmar: true.`);
    const red = [
      ...(await leerRedirecciones()).filter((r) => r.desde !== ruta).map((r) => (r.hacia === ruta ? { ...r, hacia: destino } : r)),
      { desde: ruta, hacia: destino, motivo: "Producto borrado" },
    ];
    const sha = await store.commit(
      [
        { ruta: ARCH_PRODUCTOS, contenido: json(ps.filter((p) => p.ruta !== ruta)) },
        { ruta: "content/redirecciones.json", contenido: json(red) },
      ],
      `Borrar producto ${ruta}`
    );
    return ok(`🗑️ Producto borrado (${sha}). ${ruta} redirige a ${destino}.`);
  }
);

// ---------------------------------------------------------------- Blog
server.registerTool(
  "listar_articulos",
  { title: "Listar artículos", description: "Lista los artículos del blog.", inputSchema: {}, annotations: { readOnlyHint: true } },
  async () => ok((await todosLosArticulos()).map((a) => `- ${a.ruta} | ${a.titulo} | ${a.fecha.slice(0, 10)} | marcas: ${a.marcas.join(", ") || "—"}`).join("\n") || "No hay artículos.")
);

server.registerTool(
  "ver_articulo",
  { title: "Ver artículo", description: "Devuelve un artículo completo.", inputSchema: { ruta: z.string() }, annotations: { readOnlyHint: true } },
  async ({ ruta }) => {
    const a = await leerJson(archivoArticulo(ruta));
    return a && (a as { ruta: string }).ruta === ruta ? ok(json(a)) : err(`No existe el artículo ${ruta}.`);
  }
);

server.registerTool(
  "guardar_articulo",
  {
    title: "Crear o editar artículo",
    description:
      "Crea o actualiza un single post. Consulta guia_del_sitio para el esquema. Para editar, envía ruta y los campos a cambiar; conserva los demás. La URL es /AAAA/MM/DD/slug/ y no se cambia al editar. Campos: titulo, fecha ISO, resumen opcional, imagen, unidad, marcas, cuerpo_md y seo. Usa subtítulos ##. Aparece en Noticias y, si está entre los cinco más recientes, en portada tras el despliegue.",
    inputSchema: { articulo: z.record(z.any()) },
  },
  async ({ articulo: datos }) => {
    if (!articulo.shape.ruta.safeParse(datos.ruta).success) return err("Indica una ruta válida /AAAA/MM/DD/slug/.");
    const previo = await leerJson<z.infer<typeof articulo>>(archivoArticulo(String(datos.ruta)));
    if (previo && previo.ruta !== datos.ruta) return err("Ese slug ya pertenece a otro artículo. Conserva su URL original o elige otro slug.");
    const v = validar(articulo, { ...(previo ?? {}), ...datos, seo: { ...(previo?.seo ?? {}), ...((datos.seo as object) ?? {}) } });
    if (!v.ok) return err(`El artículo no es válido:\n${v.error}`);
    if (!previo && v.data.ruta.slice(1, 11) !== v.data.fecha.slice(0, 10).replace(/-/g, "/")) return err("La fecha de la URL debe coincidir con la fecha de publicación.");
    if (!(await leerUnidades()).some((u) => u.id === v.data.unidad)) return err(`No existe la unidad ${v.data.unidad}.`);
    const marcas = await leerMarcas();
    if (v.data.marcas?.some((id) => !marcas.some((m) => m.id === id))) return err("Hay marcas que no existen; consulta listar_marcas.");
    if ((await leerRedirecciones()).some((r) => r.desde === v.data.ruta)) return err("Esa URL tiene una redirección activa. Usa otra URL o revisa la redirección antes de publicar.");
    if (await leerJson(archivoPagina(v.data.ruta))) return err("Esa URL ya pertenece a una página.");
    if (previo?.seo.jsonld) v.data.seo.jsonld = previo.seo.jsonld;
    v.data.seo.modificado = new Date().toISOString();
    const sha = await store.commit([{ ruta: archivoArticulo(v.data.ruta), contenido: json(v.data) }], `${previo ? "Editar" : "Crear"} artículo ${v.data.ruta}`);
    return ok(`✅ Artículo guardado (${sha}). URL: https://inprotar.cl${v.data.ruta}. La ficha y los listados se actualizarán cuando termine el despliegue del sitio.`);
  }
);

server.registerTool(
  "borrar_articulo",
  {
    title: "Borrar artículo",
    description: "Borra un artículo y redirige su URL (301) a la página de su unidad. Solo con confirmar: true tras confirmación del usuario.",
    inputSchema: { ruta: z.string(), confirmar: z.boolean().default(false) },
    annotations: { destructiveHint: true },
  },
  async ({ ruta, confirmar }) => {
    const a = await leerJson<z.infer<typeof articulo>>(archivoArticulo(ruta));
    if (!a || a.ruta !== ruta) return err(`No existe ${ruta}.`);
    const destino = (await leerUnidades()).find((u) => u.id === a.unidad)?.pagina ?? "/noticias/";
    if (!confirmar) return ok(`Se borrará "${a.titulo}" y se redirigirá a ${destino}. Confirma con el usuario y repite con confirmar: true.`);
    const red = [...(await leerRedirecciones()).filter((r) => r.desde !== ruta), { desde: ruta, hacia: destino, motivo: "Artículo borrado" }];
    const sha = await store.commit(
      [
        { ruta: archivoArticulo(ruta), contenido: null },
        { ruta: "content/redirecciones.json", contenido: json(red) },
      ],
      `Borrar artículo ${ruta}`
    );
    return ok(`🗑️ Artículo borrado (${sha}).`);
  }
);

// ---------------------------------------------------------------- Imágenes
server.registerTool(
  "subir_imagen",
  {
    title: "Subir imagen",
    description:
      "Sube una imagen al sitio desde una URL pública o en base64 y devuelve la ruta para usarla en los bloques. Usa un nombre descriptivo con palabras clave (ej: campana-led-industrial-greenperform.jpg) porque ayuda al SEO.",
    inputSchema: {
      nombre: z.string().regex(/^[a-z0-9-]+\.(jpg|jpeg|png|webp|svg)$/, "Usa minúsculas, números y guiones, con extensión jpg/png/webp/svg"),
      url: z.string().url().optional(),
      base64: z.string().optional(),
    },
  },
  async ({ nombre, url, base64 }) => {
    let data = base64;
    if (!data && url) {
      const r = await fetch(url);
      if (!r.ok) return err(`No se pudo descargar la imagen (${r.status}).`);
      data = Buffer.from(await r.arrayBuffer()).toString("base64");
    }
    if (!data) return err("Entrega una url o el contenido en base64.");
    if (Buffer.from(data, "base64").length > 3 * 1024 * 1024) return err("La imagen pesa más de 3 MB; optimízala antes de subirla.");
    const d = new Date();
    const ruta = `/wp-content/uploads/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${nombre}`;
    if (await store.leer("public" + ruta)) return err(`Ya existe ${ruta}; usa otro nombre.`);
    const sha = await store.commit([{ ruta: "public" + ruta, contenido: data, base64: true }], `Subir imagen ${nombre}`);
    return ok(`✅ Imagen subida (${sha}). Ruta para usar en los bloques: ${ruta}`);
  }
);

// ---------------------------------------------------------------- Historial
server.registerTool(
  "historial_cambios",
  {
    title: "Historial de cambios",
    description: "Muestra los últimos cambios publicados en el sitio (útil para saber qué se modificó y cuándo).",
    inputSchema: { cantidad: z.number().int().min(1).max(50).default(10) },
    annotations: { readOnlyHint: true },
  },
  async ({ cantidad }) => {
    if (!store.historial) return ok("Historial disponible solo en modo GitHub.");
    return ok((await store.historial(cantidad)).map((c) => `- ${c.fecha.slice(0, 16).replace("T", " ")} ${c.sha} ${c.mensaje}`).join("\n"));
  }
);

return server;
}
