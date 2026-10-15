import { marked } from "marked";
import type { Bloque } from "@/lib/content/schema";
import Accordion from "@/components/Accordion";
import s from "./Bloques.module.css";

type B<T extends Bloque["tipo"]> = Extract<Bloque, { tipo: T }>;
type Img = { src: string; alt: string; ancho?: number; alto?: number; pie?: string };
type Btn = { texto: string; url: string; estilo: "primario" | "contorno" | "contornoClaro" | "oscuro" };

/** Markdown → HTML (contenido controlado por el sitio, validado al guardar). */
function Md({ md, className }: { md?: string; className?: string }) {
  if (!md) return null;
  return <div className={`${s.md} ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: marked.parse(md, { async: false }) as string }} />;
}

function Imagen({ img, className, priority }: { img: Img; className?: string; priority?: boolean }) {
  const el = (
    <img src={img.src} alt={img.alt} width={img.ancho} height={img.alto} loading={priority ? "eager" : "lazy"} decoding="async" />
  );
  if (!img.pie) return <div className={`${s.img} ${className ?? ""}`}>{el}</div>;
  return (
    <figure className={`${s.img} ${className ?? ""}`}>
      {el}
      <figcaption>{img.pie}</figcaption>
    </figure>
  );
}

function Boton({ b }: { b: Btn }) {
  const ext = /^https?:/.test(b.url);
  return (
    <a className={`${s.btn} ${s["btn_" + b.estilo]}`} href={b.url} {...(ext ? { target: "_blank", rel: "noopener" } : {})}>
      {b.texto}
    </a>
  );
}

function Titulo({ t, className }: { t?: { texto: string; nivel: "h1" | "h2" | "h3" }; className?: string }) {
  if (!t) return null;
  const Tag = t.nivel;
  return <Tag className={className ?? s.h2}>{t.texto}</Tag>;
}

// ---------------- Bloques ----------------

function Hero({ b }: { b: B<"hero"> }) {
  return (
    <section className={s.hero} style={{ minHeight: b.alto, backgroundImage: `url("${b.fondo}")` }}>
      <div className={s.heroOverlay} style={{ opacity: b.oscurecer }} />
      <h1 className={s.heroTitle}>{b.titulo}</h1>
    </section>
  );
}

function HeroDividido({ b }: { b: B<"heroDividido"> }) {
  return (
    <>
      <div className={s.topBar} />
      <section className={s.split}>
        <div className={s.wrap}>
          <div className={s.splitText}>
            {b.antetitulo && <p className={s.kicker}>{b.antetitulo}</p>}
            <h1 className={s.splitTitle}>{b.titulo}</h1>
            <Md md={b.texto_md} className={s.splitLead} />
            {b.boton && <Boton b={b.boton} />}
          </div>
          <div className={s.splitImg}>
            <Imagen img={b.imagen} priority />
          </div>
        </div>
      </section>
    </>
  );
}

function TituloSeccion({ b }: { b: B<"titulo"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrap} style={{ display: "block", textAlign: b.alineacion === "centro" ? "center" : "left" }}>
        <Titulo t={b.titulo} />
        <Md md={b.bajada_md} className={s.bajada} />
      </div>
    </section>
  );
}

function Texto({ b }: { b: B<"texto"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrapCol}>
        <Titulo t={b.titulo} />
        <Md md={b.texto_md} />
      </div>
    </section>
  );
}

function TextoImagen({ b }: { b: B<"textoImagen"> }) {
  return (
    <section className={s.sec}>
      <div className={`${s.wrap} ${b.imagenAlLado === "izquierda" ? s.reverse : ""}`}>
        <div className={s.half}>
          <Titulo t={b.titulo} className={s.h2Left} />
          <Md md={b.texto_md} />
          {b.botones.length > 0 && (
            <div className={s.btns}>
              {b.botones.map((x) => (
                <Boton key={x.url + x.texto} b={x} />
              ))}
            </div>
          )}
        </div>
        <div className={s.half}>
          <Imagen img={b.imagen} />
        </div>
      </div>
    </section>
  );
}

function Columnas({ b }: { b: B<"columnas"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrapCol}>
        <Titulo t={b.titulo} />
        <div className={s.cols} style={{ gridTemplateColumns: `repeat(${b.columnas.length}, 1fr)` }}>
          {b.columnas.map((c, i) => (
            <div key={i} className={s.col}>
              {c.subtitulo && <p className={s.colSub}>{c.subtitulo}</p>}
              {c.titulo && <h3 className={s.colTitle}>{c.titulo}</h3>}
              {c.imagen && <Imagen img={c.imagen} />}
              <Md md={c.texto_md} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntroIconos({ b }: { b: B<"introIconos"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrap}>
        <div className={s.half}>
          {b.imagenes.length > 0 && (
            <div className={s.introImgs}>
              {b.imagenes.map((im) => (
                <Imagen key={im.src} img={im} />
              ))}
            </div>
          )}
          <Md md={b.texto_md} className={s.small} />
        </div>
        <div className={`${s.half} ${s.icons}`}>
          {b.iconos.map((ic, i) => (
            <div key={i} className={s.icon}>
              <img src={ic.icono} alt="" loading="lazy" />
              <p>{ic.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BannerImagen({ b }: { b: B<"bannerImagen"> }) {
  return (
    <section className={s.banner} style={{ backgroundImage: `url("${b.fondo}")` }}>
      <div className={s.bannerOverlay} style={{ opacity: b.oscurecer }} />
      <div className={`${s.wrap} ${b.ladoTexto === "derecha" ? s.alignRight : ""}`}>
        <div className={s.bannerText}>
          {b.antetitulo && <p className={s.bannerKicker}>{b.antetitulo}</p>}
          <h2 className={s.bannerTitle} style={{ color: b.colorTitulo }}>
            {b.titulo}
          </h2>
          <Md md={b.texto_md} className={s.bannerLead} />
          {b.botones.length > 0 && (
            <div className={s.btns}>
              {b.botones.map((x) => (
                <Boton key={x.url + x.texto} b={x} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Fichas({ b }: { b: B<"fichas"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrapCol}>
        <Titulo t={b.titulo} />
        <div className={s.fichas}>
          {b.fichas.map((f) => (
            <article key={f.nombre} className={s.ficha}>
              <h3>{f.nombre}</h3>
              <Imagen img={f.imagen} />
              <Md md={f.especificaciones_md} className={s.specs} />
              {f.boton && <Boton b={{ ...f.boton, estilo: "contornoClaro" }} />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Productos({ b }: { b: B<"productos"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrapCol}>
        <Titulo t={b.titulo} />
        <div className={s.productos}>
          {b.productos.map((p) => {
            const card = (
              <>
                <h3>{p.nombre}</h3>
                <img src={p.imagen.src} alt={p.imagen.alt} loading="lazy" />
              </>
            );
            return (
              <div key={p.nombre} className={s.producto}>
                {p.url ? (
                  <a href={p.url} className={s.productoCard}>
                    {card}
                  </a>
                ) : (
                  <div className={s.productoCard}>{card}</div>
                )}
                {p.puntos.length > 0 && (
                  <ul>
                    {p.puntos.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BandaCta({ b }: { b: B<"bandaCta"> }) {
  return (
    <section className={`${s.cta} ${s["cta_" + b.tema]}`}>
      <div className={s.wrap}>
        <div className={s.ctaText}>
          <h2>{b.titulo}</h2>
          <Md md={b.texto_md} />
        </div>
        <div className={s.ctaBtn}>
          <Boton b={b.boton} />
        </div>
      </div>
    </section>
  );
}

function Faq({ b }: { b: B<"faq"> }) {
  return (
    <section className={s.sec}>
      <div className={s.faq}>
        <h2 className={s.h2}>{b.titulo}</h2>
        <Accordion
          variant="nested"
          items={b.preguntas.map((p, i) => ({ title: p.pregunta, open: i === 0, content: <Md md={p.respuesta_md} /> }))}
        />
      </div>
    </section>
  );
}

function Galeria({ b }: { b: B<"galeria"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrapCol}>
        <Titulo t={b.titulo} />
        <div className={s.galeria} style={{ gridTemplateColumns: `repeat(${b.columnas}, 1fr)` }}>
          {b.imagenes.map((im) => (
            <Imagen key={im.src} img={im} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Tarjetas({ b }: { b: B<"tarjetas"> }) {
  return (
    <section className={s.sec}>
      <div className={s.wrapCol}>
        <Titulo t={b.titulo} />
        <div className={s.tarjetas} style={{ gridTemplateColumns: `repeat(${b.columnas}, 1fr)` }}>
          {b.tarjetas.map((t) => {
            const inner = (
              <>
                <div className={s.tarjetaFront} style={{ backgroundImage: `url("${t.imagen}")` }}>
                  <h3>{t.titulo}</h3>
                </div>
                {t.texto && (
                  <div className={s.tarjetaBack}>
                    <p>{t.texto}</p>
                    {t.url && <span className={`${s.btn} ${s.btn_primario}`}>{t.textoBoton ?? "Ver más"}</span>}
                  </div>
                )}
              </>
            );
            return t.url ? (
              <a key={t.titulo} href={t.url} className={s.tarjeta}>
                {inner}
              </a>
            ) : (
              <div key={t.titulo} className={s.tarjeta}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Cierre({ b }: { b: B<"cierre"> }) {
  return (
    <section className={s.sec}>
      <p className={s.cierre}>{b.texto}</p>
    </section>
  );
}

const MAP: { [K in Bloque["tipo"]]: (p: { b: B<K> }) => React.ReactNode } = {
  hero: Hero,
  heroDividido: HeroDividido,
  titulo: TituloSeccion,
  texto: Texto,
  textoImagen: TextoImagen,
  columnas: Columnas,
  introIconos: IntroIconos,
  bannerImagen: BannerImagen,
  fichas: Fichas,
  productos: Productos,
  bandaCta: BandaCta,
  faq: Faq,
  galeria: Galeria,
  tarjetas: Tarjetas,
  cierre: Cierre,
};

export default function Bloques({ bloques }: { bloques: Bloque[] }) {
  return (
    <>
      {bloques.map((b, i) => {
        const C = MAP[b.tipo] as (p: { b: Bloque }) => React.ReactNode;
        return <C key={i} b={b} />;
      })}
    </>
  );
}
