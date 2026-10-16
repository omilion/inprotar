import { getArticulos } from "@/lib/content";
import { articuloParaTarjeta } from "@/lib/content/blog";
import { PostCards } from "@/components/widgets/Posts";
import JsonLd from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import s from "./page.module.css";

const PATH = "/noticias/";
export const metadata = buildMetadata(PATH);

export default function NoticiasPage() {
  return (
    <>
      <JsonLd path={PATH} />
      <section className={s.c_7012096}>
        <div className={s.c_c288f40}>
          <div className={s.w_ac39ab2} />
          <h1 className={s.w_13d9c8f}>Noticias</h1>
        </div>
        <div className={s.w_cc6aceb}>
          <PostCards items={getArticulos().map(articuloParaTarjeta)} />
        </div>
      </section>
    </>
  );
}
