export type Cambio = { ruta: string; contenido: string | null; base64?: boolean };

export interface Store {
  leer(ruta: string): Promise<string | null>;
  listar(dir: string): Promise<string[]>;
  commit(cambios: Cambio[], mensaje: string): Promise<string>;
  historial?(n: number): Promise<{ sha: string; mensaje: string; fecha: string }[]>;
}

export class GitHubStore implements Store {
  private api = "https://api.github.com";
  constructor(
    private repo: string, // "usuario/repo"
    private token: string,
    private branch = "main"
  ) {}

  private async gh(url: string, init: RequestInit = {}) {
    const r = await fetch(this.api + url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "inprotar-mcp",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.headers ?? {}),
      },
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
    return r.json();
  }

  async leer(ruta: string) {
    const j = await this.gh(`/repos/${this.repo}/contents/${encodeURI(ruta)}?ref=${this.branch}`);
    if (!j || Array.isArray(j)) return null;
    return Buffer.from(j.content, "base64").toString("utf8");
  }

  async listar(dir: string) {
    const j = await this.gh(`/repos/${this.repo}/contents/${encodeURI(dir)}?ref=${this.branch}`);
    return Array.isArray(j) ? j.map((f: { path: string }) => f.path) : [];
  }

  /** Commit atómico con varios archivos usando la API de árboles de Git. */
  async commit(cambios: Cambio[], mensaje: string) {
    const ref = await this.gh(`/repos/${this.repo}/git/ref/heads/${this.branch}`);
    const baseSha = ref.object.sha;
    const baseCommit = await this.gh(`/repos/${this.repo}/git/commits/${baseSha}`);
    const tree = [];
    for (const c of cambios) {
      if (c.contenido === null) {
        tree.push({ path: c.ruta, mode: "100644", type: "blob", sha: null });
      } else {
        const blob = await this.gh(`/repos/${this.repo}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: c.contenido, encoding: c.base64 ? "base64" : "utf-8" }),
        });
        tree.push({ path: c.ruta, mode: "100644", type: "blob", sha: blob.sha });
      }
    }
    const newTree = await this.gh(`/repos/${this.repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }),
    });
    const commit = await this.gh(`/repos/${this.repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message: mensaje, tree: newTree.sha, parents: [baseSha] }),
    });
    await this.gh(`/repos/${this.repo}/git/refs/heads/${this.branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha }),
    });
    return commit.sha as string;
  }

  async historial(n: number) {
    const j = await this.gh(`/repos/${this.repo}/commits?sha=${this.branch}&per_page=${n}`);
    return (j ?? []).map((c: { sha: string; commit: { message: string; author: { date: string } } }) => ({
      sha: c.sha.slice(0, 7),
      mensaje: c.commit.message,
      fecha: c.commit.author.date,
    }));
  }
}

