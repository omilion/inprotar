import ContactPageForm from "@/components/widgets/ContactPageForm";
import { Facebook, Linkedin, Youtube, Whatsapp } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import s from "./page.module.css";

const PATH = "/contacto/";
export const metadata = buildMetadata(PATH);

export default function ContactoPage() {
  return (
    <>
      <JsonLd path={PATH} />
      <section className={s.c_0a8479e}>
        <div className={s.c_0a8479e_in}>
          <div className={s.w_31d6031} />
          <h1 className={s.w_a50f253}>CONTACTO</h1>
        </div>
      </section>
      <section className={s.c_bff4705}>
        <div className={s.c_bff4705_in}>
          <div className={s.c_2e7cca8}>
            <div className={s.c_01aad80}>
              <div className={s.c_01aad80_in}>
                <h2 className={s.w_a794cdc}>¿Tienes Preguntas o Necesitas Asesoramiento?</h2>
                <div className={s.w_1bd8c12}> <p>Rellena el formulario a continuación y uno de nuestros expertos se pondrá en contacto contigo lo antes posible. Ya sea que necesites una cotización, asistencia técnica o información adicional sobre nuestros productos, estamos aquí para ayudarte.</p> </div>
                <div className={s.w_8b8db2c}> <p>Puedes escribirnos directamente a través de nuestras redes sociales o por WhatsApp. Además, no olvides seguirnos para mantenerte al día con nuestras novedades y soluciones de iluminación. ¡Estamos aquí para ayudarte en todo lo que necesites!</p> </div>
                <div className={s.w_7563390}>
                  <a href="https://www.facebook.com/profile.php?id=61561388644389" target="_blank" rel="noopener" aria-label="Facebook"><Facebook /></a>
                  <a href="https://www.linkedin.com/company/inprotar/" target="_blank" rel="noopener" aria-label="Linkedin"><Linkedin /></a>
                  <a href="https://wa.me/56990894601" target="_blank" rel="noopener" aria-label="Youtube"><Youtube /></a>
                  <a href="https://wa.me/56990894601" target="_blank" rel="noopener" aria-label="Whatsapp"><Whatsapp /></a>
                </div>
              </div>
            </div>
          </div>
          <div className={s.c_7210451}>
            <div className={s.c_711b568}>
              <h2 className={s.w_0326e2a}>Hablemos</h2>
              <div className={s.w_f2a0390}>
                <ContactPageForm options={["Alumbrado público LED", "Alumbrado público solar", "Campanas LED industriales", "Proyectores de área LED", "Iluminación Antiexplosiva LED", "Iluminación Interior LED", "Iluminación para Horticultura", "Iluminación para Acuicultura", "Proyectores de área LED"]} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
