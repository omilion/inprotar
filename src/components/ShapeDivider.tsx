// Divisores SVG de Elementor (mismos paths que el sitio original).
type Props = {
  type: "waves" | "tilt" | "opacity-tilt";
  position?: "top" | "bottom";
  height?: number;
  /** Ancho del SVG en % (Elementor permite >100% para estirar la forma) */
  width?: number;
  flip?: boolean;
  color?: string;
  className?: string;
};

const PATHS = {
  waves: {
    viewBox: "0 0 1000 100",
    paths: [
      {
        d: "M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z",
      },
    ],
  },
  tilt: { viewBox: "0 0 1000 100", paths: [{ d: "M0,6V0h1000v100L0,6z" }] },
  "opacity-tilt": {
    viewBox: "0 0 2600 131.1",
    paths: [
      { d: "M0 0L2600 0 2600 69.1 0 0z" },
      { d: "M0 0L2600 0 2600 69.1 0 69.1z", opacity: 0.5 },
      { d: "M2600 0L0 0 0 130.1 2600 69.1z", opacity: 0.25 },
    ],
  },
};

export default function ShapeDivider({
  type,
  position = "bottom",
  height,
  width = 100,
  flip,
  color = "#fff",
  className,
}: Props) {
  const shape = PATHS[type];
  const transforms = ["translateX(-50%)"];
  if (flip) transforms.push("rotateY(180deg)");
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        overflow: "hidden",
        lineHeight: 0,
        direction: "ltr",
        pointerEvents: "none",
        zIndex: 1,
        ...(position === "bottom" ? { bottom: -1, transform: "rotate(180deg)" } : { top: -1 }),
      }}
    >
      <svg
        viewBox={shape.viewBox}
        preserveAspectRatio="none"
        style={{
          display: "block",
          width: `calc(${width}% + 1.3px)`,
          height: height ?? "auto",
          position: "relative",
          left: "50%",
          transform: transforms.join(" "),
        }}
      >
        {shape.paths.map((p, i) => (
          <path key={i} d={p.d} fill={color} style={"opacity" in p ? { opacity: p.opacity } : undefined} />
        ))}
      </svg>
    </div>
  );
}
