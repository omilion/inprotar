"""Genera page.tsx + page.module.css a partir de la extracción ex2 (escritorio + móvil)."""
import json, re, sys, os, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from htmljsx import to_jsx, local_url, Ctx, jstr

PROJECT = "C:/Users/flipe/OneDrive/Documentos/inprotar"

FONT = {"Roboto": "var(--font-roboto), sans-serif", "Lato": "var(--font-lato), sans-serif",
        "Roboto Slab": "var(--font-roboto-slab), serif", "Rufina": "var(--font-rufina), serif",
        "Montserrat": "var(--font-montserrat), sans-serif", "Poppins": "var(--font-poppins), sans-serif"}
SYSTEM = "-apple-system"


def font(ff):
    first = ff.split(",")[0].strip().strip('"')
    if first in FONT:
        return FONT[first]
    if first.startswith(SYSTEM):
        return None  # hereda la fuente del sistema del body
    return ff


def weight(ff, w):
    first = ff.split(",")[0].strip().strip('"')
    if first == "Lato":
        return {"500": "700", "600": "700", "800": "900", "200": "300", "100": "300"}.get(w, w)
    return w


def px(v):
    try:
        return float(str(v).replace("px", ""))
    except ValueError:
        return None


def nz(v):
    return v not in (None, "", "0px", "none", "normal", "auto", "rgba(0, 0, 0, 0)", "0px 0px")


def bg_url(v):
    def rep(m):
        u = m.group(1).strip("\"'")
        lu = local_url(u)
        if lu.startswith("/wp-content/"):
            IMAGES.add(lu)
        return f'url("{lu}")'
    return re.sub(r'url\(([^)]*)\)', rep, v)


IMAGES = set()
TODO = []


def box4(css, pre):
    vals = [css[pre + s] for s in ("Top", "Right", "Bottom", "Left")]
    if all(v == "0px" for v in vals):
        return None
    if len(set(vals)) == 1:
        return vals[0]
    if vals[0] == vals[2] and vals[1] == vals[3]:
        return f"{vals[0]} {vals[1]}"
    return " ".join(vals)


class Gen:
    def __init__(self, name, data):
        self.name = name
        self.d = data["desktop"]
        self.m = data["mobile"]
        self.mobile_index = {}
        self.index(self.m["ch"])
        self.rules = []      # (selector, decls)
        self.mrules = []     # mobile
        self.ctx = Ctx()
        self.uses = set()

    def index(self, nodes):
        for n in nodes:
            self.mobile_index[n["id"]] = n
            if n["k"] == "con":
                self.index(n["ch"])

    def cls(self, n):
        return ("c_" if n["k"] == "con" else "w_") + n["id"]

    def add(self, sel, decls, mobile=False):
        decls = [d for d in decls if d]
        if decls:
            (self.mrules if mobile else self.rules).append((sel, decls))

    # ---------- utilidades de estilo ----------
    def con_layout(self, css, inner=None):
        src = inner if inner else css
        o = ["display: flex"]
        o.append(f"flex-direction: {src['flexDirection']}")
        if src["flexWrap"] != "nowrap":
            o.append(f"flex-wrap: {src['flexWrap']}")
        if src["justifyContent"] not in ("normal", "flex-start"):
            o.append(f"justify-content: {src['justifyContent']}")
        if src["alignItems"] not in ("normal", "stretch"):
            o.append(f"align-items: {src['alignItems']}")
        if src["rowGap"] != "normal" and src["rowGap"] != "0px" or src["columnGap"] not in ("normal", "0px"):
            rg = src["rowGap"] if src["rowGap"] != "normal" else "0px"
            cg = src["columnGap"] if src["columnGap"] != "normal" else "0px"
            o.append(f"gap: {rg if rg == cg else rg + ' ' + cg}")
        return o

    def deco(self, css, is_text=False):
        o = []
        if nz(css.get("backgroundColor")):
            o.append(f"background-color: {css['backgroundColor']}")
        if nz(css.get("backgroundImage")):
            o.append(f"background-image: {bg_url(css['backgroundImage'])}")
            if css["backgroundSize"] not in ("auto", "auto auto"):
                o.append(f"background-size: {css['backgroundSize']}")
            if css["backgroundPosition"] not in ("0% 0%",):
                o.append(f"background-position: {css['backgroundPosition']}")
            if css["backgroundRepeat"] != "repeat":
                o.append(f"background-repeat: {css['backgroundRepeat']}")
        for side in ("Top", "Right", "Bottom", "Left"):
            w = css.get(f"border{side}Width")
            st = css.get(f"border{side}Style")
            if w and w != "0px" and st and st != "none":
                o.append(f"border-{side.lower()}: {w} {st} {css[f'border{side}Color']}")
        if nz(css.get("borderRadius")) and css["borderRadius"] != "0px":
            o.append(f"border-radius: {css['borderRadius']}")
        if nz(css.get("boxShadow")):
            o.append(f"box-shadow: {css['boxShadow']}")
        if css.get("overflow") not in (None, "visible"):
            o.append(f"overflow: {css['overflow']}")
        return o

    def spacing(self, css, margin=True, padding=True):
        o = []
        if padding:
            p = box4(css, "padding")
            if p:
                o.append(f"padding: {p}")
        if margin:
            mm = box4(css, "margin")
            if mm:
                o.append(f"margin: {mm}")
        return o

    def position(self, css):
        o = []
        if css["position"] in ("absolute", "fixed"):
            o.append(f"position: {css['position']}")
            for k in ("top", "left", "right", "bottom"):
                if css[k] != "auto":
                    o.append(f"{k}: {css[k]}")
        if css.get("zIndex") not in (None, "auto"):
            o.append(f"z-index: {css['zIndex']}")
        return o

    def width_rule(self, n, parent, mob=False):
        """Ancho relativo al contenedor padre (solo si difiere del ancho completo)."""
        if parent is None:
            return []
        box = n["box"]
        pbox = parent.get("_content")
        if not pbox or box[2] == 0:
            return []
        pw = pbox
        w = box[2]
        direction = parent["_dir"]
        if direction.startswith("row"):
            pct = round(w / pw * 100, 3)
            return [f"width: {pct}%", "max-width: 100%"] if pct < 99.9 else ["width: 100%"]
        # columna con alineación centrada/izquierda: los hijos se encogen a su contenido -> ancho fijo
        if parent.get("_align") not in (None, "normal", "stretch"):
            if n["k"] == "w" and n.get("t") in ("heading", "text-editor", "button", "bdt-advanced-button", "theme-archive-title"):
                return ["max-width: 100%"]
            if w < pw - 1.5:
                return [f"width: {w}px", "max-width: 100%"]
            return ["width: 100%"]
        if w < pw - 1.5:
            pct = round(w / pw * 100, 3)
            return [f"width: {pct}%"]
        return ["width: 100%"] if n["k"] == "con" else []

    def text_css(self, t, mob_t=None):
        o = []
        f = font(t["fontFamily"])
        if f:
            o.append(f"font-family: {f}")
        o.append(f"font-size: {t['fontSize']}")
        o.append(f"font-weight: {weight(t['fontFamily'], t['fontWeight'])}")
        if t["fontStyle"] != "normal":
            o.append(f"font-style: {t['fontStyle']}")
        o.append(f"line-height: {t['lineHeight'] if t['lineHeight'] != 'normal' else 'normal'}")
        o.append(f"color: {t['color']}")
        if t["letterSpacing"] not in ("normal", "0px"):
            o.append(f"letter-spacing: {t['letterSpacing']}")
        if t["textTransform"] != "none":
            o.append(f"text-transform: {t['textTransform']}")
        if t["textAlign"] not in ("start", "left"):
            o.append(f"text-align: {t['textAlign']}")
        if t.get("textShadow") not in (None, "none"):
            o.append(f"text-shadow: {t['textShadow']}")
        if t.get("textDecorationLine") not in (None, "none"):
            o.append(f"text-decoration: {t['textDecorationLine']}")
        return o

    def mobile_diff(self, sel, dcss, mcss, keys):
        out = []
        for k in keys:
            if k not in dcss or k not in mcss:
                continue
            if dcss[k] != mcss[k]:
                ck = re.sub(r"([A-Z])", lambda m: "-" + m.group(1).lower(), k)
                v = mcss[k]
                if k == "fontFamily":
                    v = font(v) or "inherit"
                if k == "backgroundImage":
                    v = bg_url(v)
                out.append(f"{ck}: {v}")
        self.add(sel, out, mobile=True)

    # ---------- render ----------
    def render_nodes(self, nodes, parent, ind):
        out = "\n".join(self.render(n, parent, ind) for n in nodes)
        if parent is None and nodes:
            # el header es absoluto: el primer bloque se ubica en la misma Y que en el original
            first = nodes[0]
            self.add("." + self.cls(first), [f"margin-top: {first['box'][1]}px"])
            mf = self.mobile_index.get(first["id"])
            if mf:
                self.add("." + self.cls(first), [f"margin-top: {mf['box'][1]}px"], mobile=True)
        return out

    def vis_classes(self, n):
        c = []
        for x in n.get("cls", []):
            if x.startswith("elementor-hidden-"):
                c.append("hidden-" + x.split("-")[-1])
        return c

    def render(self, n, parent, ind):
        if n["k"] == "con":
            return self.render_con(n, parent, ind)
        return self.render_widget(n, parent, ind)

    def classname(self, n, extra=()):
        c = [f"s.{self.cls(n)}"] + [jstr(x) for x in extra]
        vc = self.vis_classes(n)
        if len(c) == 1 and not vc:
            return f"className={{s.{self.cls(n)}}}"
        parts = [f"${{s.{self.cls(n)}}}"] + list(extra) + vc
        return "className={`" + " ".join(parts) + "`}"

    def render_con(self, n, parent, ind):
        css = n["css"]
        sel = "." + self.cls(n)
        boxed = "inner" in n and n.get("inner")
        decls = []
        decls += self.width_rule(n, parent)
        if not boxed:
            decls += self.con_layout(css)
        else:
            decls += ["display: flex", "flex-direction: column"]
        decls += self.spacing(css)
        if nz(css["minHeight"]) and css["minHeight"] != "0px":
            decls.append(f"min-height: {css['minHeight']}")
        if css["alignSelf"] not in ("auto", "normal", "stretch"):
            decls.append(f"align-self: {css['alignSelf']}")
        if css["flexGrow"] != "0":
            decls.append(f"flex-grow: {css['flexGrow']}")
        if css["flexShrink"] != "1":
            decls.append(f"flex-shrink: {css['flexShrink']}")
        if css.get("order") not in (None, "0"):
            decls.append(f"order: {css['order']}")
        decls += self.deco(css)
        layer = n.get("layer")
        if layer and nz(layer.get("backgroundImage")):
            decls.append(f"background-image: {bg_url(layer['backgroundImage'])}")
            decls.append(f"background-size: {layer['backgroundSize'] if layer['backgroundSize'] not in ('auto','auto auto') else 'cover'}")
            decls.append(f"background-position: {layer['backgroundPosition']}")
            if layer["backgroundRepeat"] != "repeat":
                decls.append(f"background-repeat: {layer['backgroundRepeat']}")
        if layer and nz(layer.get("backgroundColor")) and not nz(css.get("backgroundColor")):
            decls.append(f"background-color: {layer['backgroundColor']}")
        decls += self.position(css)
        overlay = None
        bf = n.get("before") or n.get("layerBefore")
        if bf and (nz(bf.get("backgroundColor")) or nz(bf.get("backgroundImage"))) and bf.get("opacity", "1") != "0":
            overlay = bf
        has_shapes = bool(n.get("shapes"))
        if (overlay or has_shapes) and css["position"] not in ("absolute", "fixed"):
            decls.append("position: relative")
        if parent and parent.get("_overlay") and css["position"] not in ("absolute", "fixed"):
            if "position: relative" not in decls:
                decls.append("position: relative")
        self.add(sel, decls)
        if overlay:
            od = ['content: ""', "position: absolute", "inset: 0"]
            if nz(overlay.get("backgroundColor")):
                od.append(f"background-color: {overlay['backgroundColor']}")
            if nz(overlay.get("backgroundImage")):
                od.append(f"background-image: {bg_url(overlay['backgroundImage'])}")
            if overlay.get("opacity", "1") != "1":
                od.append(f"opacity: {overlay['opacity']}")
            if overlay.get("mixBlendMode", "normal") != "normal":
                od.append(f"mix-blend-mode: {overlay['mixBlendMode']}")
            self.add(sel + "::before", od)
        # móvil
        mn = self.mobile_index.get(n["id"])
        if mn:
            mcss = mn["css"]
            src_d = n["inner"]["css"] if boxed else css
            src_m = (mn.get("inner") or {}).get("css") if boxed else mcss
            keys = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft",
                    "minHeight", "backgroundPosition", "backgroundSize", "alignSelf", "order", "top", "left", "right", "bottom", "position"]
            self.mobile_diff(sel, css, mcss, keys)
            if not boxed:
                self.mobile_diff(sel, css, mcss, ["flexDirection", "flexWrap", "justifyContent", "alignItems", "rowGap", "columnGap"])
            if mn.get("layer") and layer and mn["layer"]["backgroundPosition"] != layer["backgroundPosition"]:
                self.add(sel, [f"background-position: {mn['layer']['backgroundPosition']}"], mobile=True)
            # anchos en móvil
            mp = self.mobile_index.get(parent["id"]) if parent and parent.get("id") else None
            if parent and mp is not None and mn["box"][2] > 0:
                mcontent = mp.get("_content_m")
                if mcontent:
                    pct = round(mn["box"][2] / mcontent * 100, 3)
                    self.add(sel, [f"width: {min(pct, 100)}%"], mobile=True)
        # hijos
        me = {"id": n["id"], "_overlay": bool(overlay)}
        tag = "a" if n.get("href") else ("section" if parent is None else "div")
        href = f' href={jstr(local_url(n["href"]))}' if n.get("href") else ""
        if boxed:
            ic = n["inner"]["css"]
            isel = sel + "_in"
            idecl = ["width: 100%"]
            if nz(ic["maxWidth"]):
                idecl.append(f"max-width: {ic['maxWidth']}")
            idecl.append("margin: 0 auto")
            idecl += self.con_layout(ic)
            p = box4(ic, "padding")
            if p:
                idecl.append(f"padding: {p}")
            if overlay or has_shapes:
                idecl += ["position: relative", "z-index: 2"]
            if ic.get("flexGrow") != "0" or nz(css["minHeight"]):
                idecl.append("flex-grow: 1")
            self.add("." + self.cls(n) + "_in", idecl)
            if mn and mn.get("inner"):
                mic = mn["inner"]["css"]
                self.mobile_diff("." + self.cls(n) + "_in", ic, mic, ["flexDirection", "flexWrap", "justifyContent", "alignItems", "rowGap", "columnGap", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "maxWidth"])
            ib = n["inner"]["box"]
            me["_content"] = ib[2] - (px(ic["paddingLeft"]) or 0) - (px(ic["paddingRight"]) or 0)
            me["_dir"] = ic["flexDirection"]
            me["_align"] = ic["alignItems"]
            if mn and mn.get("inner"):
                mic = mn["inner"]["css"]
                mn["_content_m"] = mn["inner"]["box"][2] - (px(mic["paddingLeft"]) or 0) - (px(mic["paddingRight"]) or 0)
            children = self.render_nodes(n["ch"], me, ind + "    ")
            shapes = self.render_shapes(n, ind + "  ")
            inner = f"{ind}  <div className={{s.{self.cls(n)}_in}}>\n{children}\n{ind}  </div>"
            body = (shapes + "\n" if shapes else "") + inner
        else:
            b = n["box"]
            me["_content"] = b[2] - (px(css["paddingLeft"]) or 0) - (px(css["paddingRight"]) or 0) - (px(css["borderLeftWidth"]) or 0) - (px(css["borderRightWidth"]) or 0)
            me["_dir"] = css["flexDirection"]
            me["_align"] = css["alignItems"]
            if mn:
                mc = mn["css"]
                mn["_content_m"] = mn["box"][2] - (px(mc["paddingLeft"]) or 0) - (px(mc["paddingRight"]) or 0) - (px(mc["borderLeftWidth"]) or 0) - (px(mc["borderRightWidth"]) or 0)
            children = self.render_nodes(n["ch"], me, ind + "  ")
            shapes = self.render_shapes(n, ind + "  ")
            body = (shapes + "\n" if shapes else "") + children
        return f"{ind}<{tag} {self.classname(n)}{href}>\n{body}\n{ind}</{tag}>"

    def render_shapes(self, n, ind):
        out = []
        for i, sh in enumerate(n.get("shapes", [])):
            svg = sh["html"]
            if not svg:
                continue
            ssel = f".{self.cls(n)}_shape{i}"
            d = ["position: absolute", "left: 0", "width: 100%", "overflow: hidden", "line-height: 0", "direction: ltr", "pointer-events: none", "z-index: 1"]
            d += ["bottom: -1px", "transform: rotate(180deg)"] if sh["pos"] == "bottom" else ["top: -1px"]
            self.add(ssel, d)
            sd = ["display: block", f"width: {sh['w']}", f"height: {sh['h']}", "position: relative", "left: 50%", f"transform: {sh['tr'] if sh['tr'] != 'none' else 'translateX(-50%)'}"]
            # usar ancho relativo: calcular % sobre el ancho del contenedor
            cw = n["box"][2]
            wpx = px(sh["w"])
            if wpx and cw:
                sd[1] = f"width: calc({round(wpx / cw * 100, 2)}% + 0px)"
            self.add(ssel + " svg", sd)
            self.add(ssel + " path", [f"fill: {sh['fill']}"])
            self.add(ssel + " svg", [], )
            jsx = to_jsx(svg, self.ctx)
            out.append(f'{ind}<div className={{s.{self.cls(n)}_shape{i}}} aria-hidden="true">{jsx}</div>')
        return "\n".join(out)

    # ---------- widgets ----------
    def widget_box(self, n, parent):
        css, wc = n["css"], n["wc"]
        d = []
        d += self.width_rule(n, parent)
        if css["alignSelf"] not in ("auto", "normal", "stretch"):
            d.append(f"align-self: {css['alignSelf']}")
        if css["flexGrow"] != "0":
            d.append(f"flex-grow: {css['flexGrow']}")
        d += self.position(css)
        if parent and parent.get("_overlay") and css["position"] not in ("absolute", "fixed"):
            d.append("position: relative")
        # margen/padding/fondo del contenedor interno del widget
        d += self.spacing(wc)
        d += self.deco(wc)
        return d

    def widget_mobile(self, n, sel, parent):
        mn = self.mobile_index.get(n["id"])
        if not mn:
            return
        self.mobile_diff(sel, n["wc"], mn["wc"], ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft"])
        self.mobile_diff(sel, n["css"], mn["css"], ["position", "top", "left", "right", "bottom"])
        if n.get("tcss") and mn.get("tcss"):
            self.mobile_diff(sel, n["tcss"], mn["tcss"], ["fontSize", "lineHeight", "textAlign", "letterSpacing", "fontWeight"])

    def render_widget(self, n, parent, ind):
        t = n["t"]
        sel = "." + self.cls(n)
        box = self.widget_box(n, parent)
        fn = getattr(self, "w_" + t.replace("-", "_").replace(".", "_"), None)
        if fn is None:
            TODO.append((self.name, t, n["id"]))
            self.add(sel, box)
            jsx = to_jsx(n.get("html", ""), self.ctx, keep_class=False)
            return f"{ind}{{/* TODO widget {t} */}}\n{ind}<div {self.classname(n)}>{jsx}</div>"
        out = fn(n, sel, box, ind, parent)
        self.widget_mobile(n, sel, parent)
        # Elementor: un widget cuyo margen negativo supera su contenido no ocupa espacio (alto 0)
        if n.get("vis") and n["box"][3] == 0 and (px(n["wc"]["marginTop"]) or 0) < 0:
            out = f'{ind}<div className="zero-h">\n{out}\n{ind}</div>'
        return out

    def w_heading(self, n, sel, box, ind, parent):
        tag = n["tag"] if n["tag"] in ("h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span") else "h2"
        d = box + self.text_css(n["tcss"]) + ["margin-block: 0"]
        wm = box4(n["wc"], "margin")
        if wm:
            d.append(f"margin: {wm}")
        self.add(sel, d)
        if n.get("acss"):
            self.add(sel + " a", [f"color: {n['acss']['color']}"])
        jsx = to_jsx(n["html"], self.ctx)
        return f"{ind}<{tag} {self.classname(n)}>{jsx}</{tag}>"

    def w_text_editor(self, n, sel, box, ind, parent):
        d = box + self.text_css(n["tcss"])
        self.add(sel, d)
        if n.get("pcss") and n["pcss"]["marginBottom"] != "14.4px":
            self.add(sel + " p", [f"margin-bottom: {n['pcss']['marginBottom']}"])
        if n.get("scss") and n["scss"]["color"] != n["tcss"]["color"]:
            self.add(sel + " strong", [f"color: {n['scss']['color']}"])
        if n.get("acss"):
            self.add(sel + " a", [f"color: {n['acss']['color']}"])
        jsx = to_jsx(n["html"], self.ctx)
        return f"{ind}<div {self.classname(n)}>{jsx}</div>"

    w_theme_post_content = w_text_editor

    def w_image(self, n, sel, box, ind, parent):
        if not n.get("src"):
            return f"{ind}{{/* imagen vacía {n['id']} */}}"
        src = local_url(n["src"])
        if src.startswith("/wp-content/"):
            IMAGES.add(src)
        d = (["margin: 0"] if n.get("caption") else []) + box + [f"text-align: {n['align'] if n['align'] not in ('start',) else 'left'}"]
        self.add(sel, d)
        ic = n["icss"]
        idecl = []
        wbox = n["box"][2] - (px(n["wc"]["paddingLeft"]) or 0) - (px(n["wc"]["paddingRight"]) or 0)
        iw = n["ibox"][2]
        ww, hh = n.get("wh") or [None, None]
        natural_w = px(ww) if ww else None
        if wbox and iw and abs(iw - wbox) < 1.5:
            idecl.append("width: 100%")
        elif natural_w and abs(iw - natural_w) < 1.5:
            pass
        elif wbox and iw:
            idecl.append(f"width: {round(iw / wbox * 100, 3)}%")
        if ic["maxWidth"] not in ("100%", "none"):
            idecl.append(f"max-width: {ic['maxWidth']}")
        ih = n["ibox"][3]
        if natural_w and hh and iw:
            prop = iw * px(hh) / natural_w
            if abs(prop - ih) > 2:
                idecl.append(f"height: {ih}px")
                if ic["objectFit"] != "fill":
                    idecl.append(f"object-fit: {ic['objectFit']}")
        for k, ck in (("borderRadius", "border-radius"), ("boxShadow", "box-shadow"), ("opacity", "opacity"), ("filter", "filter")):
            if nz(ic.get(k)) and ic[k] not in ("1", "0px"):
                idecl.append(f"{ck}: {ic[k]}")
        self.add(sel + " img", idecl)
        mn = self.mobile_index.get(n["id"])
        if mn and mn.get("ibox") and mn["box"][2]:
            mw = mn["box"][2] - (px(mn["wc"]["paddingLeft"]) or 0) - (px(mn["wc"]["paddingRight"]) or 0)
            if mw and mn["ibox"][2] and abs(mn["ibox"][2] - mw) > 1.5 and abs(mn["ibox"][2] - (iw or 0)) > 1.5:
                self.add(sel + " img", [f"width: {round(mn['ibox'][2] / mw * 100, 3)}%"], mobile=True)
        alt = jstr(n.get("alt", ""))
        wh = ""
        if ww and hh:
            wh = f' width={{{int(float(ww))}}} height={{{int(float(hh))}}}'
        img = f'<img src={jstr(src)} alt={alt}{wh} loading="lazy" decoding="async" />'
        if n.get("href"):
            tgt = ' target="_blank" rel="noopener"' if n.get("target") == "_blank" else ""
            img = f"<a href={jstr(local_url(n['href']))}{tgt}>{img}</a>"
        if n.get("caption"):
            cc = n["ccss"]
            self.add(sel + " figcaption", self.text_css(cc) + ["margin-block-start: 0"])
            return f"{ind}<figure {self.classname(n)}>\n{ind}  {img}\n{ind}  <figcaption>{to_jsx(n['caption'], self.ctx)}</figcaption>\n{ind}</figure>"
        return f"{ind}<div {self.classname(n)}>{img}</div>"

    w_theme_post_featured_image = w_image

    def btn_css(self, b, full):
        o = []
        f = font(b["fontFamily"])
        if f:
            o.append(f"font-family: {f}")
        o += [f"font-size: {b['fontSize']}", f"font-weight: {weight(b['fontFamily'], b['fontWeight'])}",
              f"line-height: {b['lineHeight']}", f"color: {b['color']}"]
        if b["textTransform"] != "none":
            o.append(f"text-transform: {b['textTransform']}")
        if b["letterSpacing"] not in ("normal", "0px"):
            o.append(f"letter-spacing: {b['letterSpacing']}")
        if b["fontStyle"] != "normal":
            o.append(f"font-style: {b['fontStyle']}")
        o.append(f"background-color: {b['backgroundColor']}")
        if nz(b["backgroundImage"]):
            o.append(f"background-image: {b['backgroundImage']}")
        o.append(f"padding: {b['paddingTop']} {b['paddingRight']} {b['paddingBottom']} {b['paddingLeft']}")
        if b["borderTopStyle"] != "none" and b["borderTopWidth"] != "0px":
            o.append(f"border: {b['borderTopWidth']} {b['borderTopStyle']} {b['borderTopColor']}")
        if b["borderRadius"] != "0px":
            o.append(f"border-radius: {b['borderRadius']}")
        if nz(b["boxShadow"]):
            o.append(f"box-shadow: {b['boxShadow']}")
        o.append("display: " + ("block" if full else "inline-block"))
        o.append("text-align: center")
        o.append("transition: all .3s")
        return o

    def w_button(self, n, sel, box, ind, parent):
        al = n["align"] if n["align"] not in ("start",) else "left"
        self.add(sel, box + [f"text-align: {al}"])
        full = n["bbox"][2] >= n["box"][2] - 1
        self.add(sel + " a", self.btn_css(n["bcss"], full))
        self.add(sel + " a:hover", ["opacity: .85"])
        mn = self.mobile_index.get(n["id"])
        if mn and mn.get("bcss"):
            self.mobile_diff(sel + " a", n["bcss"], mn["bcss"], ["fontSize", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"])
        href = local_url(n.get("href") or "#")
        tgt = ' target="_blank" rel="noopener"' if n.get("target") == "_blank" else ""
        return f"{ind}<div {self.classname(n)}>\n{ind}  <a href={jstr(href)}{tgt}>{to_jsx(n['text'], self.ctx)}</a>\n{ind}</div>"

    def w_bdt_advanced_button(self, n, sel, box, ind, parent):
        al = n["align"] if n["align"] not in ("start",) else "left"
        self.add(sel, box + [f"text-align: {al}"])
        full = n["bbox"][2] >= n["box"][2] - 1
        self.add(sel + " a", self.btn_css(n["bcss"], full))
        self.add(sel + " a:hover", ["opacity: .85"])
        mn = self.mobile_index.get(n["id"])
        if mn and mn.get("bcss"):
            self.mobile_diff(sel + " a", n["bcss"], mn["bcss"], ["fontSize", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"])
        href = n.get("href") or "#"
        if href.startswith("javascript"):
            href = "https://wa.me/56990894601"
        tgt = ' target="_blank" rel="noopener"' if n.get("target") == "_blank" else ""
        return f"{ind}<div {self.classname(n)}>\n{ind}  <a href={jstr(local_url(href))}{tgt}>{to_jsx(n.get('html') or n['text'], self.ctx)}</a>\n{ind}</div>"

    def w_spacer(self, n, sel, box, ind, parent):
        self.add(sel, box + [f"height: {n['h']}px"])
        mn = self.mobile_index.get(n["id"])
        if mn and mn.get("h") is not None and mn["h"] != n["h"]:
            self.add(sel, [f"height: {mn['h']}px"], mobile=True)
        return f"{ind}<div {self.classname(n)} />"

    def w_divider(self, n, sel, box, ind, parent):
        dc = n["dcss"]
        self.add(sel, box + [f"padding-block: {n['dpad']['paddingTop']}", "display: flex", "justify-content: center"])
        self.add(sel + " span", [f"display: block", f"width: {dc['width']}", f"border-top: {dc['borderTopWidth']} {dc['borderTopStyle']} {dc['borderTopColor']}"])
        return f"{ind}<div {self.classname(n)}><span /></div>"

    def w_icon(self, n, sel, box, ind, parent):
        svg = n.get("svg") or ""
        if not svg:
            return f"{ind}<div {self.classname(n)} />"
        h = hashlib.md5(svg.encode()).hexdigest()[:8]
        fname = f"/media/icons/{self.name}-{n['id']}.svg"
        fixed = svg.replace("viewbox=", "viewBox=")
        if 'xmlns="http://www.w3.org/2000/svg"' not in fixed:
            fixed = fixed.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        fill = n["icss"].get("fill")
        if fill and "fill=" not in fixed.split(">")[0]:
            fixed = fixed.replace("<svg", f'<svg fill="{fill}"', 1)
        os.makedirs(PROJECT + "/public/media/icons", exist_ok=True)
        open(PROJECT + "/public" + fname, "w", encoding="utf8").write(fixed)
        al = n.get("align", "center")
        self.add(sel, box + [f"text-align: {al if al != 'start' else 'left'}", "line-height: 0"])
        self.add(sel + " img", [f"height: {n['icss'].get('height')}", "width: auto"])
        img = f'<img src="{fname}" alt="" loading="lazy" />'
        if n.get("href"):
            img = f"<a href={jstr(local_url(n['href']))}>{img}</a>"
        return f"{ind}<div {self.classname(n)}>{img}</div>"

    # ---------- salida ----------
    def css_text(self):
        def fmt(rules):
            return "\n".join(f"{sel} {{\n" + "".join(f"  {d};\n" for d in decls) + "}" for sel, decls in rules)
        out = "/* Generado a partir del diseño Elementor original (escritorio + móvil). */\n" + fmt(self.rules)
        if self.mrules:
            out += "\n\n@media (max-width: 767px) {\n" + "\n".join("  " + l for l in fmt(self.mrules).split("\n")) + "\n}\n"
        return out

    def page(self, route, comp):
        body = self.render_nodes(self.d["ch"], None, "      ")
        return body


import specials
specials.IMAGES = IMAGES
specials.PROJECT = PROJECT
for _k, _f in specials.HANDLERS.items():
    setattr(Gen, _k, _f)


def run(name, route, comp, extra_top=""):
    data = json.load(open(f"../ex2/{name}.json", encoding="utf8"))
    g = Gen(name, data)
    body = g.render_nodes(g.d["ch"], None, "      ")
    folder = PROJECT + "/src/app" + route
    os.makedirs(folder, exist_ok=True)
    extra_imports = "".join(u + chr(10) for u in sorted(g.uses))
    tsx = f'''{extra_imports}import JsonLd from "@/components/JsonLd";
import {{ buildMetadata }} from "@/lib/seo";
import s from "./page.module.css";

const PATH = "{route}";
export const metadata = buildMetadata(PATH);

export default function {comp}() {{
  return (
    <>
      <JsonLd path={{PATH}} />
{extra_top}{body}
    </>
  );
}}
'''
    open(folder + "/page.tsx", "w", encoding="utf8").write(tsx)
    open(folder + "/page.module.css", "w", encoding="utf8").write(g.css_text())
    return g


if __name__ == "__main__":
    jobs = json.loads(sys.argv[1])
    for name, route, comp in jobs:
        run(name, route, comp)
        print("ok", name)
    open("../images_needed.txt", "w").write("\n".join(sorted(IMAGES)))
    print("TODO:", TODO)
