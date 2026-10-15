"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { CATALOG_LINKS, CONTACT, LIGHTING_LINKS, LOGO_DARK_BG, SOCIAL } from "@/data/site";
import { CaretDown, Close, Facebook, Linkedin, MailBulk, MenuBar, PhoneSquare, SearchLocation, Youtube } from "./icons";

export function SocialIcons({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <div className={`${styles.social} ${className ?? ""}`}>
      <a href={SOCIAL.facebook} target="_blank" rel="noopener" aria-label="Facebook">
        <span className="sr-only">Facebook</span>
        <Facebook size={size} />
      </a>
      <a href={SOCIAL.linkedin} target="_blank" rel="noopener" aria-label="Linkedin">
        <span className="sr-only">Linkedin</span>
        <Linkedin size={size} />
      </a>
      <a href={SOCIAL.youtube} target="_blank" rel="noopener" aria-label="Youtube">
        <span className="sr-only">Youtube</span>
        <Youtube size={size} />
      </a>
    </div>
  );
}

type MenuKey = "areas" | "catalogo" | null;

export default function Header() {
  const [open, setOpen] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) => (pathname === href ? styles.active : undefined);

  return (
    <header className={styles.header}>
      {/* ---------- Escritorio ---------- */}
      <div className={styles.desktop}>
        <div className={styles.logoCol}>
          <Link href="/" className={styles.logo}>
            <img src={LOGO_DARK_BG} alt="" width={360} height={194} />
          </Link>
        </div>

        <div className={styles.midCol}>
          <div className={styles.infoRow}>
            <div className={`${styles.info} ${styles.infoMail}`}>
              <a href={`mailto:${CONTACT.email}`}>
                <MailBulk className={styles.infoIcon} />
                <span>{CONTACT.email}</span>
              </a>
            </div>
            <div className={`${styles.info} ${styles.infoPhone}`}>
              <a href={CONTACT.whatsappInfo}>
                <PhoneSquare className={styles.infoIcon} />
                <span>{CONTACT.phone}</span>
              </a>
            </div>
            <div className={`${styles.info} ${styles.infoAddr}`}>
              <span className={styles.infoItem}>
                <SearchLocation className={styles.infoIcon} />
                <span>{CONTACT.address}</span>
              </span>
            </div>
          </div>

          <nav className={styles.navRow} aria-label="Menú" onMouseLeave={() => setOpen(null)}>
            <ul className={styles.menu}>
              <li onMouseEnter={() => setOpen("areas")}>
                <div className={styles.menuTitle}>
                  <Link href="/iluminacion-profesional-conectada/">AREAS DE NEGOCIO</Link>
                  <button
                    type="button"
                    aria-expanded={open === "areas"}
                    aria-label="Abrir AREAS DE NEGOCIO"
                    onClick={() => setOpen(open === "areas" ? null : "areas")}
                    className={open === "areas" ? styles.caretOpen : ""}
                  >
                    <CaretDown size={16} />
                  </button>
                </div>
                <div className={`${styles.mega} ${open === "areas" ? styles.megaOpen : ""}`}>
                  <div className={styles.megaInner}>
                    <div className={styles.megaCol}>
                      <h2 className={styles.megaTitle}>
                        <Link href="/iluminacion-profesional-conectada/">Iluminación Profesional Conectada</Link>
                      </h2>
                      <ul className={styles.megaLinks}>
                        {LIGHTING_LINKS.map((l, i) => (
                          <li key={i}>
                            <Link href={l.href}>{l.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.megaCol}>
                      <h2 className={styles.megaTitle}>
                        <Link href="/suministros-y-componentes-electricos-y-electronicos/">
                          Suministros y Componentes Eléctricos &amp; Electrónicos
                        </Link>
                      </h2>
                    </div>
                    <div className={styles.megaCol}>
                      <h2 className={styles.megaTitle}>
                        <Link href="/automatizacion-y-digitalizacion-integrada/">Automatización &amp; Digitalización Integrada</Link>
                      </h2>
                    </div>
                  </div>
                </div>
              </li>
              <li onMouseEnter={() => setOpen("catalogo")}>
                <div className={styles.menuTitle}>
                  <Link href="/tienda/">CATÁLOGO</Link>
                  <button
                    type="button"
                    aria-expanded={open === "catalogo"}
                    aria-label="Abrir CATÁLOGO"
                    onClick={() => setOpen(open === "catalogo" ? null : "catalogo")}
                    className={open === "catalogo" ? styles.caretOpen : ""}
                  >
                    <CaretDown size={16} />
                  </button>
                </div>
                <div className={`${styles.mega} ${open === "catalogo" ? styles.megaOpen : ""}`}>
                  <div className={styles.megaInner}>
                    <div className={styles.megaCol}>
                      <h2 className={styles.megaTitle}>
                        <Link href="/iluminacion-profesional-conectada/">Iluminación LED</Link>
                      </h2>
                      <ul className={`${styles.megaLinks} ${styles.megaLinksCols}`}>
                        {CATALOG_LINKS.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href}>{l.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
              <li onMouseEnter={() => setOpen(null)}>
                <div className={styles.menuTitle}>
                  <Link href="/quienes-somos/" className={active("/quienes-somos/")}>QUIENES SOMOS</Link>
                </div>
              </li>
              <li onMouseEnter={() => setOpen(null)}>
                <div className={styles.menuTitle}>
                  <Link href="/noticias/" className={active("/noticias/")}>NOTICIAS</Link>
                </div>
              </li>
              <li onMouseEnter={() => setOpen(null)}>
                <div className={styles.menuTitle}>
                  <Link href="/contacto/" className={active("/contacto/")}>CONTACTO</Link>
                </div>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.ctaWrap}>
            <a className={styles.cta} href={CONTACT.whatsapp}>
              Hablar con un experto
            </a>
          </div>
          <SocialIcons />
        </div>
      </div>

      {/* ---------- Móvil / tablet ---------- */}
      <div className={styles.mobile}>
        <div className={styles.mobileTop}>
          <Link href="/" className={styles.mobileLogo}>
            <img src={LOGO_DARK_BG} alt="" width={360} height={194} />
          </Link>
          <button
            type="button"
            className={styles.toggle}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <Close size={32} /> : <MenuBar size={32} />}
          </button>
        </div>
        <nav className={`${styles.dropdown} ${mobileOpen ? styles.dropdownOpen : ""}`} aria-label="Menú móvil">
          <ul>
            <li className={styles.dropHeading}>
              <Link href="/iluminacion-profesional-conectada/" onClick={() => setMobileOpen(false)}>
                Areas de negocio
              </Link>
            </li>
            {LIGHTING_LINKS.map((l, i) => (
              <li key={i}>
                <Link href={l.href} onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/suministros-y-componentes-electricos-y-electronicos/" onClick={() => setMobileOpen(false)}>
                Suministros y Componentes Eléctricos y Electrónicos
              </Link>
            </li>
            <li className={styles.dropHeading}>
              <Link href="/tienda/" onClick={() => setMobileOpen(false)}>
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/quienes-somos/" onClick={() => setMobileOpen(false)}>
                Quienes somos
              </Link>
            </li>
            <li>
              <Link href="/noticias/" onClick={() => setMobileOpen(false)}>
                Noticias
              </Link>
            </li>
            <li>
              <Link href="/contacto/" onClick={() => setMobileOpen(false)}>
                Contacto
              </Link>
            </li>
          </ul>
        </nav>
        <SocialIcons className={styles.mobileSocial} />
      </div>
    </header>
  );
}
