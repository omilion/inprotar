import styles from "./ProductGrid.module.css";

export type ShopProduct = { title: string; href: string; img: string; alt: string; category?: { name: string; href: string } };

/** Grilla de productos del catálogo (WooLentor product archive, 4 columnas). */
export default function ProductGrid({
  items,
  total,
  page = 1,
  perPage = 20,
}: {
  items: ShopProduct[];
  total: number;
  page?: number;
  perPage?: number;
}) {
  const start = (page - 1) * perPage + 1;
  const pages = Math.ceil(total / perPage);
  const href = (n: number) => (n === 1 ? "/tienda/" : `/tienda/page/${n}/`);
  return (
    <div>
      <div className={styles.bar}>
        <div className={styles.views} aria-hidden="true">
          <span className={styles.viewActive}>▦</span>
          <span>☰</span>
        </div>
        <p className={styles.count}>
          Mostrando {start}–{start + items.length - 1} de {total} resultados
        </p>
        <select className={styles.order} defaultValue="menu_order" aria-label="Pedido de la tienda">
          <option value="menu_order">Orden predeterminado</option>
          <option value="popularity">Ordenar por popularidad</option>
          <option value="rating">Ordenar por puntuación media</option>
          <option value="date">Ordenar por los últimos</option>
          <option value="price">Ordenar por precio: bajo a alto</option>
          <option value="price-desc">Ordenar por precio: alto a bajo</option>
        </select>
      </div>
      <div className={styles.grid}>
        {items.map((p) => (
          <div key={p.href} className={styles.item}>
            <div className={styles.inner}>
              <a href={p.href} className={styles.image}>
                <img src={p.img} alt={p.alt} loading="lazy" />
              </a>
              <div className={styles.content}>
                {p.category && (
                  <div className={styles.cat}>
                    <a href={p.category.href}>{p.category.name}</a>
                  </div>
                )}
                <h4 className={styles.title}>
                  <a href={p.href}>{p.title}</a>
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <nav className={styles.pagination} aria-label="Paginación de productos">
          {page > 1 && <a href={href(page - 1)}>←</a>}
          {Array.from({ length: pages }, (_, k) =>
            k + 1 === page ? (
              <span key={k} aria-current="page">
                {k + 1}
              </span>
            ) : (
              <a key={k} href={href(k + 1)}>
                {k + 1}
              </a>
            )
          )}
          {page < pages && <a href={href(page + 1)}>→</a>}
        </nav>
      )}
    </div>
  );
}
