import type { ReactNode } from "react";
import styles from "./Accordion.module.css";
import { AngleRight, Minus, Plus } from "./icons";

export type AccordionItem = { title: string; content: ReactNode; open?: boolean };

/**
 * Acordeón basado en <details>/<summary>: funciona sin JavaScript y el contenido
 * queda en el HTML (indexable), igual que en el sitio original.
 * - variant "eael": estilo Essential Addons (Alumbrado Solar)
 * - variant "nested": estilo Nested Accordion de Elementor (Acuicultura)
 */
export default function Accordion({ items, variant = "eael" }: { items: AccordionItem[]; variant?: "eael" | "nested" }) {
  return (
    <div className={variant === "eael" ? styles.eael : styles.nested}>
      {items.map((it, i) => (
        <details key={i} className={styles.item} open={it.open}>
          <summary className={styles.header}>
            <span className={styles.iconClosed}>
              <Plus size={16} />
            </span>
            <span className={styles.iconOpened}>
              <Minus size={16} />
            </span>
            <span className={styles.title}>{it.title}</span>
            {variant === "eael" && (
              <span className={styles.toggle}>
                <AngleRight size={16} />
              </span>
            )}
          </summary>
          <div className={styles.content}>{it.content}</div>
        </details>
      ))}
    </div>
  );
}
