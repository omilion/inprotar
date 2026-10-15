# MCP de administración — inprotar.cl

Permite que el cliente edite su sitio conversando con Claude ("agrega una pregunta frecuente a Campanas LED",
"crea una página para la nueva luminaria X", "borra todo lo de la marca Y").

## Cómo funciona

```
Cliente ── Claude ── MCP inprotar-web ── GitHub (content/*.json) ── Vercel (publica en 1-2 min)
```

- Cada acción es **un commit** en GitHub: hay historial completo y cualquier cambio se puede revertir.
- Todo se **valida** contra `src/lib/content/schema.ts` antes de guardarse (si algo no es válido, no se guarda).
- **Páginas protegidas** (las mejor posicionadas en Google): no se modifican salvo pedido explícito.
- Las páginas de **diseño a medida** (Decreto Supremo 1, portada, noticias, tienda, contacto) son de solo lectura.
- Al **borrar** una página, artículo o marca se crea automáticamente una **redirección 301** hacia la página de su
  unidad de negocio, para no perder posicionamiento. Siempre se muestra un resumen y se pide confirmación antes.
- La página principal de cada unidad de negocio nunca se borra (es el destino de las redirecciones).

## Herramientas

| Herramienta | Qué hace |
|---|---|
| `guia_del_sitio` | Estructura, unidades, marcas, bloques disponibles y reglas de SEO |
| `listar_paginas` / `ver_pagina` | Consultar páginas (filtrar por unidad o marca) |
| `editar_pagina` / `editar_bloque` | Cambiar SEO, textos, imágenes, agregar/quitar/reordenar bloques |
| `crear_pagina` | Crear página nueva copiando la estructura de otra |
| `borrar_pagina` | Borrar con redirección 301 (pide confirmación) |
| `listar_marcas` / `crear_marca` / `borrar_marca` | Gestionar marcas; borrar elimina en cascada su contenido |
| `listar_articulos` / `ver_articulo` / `guardar_articulo` / `borrar_articulo` | Blog |
| `subir_imagen` | Sube imágenes (URL o base64) y devuelve la ruta |
| `historial_cambios` | Últimos cambios publicados |

## Instalación en Claude Desktop (cliente)

1. Crear un token de GitHub *fine-grained* con permiso **Contents: Read and write** solo sobre el repositorio del sitio.
2. En Claude Desktop → Configuración → Desarrollador → Editar configuración, agregar:

```json
{
  "mcpServers": {
    "inprotar-web": {
      "command": "npx",
      "args": ["-y", "tsx", "C:/ruta/al/proyecto/mcp/server.ts"],
      "env": {
        "GITHUB_TOKEN": "github_pat_xxx",
        "GITHUB_REPO": "usuario/inprotar-web",
        "GITHUB_BRANCH": "main"
      }
    }
  }
}
```

3. Reiniciar Claude Desktop. Aparecerá "inprotar-web" en las herramientas.

Sin `GITHUB_TOKEN` el MCP trabaja en **modo local** sobre la carpeta del proyecto (útil para desarrollo).

## Pruebas

```bash
node mcp/test-client.mjs <carpeta-con-copia-de-content>
```
