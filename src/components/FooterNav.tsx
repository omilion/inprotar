"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import type { NavLink } from "@/data/site";

/** Lista de enlaces del footer; marca el ítem activo con subrayado como en el original. */
export default function FooterNav({ links, bare }: { links: NavLink[]; bare?: boolean }) {
  const pathname = usePathname();
  const list = (
    <ul>
      {links.map((l, i) => (
        <li key={i}>
          <Link href={l.href} className={pathname === l.href ? styles.active : undefined}>
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
  if (bare) return list;
  return (
    <nav className={styles.nav} aria-label="Iluminación Profesional Conectada">
      <ul>
        {links.map((l, i) => (
          <li key={i}>
            <Link href={l.href} className={pathname === l.href ? styles.active : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
