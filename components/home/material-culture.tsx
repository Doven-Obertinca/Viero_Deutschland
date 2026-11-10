import Image from "next/image";
import { MaterialGallery } from "./material-gallery";
import styles from "./material-culture.module.css";

export function MaterialCulture() {
  return (
    <section
      id="materialkultur"
      className={styles.surface}
      aria-labelledby="material-culture-title"
    >
      <div className={styles.chapter}>
        <div className={styles.opening}>
          <p className={styles.marker}>VIERO / 03 — MATERIALKULTUR</p>
          <h2 id="material-culture-title" className={styles.statement}>
            <span className={styles.line}>
              <span>Von der Materie.</span>
            </span>{" "}
            <span className={styles.line}>
              <span>Zur Geste.</span>
            </span>{" "}
            <span className={styles.line}>
              <span>Zum Raum.</span>
            </span>
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
          <MaterialGallery />
          <p className={styles.materialCopy}>
            Am Anfang steht die Auswahl der Rohstoffe. In der Verarbeitung
            entsteht der gewünschte dekorative Effekt.
          </p>
        </div>

        <figure className={styles.gesture}>
          <div className={styles.gesturePanel}>
            <div className={styles.gestureVisual}>
              <Image
                src="/brand/material-culture/fermento.webp"
                alt="Boutique mit kupferroten, strukturierten Fermento-Wänden"
                fill
                quality={90}
                sizes="(max-width: 639px) max(155vw, 37.5rem), (min-width: 1800px) 1900px, 105vw"
                loading="lazy"
              />
            </div>
            <div className={styles.gestureCopy}>
              <p className={styles.marker}>02 / GESTE</p>
              <h3>
                Die eigene
                <br />
                Handschrift.
              </h3>
              <p>
                Jeder dekorative Effekt kann vom Verarbeiter neu interpretiert
                und individualisiert werden. Das Detail trägt seine Handschrift.
              </p>
            </div>
          </div>
          <figcaption>02 — Die Verarbeitung prägt den Ausdruck.</figcaption>
        </figure>

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
            <div className={styles.spaceVisual}>
              <Image
                src="/brand/material-culture/tramato.webp"
                alt="Türkisgrüne Tramato-Wand in einem Arbeitszimmer mit Rundbogenfenster und drei Pendelleuchten"
                width={4096}
                height={4096}
                quality={90}
                sizes="(max-width: 639px) 84vw, (max-width: 959px) 60vw, (min-width: 1800px) 900px, 51vw"
                loading="lazy"
              />
            </div>
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
      </div>
    </section>
  );
}
