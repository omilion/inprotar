#!/usr/bin/env bash
# Publicación automática (se ejecuta en el VPS cada 2 minutos vía systemd).
# Si hay commits nuevos en GitHub (por ejemplo, cambios hechos por el cliente con el MCP),
# reconstruye la imagen y reemplaza el contenedor. Si la compilación falla, el sitio anterior sigue en línea.
set -euo pipefail
REPO=/opt/inprotar/repo
PUERTO="${PUERTO:-3100}"
LOG=/var/log/inprotar-sync.log
exec 9>/run/inprotar-sync.lock
flock -n 9 || exit 0

cd "$REPO"
git fetch -q origin main
ACTUAL="$(git rev-parse HEAD)"
NUEVO="$(git rev-parse origin/main)"
CORRIENDO="$(docker inspect -f '{{index .Config.Labels "inprotar.commit"}}' inprotar-web 2>/dev/null || true)"
[ "$NUEVO" = "$CORRIENDO" ] && exit 0

git reset -q --hard "$NUEVO"
V="${NUEVO:0:7}"
echo "$(date '+%F %T') compilando $V ($(git log -1 --format=%s))" >> "$LOG"
if ! docker build -q --label inprotar.commit="$NUEVO" -t inprotar-web:"$V" -t inprotar-web:latest "$REPO" >> "$LOG" 2>&1; then
  echo "$(date '+%F %T') ERROR: falló la compilación de $V; se mantiene la versión anterior" >> "$LOG"
  exit 1
fi
docker rm -f inprotar-web >/dev/null 2>&1 || true
docker run -d --name inprotar-web --restart unless-stopped --network web -p "$PUERTO":3000 --memory 768m \
  --label inprotar.commit="$NUEVO" inprotar-web:"$V" >/dev/null
sleep 5
CODIGO="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:"$PUERTO"/ || true)"
echo "$(date '+%F %T') publicado $V -> HTTP $CODIGO" >> "$LOG"
docker image prune -f >/dev/null
