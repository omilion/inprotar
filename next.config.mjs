import fs from "node:fs";

/** Redirecciones 301 administradas desde content/redirecciones.json (las crea el MCP al borrar páginas). */
function redirecciones() {
  try {
    return JSON.parse(fs.readFileSync(new URL("./content/redirecciones.json", import.meta.url), "utf8"));
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantiene las URLs con barra final, igual que WordPress
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return redirecciones().map((r) => ({ source: r.desde, destination: r.hacia, permanent: true }));
  },
};

export default nextConfig;
