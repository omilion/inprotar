import styles from "./FlipBox.module.css";

/** Tarjeta con efecto "fade" al pasar el mouse (Element Pack Flip Box). */
export default function FlipBox({
  image,
  imagePosition = "0 0",
  overlay,
  title,
  desc,
  button,
}: {
  image: string;
  imagePosition?: string;
  overlay: string;
  title: string;
  desc: string;
  button: { text: string; href?: string };
}) {
  return (
    <div className={styles.box}>
      <div className={styles.front} style={{ backgroundImage: `url("${image}")`, backgroundPosition: imagePosition }}>
        <div className={styles.overlay} style={{ backgroundColor: overlay }}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      </div>
      <div className={styles.back}>
        <div className={styles.overlay}>
          <div className={styles.desc}>{desc}</div>
          {button.href ? (
            <a className={styles.btn} href={button.href}>
              {button.text}
            </a>
          ) : (
            <span className={styles.btn}>{button.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
