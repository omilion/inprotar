"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Carousel.module.css";

type Img = { src: string; alt: string; width?: number; height?: number };

/**
 * Carrusel de imágenes con puntos (equivalente al widget "Image Carousel" de Elementor):
 * 1 slide visible, autoplay 5s, pausa al pasar el mouse, transición slide 500ms.
 * Todas las imágenes quedan en el HTML para que Google las indexe.
 */
export default function Carousel({ images, interval = 5000 }: { images: Img[]; interval?: number }) {
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setI((v) => (v + 1) % images.length);
    }, interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((img, k) => (
            <figure key={img.src} className={styles.slide} aria-hidden={k !== i}>
              <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading={k === 0 ? "eager" : "lazy"} />
            </figure>
          ))}
        </div>
      </div>
      <div className={styles.dots}>
        {images.map((img, k) => (
          <button
            key={img.src}
            type="button"
            aria-label={`Ir a la diapositiva ${k + 1}`}
            className={`${styles.dot} ${k === i ? styles.dotActive : ""}`}
            onClick={() => {
              paused.current = true;
              setI(k);
            }}
          />
        ))}
      </div>
    </div>
  );
}
