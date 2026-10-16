# INPROTAR — versión React (Next.js)

Copia del sitio WordPress/Elementor de inprotar.cl en React, con exportación estática (HTML pre-renderizado, ideal para SEO).

## Comandos
- `npm run dev` — desarrollo en http://localhost:3000
- `npm run build` — genera el sitio estático en `out/` (subir esa carpeta a cualquier hosting)

## SEO conservado
- Mismas URLs (con barra final), incluidas las de blog `/AAAA/MM/DD/slug/`.
- Title, description, canonical, robots, Open Graph, Twitter y JSON-LD de Rank Math copiados 1:1 en `src/data/seo.ts`.
- Imágenes con la misma ruta `/wp-content/uploads/...`, mismo nombre de archivo y mismo `alt`.
- Misma jerarquía de encabezados (H1/H2/H3) que el original.
- `sitemap.xml` y `robots.txt` generados automáticamente.

## Páginas migradas (22 URLs)
- / (portada, con popup DS-1 y partículas del hero)
- /quienes-somos/, /contacto/, /noticias/, /politicas-de-privacidad/
- /tienda/ y /tienda/page/2/
- /iluminacion-profesional-conectada/, /automatizacion-y-digitalizacion-integrada/
- /alumbrado-publico-led/, /campanas-led-industriales/, /proyectores-de-area-led/
- /iluminacion-antiexplosiva/, /iluminacion-interior-led/, /iluminacion-para-horticultura/
- /que-es-el-decreto-supremo-1/
- /conductores-electricos-chile/
- /alumbrado-publico-solar/
- /suministros-y-componentes-electricos-y-electronicos/
- /iluminacion-para-acuicultura/
- /decreto-supremo-uno-contaminacion-luminica-2024/
- /2024/08/26/iluminacion-para-acuicultura-en-la-salmonicultura-chilena-mejorando-la-productividad/
- /2025/03/25/iluminacion-solar-industrial-eficiencia-energetica-al-mas-alto-nivel-con-sunstay/

## Agregar una entrada de blog
Usar `guardar_articulo` del MCP (ver `mcp/README.md`) o crear un JSON válido en `content/blog/`. La ficha individual, Noticias, los cinco artículos más recientes de la portada y el sitemap usan estos archivos. Los cambios aparecen al reconstruir y desplegar el sitio. `src/data/posts.tsx` es contenido antiguo y ya no alimenta el blog.

## Herramientas de migración (`scripts/migracion/`)
Scripts usados para copiar páginas desde WordPress (requieren Chrome, Node y Python con beautifulsoup4):
- `ex2.mjs` extrae la estructura y estilos Elementor (escritorio + móvil) de una URL.
- `gen.py` + `specials.py` generan `page.tsx` y `page.module.css`.
- `pos.mjs` / `cmp.mjs` comparan posiciones y capturas contra el sitio original.
