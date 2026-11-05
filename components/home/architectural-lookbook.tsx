import Image from "next/image";
import { architecturalSpaces } from "@/lib/home/spaces";
import { ArchitecturalReel } from "./architectural-reel";
import styles from "./architectural-lookbook.module.css";

export function ArchitecturalLookbook() {
  return (
    <section
      id="inspiration"
      className={styles.chapter}
      aria-labelledby="spaces-title"
    >
      <header className={styles.opening}>
        <p className={styles.marker}>04 / INSPIRATION</p>
        <h2 id="spaces-title">
          Räume mit<span>Charakter.</span>
        </h2>
        <p className={styles.intro}>
          Oberfläche, Licht, Architektur.
          <br />
          Sechs Perspektiven auf den Raum.
        </p>
      </header>

      <ArchitecturalReel className={styles.reel}>
        <div className={styles.viewport}>
          <p className={styles.filmLabel} aria-hidden="true">
            VIERO — SPACES / 01—06
          </p>
          <div className={styles.strip}>
            {architecturalSpaces.map((space, index) => (
              <figure className={styles.frame} key={space.slug}>
                <a
                  className={styles.imageLink}
                  href={space.href}
                  aria-label={`${space.title} — VIERO Referenz ansehen`}
                  aria-describedby={`space-caption-${space.slug}`}
                >
                  <Image
                    src={`/brand/spaces/${space.slug}.webp`}
                    alt={space.alt}
                    width={space.width}
                    height={space.height}
                    sizes={
                      [
                        "(max-width: 639px) 90vw, (max-width: 1099px) 80vw, 70vw",
                        "(max-width: 639px) 72vw, (max-width: 1099px) 45vw, 35vw",
                        "(max-width: 639px) 84vw, (max-width: 1099px) 50vw, 66vw",
                        "(max-width: 639px) 78vw, (max-width: 1099px) 65vw, 55vw",
                        "(max-width: 639px) 84vw, (max-width: 1099px) 75vw, 60vw",
                        "(max-width: 639px) 84vw, (max-width: 1099px) 60vw, 68vw",
                      ][index]
                    }
                    loading="lazy"
                  />
                </a>
                <figcaption id={`space-caption-${space.slug}`}>
                  <span className={styles.number}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    {space.title}
                    <span className={styles.finish}>{space.finish}</span>
                  </span>
                  <a
                    href={space.href}
                    aria-label={`${space.title} — Referenz öffnen`}
                  >
                    Projekt ansehen
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </ArchitecturalReel>

      <div className={styles.ending}>
        <p className={styles.marker}>VIERO / RÄUME</p>
        <p className={styles.closing}>
          Oberflächen<span>werden Räume.</span>
        </p>
        <a href="https://www.vierodecoratives.com/projects-references/">
          Weitere Referenzen
        </a>
      </div>
    </section>
  );
}
