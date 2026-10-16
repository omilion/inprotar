import { getProductos, productoParaTarjeta } from "@/lib/catalogo";
import ProductGrid from "@/components/widgets/ProductGrid";
import JsonLd from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import s from "./page.module.css";

const PATH = "/tienda/";
export const metadata = buildMetadata(PATH);

export default function TiendaPage() {
  return (
    <>
      <JsonLd path={PATH} />
      <section className={s.c_b7b6954}>
        <div className={s.c_b7b6954_in}>
          <h1 className={s.w_3bb68eb}>Catálogo</h1>
        </div>
      </section>
      <section className={s.c_db7fbd4}>
        <div className={s.c_db7fbd4_in}>
          <div className={s.w_1482f46} />
        </div>
      </section>
      <section className={s.c_7941785}>
        <div className={s.c_7941785_in}>
          <div className={s.w_ce5949e}>
            <ProductGrid total={getProductos().length} page={1} items={getProductos().slice(0, 20).map(productoParaTarjeta)} />
          </div>
        </div>
      </section>
      <section className={s.c_0823c46}>
        <div className={s.c_0823c46_in}>
          <div className={s.w_0a54143} />
        </div>
      </section>
    </>
  );
}
