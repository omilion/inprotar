import type { ReactNode } from "react";
import styles from "./PageHero.module.css";
import ShapeDivider from "./ShapeDivider";

/**
 * Hero de cabecera usado por páginas internas y entradas del blog:
 * imagen de fondo + overlay oscuro, bajo el header transparente.
 */
export default function PageHero({
  image,
  height,
  overlayOpacity,
  spacer,
  children,
  tilt,
  imagePosition = "0 0",
  mobileImagePosition,
}: {
  image: string;
  /** Alto visible en escritorio (px) */
  height: number;
  overlayOpacity: number;
  /** Espacio superior antes del contenido (px, medido desde el borde superior visible) */
  spacer: number;
  children: ReactNode;
  tilt?: { height: number; flip?: boolean };
  imagePosition?: string;
  mobileImagePosition?: string;
}) {
  return (
    <section
      className={styles.hero}
      style={
        {
          minHeight: height,
          backgroundImage: `url("${image}")`,
          backgroundPosition: imagePosition,
          "--mobile-pos": mobileImagePosition ?? imagePosition,
        } as React.CSSProperties
      }
    >
      <div className={styles.overlay} style={{ opacity: overlayOpacity }} />
      <div className={styles.inner} style={{ paddingTop: spacer }}>
        {children}
      </div>
      {tilt && <ShapeDivider type="tilt" height={tilt.height} flip={tilt.flip} />}
    </section>
  );
}
