"use client";

import { FormEvent, useState } from "react";
import styles from "./ContactPageForm.module.css";
import { CONTACT } from "@/data/site";

const OPTIONS = [
  "Alumbrado público LED",
  "Alumbrado público solar",
  "Campanas LED industriales",
  "Proyectores de área LED",
  "Iluminación Antiexplosiva LED",
  "Iluminación Interior LED",
  "Iluminación para Horticultura",
  "Iluminación para Acuicultura",
  "Proyectores de area LED",
];

/** Formulario de la página Contacto: envía la consulta por WhatsApp (el original usaba Elementor Forms). */
export default function ContactPageForm({ options = OPTIONS }: { options?: string[] }) {
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text =
      `Hola, soy ${f.get("name")} de ${f.get("company")}.\n` +
      `Requerimiento: ${f.getAll("need").join(", ")}\n` +
      `Email: ${f.get("email")}\nTeléfono: ${f.get("phone")}\n\n${f.get("message")}`;
    window.open(`https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setSent(true);
    e.currentTarget.reset();
  }
  return (
    <form className={styles.form} onSubmit={onSubmit} name="New Form">
      <label htmlFor="cf-name">Nombre</label>
      <input id="cf-name" name="name" placeholder="Nombre Completo" required />
      <label htmlFor="cf-company">Empresa</label>
      <input id="cf-company" name="company" placeholder="Nombre Empresa" required />
      <label htmlFor="cf-need">Requerimiento</label>
      <select id="cf-need" name="need" multiple required>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <label htmlFor="cf-email">Email</label>
      <input id="cf-email" type="email" name="email" placeholder="Email" required />
      <label htmlFor="cf-phone">Teléfono</label>
      <input id="cf-phone" type="tel" name="phone" placeholder="Te hablaremos a Whatsapp" required />
      <label htmlFor="cf-msg">Mensaje</label>
      <textarea id="cf-msg" name="message" rows={4} placeholder="Cómo te ayudamos?" required />
      <button type="submit">Enviar</button>
      {sent && <p className={styles.sent}>¡Gracias! Te contactaremos a la brevedad.</p>}
    </form>
  );
}
