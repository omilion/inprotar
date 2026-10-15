"""Conversión de HTML (contenido de widgets Elementor) a JSX legible."""
import re
from bs4 import BeautifulSoup, NavigableString, Comment, Tag

SITE = "https://inprotar.cl"
TAG_MAP = {"lineargradient": "linearGradient", "radialgradient": "radialGradient", "clippath": "clipPath", "textpath": "textPath", "foreignobject": "foreignObject", "fegaussianblur": "feGaussianBlur"}
VOID = {"br", "img", "hr", "input", "source", "col", "wbr", "meta", "link"}
ATTR_MAP = {
    "class": None, "for": "htmlFor", "colspan": "colSpan", "rowspan": "rowSpan",
    "cellpadding": "cellPadding", "cellspacing": "cellSpacing", "tabindex": "tabIndex",
    "fill-rule": "fillRule", "clip-rule": "clipRule", "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "stroke-miterlimit": "strokeMiterlimit",
    "xlink:href": "xlinkHref", "viewbox": "viewBox", "preserveaspectratio": "preserveAspectRatio",
    "stop-color": "stopColor", "stop-opacity": "stopOpacity", "fill-opacity": "fillOpacity",
    "stroke-opacity": "strokeOpacity", "font-size": "fontSize", "font-family": "fontFamily",
    "text-anchor": "textAnchor", "gradientunits": "gradientUnits", "gradienttransform": "gradientTransform",
    "frameborder": "frameBorder", "allowfullscreen": "allowFullScreen", "referrerpolicy": "referrerPolicy",
}
KEEP = {"href", "src", "alt", "target", "rel", "title", "width", "height", "border", "colspan", "rowspan",
        "cellpadding", "cellspacing", "viewbox", "d", "fill", "stroke", "xmlns", "points", "cx", "cy", "r", "rx",
        "ry", "x", "y", "x1", "x2", "y1", "y2", "transform", "fill-rule", "clip-rule", "stroke-width", "opacity",
        "preserveaspectratio", "offset", "stop-color", "id", "style", "type", "name", "placeholder", "value",
        "loading", "allow", "allowfullscreen", "frameborder", "lang", "dir", "start", "stroke-linecap",
        "stroke-linejoin", "gradientunits", "gradienttransform", "xlink:href", "fill-opacity", "referrerpolicy"}


def cf_decode(hexstr):
    k = int(hexstr[:2], 16)
    return "".join(chr(int(hexstr[i:i + 2], 16) ^ k) for i in range(2, len(hexstr), 2))


def local_url(u):
    if not u:
        return u
    u = u.strip()
    if u.startswith("http://inprotar.cl"):
        u = "https://" + u[len("http://"):]
    if u.startswith(SITE + "/wp-content/") or u.startswith("/wp-content/"):
        return u.replace(SITE, "")
    if u.startswith(SITE):
        rest = u[len(SITE):] or "/"
        return rest
    return u


def css_to_obj(style):
    out = []
    for decl in style.split(";"):
        if ":" not in decl:
            continue
        k, v = decl.split(":", 1)
        k = k.strip()
        v = v.strip()
        if not k or not v:
            continue
        if k.startswith("--"):
            continue
        ck = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
        out.append(f"{ck}: {jstr(v)}")
    return "{{ " + ", ".join(out) + " }}" if out else None


def jstr(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'


def esc_text(t):
    # JSX: escapar llaves y signos < >
    t = t.replace("{", "\u0001").replace("}", "\u0002")
    t = t.replace("\u0001", "{'{'}").replace("\u0002", "{'}'}")
    t = t.replace("<", "{'<'}").replace(">", "{'>'}")
    return t


class Ctx:
    def __init__(self):
        self.images = set()


def to_jsx(html, ctx=None, indent="", keep_class=False):
    ctx = ctx or Ctx()
    soup = BeautifulSoup(html, "html.parser")
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    for t in soup.find_all(["script", "style", "noscript"]):
        t.decompose()
    # Emails ofuscados por Cloudflare
    for sp in soup.select("[data-cfemail]"):
        sp.replace_with(cf_decode(sp["data-cfemail"]))
    for a in soup.find_all("a", href=True):
        if "/cdn-cgi/l/email-protection" in a["href"]:
            h = a["href"].split("#", 1)
            a["href"] = "mailto:" + (cf_decode(h[1]) if len(h) > 1 else a.get_text())
    return render_children(soup, ctx, indent, keep_class)


def render_children(node, ctx, indent, keep_class):
    parts = []
    for ch in node.children:
        r = render(ch, ctx, indent, keep_class)
        if r is not None:
            parts.append(r)
    return "".join(parts)


def render(node, ctx, indent, keep_class):
    if isinstance(node, NavigableString):
        t = str(node)
        if not t:
            return None
        t = re.sub(r"[ \t\r\n]+", " ", t)
        return esc_text(t)
    if not isinstance(node, Tag):
        return None
    name = node.name.lower()
    if ":" in name:
        return None
    name = TAG_MAP.get(name, name)
    attrs = []
    for k, v in node.attrs.items():
        lk = k.lower()
        if isinstance(v, list):
            v = " ".join(v)
        if lk == "class":
            if name == "img" and "emoji" in v.split():
                attrs.append('className="emoji"')
                continue
            if keep_class and v:
                attrs.append(f'className={jstr(v)}')
            continue
        if lk not in KEEP and not lk.startswith("aria-"):
            continue
        if lk == "style":
            o = css_to_obj(v)
            if o:
                attrs.append(f"style={o}")
            continue
        if lk == "id" and name not in ("svg", "lineargradient", "radialgradient", "clippath", "mask", "a", "path", "g"):
            continue
        if lk in ("href", "src", "xlink:href"):
            v = local_url(v)
            if lk == "src" and v.startswith("/wp-content/"):
                ctx.images.add(v)
        key = ATTR_MAP.get(lk, lk)
        if key == "allowFullScreen":
            attrs.append("allowFullScreen")
            continue
        if key in ("cellSpacing", "cellPadding", "border", "colSpan", "rowSpan", "tabIndex") and str(v).strip().isdigit():
            attrs.append(f"{key}={{{int(v)}}}")
            continue
        attrs.append(f"{key}={jstr(v)}")
    a = (" " + " ".join(attrs)) if attrs else ""
    if name in VOID:
        return f"<{name}{a} />"
    inner = render_children(node, ctx, indent, keep_class)
    return f"<{name}{a}>{inner}</{name}>"
