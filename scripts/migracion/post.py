"""Ajustes manuales posteriores a la generación (se aplican tras cada regeneración)."""
import re
P = "C:/Users/flipe/OneDrive/Documentos/inprotar/src/app"

# Portada: popup DS1 + partículas del hero
f = P + "/page.tsx"
s = open(f, encoding="utf8").read()
if "Ds1Popup" not in s:
    s = 'import Ds1Popup from "@/components/widgets/Ds1Popup";\nimport Particles from "@/components/widgets/Particles";\n' + s
    s = s.replace("      <JsonLd path={PATH} />\n", "      <JsonLd path={PATH} />\n      <Ds1Popup />\n", 1)
    m = re.search(r"(      <section className=\{s\.(c_[a-z0-9]+)\}>\n)", s)
    s = s.replace(m.group(1), m.group(1) + "        <Particles />\n", 1)
    open(f, "w", encoding="utf8").write(s)
    css = P + "/page.module.css"
    c = open(css, encoding="utf8").read()
    c += f"\n.{m.group(2)} {{\n  position: relative;\n}}\n.{m.group(2)} > div:not([aria-hidden]) {{\n  position: relative;\n  z-index: 2;\n}}\n"
    open(css, "w", encoding="utf8").write(c)
print("post ok")
