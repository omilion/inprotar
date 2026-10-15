"use client";

import { useEffect, useState } from "react";
import styles from "./ProductCarousel.module.css";

export type ProductCard = { title: string; href: string; img: string; alt: string };

/** Carrusel de productos (Loop Carousel de Elementor): 5 visibles en escritorio, 1 en móvil, flechas y puntos. */
export default function ProductCarousel({ items }: { items: ProductCard[] }) {
  const [perView, setPerView] = useState(5);
  const [i, setI] = useState(0);
  useEffect(() => {
    const f = () => setPerView(window.innerWidth <= 767 ? 1 : window.innerWidth <= 1024 ? 3 : 5);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const pages = Math.max(1, items.length - perView + 1);
  const go = (n: number) => setI((n + pages) % pages);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % pages), 5000);
    return () => clearInterval(t);
  }, [pages]);

  return (
    <div className={styles.wrap}>
      <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Anterior" onClick={() => go(i - 1)}>
        ‹
      </button>
      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(calc(-${i} * (100% + 10px) / ${perView}))` }}>
          {items.map((p) => (
            <a key={p.href} href={p.href} className={styles.card} style={{ flexBasis: `calc((100% - ${(perView - 1) * 10}px) / ${perView})` }}>
              <h3 className={styles.title}>{p.title}</h3>
              <img src={p.img} alt={p.alt} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
      <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Siguiente" onClick={() => go(i + 1)}>
        ›
      </button>
      <div className={styles.dots}>
        {Array.from({ length: pages }).map((_, k) => (
          <button
            key={k}
            type="button"
            aria-label={`Ir a ${k + 1}`}
            className={`${styles.dot} ${k === i ? styles.dotActive : ""}`}
            onClick={() => go(k)}
          />
        ))}
      </div>
    </div>
  );
}
