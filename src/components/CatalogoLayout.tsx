import type { ReactNode } from "react";
import s from "@/app/tienda/page.module.css";
import c from "./CatalogoLayout.module.css";

export default function CatalogoLayout({ titulo, children }: { titulo: string; children: ReactNode }) {
  return <>
    <section className={s.c_b7b6954}>
      <div className={s.c_b7b6954_in}><h1 className={s.w_3bb68eb}>{titulo}</h1></div>
    </section>
    <section className={c.container}>{children}</section>
  </>;
}
