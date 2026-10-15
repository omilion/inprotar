"use client";

import { FormEvent, useState } from "react";
import styles from "./Footer.module.css";
import { CONTACT } from "@/data/site";

/**
 * Formulario "Hablemos". El sitio original usa Elementor Forms (backend de WordPress).
 * En la versión estática se envía la consulta por WhatsApp, el canal principal de Inprotar.
 * Para recibirlo por correo, reemplazar `onSubmit` por un POST a Formspree, Resend, etc.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text =
      `Hola, soy ${f.get("name")}.\n` +
      `Email: ${f.get("email")}\n` +
      `Teléfono: ${f.get("phone")}\n\n` +
      `${f.get("message")}`;
    window.open(`https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setSent(true);
    e.currentTarget.reset();
  }

  return (
    <form className={styles.form} name="New Form" onSubmit={onSubmit}>
      <div className={styles.field}>
        <label htmlFor="form-field-name">Nombre</label>
        <input id="form-field-name" type="text" name="name" placeholder="Nombre Completo" required />
      </div>
      <div className={styles.field}>
        <label htmlFor="form-field-email">Email</label>
        <input id="form-field-email" type="email" name="email" placeholder="Email" required />
      </div>
      <div className={styles.field}>
        <label htmlFor="form-field-phone">Teléfono</label>
        <input
          id="form-field-phone"
          type="tel"
          name="phone"
          placeholder="Te hablaremos a Whatsapp"
          required
          pattern="[0-9()#&+*\-=.\s]+"
          title="Only numbers and phone characters (#, -, *, etc) are accepted."
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="form-field-message">Mensaje</label>
        <textarea id="form-field-message" name="message" rows={4} placeholder="Cómo te ayudamos?" required />
      </div>
      <div className={styles.field}>
        <button type="submit" className={styles.submit}>
          Enviar
        </button>
      </div>
      {sent && <p className={styles.sent}>¡Gracias! Te contactaremos a la brevedad.</p>}
    </form>
  );
}
