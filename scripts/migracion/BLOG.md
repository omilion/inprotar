# Migración del blog

Migración de nueve artículos pendientes el 15 de octubre de 2026. Se conservan los dos artículos que ya estaban migrados.

Fuente: API pública de WordPress (`https://inprotar.cl/wp-json/wp/v2/posts?per_page=100`), HTML de cada página y API de medios.

## Artículos incorporados

- [guia-tecnica-de-conductores-electricos-industriales-inprotar](https://inprotar.cl/2025/05/06/guia-tecnica-de-conductores-electricos-industriales-inprotar/)
- [conductores-electricos-inprotar-conectando-eficiencia-energetica-y-durabilidad-industrial](https://inprotar.cl/2025/03/26/conductores-electricos-inprotar-conectando-eficiencia-energetica-y-durabilidad-industrial/)
- [kit-solar-sistema-fotovoltaico-hibrido](https://inprotar.cl/2025/03/25/kit-solar-sistema-fotovoltaico-hibrido/)
- [lighting-as-a-service-laas-iluminacion-inteligente-y-sustentable-al-alcance-de-todos](https://inprotar.cl/2025/03/24/lighting-as-a-service-laas-iluminacion-inteligente-y-sustentable-al-alcance-de-todos/)
- [iluminacion-profesional-en-horticultura-innovaciones-para-la-agricultura-vertical-en-chile](https://inprotar.cl/2024/08/27/iluminacion-profesional-en-horticultura-innovaciones-para-la-agricultura-vertical-en-chile/)
- [alumbrado-publico-solar-la-revolucion-en-la-iluminacion-vial-industrial-y-minera](https://inprotar.cl/2024/07/24/alumbrado-publico-solar-la-revolucion-en-la-iluminacion-vial-industrial-y-minera/)
- [interact-de-signify-el-futuro-del-control-de-iluminacion](https://inprotar.cl/2024/06/12/interact-de-signify-el-futuro-del-control-de-iluminacion/)
- [conoce-el-decreto-supremo-ds-1](https://inprotar.cl/2024/06/12/conoce-el-decreto-supremo-ds-1/)
- [innovacion-en-sistemas-de-iluminacion-para-naves-industriales-con-highbay-de-philips](https://inprotar.cl/2024/06/11/innovacion-en-sistemas-de-iluminacion-para-naves-industriales-con-highbay-de-philips/)

## Criterios

- Texto original convertido a Markdown, sin reescribir afirmaciones ni actualizar datos históricos.
- URLs, título SEO, descripción, fechas y JSON-LD tomados de las páginas originales.
- Encabezados H1 del cuerpo convertidos a H2 porque la plantilla ya muestra el H1 del artículo.
- Imágenes destacadas y del cuerpo conservadas bajo sus rutas originales en public/wp-content/uploads. Ocho archivos faltantes descargados; los demás ya existían.
- Enlaces a páginas migradas convertidos a rutas locales. Enlaces externos y a recursos todavía no migrados conservados con su URL original.
- Botones de contacto que abrían ventanas de Elementor ahora enlazan a /contacto/. El video de Interact se conserva mediante un enlace a YouTube.
- Unidad y marcas asignadas a las entidades existentes según el tema y las menciones del texto.

## Reproducción

`blog.py` convierte las copias de origen guardadas como JSON en esta carpeta (ignoradas por Git), sin sobrescribir artículos existentes. Requiere Python, beautifulsoup4 y markdownify. Los archivos finales versionados están en content/blog y public/wp-content/uploads.

Verificación: compilación Next.js, presencia de las once fichas y sus enlaces en Noticias/sitemap, cinco artículos recientes en portada y existencia local de todas las imágenes de los artículos incorporados.
