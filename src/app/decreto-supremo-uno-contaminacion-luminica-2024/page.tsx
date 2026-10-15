import JsonLd from "@/components/JsonLd";
import ShapeDivider from "@/components/ShapeDivider";
import { buildMetadata } from "@/lib/seo";
import { CONTACT } from "@/data/site";
import s from "./page.module.css";

const PATH = "/decreto-supremo-uno-contaminacion-luminica-2024/";
export const metadata = buildMetadata(PATH);

const UP = "/wp-content/uploads";

/** Imagen con tamaño intrínseco (alto proporcional) usada por los widgets de imagen. */
function Img({ src, alt = "", w, h, maxWidth, style }: { src: string; alt?: string; w: number; h: number; maxWidth?: string; style?: React.CSSProperties }) {
  return (
    <div className={s.img} style={style}>
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" style={maxWidth ? { maxWidth } : undefined} />
    </div>
  );
}

/** Carrusel de una sola imagen (Element Pack "Custom Carousel"): imagen contenida + enlace al archivo. */
function SingleSlide({ src, height, alt }: { src: string; height: number; alt: string }) {
  return (
    <a href={src} className={s.slide} style={{ height }}>
      <img src={src} alt={alt} loading="lazy" />
    </a>
  );
}

export default function DecretoSupremoPage() {
  return (
    <>
      <JsonLd path={PATH} />

      <div className={s.topBar} />

      {/* ===================== Cielo estrellado (parte 1) ===================== */}
      <section className={`${s.sky} ${s.sky1}`}>
        <div className={s.skyInner}>
          {/* Intro */}
          <div className={s.row}>
            <div className={`${s.col} ${s.centerV}`}>
              <Img src={`${UP}/2024/08/LOGO-fondo-oscuro2.png`} w={360} h={194} maxWidth="12%" />
              <h2 className={s.kicker}>Liderando en soluciones de iluminación y cumpliminto de normativas</h2>
              <h2 className={s.h44}>Cumple con el Decreto Supremo Uno: Soluciones Certificadas</h2>
              <p className={`${s.text} ${s.center}`}>
                Inprotar te entrega la información y las herramientas&nbsp; necesarias para cumplir con esta normativa
                esencial para proteger nuestros cielos y ecosistemas.
              </p>
            </div>
          </div>

          <div className={s.row} style={{ maxWidth: 918, alignSelf: "center" }}>
            <div className={`${s.col} ${s.centerV}`}>
              <p className={s.text}>
                Emitido por el Ministerio del Medio Ambiente de Chile, establece normas estrictas para la regulación de la
                contaminación lumínica en el país. Este decreto, promulgado el 18 de octubre de 2023, y que entrará en
                vigencia el 18 de octubre de 2024, reemplaza al anterior Decreto Supremo Nº 43 de 2012. Su objetivo
                principal es proteger la calidad de los cielos nocturnos, esenciales para la astronomía, y preservar la
                biodiversidad y la calidad de vida de los habitantes de Chile
              </p>
            </div>
          </div>

          {/* Por qué es importante */}
          <div className={`${s.row} ${s.why}`}>
            <div className={`${s.col} ${s.centerV}`} style={{ flex: 1 }}>
              <h2 className={s.h44}>¿Por qué es importante este decreto?</h2>
              <div className={`${s.img} hidden-desktop`}>
                <img src="/media/icons/observatorio.svg" alt="" className={s.observatoryMobile} loading="lazy" />
              </div>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      Chile, <strong>líder mundial en astronomía </strong>con el{" "}
                      <strong>70% de la capacidad de observación global</strong> proyectada para 2030.
                    </p>
                  </li>
                  <li>
                    <p>Impactos del exceso de luz artificial:</p>
                    <ul>
                      <li>
                        <p>
                          Disrupción del <strong>ciclo circadiano</strong>, aumentando riesgos de enfermedades metabólicas
                          y cáncer.
                        </p>
                      </li>
                      <li>
                        <p>
                          <strong>Alteración de los hábitats</strong> de especies nocturnas críticas.
                        </p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${s.colTight} hidden-tablet hidden-mobile`} style={{ flex: 1 }}>
              <img src="/media/icons/observatorio.svg" alt="" className={s.observatory} loading="lazy" />
            </div>
          </div>

          {/* Áreas de protección */}
          <div className={s.row}>
            <div className={s.col}>
              <div style={{ height: 50 }} />
              <h2 className={s.h44}>Áreas de Protección y Zonas Especiales</h2>
              <div className={s.innerRow}>
                <div className={s.col}>
                  <h2 className={s.h25}>Áreas Astronómicas</h2>
                  <div className={s.text}>
                    <p>
                      Corresponden a 29 comunas próximas a sitios de interés astronómico. Se dividen en cercanas y lejanas.
                    </p>
                    <p>
                      Comunas clasificadas como cercanas (&lt;100 km), lejanas (&gt;100 km) a observatorios astronómicos y
                      comunas fuera del Área Astronómica.
                    </p>
                    <p>Ejemplo: Observatorio Paranal y comunas protegidas.</p>
                  </div>
                  <div className={s.innerRow}>
                    <div className={s.mapCol}>
                      <SingleSlide
                        src={`${UP}/2024/11/decreto-supremo-1-que-es-1.png`}
                        height={362}
                        alt="Mapa de áreas astronómicas del Decreto Supremo 1"
                      />
                    </div>
                    <div className={s.col} style={{ flex: 1 }}>
                      <div className={s.text}>
                        <ul>
                          <li>
                            <p>
                              Comunas clasificadas como <strong>cercanas</strong> (&lt;100 km): Ollagüe, Calama, San Pedro de
                              Atacama, María Elena, Mejillones, Antofagasta, Tal Tal, Sierra Gorda, Caldera, Copiapó, Tierra
                              Amarilla, La Higuera, La Serena, Coquimbo, Andacollo, Vicuña, Paihuano, Río Hurtado.
                            </p>
                          </li>
                          <li>
                            <p>
                              Comunas clasificadas como <strong>lejanas</strong> (&gt;100 km): Freirina, Huasco, Vallenar,
                              Alto del Carmen, Ovalle, Monte Patria, Punitaqui, Combarbalá, Canela, Illapel, Salamanca
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`${s.col} ${s.relative}`}>
                  <h2 className={s.h25}>Áreas de Protección para la Biodiversidad</h2>
                  <div className={s.text}>
                    <p>
                      Corresponde a áreas delimitadas con el fin de asegurar la diversidad biológica, tutelar la preservación
                      de la naturaleza o conservar el patrimonio ambiental.
                    </p>
                    <p>Son áreas de protección para la biodiversidad:</p>
                    <ul>
                      <li>Parques Marinos</li>
                      <li>Reservas de Regiones Vírgenes</li>
                      <li>Parques Nacionales</li>
                      <li>Monumentos Naturales</li>
                    </ul>
                    <ul>
                      <li>Santuarios de la Naturaleza</li>
                    </ul>
                    <ul>
                      <li>Reservas Forestales</li>
                      <li>Reservas Nacionales</li>
                      <li>Reservas Marinas</li>
                      <li>Áreas Marinas Costeras Protegidas de Múltiples Usos</li>
                    </ul>
                    <ul>
                      <li>
                        Humedales que sean parte del listado de la Convención sobre Zonas Húmedas de Importancia
                        Internacional especialmente como Hábitat de las Aves Acuáticas (Sitios RAMSAR)
                      </li>
                    </ul>
                  </div>
                  <img
                    src="/media/icons/golondrina-de-mar-negra.svg"
                    alt="Golondrina de mar Negra"
                    className={`${s.bird} hidden-tablet hidden-mobile`}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Límites técnicos */}
          <div className={s.row}>
            <div className={`${s.col} ${s.centerV}`}>
              <div style={{ height: 31 }} />
              <h2 className={s.h44}>Límites Técnicos por Tipo de Alumbrado</h2>
            </div>
          </div>

          <div className={`${s.row} ${s.bordered}`}>
            <div className={s.col} style={{ flex: 1 }}>
              <h2 className={s.h25}>Alumbrado Peatonal</h2>
              <div className={s.text}>
                <p>
                  Es aquel alumbrado de exteriores que se encuentra generalmente sobre soportes de baja altura (3 a 5 metros)
                  para la iluminación de víaspeatonales, parques y jardines, entre otros.
                </p>
                <p>
                  También se considerará como alumbrado peatonal aquel destinado ailuminar las vías peatonales y áreas
                  comunes asociadas al alumbradoindustrial, deportivo y recreacional.
                </p>
              </div>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      <strong>Límite de intensidad luminosa:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Ángulo Gama ≤ 90°: Máximo 0,49 candelas por cada 1.000 lúmenes.</p>
                      </li>
                      <li>
                        <p>Ángulo Gama &gt; 90°: Máximo 0 candelas por cada 1.000 lúmenes.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Requisitos de emisión por reflexión:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Vías con alta densidad de tránsito peatonal: hasta 18 lux (Clase P1).</p>
                      </li>
                      <li>
                        <p>Zonas históricas o de baja densidad: 3 lux (Clase P6).</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Temperatura de color:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Máximo 2700 K en zonas urbanas.</p>
                      </li>
                      <li>
                        <p>Máximo 2200 K en zonas cercanas a observatorios o biodiversidad.</p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${s.col} ${s.centerV}`} style={{ flex: 1 }}>
              <Img src={`${UP}/2024/11/alumbrado-peatonal-decreto-supremo-1-2.png`} w={800} h={859} />
              <p className={s.note}>
                La luminaria deberá ser instalada respetando el ángulo de instalación indicado por el productorcertificado de
                la luminaria.
              </p>
              <div style={{ height: 31 }} />
            </div>
          </div>

          <div className={`${s.row} ${s.bordered}`}>
            <div className={`${s.col} ${s.centerV} hidden-tablet hidden-mobile`} style={{ flex: 1 }}>
              <Img
                src={`${UP}/2024/11/Alumbrado-Vehicular-decreto-supremo-1.png`}
                alt="Alumbrado Vehicular decreto supremo 1"
                w={781}
                h={559}
              />
            </div>
            <div className={`${s.col} ${s.centerV}`} style={{ flex: 1 }}>
              <h2 className={s.h25}>Alumbrado Vehicular</h2>
              <div className="hidden-desktop">
                <Img
                  src={`${UP}/2024/11/Alumbrado-Vehicular-decreto-supremo-1.png`}
                  alt="Alumbrado Vehicular decreto supremo 1"
                  w={781}
                  h={559}
                />
              </div>
              <div className={s.text}>
                <p>
                  Es aquel alumbrado de exteriores destinado a la iluminación de autopistas, autovías, carreteras y vías
                  urbanas.
                </p>
                <p>
                  También se considerará como alumbrado vehicular aquel destinado a cumplir esta misma función en aquellas
                  áreas comunes asociadas al alumbrado industrial o deportivo y recreacional.
                </p>
              </div>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      <strong>Límite de intensidad luminosa:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Ángulo Gama ≤ 90°: Máximo 0,49 candelas por cada 1.000 lúmenes.</p>
                      </li>
                      <li>
                        <p>Ángulo Gama &gt; 90°: Máximo 0 candelas.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Niveles de luminancia promedio:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Autopistas (&gt;120 km/hr): 2,4 cd/m² (Clase M1).</p>
                      </li>
                      <li>
                        <p>Vías locales (&lt;80 km/hr): 0,75 cd/m² (Clase M5).</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Temperatura de color:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Máximo 2700 K en zonas urbanas.</p>
                      </li>
                      <li>
                        <p>Máximo 2200 K en zonas protegidas.</p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div style={{ height: 31 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Ilumina con responsabilidad ===================== */}
      <section className={s.responsible}>
        <div className={s.responsibleInner}>
          <div className={s.col} style={{ flex: "0 0 787px" }}>
            <h2 className={s.h32} style={{ marginBottom: 11 }}>
              Ilumina con Responsabilidad y Sostenibilidad
            </h2>
            <div className="hidden-desktop">
              <Img src={`${UP}/2024/07/SunStay-1024x904.png`} w={800} h={706} />
            </div>
            <p className={s.text} style={{ margin: "-16px 0 1.4px" }}>
              Descubre cómo las luminarias <strong>SunStay de Philips</strong> no solo ofrecen soluciones eficientes y
              duraderas, sino que también cumplen estrictamente con el <strong>Decreto Supremo 1 (DS-1)</strong> de Chile
              para la reducción de la contaminación lumínica.
            </p>
            <div style={{ marginBottom: 10 }}>
              <a className={`el-btn ${s.outlineWhite}`} href={CONTACT.whatsapp}>
                COTIZA AHORA CON INPROTAR
              </a>
            </div>
          </div>
          <div className={`${s.responsibleImg} hidden-tablet hidden-mobile`}>
            <img src={`${UP}/2024/07/SunStay-1024x904.png`} alt="" width={800} height={706} loading="lazy" />
          </div>
        </div>
        <ShapeDivider type="tilt" height={55} />
      </section>

      {/* ===================== Radiancia espectral ===================== */}
      <section className={s.boxed}>
        <div style={{ height: 50 }} />
        <h2 className={s.radianceTitle}>RADIANCIA ESPECTRAL</h2>
        <p className={`${s.textDark} ${s.center}`}>
          Dado que la porción azul del espectro visible (conocida comúnmente como luz azul) es la más dañina para la salud
          humana y la biodiversidad, la Norma Lumínica establece los siguientes límites:
        </p>
      </section>
      <section className={s.boxedRow}>
        <div className={s.col} style={{ flex: 1 }}>
          <h2 className={s.h25Blue}>Territorio Nacional 7%</h2>
          <Img src={`${UP}/2024/11/Captura-de-pantalla-2024-11-28-192115.png`} w={756} h={435} />
          <a
            className={`el-btn ${s.outlineDark}`}
            href="/2024/07/24/alumbrado-publico-solar-la-revolucion-en-la-iluminacion-vial-industrial-y-minera/"
          >
            Ver Catalogo LED DS-1
          </a>
        </div>
        <div className={s.col} style={{ flex: 1 }}>
          <h2 className={s.h25Blue}>Áreas de Protección Especial 1%</h2>
          <Img src={`${UP}/2024/11/Captura-de-pantalla-2024-11-28-192132.png`} w={739} h={433} maxWidth="98%" />
          <a className={`el-btn ${s.outlineDark}`} href="/alumbrado-publico-solar/">
            Ver Catalogo SOLAR LED DS-1
          </a>
        </div>
      </section>

      <div style={{ height: 70 }} />

      {/* ===================== Alumbrado industrial ===================== */}
      <section className={s.boxedRow} style={{ marginBottom: 40, gap: 20 }}>
        <div className={s.col} style={{ flex: "0 0 448px" }}>
          <h2 className={s.h25Blue}>Alumbrado Industrial</h2>
          <p className={s.textDark}>
            Es aquel alumbrado de exteriores destinado a la iluminación de áreas donde se lleven a cabo tareas propias de
            la actividad productiva, extractiva, manufacturera, entre otras.
          </p>
          <div className={s.textDark}>
            <ul>
              <li>
                <p>
                  <strong>Límite de intensidad:</strong>
                </p>
                <ul>
                  <li>
                    <p>Ángulo Gama ≤ 90°: Máximo 0,49 candelas por cada 1.000 lúmenes.</p>
                  </li>
                  <li>
                    <p>Ángulo Gama &gt; 90°: Máximo 0 candelas.</p>
                  </li>
                </ul>
              </li>
              <li>
                <p>
                  <strong>Horarios de apagado:</strong>
                </p>
                <ul>
                  <li>
                    <p>Fuera de horario laboral: Iluminación reducida al 50% o apagada.</p>
                  </li>
                </ul>
              </li>
              <li>
                <p>
                  <strong>Temperatura de color:</strong>
                </p>
                <ul>
                  <li>
                    <p>Máximo 2700 K en zonas industriales.</p>
                  </li>
                  <li>
                    <p>Máximo 2200 K en cercanías a biodiversidad o observatorios.</p>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <div className={s.hoursCol}>
          <h2 className={s.h20}>Límites Horarios</h2>
          <p className={s.textDark}>
            Cuando no se estén realizando tareas en las áreas de trabajo exteriores, la iluminacióndeberá permanecer apagada
            o reducida a menos de un 50% del flujo luminoso.
          </p>
          <div className={s.innerRow}>
            <div className={s.col} style={{ flex: 1 }}>
              <Img
                src={`${UP}/2024/11/Captura-de-pantalla-2024-11-28-195558.png`}
                alt="limites horarios decreto supremo 1"
                w={800}
                h={474}
              />
            </div>
            <div className={s.col} style={{ flex: 1 }}>
              <Img src={`${UP}/2024/11/Captura-de-pantalla-2024-11-28-195616.png`} w={800} h={430} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Cielo estrellado (parte 2) ===================== */}
      <section className={`${s.sky} ${s.sky2}`}>
        <ShapeDivider type="tilt" position="top" height={44} />
        <div className={s.skyInner}>
          <div className={s.row} style={{ minHeight: 82 }} />

          <div className={`${s.row} ${s.bordered} ${s.reverse}`}>
            <div className={s.col} style={{ flex: 1 }}>
              <h2 className={s.h25}>Alumbrado Ornamental y Decorativo</h2>
              <p className={s.text}>
                Es aquel alumbrado de exteriores destinado a la iluminación de fachadas de edificios, monumentos, estatuas,
                murallas, fuentes y similares.
              </p>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      <strong>Flujo luminoso directo al hemisferio superior:</strong> Máximo 0 lúmenes.
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>Temperatura de color máxima:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Nacional: 2700 K.</p>
                      </li>
                      <li>
                        <p>Áreas especiales: 2200 K, evitando luz azul.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Restricciones horarias:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Apagado entre las 00:00 y las 07:00 horas, salvo eventos autorizados.</p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className={s.col} style={{ flex: 1 }}>
              <Img src={`${UP}/2024/11/Iluminacion-ornamental-decreto-supremo-1.png`} w={800} h={676} />
            </div>
          </div>

          <div className={`${s.row} ${s.bordered}`} style={{ marginTop: 40 }}>
            <div className={s.col} style={{ flex: "0 0 496px" }}>
              <h2 className={s.h25}>Alumbrado Deportivo y Recreacional</h2>
              <div className="hidden-desktop">
                <SingleSlide
                  src={`${UP}/2024/11/Alumbrado-Deportivo-y-Recreacional-1.png`}
                  height={124}
                  alt="Alumbrado Deportivo y Recreacional"
                />
              </div>
              <div className={s.text}>
                <p>
                  Es aquel alumbrado de exteriores destinado a áreas donde se desarrollan actividades deportivas y
                  recreacionales, tales como las canchas de estadios, multicanchas de barrio, pistas de atletismo,
                  hipódromos, entre otros.
                </p>
                <p>
                  Los recintos deportivos y recreacionales se clasificarán en tres clases de acuerdo con la norma
                  NCh3834:2023 Iluminación – Iluminación de&nbsp;instalaciones deportivas.
                </p>
              </div>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      <strong>Límites de intensidad:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Ángulo Gama ≤ 90°: Máximo 10 candelas por cada 1.000 lúmenes.</p>
                      </li>
                      <li>
                        <p>Ángulo Gama &gt; 90°: Máximo 0 candelas.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Temperatura de color máxima:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Recintos Clase I y II: 5000 K.</p>
                      </li>
                      <li>
                        <p>Clase III (recreativo): 3000 K.</p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${s.col} ${s.centerV} hidden-tablet hidden-mobile`} style={{ flex: 1 }}>
              <SingleSlide
                src={`${UP}/2024/11/Alumbrado-Deportivo-y-Recreacional-1.png`}
                height={362}
                alt="Alumbrado Deportivo y Recreacional"
              />
            </div>
          </div>

          <div className={s.datesRow}>
            <div className={`${s.col} ${s.bordered}`}>
              <h2 className={s.h25}>Fechas Clave</h2>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      <strong>Nuevas instalaciones:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Cumplimiento obligatorio desde el 19 de octubre de 2024.</p>
                      </li>
                      <li>
                        <p>
                          Las instalaciones deben seguir los nuevos estándares de intensidad luminosa, temperatura de color y
                          restricciones horarias según el tipo de alumbrado.
                        </p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Fuentes existentes:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>
                          Adaptaciones progresivas con plazos máximos hasta 2029, dependiendo del tipo de instalación y zona
                          de protección.
                        </p>
                      </li>
                      <li>
                        <p>
                          Las adecuaciones deben incluir ajustes en la orientación de las luminarias, reducción del flujo
                          luminoso al hemisferio superior y cumplimiento de los límites de temperatura de color (2200 K o
                          2700 K según la ubicación).
                        </p>
                      </li>
                      <li>
                        <p>
                          Primer hito: Declaración de cumplimiento inicial obligatoria antes del 31 de diciembre de 2025 para
                          zonas urbanas y antes del 31 de diciembre de 2026 para áreas protegidas.
                        </p>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${s.col} ${s.bordered}`}>
              <h2 className={s.h25}>Alumbrado Deportivo y Recreacional</h2>
              <div className={s.text}>
                <ul>
                  <li>
                    <p>
                      <strong>Responsables:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Superintendencia del Medio Ambiente (SMA): Fiscalización normativa.</p>
                      </li>
                      <li>
                        <p>SEC: Certificación y control de productos.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Protocolos:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>Medición anual y reporte al Ministerio de Medio Ambiente.</p>
                      </li>
                      <li>
                        <p>Certificación obligatoria de luminarias por laboratorios autorizados.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      <strong>Multas y Sanciones:</strong>
                    </p>
                    <ul>
                      <li>
                        <p>
                          Las empresas que no cumplan con los plazos de adaptación o instalen luminarias sin certificación
                          enfrentarán sanciones económicas.
                        </p>
                      </li>
                      <li>
                        <p>Sanciones adicionales incluyen:</p>
                        <ul>
                          <li>
                            <p>Multas de hasta 500 UTM dependiendo de la gravedad de la infracción.</p>
                          </li>
                          <li>
                            <p>Clausura temporal de instalaciones no adaptadas.</p>
                          </li>
                          <li>
                            <p>Obligación de retirar luminarias fuera de norma.</p>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={s.commitment}>
            <div className={s.col}>
              <h2 className={s.h25}>Nuestro compromiso</h2>
              <p className={s.text}>
                En Inprotar, estamos comprometidos con la implementación de soluciones de iluminación que cumplen con los
                estándares del DS-1. Nos esforzamos por educar y concienciar a nuestras comunidades sobre la importancia de
                reducir la contaminación lumínica. A través de nuestros productos y servicios, ofrecemos tecnologías
                avanzadas que optimizan la eficiencia energética y minimizan la dispersión de luz.
              </p>
            </div>
            <div className={s.expertCol}>
              <Img
                src={`${UP}/2024/11/Experto-decreto-supremo-1-683x1024.png`}
                w={683}
                h={1024}
                maxWidth="51%"
                style={{ marginBottom: -20 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA asesoría ===================== */}
      <section className={s.cta}>
        <div className={s.ctaInner}>
          <div className={`${s.col} ${s.centerV}`} style={{ flex: "0 0 760px" }}>
            <p className={s.text} style={{ margin: "0 0 0.4px" }}>
              Confianza, Experiencia y Cumplimiento Garantizado.
            </p>
            <h2 className={s.h32} style={{ marginBottom: 11 }}>
              Accede al portafolio más completo para cumplir con el Decreto Supremo 1
            </h2>
            <p className={s.text} style={{ margin: "-16px 0 64.4px" }}>
              En Inprotar, transformamos los desafíos del Decreto Supremo Uno en oportunidades de eficiencia, iluminación
              conectada y gestión de activos para tu negocio. Obtén soluciones personalizadas, certificadas y alineadas con la
              normativa.
            </p>
          </div>
          <div className={s.ctaBtnCol}>
            <a className={`el-btn ${s.blueRound}`} href={CONTACT.whatsapp}>
              Solicita tu asesoría hoy
            </a>
          </div>
        </div>
        <ShapeDivider type="opacity-tilt" />
      </section>

      {/* ===================== Cierre ===================== */}
      <section className={s.boxed} style={{ marginTop: 50 }}>
        <Img src="/wp-content/uploads/2024/06/LOGO-fondo-oscuro.png" w={360} h={194} maxWidth="24%" />
        <h2 className={s.closing}>
          lideramos la industria con el portafolio más completo y avanzado, asegurando que tu negocio no solo cumpla con la
          normativa
        </h2>
      </section>
      <div className="hidden-tablet hidden-mobile" style={{ height: 138 }} />
    </>
  );
}
