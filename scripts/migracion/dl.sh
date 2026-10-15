#!/bin/bash
# descarga las imágenes listadas (rutas /wp-content/...) que falten en public/
cd "C:/Users/flipe/OneDrive/Documentos/inprotar"
tr -d '\r' < "$1" | while IFS= read -r p || [ -n "$p" ]; do
  [ -z "$p" ] && continue
  f="public$p"; [ -f "$f" ] && continue
  mkdir -p "$(dirname "$f")"
  curl -sfL -A "Mozilla/5.0" "https://inprotar.cl$p" -o "$f" || echo "FAIL $p"
done
