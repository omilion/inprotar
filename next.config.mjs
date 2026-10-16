import fs from "node:fs";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

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
  // Servidor autónomo para Docker (copia mínima de node_modules)
  output: "standalone",
  // Mantiene las URLs con barra final, igual que WordPress
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return redirecciones().map((r) => ({ source: r.desde, destination: r.hacia, permanent: true }));
  },
};

// Evita que next dev sobrescriba los manifiestos usados por next build/start.
export default (phase) => ({
  ...nextConfig,
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
});
