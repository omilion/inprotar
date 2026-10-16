# Catálogo y rutas del menú

El 15 de octubre de 2026 se recuperaron 21 productos y 20 categorías, incluidas las vacías, desde las APIs públicas del sitio original:

- https://inprotar.cl/wp-json/wc/store/v1/products?per_page=100
- https://inprotar.cl/wp-json/wc/store/v1/products/categories?per_page=100&hide_empty=false

`catalogo.py` convierte esas respuestas en `content/catalogo/productos.json` y `categorias.json`. Conserva las URLs, nombres, descripciones, imágenes, categorías y atributos. Las imágenes faltantes se descargaron a sus rutas originales en `public/wp-content/uploads`.

Las rutas `/categoria-producto/[...slug]/` y `/producto/[slug]/` generan las páginas del catálogo. Se incluyen categorías anidadas y categorías vacías; estas últimas muestran un mensaje y acceso a contacto. Tienda y su segunda página leen los mismos productos. El sitemap incluye todas las rutas nuevas.

Las fichas ofrecen cotización por WhatsApp. No se implementan carrito, pagos ni sincronización de precios o inventario de WooCommerce. Los metadatos de las páginas nuevas se generan a partir del nombre y la URL del catálogo; no se han copiado las etiquetas SEO completas de cada página original.

Estos archivos de catálogo aún no tienen herramientas de edición específicas en el MCP; las herramientas de páginas y artículos no los modifican.

Verificación después de compilar: `npm run check:navigation`. Para verificar también respuestas HTTP del servidor local, definir `NAV_CHECK_BASE_URL=http://localhost:3000` al ejecutar la comprobación.
