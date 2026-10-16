"""Convierte las respuestas públicas WooCommerce Store API en el catálogo local.

Entradas: products-original.json y categories-original.json en esta carpeta.
Requiere beautifulsoup4 y markdownify. No incluye carrito ni precios/stock en vivo.
"""
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
products = json.loads((HERE / "products-original.json").read_text(encoding="utf-8"))
categories = json.loads((HERE / "categories-original.json").read_text(encoding="utf-8"))
known = {urlsplit(p["permalink"]).path for p in products + categories}
known.update(json.loads(p.read_text(encoding="utf-8"))["ruta"] for p in (ROOT / "content/paginas").glob("*.json"))
images = {}


def image_url(src):
    u = urlsplit(src)
    if u.hostname not in (None, "inprotar.cl", "www.inprotar.cl"):
        raise ValueError(f"Revisar imagen externa: {src}")
    path = unquote(u.path)
    if not path.startswith("/wp-content/uploads/") or ".." in path.split("/"):
        raise ValueError(src)
    images[path] = "https://inprotar.cl" + u.path
    return path


def markdown(html):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.select("script,style,noscript"):
        tag.decompose()
    for tag in soup.find_all("h1"):
        tag.name = "h2"
    for tag in soup.find_all("a", href=True):
        url = urlsplit(tag["href"])
        if url.hostname in ("inprotar.cl", "www.inprotar.cl") and url.path in known:
            tag["href"] = url.path + ("#" + url.fragment if url.fragment else "")
    for tag in soup.find_all("img", src=True):
        tag["src"] = image_url(tag["src"])
    return markdownify(str(soup), heading_style="ATX", bullets="-").strip()


out = []
for p in products:
    imgs = [{"src": image_url(i["src"]), "alt": i["alt"] or p["name"]} for i in p["images"]]
    if not imgs:
        imgs = [{"src": image_url("/wp-content/uploads/woocommerce-placeholder-1024x1024.png"), "alt": "Imagen no disponible"}]
    out.append({
        "ruta": urlsplit(p["permalink"]).path,
        "nombre": p["name"],
        "sku": p["sku"],
        "resumen_md": markdown(p["short_description"]),
        "descripcion_md": markdown(p["description"]),
        "imagenes": imgs,
        "categorias": [urlsplit(c["link"]).path for c in p["categories"]],
        "atributos": [{"nombre": a["name"], "valores": [t["name"] for t in a["terms"]]} for a in p["attributes"]],
    })

# Mantener el orden del catálogo ya migrado.
order = []
for file in [ROOT / "src/app/tienda/page.tsx", ROOT / "src/app/tienda/page/2/page.tsx"]:
    order.extend(re.findall(r'"href": "(/producto/[^"]+)"', file.read_text(encoding="utf-8")))
if order:
    out.sort(key=lambda p: order.index(p["ruta"]) if p["ruta"] in order else len(order))
cats = [{"ruta": urlsplit(c["permalink"]).path, "nombre": c["name"], "descripcion_md": markdown(c["description"])} for c in categories]
dest = ROOT / "content/catalogo"
dest.mkdir(exist_ok=True)
for name, data in [("productos", out), ("categorias", cats)]:
    (dest / (name + ".json")).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "catalogo-imagenes.json").write_text(json.dumps(images, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Productos: {len(out)}; categorías: {len(cats)}; imágenes: {len(images)}")
