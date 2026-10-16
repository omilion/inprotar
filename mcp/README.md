# MCP de administración — inprotar.cl

Permite que el cliente edite su sitio conversando con Claude ("agrega una pregunta frecuente a Campanas LED",
"crea una página para la nueva luminaria X", "borra todo lo de la marca Y").

## Cómo funciona

```
Cliente ── Claude ── HTTPS /mcp (Cloudflare Worker) ── GitHub ── hosting de la web
```

- Cada acción de escritura en modo GitHub es **un commit**: hay historial y se puede revertir.
- La publicación requiere conectar el hosting de la web al repositorio y a la rama configurados. Un commit exitoso no garantiza que el despliegue haya terminado.
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

## Artículos individuales (single post)

`guardar_articulo` crea o actualiza artículos; `ver_articulo` devuelve sus campos. Para editar, enviar `ruta` y los campos a cambiar: se conservan los demás. `guia_del_sitio` incluye el esquema completo. Campos: `ruta`, `titulo`, `fecha` ISO, `imagen` (src, alt, ancho/alto y pie opcionales), `unidad`, `marcas`, `cuerpo_md`, `seo` y `resumen` opcional de hasta 400 caracteres.

La ficha individual se genera en `src/app/[...slug]/page.tsx` con título, fecha, imagen, resumen y cuerpo. Noticias muestra todos los artículos de `content/blog/`; la portada muestra los cinco más recientes. Si no hay resumen, las tarjetas usan la descripción SEO. El sitemap también se actualiza. Los cambios se reflejan cuando termina el despliegue de la web.

Para crear, usar `/AAAA/MM/DD/slug/` con la misma fecha de publicación y una unidad y marcas existentes. Subir la imagen antes de usar su ruta. No reutilizar un slug bajo otra fecha ni una URL redirigida. Para editar, conservar la URL original. `borrar_articulo` pide confirmación y registra una redirección. No hay borradores ni publicación programada: todos los artículos guardados se publican en el siguiente despliegue.

Hay once artículos migrados desde WordPress, incluidos los ocho que faltaban en la lista de Noticias y un artículo anterior sobre Highbay de Philips. Todos se administran con las mismas herramientas MCP. Ver `scripts/migracion/BLOG.md` para la procedencia y verificación de la migración.

## Alojamiento remoto recomendado: Cloudflare Workers Free

El cliente conecta Claude mediante una URL; no necesita Node, una copia del proyecto ni el token de GitHub en su computador. El Worker es independiente del alojamiento de la web Next.js y no aloja la web completa.

Se usa MCP Streamable HTTP sin sesiones persistentes, sin base de datos ni almacenamiento local. Cada solicitud está protegida por `Authorization: Bearer ...`. Las herramientas y validaciones son las mismas del modo local.

Cloudflare ofrece un plan Workers Free con 100.000 solicitudes al día, 10 ms de CPU por solicitud y límites de subsolicitudes. El tiempo esperando GitHub no es CPU. Operaciones grandes, listados extensos o imágenes pueden superar límites: revisar métricas con contenido real antes de entregarlo al cliente. Mantener la cuenta en Workers Free; este proyecto no habilita un plan de pago. No se garantiza capacidad ilimitada ni gratuidad de servicios externos.

Vercel Hobby restringe su uso a proyectos personales no comerciales, por eso no se recomienda para INPROTAR. El alojamiento de la web se contrata/configura por separado; desplegar este MCP no cambia su hosting.

### Preparación y despliegue (administrador, una sola vez)

Desde la raíz del repositorio, con Node.js 22 o superior:

```bash
npm ci
npx wrangler login
npm run mcp:deploy
```

Wrangler publica `mcp/worker.ts`, no toda la aplicación Next.js, e informa una dirección similar a `https://inprotar-mcp.TU-SUBDOMINIO.workers.dev`. No requiere comprar dominio. El servicio devuelve 503 hasta configurar todos los secretos.

Crear un token GitHub fine-grained limitado al repositorio del sitio con **Contents: Read and write**. Configurar los siguientes valores; cada comando pide el valor de forma interactiva:

```bash
npx wrangler secret put GITHUB_TOKEN --config mcp/wrangler.jsonc
npx wrangler secret put GITHUB_REPO --config mcp/wrangler.jsonc
npx wrangler secret put MCP_ACCESS_TOKEN --config mcp/wrangler.jsonc
```

- `GITHUB_TOKEN`: token GitHub del administrador.
- `GITHUB_REPO`: `propietario/repositorio`, sin URL.
- `MCP_ACCESS_TOKEN`: clave aleatoria independiente de GitHub, de al menos 32 caracteres. Generar una con un gestor de contraseñas; compartirla solamente con quienes administran el sitio.
- `GITHUB_BRANCH`: por defecto `main`, editable en `mcp/wrangler.jsonc`. La rama debe existir y admitir commits del token. Para ensayar, apuntar primero a una rama de pruebas.

El token GitHub permanece en Cloudflare. La clave MCP da acceso a todas las herramientas del sitio: este despliegue está pensado para un administrador o equipo de confianza, sin permisos individuales por usuario. Para revocar el acceso, reemplazar `MCP_ACCESS_TOKEN` y actualizar el conector.

### Conectar Claude

1. Ir a **Configuración → Conectores → Agregar conector personalizado**.
2. Nombre: `INPROTAR`. URL: `https://inprotar-mcp.TU-SUBDOMINIO.workers.dev/mcp` (usar la URL real que entrega Wrangler).
3. En la configuración de autenticación / **Request headers**, agregar `Authorization` con el valor `Bearer TU_MCP_ACCESS_TOKEN`. Es una credencial fija, no OAuth. No usar el token GitHub aquí ni poner claves en la URL.
4. Conectar y probar: «Lista las páginas de INPROTAR», sin modificar contenido.

Claude admite credenciales fijas mediante encabezados para conectores remotos. Si la interfaz de tu cuenta no muestra Request headers, revisar la documentación oficial enlazada; este servidor no implementa OAuth y no debe dejarse público sin autenticación.

Abrir la URL en un navegador no es una prueba del protocolo: sin clave responde 401, y un GET autorizado responde 405. Claude usa POST con el protocolo MCP.

### Desarrollo y pruebas

```bash
npm run mcp:test
npx tsc --noEmit
npx wrangler deploy --config mcp/wrangler.jsonc --dry-run
```

Las pruebas HTTP usan el cliente MCP oficial y un almacenamiento simulado: comprueban autenticación, configuración incompleta, origen, métodos, inicialización, listado y lectura. No escriben en GitHub.

Para ejecutar el Worker localmente, crear `mcp/.dev.vars` (ignorado por Git):

```dotenv
GITHUB_TOKEN=token_de_un_repositorio_de_pruebas
GITHUB_REPO=propietario/repositorio-de-pruebas
MCP_ACCESS_TOKEN=clave_de_prueba_de_al_menos_32_caracteres
```

Ejecutar `npm run mcp:dev`. Este modo HTTP también usa GitHub; **las escrituras son reales** en el repositorio configurado. El modo de archivos locales descrito abajo es independiente.

## Alternativa: conexión local por stdio

Para desarrollo o instalación local en Claude Desktop, conservar la configuración de `mcpServers`, apuntando al nuevo punto de entrada `mcp/stdio.ts`:

```json
{
  "mcpServers": {
    "inprotar-web": {
      "command": "npx",
      "args": ["tsx", "C:/ruta/al/proyecto/mcp/stdio.ts"],
      "env": {
        "GITHUB_TOKEN": "github_pat_xxx",
        "GITHUB_REPO": "usuario/inprotar-web",
        "GITHUB_BRANCH": "main"
      }
    }
  }
}
```

Instalar primero las dependencias en el proyecto. También se puede iniciar desde su raíz con `npm run mcp`. Sin ambas variables `GITHUB_TOKEN` y `GITHUB_REPO`, el modo stdio trabaja sobre archivos locales; `INPROTAR_ROOT` permite elegir una copia de prueba. El servidor remoto **nunca** recurre a archivos locales cuando faltan credenciales.

Prueba original de edición/borrado, únicamente sobre una copia desechable del contenido y sin credenciales GitHub en el entorno:

```bash
node mcp/test-client.mjs <carpeta-con-copia-de-content>
```

## Referencias

- [Conectores remotos y Request headers en Claude](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [Límites de Cloudflare Workers](https://developers.cloudflare.com/workers/platform/limits/)
- [Precios de Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/)
- [Restricciones de Vercel Hobby](https://vercel.com/docs/plans/hobby)
