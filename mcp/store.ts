/**
 * Almacenamiento del contenido para el MCP.
 * - GitHubStore: lee y escribe en el repositorio vía API. Cada operación del cliente es UN commit
 *   (atómico, aunque toque varios archivos), y Vercel publica el sitio automáticamente.
 * - LocalStore: trabaja sobre la carpeta del proyecto (desarrollo y pruebas).
 */
import fs from "node:fs";
import path from "node:path";

import { GitHubStore, type Store, type Cambio } from "./github-store";
export { GitHubStore, type Store, type Cambio } from "./github-store";

export class LocalStore implements Store {
  constructor(private root: string) {}
  async leer(ruta: string) {
    const f = path.join(this.root, ruta);
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
  }
  async listar(dir: string) {
    const d = path.join(this.root, dir);
    return fs.existsSync(d) ? fs.readdirSync(d).map((f) => `${dir}/${f}`) : [];
  }
  async commit(cambios: Cambio[], mensaje: string) {
    for (const c of cambios) {
      const f = path.join(this.root, c.ruta);
      if (c.contenido === null) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } else {
        fs.mkdirSync(path.dirname(f), { recursive: true });
        fs.writeFileSync(f, c.base64 ? Buffer.from(c.contenido, "base64") : c.contenido);
      }
    }
    return `local: ${mensaje}`;
  }
}

export function crearStore(): Store {
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH, INPROTAR_ROOT } = process.env;
  if (GITHUB_TOKEN && GITHUB_REPO) return new GitHubStore(GITHUB_REPO, GITHUB_TOKEN, GITHUB_BRANCH || "main");
  return new LocalStore(INPROTAR_ROOT || path.resolve(import.meta.dirname, ".."));
}
