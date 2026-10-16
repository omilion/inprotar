"""Migra artículos pendientes desde las copias públicas de WordPress descargadas.

Requiere beautifulsoup4 y markdownify. Entradas (ignoradas por Git):
posts-original.json y <slug>-source.json con HTML de página y respuesta REST de media.
No sobrescribe artículos existentes. Produce imágenes-pendientes.json para descarga.
"""
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, unquote

from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).resolve().parent
posts = json.loads((SOURCE / "posts-original.json").read_text(encoding="utf-8"))
routes = {urlsplit(p["link"]).path for p in posts}
routes.update(json.loads(p.read_text(encoding="utf-8"))["ruta"] for p in (ROOT / "content/paginas").glob("*.json"))
routes.update(["/", "/noticias/", "/contacto/", "/tienda/", "/que-es-el-decreto-supremo-1/", "/decreto-supremo-uno-contaminacion-luminica-2024/"])
images = {}
report = []


def local_image(url):
    parsed = urlsplit(url)
    if parsed.hostname not in (None, "inprotar.cl", "www.inprotar.cl"):
        raise ValueError(f"Revisar imagen externa: {url}")
    path = unquote(parsed.path)
    if not path.startswith("/wp-content/uploads/") or ".." in path.split("/"):
        raise ValueError(f"Ruta de imagen inesperada: {url}")
    images[path] = "https://inprotar.cl" + parsed.path
    return path


for post in posts:
    dest = ROOT / "content/blog" / (post["slug"] + ".json")
    if dest.exists():
        continue
    source = json.loads((SOURCE / (post["slug"] + "-source.json")).read_text(encoding="utf-8"))
    page = BeautifulSoup(source["page"], "html.parser")
    body = BeautifulSoup(post["content"]["rendered"], "html.parser")
    for node in body.select("script, style, noscript"):
        node.decompose()
    # La plantilla ya genera el H1; conservar los encabezados del cuerpo como H2.
    for heading in body.find_all("h1"):
        heading.name = "h2"
    for image in body.find_all("img"):
        image["src"] = local_image(image.get("src") or image["data-src"])
    for link in body.find_all("a", href=True):
        if link["href"] == "#" and "Contacta" in link.get_text():
            link["href"] = "/contacto/"
        url = urlsplit(link["href"])
        if url.hostname in ("inprotar.cl", "www.inprotar.cl") and url.path in routes:
            link["href"] = url.path + ("?" + url.query if url.query else "") + ("#" + url.fragment if url.fragment else "")
    for widget in body.select("[data-settings]"):
        settings = json.loads(widget["data-settings"])
        video = settings.get("youtube_url") or settings.get("vimeo_url")
        if video:
            link = body.new_tag("a", href=video)
            link.string = "Ver video original"
            widget.append(link)
    for frame in body.find_all("iframe", src=True):
        link = body.new_tag("a", href=frame["src"])
        link.string = frame.get("title") or "Ver video original"
        frame.replace_with(link)
    md = markdownify(str(body), heading_style="ATX", bullets="-", strip=["div", "span"]).strip()
    md = re.sub(r"\n{3,}", "\n\n", md)

    def meta(key):
        tag = page.find("meta", attrs={"property": key}) or page.find("meta", attrs={"name": key})
        return tag.get("content") if tag else None

    media = source["media"]
    image = {"src": local_image(media["source_url"]), "alt": media.get("alt_text", "")}
    for key, field in [("width", "ancho"), ("height", "alto")]:
        if media["media_details"].get(key):
            image[field] = media["media_details"][key]
    title = BeautifulSoup(post["title"]["rendered"], "html.parser").get_text()
    seo = {
        "titulo": page.title.get_text() if page.title else title,
        "descripcion": meta("description") or BeautifulSoup(post["excerpt"]["rendered"], "html.parser").get_text(" ", strip=True),
        "imagen": {**image, "src": local_image(meta("og:image") or media["source_url"])},
        "publicado": meta("article:published_time") or post["date_gmt"] + "Z",
        "modificado": meta("article:modified_time") or post["modified_gmt"] + "Z",
    }
    schemas = [json.loads(tag.string or tag.get_text()) for tag in page.select('script[type="application/ld+json"]')]
    if len(schemas) == 1:
        seo["jsonld"] = schemas[0]
    elif schemas:
        seo["jsonld"] = {"@context": "https://schema.org", "@graph": schemas}
    conductores = "conductores-electricos" in post["slug"]
    data = {
        "ruta": urlsplit(post["link"]).path,
        "titulo": title,
        "fecha": seo["publicado"],
        "imagen": image,
        "unidad": "suministros" if conductores else "iluminacion",
        "marcas": ["inprotar-conductores"] if conductores else (["philips"] if re.search(r"philips|signify|sunstay|greenpower|interact", body.get_text(), re.I) else []),
        "cuerpo_md": md,
        "seo": seo,
    }
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report.append({"ruta": data["ruta"], "fuente": post["link"], "caracteres_markdown": len(md), "imagenes_cuerpo": len(body.find_all("img"))})

(SOURCE / "imagenes-pendientes.json").write_text(json.dumps(images, ensure_ascii=False, indent=2), encoding="utf-8")
(SOURCE / "blog-migrado.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Migrados: {len(report)}. Imágenes referenciadas: {len(images)}.")
