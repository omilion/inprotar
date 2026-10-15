import { CONTACT } from "@/data/site";
import { Whatsapp } from "./icons";

/** Botón flotante de WhatsApp (equivalente al plugin "Joinchat" del sitio original). */
export default function WhatsAppFloat() {
  return (
    <a
      href={CONTACT.whatsapp}
      target="_blank"
      rel="noopener"
      aria-label="Abrir chat de WhatsApp"
      className="wa-float"
    >
      <Whatsapp size={34} />
    </a>
  );
}
