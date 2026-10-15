import styles from "./Posts.module.css";

export type PostItem = {
  title: string;
  href: string;
  img: string;
  alt?: string;
  date: string;
  excerpt?: string;
  categories?: { name: string; href: string }[];
};

/** Grilla de noticias de la portada (Element Pack Post Grid): 2 destacadas + 3 pequeñas. */
export function PostGrid({ items }: { items: PostItem[] }) {
  return (
    <div className={styles.grid}>
      {items.map((p, i) => (
        <div key={p.href} className={`${styles.gItem} ${i < 2 ? styles.big : styles.small}`}>
          <a href={p.href} className={styles.gImg} style={{ backgroundImage: `url("${p.img}")` }} aria-label={p.title} />
          <div className={styles.gOverlay} />
          <div className={styles.gDesc}>
            <h2 className={styles.gTitle}>
              <a href={p.href}>{p.title}</a>
            </h2>
            {i < 2 && (
              <div className={styles.gMeta}>
                <span>
                  <a href="/author/spadmin/">spadmin</a>
                </span>
                <span>{p.date}</span>
                <span>0</span>
              </div>
            )}
          </div>
          {p.categories && (
            <div className={styles.gCats}>
              {p.categories.map((c) => (
                <a key={c.href} href={c.href}>
                  {c.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Tarjetas del archivo de noticias (Elementor Archive Posts, skin "cards"). */
export function PostCards({ items }: { items: PostItem[] }) {
  return (
    <div className={styles.cards}>
      {items.map((p) => (
        <article key={p.href} className={styles.card}>
          <a href={p.href} className={styles.thumb}>
            <img src={p.img} alt={p.alt ?? ""} loading="lazy" />
          </a>
          <div className={styles.text}>
            <h3 className={styles.cTitle}>
              <a href={p.href}>{p.title}</a>
            </h3>
            {p.excerpt && (
              <div className={styles.excerpt}>
                <p>{p.excerpt}</p>
              </div>
            )}
            <a href={p.href} className={styles.more}>
              Read More »
            </a>
          </div>
          <div className={styles.meta}>
            <span>{p.date}</span>
            <span className={styles.sep}>No hay comentarios</span>
          </div>
        </article>
      ))}
    </div>
  );
}
