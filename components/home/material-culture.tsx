import Image from "next/image";
import styles from "./material-culture.module.css";

export function MaterialCulture() {
  return (
    <section
      id="materialkultur"
      className={styles.chapter}
      aria-labelledby="material-culture-title"
    >
      <div className={styles.opening}>
        <p className={styles.marker}>VIERO / 03 — MATERIALKULTUR</p>
        <h2 id="material-culture-title" className={styles.statement}>
          Von der Materie.
          <span>Zur Geste.</span>
          <span>Zum Raum.</span>
        </h2>
        <p className={styles.prelude}>
          Die Auswahl des Materials. Die Handschrift der Verarbeitung.
          Italienische Dekorationskultur.
        </p>
      </div>

      <div className={styles.material}>
        <div className={styles.materialTitle}>
          <p className={styles.marker}>01 / MATERIE</p>
          <h3>Materie</h3>
        </div>
        <figure className={styles.materialFigure}>
          <div className={styles.materialReveal}>
            <Image
              src="/brand/material-culture/material.webp"
              alt="Helle VIERO Oberfläche mit feinen, unregelmäßigen Spachtelspuren"
              width={869}
              height={1186}
              sizes="(max-width: 639px) 84vw, (max-width: 959px) 52vw, (min-width: 1800px) 760px, 43vw"
              loading="lazy"
            />
          </div>
          <figcaption>
            01 — Struktur im Detail. Licht auf der Oberfläche.
          </figcaption>
        </figure>
        <p className={styles.materialCopy}>
          Am Anfang steht die Auswahl der Rohstoffe. In der Verarbeitung
          entsteht der gewünschte dekorative Effekt.
        </p>
      </div>

      <div className={styles.gesture}>
        <figure className={styles.gestureFigure}>
          <div className={styles.gestureVisual}>
            <Image
              src="/brand/material-culture/gesture.webp"
              alt="Ein Pinsel bearbeitet eine strukturierte, bronzefarbene dekorative Oberfläche"
              width={1195}
              height={870}
              sizes="(max-width: 639px) 90vw, (max-width: 959px) 68vw, (min-width: 1800px) 900px, 51vw"
              loading="lazy"
            />
          </div>
          <figcaption>02 — Die Verarbeitung prägt den Ausdruck.</figcaption>
        </figure>
        <div className={styles.gestureCopy}>
          <p className={styles.marker}>02 / GESTE</p>
          <h3>
            Die eigene
            <br />
            Handschrift.
          </h3>
          <p>
            Jeder dekorative Effekt kann vom Verarbeiter neu interpretiert und
            individualisiert werden. Das Detail trägt seine Handschrift.
          </p>
        </div>
      </div>

      <div className={styles.origin}>
        <div className={styles.originHeading}>
          <p className={styles.marker}>03 / RAUM — THE ITALIAN EXPERIENCE</p>
          <h3 className={styles.italy} aria-label="Made in Italy">
            <span>Made</span>
            <span>in</span>
            <span>Italy.</span>
          </h3>
        </div>
        <figure className={styles.spaceFigure}>
          <Image
            src="/brand/material-culture/space.webp"
            alt="VIERO Wandgestaltung mit wechselnden strukturierten Feldern hinter einem geflochtenen Stuhl und einer Tischleuchte"
            width={1438}
            height={1186}
            sizes="(max-width: 639px) 84vw, (max-width: 959px) 60vw, (min-width: 1800px) 900px, 51vw"
            loading="lazy"
          />
          <figcaption>03 — Material wird Teil des Raums.</figcaption>
        </figure>
        <p className={styles.originCopy}>
          VIERO steht für italienischen Stil. Für die Liebe zum Detail und den
          Dialog zwischen Tradition und Moderne.
        </p>
        <p className={styles.signature}>
          VIERO DECORATIVES<span>THE ITALIAN EXPERIENCE</span>
        </p>
      </div>
    </section>
  );
}
