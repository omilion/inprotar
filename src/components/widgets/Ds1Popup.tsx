"use client";

import { useEffect, useState } from "react";
import styles from "./Ds1Popup.module.css";

/** Popup del Decreto Supremo 1 que muestra la portada a los 2 segundos (una vez por sesión). */
export default function Ds1Popup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ds1-popup") === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, []);
  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem("ds1-popup", "1");
    } catch {}
  }
  if (!open) return null;
  return (
    <div className={styles.backdrop} onClick={close} role="dialog" aria-modal="true" aria-label="Decreto Supremo Uno">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={close} aria-label="Cerrar">
          ×
        </button>
        <div className={styles.content}>
          <div className={styles.left}>
            <p className={styles.kicker}>Liderando en soluciones de iluminación y cumpliminto de normativas</p>
            <p className={styles.title}>¿Estás listo para cumplir con el Decreto Supremo Uno?</p>
            <p className={styles.text}>
              Inprotar te entrega la información más precisa y soluciones certificadas para que enfrentes esta normativa con
              confianza.
              <br />
              Resolvemos tus dudas más importantes:
            </p>
            <ul className={styles.questions}>
              <li>¿Cómo afecta esta normativa a mi empresa?</li>
              <li>¿Qué cambios debo implementar en mi iluminación?</li>
              <li>¿Qué beneficios puedo obtener si cumplo a tiempo?</li>
            </ul>
          </div>
          <div className={styles.right}>
            <a href="/decreto-supremo-uno-contaminacion-luminica-2024/" className={styles.cta} onClick={close}>
              Resuelve tus dudas Hoy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
