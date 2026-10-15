"use client";

import { useState, type ReactNode } from "react";
import styles from "./CircleInfo.module.css";

export type CircleItem = { title: ReactNode; desc: ReactNode; icon: string };

/** Infografía circular (Element Pack Circle Info): íconos alrededor del círculo; al pasar el mouse cambia el texto central. */
export default function CircleInfo({ items }: { items: CircleItem[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className={styles.wrap}>
      <div className={styles.ring}>
        {items.map((it, i) => {
          const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + 50 * Math.cos(angle);
          const y = 50 + 50 * Math.sin(angle);
          return (
            <button
              key={i}
              type="button"
              aria-label={`Ver punto ${i + 1}`}
              className={`${styles.bubble} ${i === active ? styles.bubbleActive : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              dangerouslySetInnerHTML={{ __html: it.icon }}
            />
          );
        })}
        <div className={styles.content}>
          {items.map((it, i) => (
            <div key={i} className={styles.item} hidden={i !== active}>
              <span className={styles.title}>{it.title}</span>
              <div className={styles.desc}>{it.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
