import type { CSSProperties } from "react";

/** Imagen con pie de foto, igual al widget Image de Elementor (caption gris en cursiva). */
export default function Figure({
  src,
  alt = "",
  width,
  height,
  caption,
  imgStyle,
  style,
  className,
  priority,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  imgStyle?: CSSProperties;
  style?: CSSProperties;
  className?: string;
  priority?: boolean;
}) {
  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={imgStyle}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
  if (!caption) {
    return (
      <div className={className} style={{ textAlign: "center", ...style }}>
        {img}
      </div>
    );
  }
  return (
    <figure className={className} style={{ margin: 0, textAlign: "center", ...style }}>
      {img}
      <figcaption
        style={{
          marginBlockStart: 0,
          fontFamily: "var(--font-roboto), sans-serif",
          fontSize: 16,
          fontStyle: "italic",
          lineHeight: "22.4px",
          color: "#7a7a7a",
          textAlign: "center",
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
