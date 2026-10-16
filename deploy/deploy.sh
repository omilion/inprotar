#!/usr/bin/env bash
# Despliega la web en el VPS: empaqueta el commit actual, lo sube, construye la imagen y reinicia el contenedor.
# Uso: bash deploy/deploy.sh [root@169.58.111.162] [~/.ssh/chezz_contabo] [puerto]
set -euo pipefail
DESTINO="${1:-root@169.58.111.162}"
LLAVE="${2:-$HOME/.ssh/chezz_contabo}"
PUERTO="${3:-3100}"
VERSION="$(git rev-parse --short HEAD)"
PAQUETE="$(mktemp -d)/inprotar-${VERSION}.tgz"
SSH=(-i "$LLAVE" -o StrictHostKeyChecking=accept-new)

git archive --format=tar.gz -o "$PAQUETE" HEAD
scp "${SSH[@]}" "$PAQUETE" "$DESTINO:/tmp/inprotar-release.tgz"
ssh "${SSH[@]}" "$DESTINO" VERSION="$VERSION" PUERTO="$PUERTO" bash -s <<'REMOTO'
set -euo pipefail
rm -rf /opt/inprotar/src && mkdir -p /opt/inprotar/src
tar -xzf /tmp/inprotar-release.tgz -C /opt/inprotar/src
docker build -t inprotar-web:"$VERSION" -t inprotar-web:latest /opt/inprotar/src
docker rm -f inprotar-web 2>/dev/null || true
docker run -d --name inprotar-web --restart unless-stopped \
  --network web -p "$PUERTO":3000 --memory 768m inprotar-web:"$VERSION"
sleep 4
curl -fsS -o /dev/null -w "inprotar-web $VERSION -> HTTP %{http_code}\n" http://127.0.0.1:"$PUERTO"/
docker image prune -f --filter "label!=keep" >/dev/null
REMOTO
