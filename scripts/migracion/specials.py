"""Manejadores de widgets especiales para gen.py (se agregan como métodos de Gen)."""
import re, json, os, html as H
from bs4 import BeautifulSoup
from htmljsx import to_jsx, local_url, jstr

IMAGES = set()
PROJECT = ""
CSSDIR = os.path.join(os.path.dirname(__file__), "..", "css")


def soup(h):
    return BeautifulSoup(h or "", "html.parser")


def js(v):
    return json.dumps(v, ensure_ascii=False)


def inner_html(el):
    return el.decode_contents() if el else ""


def text(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)) if el else ""


def page_css(gen):
    pid = gen.d.get("id")
    p = os.path.join(CSSDIR, f"post-{pid}.css")
    return open(p, encoding="utf8").read() if os.path.exists(p) else ""


def w_nested_accordion(self, n, sel, box, ind, parent):
    self.uses.add('import Accordion from "@/components/Accordion";')
    self.add(sel, box)
    items = []
    for i, d in enumerate(soup(n["html"]).select("details")):
        t = text(d.select_one(".e-n-accordion-item-title-text"))
        body = d.select_one(".elementor-widget-container") or d
        content = to_jsx(inner_html(body), self.ctx)
        op = "open: true, " if d.has_attr("open") else ""
        items.append(f"{ind}    {{ title: {js(t)}, {op}content: (<>{content}</>) }},")
    return f"{ind}<div {self.classname(n)}>\n{ind}  <Accordion\n{ind}    variant=\"nested\"\n{ind}    items={{[\n" + "\n".join(items) + f"\n{ind}    ]}}\n{ind}  />\n{ind}</div>"


def w_eael_adv_accordion(self, n, sel, box, ind, parent):
    self.uses.add('import Accordion from "@/components/Accordion";')
    self.add(sel, box)
    items = []
    for li in soup(n["html"]).select(".eael-accordion-list"):
        t = text(li.select_one(".eael-accordion-tab-title"))
        content = to_jsx(inner_html(li.select_one(".eael-accordion-content")), self.ctx)
        items.append(f"{ind}    {{ title: {js(t)}, content: (<>{content}</>) }},")
    return f"{ind}<div {self.classname(n)}>\n{ind}  <Accordion\n{ind}    items={{[\n" + "\n".join(items) + f"\n{ind}    ]}}\n{ind}  />\n{ind}</div>"


def w_bdt_flip_box(self, n, sel, box, ind, parent):
    self.uses.add('import FlipBox from "@/components/widgets/FlipBox";')
    self.add(sel, box)
    s = soup(n["html"])
    css = page_css(self)
    img, pos, ov = "", "0 0", "#02010157"
    m = re.search(r"elementor-element-" + n["id"] + r" \.bdt-flip-box-front\{([^}]*)\}", css)
    if m:
        u = re.search(r'url\("?([^")]+)"?\)', m.group(1))
        if u:
            img = local_url(u.group(1))
        p = re.search(r"background-position:([^;]+)", m.group(1))
        if p:
            pos = p.group(1).strip()
    m2 = re.search(r"elementor-element-" + n["id"] + r" \.bdt-flip-box-front \.bdt-flip-box-layer-overlay\{background-color:([^;]+)", css)
    if m2:
        ov = m2.group(1).strip()
    if img.startswith("/wp-content/"):
        IMAGES.add(img)
    a = s.select_one(".bdt-flip-box-button")
    btn = {"text": text(a)}
    if a and a.get("href"):
        btn["href"] = local_url(a["href"])
    return (f"{ind}<div {self.classname(n)}>\n{ind}  <FlipBox image={jstr(img)} imagePosition={jstr(pos)} overlay={jstr(ov)} "
            f"title={jstr(text(s.select_one('.bdt-flip-box-layer-title')))} desc={jstr(text(s.select_one('.bdt-flip-box-layer-desc')))} button={{{js(btn)}}} />\n{ind}</div>")


def w_bdt_circle_info(self, n, sel, box, ind, parent):
    self.uses.add('import CircleInfo from "@/components/widgets/CircleInfo";')
    self.add(sel, box)
    s = soup(n["html"])
    icons = [str(c.find("svg") or "") for c in s.select(".bdt-ep-circle-info-sub-circle")]
    items = []
    for i, it in enumerate(s.select(".bdt-ep-circle-info-item")):
        t = to_jsx(inner_html(it.select_one(".bdt-ep-circle-info-title")), self.ctx).strip()
        d = to_jsx(inner_html(it.select_one(".bdt-ep-circle-info-desc")), self.ctx)
        icon = icons[i] if i < len(icons) else ""
        items.append(f"{ind}    {{ title: (<>{t}</>), desc: (<>{d}</>), icon: {js(icon)} }},")
    return f"{ind}<div {self.classname(n)}>\n{ind}  <CircleInfo\n{ind}    items={{[\n" + "\n".join(items) + f"\n{ind}    ]}}\n{ind}  />\n{ind}</div>"


def w_bdt_custom_carousel(self, n, sel, box, ind, parent):
    s = soup(n["html"])
    a = s.select_one("a")
    href = local_url(a["href"]) if a and a.get("href") else ""
    if href.startswith("/wp-content/"):
        IMAGES.add(href)
    h = n["box"][3] or 362
    self.add(sel, box + [f"height: {h}px"])
    self.add(sel + " a", ["display: block", "height: 100%"])
    self.add(sel + " img", ["width: 100%", "height: 100%", "object-fit: contain"])
    mn = self.mobile_index.get(n["id"])
    if mn and mn["box"][3] and mn["box"][3] != h:
        self.add(sel, [f"height: {mn['box'][3]}px"], mobile=True)
    return f'{ind}<div {self.classname(n)}>\n{ind}  <a href={jstr(href)}><img src={jstr(href)} alt="" loading="lazy" /></a>\n{ind}</div>'


def w_image_gallery(self, n, sel, box, ind, parent):
    s = soup(n["html"])
    g = s.select_one(".gallery")
    cols = 1
    if g:
        m = re.search(r"gallery-columns-(\d+)", " ".join(g.get("class", [])))
        if m:
            cols = int(m.group(1))
    self.add(sel, box + ["display: grid", f"grid-template-columns: repeat({cols}, 1fr)", "gap: 10px"])
    self.add(sel + " img", ["width: 100%", "display: block"])
    out = []
    for fig in s.select("figure"):
        im = fig.find("img")
        src = local_url(im["src"])
        IMAGES.add(src)
        a = fig.find("a")
        href = local_url(a["href"]) if a else src
        out.append(f'{ind}  <figure style={{{{ margin: 0 }}}}><a href={jstr(href)}><img src={jstr(src)} alt={jstr(im.get("alt", ""))} width={{{im.get("width")}}} height={{{im.get("height")}}} loading="lazy" /></a></figure>')
    return f"{ind}<div {self.classname(n)}>\n" + "\n".join(out) + f"\n{ind}</div>"


def w_slides(self, n, sel, box, ind, parent):
    s = soup(n["html"])
    slide = s.select_one(".swiper-slide")
    inner = slide.select_one(".swiper-slide-inner")
    href = local_url(inner.get("href", "#")) if inner else "#"
    head = text(slide.select_one(".elementor-slide-heading"))
    btn = text(slide.select_one(".elementor-slide-button"))
    self.add(sel, box + ["height: 400px", "position: relative"])
    self.add(sel + " a", ["display: flex", "height: 100%", "padding: 50px", "align-items: center", "justify-content: center", "text-align: center", "color: #fff"])
    self.add(sel + " .slideContent", ["max-width: 945px", "text-shadow: rgba(0, 0, 0, 0.3) 0px 0px 10px"])
    self.add(sel + " .slideHeading", ["font-family: Arial, sans-serif", "font-size: 35px", "font-weight: 600", "line-height: 1", "margin-bottom: 30px"])
    self.add(sel + " .slideButton", ["display: inline-block", "font-family: var(--font-roboto), sans-serif", "font-size: 15px", "font-weight: 500", "line-height: 1", "padding: 12px 24px", "border: 2px solid #fff", "border-radius: 3px"])
    self.add(sel + " .slideHeading", ["font-size: 24px"], mobile=True)
    return (f'{ind}<div {self.classname(n)}>\n{ind}  <a href={jstr(href)}>\n{ind}    <div className="slideContent">\n'
            f'{ind}      <div className="slideHeading">{to_jsx(head, self.ctx)}</div>\n{ind}      <div className="slideButton">{to_jsx(btn, self.ctx)}</div>\n'
            f"{ind}    </div>\n{ind}  </a>\n{ind}</div>")


def w_icon_box(self, n, sel, box, ind, parent):
    s = soup(n["html"])
    svg = s.find("svg")
    fname = f"/media/icons/{self.name}-{n['id']}.svg"
    if svg:
        txt = str(svg).replace("viewbox=", "viewBox=")
        if "xmlns=" not in txt.split(">")[0]:
            txt = txt.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        txt = txt.replace("<svg", '<svg fill="#585858"', 1)
        open(PROJECT + "/public" + fname, "w", encoding="utf8").write(txt)
    self.add(sel, box + ["text-align: center"])
    self.add(sel + " img", ["height: 50px", "width: auto", "margin-bottom: 15px"])
    self.add(sel + " h3", ["margin: 8px 0 16px", "font-family: var(--font-lato), sans-serif", "font-size: 22px", "font-weight: 700", "line-height: 1.2", "color: #0044aa"])
    self.add(sel + " p", ["margin: 0", "font-family: var(--font-roboto), sans-serif", "font-size: 16px", "line-height: 24px", "color: #7a7a7a"])
    return (f"{ind}<div {self.classname(n)}>\n{ind}  <img src=\"{fname}\" alt=\"\" loading=\"lazy\" />\n"
            f"{ind}  <h3>{to_jsx(text(s.select_one('.elementor-icon-box-title')), self.ctx)}</h3>\n"
            f"{ind}  <p>{to_jsx(text(s.select_one('.elementor-icon-box-description')), self.ctx)}</p>\n{ind}</div>")


def w_loop_carousel_product(self, n, sel, box, ind, parent):
    self.uses.add('import ProductCarousel from "@/components/widgets/ProductCarousel";')
    self.add(sel, box)
    s = soup(n["html"])
    items, seen = [], set()
    for sl in s.select(".swiper-slide"):
        if "swiper-slide-duplicate" in sl.get("class", []):
            continue
        link = sl.select_one("[data-ep-wrapper-link]")
        href = ""
        if link:
            href = local_url(json.loads(H.unescape(link["data-ep-wrapper-link"]))["url"])
        if href in seen:
            continue
        seen.add(href)
        im = sl.find("img")
        src = local_url(im["src"]) if im else ""
        IMAGES.add(src)
        items.append({"title": text(sl.select_one("h1,h2,h3")), "href": href, "img": src, "alt": im.get("alt", "") if im else ""})
    return f"{ind}<div {self.classname(n)}>\n{ind}  <ProductCarousel items={{{js(items)}}} />\n{ind}</div>"


def w_bdt_post_grid(self, n, sel, box, ind, parent):
    self.uses.add('import { PostGrid } from "@/components/widgets/Posts";')
    self.add(sel, box)
    s = soup(n["html"])
    items = []
    for it in s.select(".bdt-post-grid-item"):
        a = it.select_one(".bdt-post-grid-img-wrap a")
        m = re.search(r"url\(([^)]+)\)", a.get("style", "")) if a else None
        img = local_url(m.group(1).strip("'\"")) if m else ""
        IMAGES.add(img)
        cats = [{"name": text(c), "href": local_url(c["href"])} for c in it.select(".bdt-post-grid-category a")]
        items.append({"title": text(it.select_one(".bdt-post-grid-title")), "href": local_url(a["href"]), "img": img,
                      "date": text(it.select_one(".bdt-post-grid-date")), "categories": cats})
    return f"{ind}<div {self.classname(n)}>\n{ind}  <PostGrid items={{{js(items)}}} />\n{ind}</div>"


def w_archive_posts_archive_cards(self, n, sel, box, ind, parent):
    self.uses.add('import { PostCards } from "@/components/widgets/Posts";')
    self.add(sel, box)
    s = soup(n["html"])
    items = []
    for art in s.select("article"):
        im = art.find("img")
        src = local_url(im["src"]) if im else ""
        IMAGES.add(src)
        a = art.select_one(".elementor-post__title a")
        items.append({"title": text(a), "href": local_url(a["href"]), "img": src, "alt": im.get("alt", "") if im else "",
                      "date": text(art.select_one(".elementor-post-date")), "excerpt": text(art.select_one(".elementor-post__excerpt"))})
    return f"{ind}<div {self.classname(n)}>\n{ind}  <PostCards items={{{js(items)}}} />\n{ind}</div>"


def w_woolentor_custom_product_archive(self, n, sel, box, ind, parent):
    self.uses.add('import ProductGrid from "@/components/widgets/ProductGrid";')
    self.add(sel, box)
    s = soup(n["html"])
    items = []
    for p in s.select(".wlshop-grid-area"):
        im = p.select_one(".ht-product-image img")
        src = local_url(im["src"]) if im else ""
        if src.startswith("/wp-content/"):
            IMAGES.add(src)
        t = p.select_one(".ht-product-title a")
        cat = p.select_one(".ht-product-categories a")
        it = {"title": text(t), "href": local_url(t["href"]) if t else "", "img": src, "alt": im.get("alt", "") if im else ""}
        if cat:
            it["category"] = {"name": text(cat), "href": local_url(cat["href"])}
        items.append(it)
    total = len(items)
    m = re.search(r"de (\d+) resultados", s.get_text())
    if m:
        total = int(m.group(1))
    return f"{ind}<div {self.classname(n)}>\n{ind}  <ProductGrid total={{{total}}} items={{{js(items)}}} />\n{ind}</div>"


def w_theme_archive_title(self, n, sel, box, ind, parent):
    self.add(sel, box + ["margin-block: 0", "font-family: var(--font-roboto), sans-serif", "font-size: 40px", "font-weight: 600",
                         "line-height: 1", "color: rgb(252, 252, 252)", "text-align: center"])
    self.add(sel, ["font-size: 28px"], mobile=True)
    t = text(soup(n["html"]).find(["h1", "h2"]))
    return f"{ind}<h1 {self.classname(n)}>{to_jsx(t, self.ctx)}</h1>"


def w_form(self, n, sel, box, ind, parent):
    self.uses.add('import ContactPageForm from "@/components/widgets/ContactPageForm";')
    self.add(sel, box)
    opts = [o.get_text(strip=True) for o in soup(n["html"]).select("option")]
    return f"{ind}<div {self.classname(n)}>\n{ind}  <ContactPageForm options={{{js(opts)}}} />\n{ind}</div>"


def w_social_icons(self, n, sel, box, ind, parent):
    self.uses.add('import { Facebook, Linkedin, Youtube, Whatsapp } from "@/components/icons";')
    s = soup(n["html"])
    self.add(sel, box + ["display: flex", "justify-content: center", "flex-wrap: wrap"])
    self.add(sel + " a", ["display: inline-flex", "padding: 15px", "margin: 0 10px", "color: #fff"])
    self.add(sel + " svg", ["width: 70px", "height: 70px"])
    self.add(sel + " svg", ["width: 40px", "height: 40px"], mobile=True)
    out = []
    for a in s.select("a"):
        cls = " ".join(a.get("class", []))
        name = "Facebook" if "facebook" in cls else "Linkedin" if "linkedin" in cls else "Youtube" if "youtube" in cls else "Whatsapp"
        href = a.get("href") or "https://wa.me/56990894601"
        out.append(f'{ind}  <a href={jstr(href)} target="_blank" rel="noopener" aria-label="{name}"><{name} /></a>')
    return f"{ind}<div {self.classname(n)}>\n" + "\n".join(out) + f"\n{ind}</div>"


HANDLERS = {k: v for k, v in globals().items() if k.startswith("w_")}
