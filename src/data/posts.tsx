import type { ReactNode } from "react";
import styles from "@/app/[year]/[month]/[day]/[slug]/page.module.css";

// Entradas del blog migradas desde WordPress. La URL conserva el formato /AAAA/MM/DD/slug/.
export type Post = {
  year: string;
  month: string;
  day: string;
  slug: string;
  title: string;
  /** Imagen destacada (también usada como fondo del hero) */
  image: { src: string; width: number; height: number; alt: string };
  content: ReactNode;
};

const UP = "/wp-content/uploads";

export const POSTS: Post[] = [
  {
    year: "2024",
    month: "08",
    day: "26",
    slug: "iluminacion-para-acuicultura-en-la-salmonicultura-chilena-mejorando-la-productividad",
    title: "Iluminación para Acuicultura en la Salmonicultura Chilena: Mejorando la Productividad",
    image: { src: `${UP}/2024/07/1687265348163.jpeg`, width: 452, height: 350, alt: "" },
    content: (
      <div className={styles.elContainer}>
        <div>
          <div>
            <strong>Iluminación para Acuicultura en la Salmonicultura Chilena: Mejorando la Productividad</strong>
          </div>
          <div>&nbsp;</div>
          <p>
            La salmonicultura en Chile se beneficia significativamente de la iluminación artificial. Esta tecnología se
            utiliza para controlar el fotoperiodo, que influye directamente en procesos biológicos críticos como la
            esmoltificación (la transformación de los alevines en peces juveniles adaptados al agua salada) y el
            crecimiento continuo, incluso en condiciones de baja luz natural.
          </p>
          <p>
            La iluminación LED en la acuicultura no solo mejora el bienestar de los salmones al reducir el estrés, sino que
            también permite mantener una tasa de alimentación óptima, lo que resulta en un crecimiento más rápido y
            uniforme. Según estudios recientes, la implementación de luces artificiales en los cultivos de salmón puede
            aumentar la eficiencia de conversión alimenticia y reducir el tiempo de producción, lo que se traduce en un
            producto de mejor calidad y más rentable.
          </p>
        </div>
        <div className={styles.imageRow}>
          <div className={styles.imageCol}>
            <img src={`${UP}/2024/07/1687265348163.jpeg`} alt="" width={452} height={350} loading="lazy" />
          </div>
          <div className={styles.imageCol}>
            <img
              src={`${UP}/2024/07/1687265349787-e1722464873859.png`}
              alt=""
              width={397}
              height={405}
              loading="lazy"
              style={{ maxWidth: "75%" }}
            />
          </div>
        </div>
        <div>
          <div>
            <strong>
              <a href="https://inprotar.cl/iluminacion-para-acuicultura/">https://inprotar.cl/iluminacion-para-acuicultura/</a>
              Soluciones de Inprotar para la Iluminación en Acuicultura:
            </strong>
          </div>
          <p>Inprotar ofrece una gama de productos diseñados específicamente para acuicultura, entre los que destacan:</p>
          <ul>
            <li>
              <strong>Luminarias LED sumergibles:</strong> Estas luminarias permiten una distribución homogénea de la luz en
              ambientes acuáticos, favoreciendo el crecimiento uniforme de los salmones.
            </li>
            <li>
              <strong>Control de fotoperiodo:</strong> Los sistemas de iluminación de Inprotar permiten ajustar el ciclo de
              luz para simular condiciones óptimas, manteniendo los salmones activos y mejorando su tasa de conversión
              alimenticia.
            </li>
            <li>
              <strong>Sistemas de control inteligente:</strong> Integrados con sensores que monitorean la calidad del agua y
              el comportamiento de los peces, estos sistemas optimizan automáticamente la iluminación, asegurando un
              ambiente de cultivo ideal.
            </li>
          </ul>
        </div>
        <div>
          <img src={`${UP}/2024/08/1369319.jpeg`} alt="" width={800} height={535} loading="lazy" />
        </div>
        <div>
          <div>&nbsp;</div>
          <p>
            <strong>Beneficios para la Salmonicultura en Chile:</strong>
          </p>
          <ol>
            <li>
              <strong>Aumento de la productividad:</strong> Al controlar el ciclo de luz, se acelera el crecimiento de los
              salmones y se mejora la conversión alimenticia.
            </li>
            <li>
              <strong>Reducción de costos operativos:</strong> Las luminarias LED de alta eficiencia energética reducen el
              consumo de energía.
            </li>
            <li>
              <strong>Mejora en la calidad del producto final:</strong> La iluminación constante y controlada reduce el
              estrés de los peces, mejorando su salud y, en consecuencia, la calidad del salmón.
            </li>
          </ol>
          <p>
            En resumen, las soluciones de iluminación de Inprotar no solo optimizan el rendimiento de las granjas de salmón
            en Chile, sino que también garantizan un enfoque sostenible y eficiente en la acuicultura.
          </p>
          <p>
            Para conocer más sobre cómo Inprotar puede ayudar a mejorar tu operación de salmonicultura, visita{" "}
            <a href="https://inprotar.cl/iluminacion-para-acuicultura/" target="_new" rel="noopener">
              Inprotar – Iluminación para Acuicultura
            </a>
            .
          </p>
        </div>
      </div>
    ),
  },
  {
    year: "2025",
    month: "03",
    day: "25",
    slug: "iluminacion-solar-industrial-eficiencia-energetica-al-mas-alto-nivel-con-sunstay",
    title: "Iluminación Solar Industrial: Eficiencia Energética al Más Alto Nivel con SunStay",
    image: { src: `${UP}/2024/07/iluminacion-eficiente-y-sostenible.webp`, width: 858, height: 473, alt: "Iluminación solar" },
    content: (
      <div>
        <p>
          La iluminación solar industrial representa una solución sustentable que aprovecha la energía renovable del sol
          para iluminar espacios públicos, áreas industriales y urbanas. La tecnología solar fotovoltaica aplicada a
          luminarias industriales ha alcanzado niveles de eficiencia y confiabilidad antes impensados, especialmente con
          productos avanzados como SunStay.
        </p>
        <p>
          <strong>¿Qué es SunStay y por qué elegirlo?</strong>
        </p>
        <p>
          SunStay es una luminaria solar todo-en-uno diseñada para aplicaciones industriales, urbanas y residenciales
          exigentes. Su propuesta innovadora radica en la integración completa del panel solar, la batería, el controlador
          inteligente y la iluminación LED en un único dispositivo robusto y de calidad industrial. Esto garantiza
          iluminación continua, segura y eficiente, incluso en condiciones climáticas adversas.
        </p>
        <p>
          <strong>Tendencias y contexto de la iluminación solar</strong>
        </p>
        <p>
          Según la International Renewable Energy Agency (IRENA), la capacidad instalada mundial de energía solar
          fotovoltaica superó los 1.200 GW en 2023. En Chile, la energía solar es la principal fuente de generación
          renovable, alcanzando más del 20% de la matriz energética nacional, según la Comisión Nacional de Energía (CNE).
          Este contexto favorece enormemente la adopción de soluciones como SunStay, especialmente en sectores
          industriales que buscan eficiencia energética, reducción de costos operativos y sostenibilidad ambiental.
        </p>
        <p>
          <strong>Ventajas técnicas y económicas del sistema SunStay</strong>
        </p>
        <p>
          SunStay reduce considerablemente los costos operativos, eliminando el consumo eléctrico tradicional. Ofrece hasta
          24 horas de autonomía energética gracias a su batería integrada de litio de alta eficiencia, lo que asegura
          iluminación continua incluso en días nublados. Su construcción resistente con clasificación IP66 y IK08 garantiza
          protección frente al polvo, la humedad y los impactos, siendo ideal para ambientes exigentes como zonas
          industriales, minería, espacios urbanos o rurales aislados.
        </p>
        <p>
          Adicionalmente, la implementación de luminarias solares SunStay permite acceder a diversos beneficios tributarios
          y apoyos económicos en el marco de políticas nacionales e internacionales de transición energética y reducción de
          emisiones de carbono.
        </p>
        <p>
          <strong>Impacto ambiental positivo y sustentable</strong>
        </p>
        <p>
          La utilización de SunStay ayuda a reducir significativamente la huella de carbono de las operaciones industriales
          y urbanas, al eliminar por completo las emisiones asociadas al uso de energía eléctrica convencional. Estudios
          recientes indican que el uso generalizado de iluminación solar puede reducir hasta un 50% el consumo energético en
          ciudades y parques industriales.
        </p>
        <p>
          <strong>Inprotar y SunStay: Combinación de calidad y sustentabilidad</strong>
        </p>
        <p>
          En Inprotar brindamos soluciones completas y eficientes con luminarias solares SunStay, acompañando a empresas e
          instituciones en la implementación de iluminación industrial sustentable. Ofrecemos asesoría personalizada,
          instalación profesional y servicio postventa especializado, asegurando que cada proyecto alcance máximos niveles
          de rendimiento, ahorro energético y sustentabilidad.
        </p>
        <p>
          <strong>Descubre cómo iluminar de forma eficiente, inteligente y sustentable con SunStay.</strong> Contáctanos en{" "}
          <a href="https://inprotar.cl/landing-sunstay-120225/">www.inprotar.cl</a> o al correo{" "}
          <a href="mailto:ventas@inprotar.cl">ventas@inprotar.cl</a>.
        </p>
        <p></p>
      </div>
    ),
  },
];

export const postPath = (p: Post) => `/${p.year}/${p.month}/${p.day}/${p.slug}/`;
