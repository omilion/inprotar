import Link from "next/link";
import styles from "./Footer.module.css";
import ContactForm from "./ContactForm";
import { SocialIcons } from "./Header";
import { FOOTER_MENU, LIGHTING_LINKS, LOGO_DARK_BG } from "@/data/site";
import FooterNav from "./FooterNav";
import { CaretDown } from "./icons";

export default function Footer() {
  return (
    <footer className={styles.footerWrap}>
      <div className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <img src={LOGO_DARK_BG} alt="" width={360} height={194} loading="lazy" />
            </Link>
            <p className={styles.tagline}>
              Proporcionar soluciones personalizadas en iluminación, automatización y tecnología digital avanzada para la
              Industria 4.0 y 5.0
            </p>
          </div>

          <div className={styles.navCol}>
            <FooterNav links={LIGHTING_LINKS} />
          </div>

          <div className={`${styles.navCol} ${styles.navCol2}`}>
            <nav className={styles.nav} aria-label="Menú footer">
              <ul>
                <li className={styles.hasSub}>
                  <a href="#">
                    {FOOTER_MENU.areas.label}
                    <CaretDown size={10} className={styles.subCaret} />
                  </a>
                  <ul className={styles.sub}>
                    {FOOTER_MENU.areas.children.map((c) => (
                      <li key={c.href} className={"children" in c ? styles.hasSub : undefined}>
                        <Link href={c.href}>{c.label}</Link>
                        {"children" in c && c.children && (
                          <ul className={styles.sub}>
                            {c.children.map((cc) => (
                              <li key={cc.href}>
                                <Link href={cc.href}>{cc.label}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
              <FooterNav links={FOOTER_MENU.links} bare />
            </nav>
          </div>

          <div className={styles.formCol}>
            <div className={styles.formBox}>
              <h2 className={styles.formTitle}>Hablemos</h2>
              <ContactForm />
              <SocialIcons size={25} className={styles.formSocial} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.credits}>
        <p>
          <img draggable={false} alt="💎" src="https://s.w.org/images/core/emoji/17.0.2/svg/1f48e.svg" className="emoji" />{" "}
          <a href="https://sistemasdeiluminacion.cl/">Inprotar.cl</a> es un cliente elite de
          <a href="http://hazlomejor.cl"> HazloMejor</a>
        </p>
      </div>
    </footer>
  );
}
