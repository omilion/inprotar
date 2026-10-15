"use client";

import { useEffect, useState } from "react";

/** Slider de imágenes de fondo (widget "Slides" de Elementor): autoplay 5s, transición slide. */
export default function BgSlides({ images, height, interval = 5000 }: { images: string[]; height: number; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden" }}>
      <div style={{ display: "flex", height: "100%", transition: "transform .5s ease", transform: `translateX(-${i * 100}%)` }}>
        {images.map((src) => (
          <div
            key={src}
            role="img"
            aria-hidden="true"
            style={{
              flex: "0 0 100%",
              height: "100%",
              backgroundColor: "#fff",
              backgroundImage: `url("${src}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
      </div>
    </div>
  );
}
