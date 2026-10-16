import { getProductos, productoParaTarjeta } from "@/lib/catalogo";
import ProductGrid from "@/components/widgets/ProductGrid";
import JsonLd from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import s from "../../page.module.css";

const PATH = "/tienda/page/2/";
export const metadata = buildMetadata(PATH);

// Segunda página del catálogo (WooCommerce muestra 20 productos por página).
export default function TiendaPage2() {
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
          <div className={s.w_ce5949e}>
            <ProductGrid total={getProductos().length} page={2} items={getProductos().slice(20, 40).map(productoParaTarjeta)} />
          </div>
        </div>
      </section>
    </>
  );
}
