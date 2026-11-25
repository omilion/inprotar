#!/usr/bin/env bash
# Publicación automática de inprotar.cl (se ejecuta en el VPS vía systemd).
# - Si solo cambió contenido (content/ o imágenes en public/wp-content/uploads/, sin redirecciones.json):
#   actualiza los archivos montados por volumen y llama a /api/revalidate (< 1 segundo, sin docker build).
# - Si cambió código, dependencias o redirecciones.json:
#   reconstruye la imagen Docker y reemplaza únicamente el contenedor inprotar-web.
set -euo pipefail
REPO=/opt/inprotar/repo
WEB_ENV=/opt/inprotar/web.env
PUERTO="${PUERTO:-3100}"
LOG=/var/log/inprotar-sync.log
exec 9>/run/inprotar-sync.lock
flock -n 9 || exit 0

if [ ! -f "$WEB_ENV" ]; then
  umask 077
  printf 'REVALIDATE_SECRET=%s\n' "$(openssl rand -hex 24)" > "$WEB_ENV"
fi
REVALIDATE_SECRET="$(grep '^REVALIDATE_SECRET=' "$WEB_ENV" | cut -d= -f2-)"

cd "$REPO"
git fetch -q origin main
ACTUAL="$(git rev-parse HEAD)"
NUEVO="$(git rev-parse origin/main)"
LIVE="$(docker inspect -f '{{index .Config.Labels "inprotar.live"}}' inprotar-web 2>/dev/null || true)"
ESTADO="$(docker inspect -f '{{.State.Running}}' inprotar-web 2>/dev/null || true)"

# Si ya estamos en el último commit y el contenedor live está corriendo, no hacer nada.
if [ "$ACTUAL" = "$NUEVO" ] && [ "$LIVE" = "1" ] && [ "$ESTADO" = "true" ]; then
  exit 0
fi

V="${NUEVO:0:7}"

# Camino rápido: contenedor live corriendo y el diff solo toca contenido o imágenes subidas.
SOLO_CONTENIDO=0
if [ "$LIVE" = "1" ] && [ "$ESTADO" = "true" ] && [ "$ACTUAL" != "$NUEVO" ]; then
  CAMBIOS="$(git diff --name-only "$ACTUAL" "$NUEVO")"
  if [ -n "$CAMBIOS" ]; then
    SOLO_CONTENIDO=1
    while IFS= read -r f; do
      case "$f" in
        content/redirecciones.json) SOLO_CONTENIDO=0; break ;;
        content/*|public/wp-content/uploads/*) ;;
        *) SOLO_CONTENIDO=0; break ;;
      esac
    done <<< "$CAMBIOS"
  fi
fi

if [ "$SOLO_CONTENIDO" = "1" ]; then
  git reset -q --hard "$NUEVO"
  CODIGO="$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    -H "Authorization: Bearer ${REVALIDATE_SECRET}" \
    "http://127.0.0.1:${PUERTO}/api/revalidate/" || true)"
  echo "$(date '+%F %T') contenido actualizado en vivo $V ($(git log -1 --format=%s)) -> revalidate HTTP $CODIGO" >> "$LOG"
  exit 0
fi

# Camino completo: reconstruir imagen Docker (solo para cambios de código o primera migración a live).
git reset -q --hard "$NUEVO"
echo "$(date '+%F %T') compilando $V ($(git log -1 --format=%s))" >> "$LOG"
if ! docker build -q --label inprotar.commit="$NUEVO" --label inprotar.live=1 -t inprotar-web:"$V" -t inprotar-web:latest "$REPO" >> "$LOG" 2>&1; then
  echo "$(date '+%F %T') ERROR: falló la compilación de $V; se mantiene la versión anterior" >> "$LOG"
  exit 1
fi
docker rm -f inprotar-web >/dev/null 2>&1 || true
docker run -d --name inprotar-web --restart unless-stopped \
  --network web -p 127.0.0.1:"$PUERTO":3000 --memory 768m \
  --env-file "$WEB_ENV" \
  -v "${REPO}/content:/app/content:ro" \
  -v "${REPO}/public/wp-content/uploads:/app/public/wp-content/uploads:ro" \
  --label inprotar.commit="$NUEVO" --label inprotar.live=1 \
  inprotar-web:"$V" >/dev/null
sleep 5
CODIGO="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PUERTO}/" || true)"
echo "$(date '+%F %T') publicado $V (live=1) -> HTTP $CODIGO" >> "$LOG"
docker image prune -f >/dev/null
