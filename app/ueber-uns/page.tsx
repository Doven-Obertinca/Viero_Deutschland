import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { CmsRichText } from "@/components/content/cms-rich-text";
import { getAbout } from "@/lib/content/about";
import { aboutPath } from "@/lib/content/about-route";
import { getFooterContent } from "@/lib/content/footer";
import { metadata } from "@/lib/seo";
import { InteriorGallery } from "./interior-gallery";
import { MaterialStudy } from "./material-study";
import { SectionStack } from "./section-stack";
import styles from "./about.module.css";

const source = "https://viero-deutschland.de/UEber-uns/";
const heroImage = "/brand/about/iron-3.webp";
export async function generateMetadata() {
  const about = await getAbout();
  const base = metadata(about?.title ?? "Über uns", aboutPath);
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [heroImage] },
    ...(about ? {} : { robots: { index: false } }),
  };
}

export default async function AboutPage() {
  const [about, footer] = await Promise.all([getAbout(), getFooterContent()]);
  const links = footer.groups.flatMap((group) => group.links);
  const contact = links.find((link) => /^kontakt$/i.test(link.title));
  const title = about?.title ?? "Über uns";

  function richText(html: string) {
    return <CmsRichText html={html} origin={footer.origin} links={links} />;
  }

  return (
    <article className={styles.page}>
      <header className={styles.hero} data-fullscreen-hero>
        <div className={styles.heroArt}>
          <Image
            src={heroImage}
            alt="Dunkles Eisenrelief mit feinen metallischen Akzenten im Streiflicht"
            fill
            sizes="100vw"
            quality={90}
            preload
          />
        </div>
        <div className={styles.heroType}>
          <p className={styles.kicker}>Viero / Deutschland</p>
          <h1 aria-label={title}>
            {title.split(/\s+/).map((word, index) => (
              <span key={index}>
                <span>{word}</span>
              </span>
            ))}
          </h1>
        </div>
        <a className={styles.scroll} href="#viero-geschichte">
          <span aria-hidden="true">↓</span> Weiter
        </a>
        <span className={styles.folio} aria-hidden="true">
          01 / 03
        </span>
      </header>

      <SectionStack id="viero-geschichte">
        {about ? (
          about.chapters.map((chapter, chapterIndex) =>
            chapter.type === "timeline" ? (
              <section
                className={styles.history}
                key={chapterIndex}
                data-scroll-scene
              >
                <span className={styles.kicker} aria-hidden="true">
                  03 / 03
                </span>
                <h2>{chapter.title}</h2>
                <div className={styles.timeline}>
                  {richText(chapter.intro)}
                  {chapter.entries.map((entry, index) => (
                    <details
                      key={index}
                      name={`geschichte-${chapterIndex}`}
                      open={index === 0}
                    >
                      <summary>{entry.title}</summary>
                      <div>{richText(entry.html)}</div>
                    </details>
                  ))}
                </div>
              </section>
            ) : (
              <Fragment key={chapterIndex}>
                {richText(chapter.intro)}
                {chapter.entries.map((entry, index) => (
                  <section
                    className={styles.profile}
                    key={index}
                    data-scroll-scene
                  >
                    <div className={styles.profileCopy}>
                      <h2>{entry.title}</h2>
                      <div className={styles.prose}>{richText(entry.html)}</div>
                    </div>
                    <div className={styles.profileArt}>
                      <Image
                        src={
                          index === 0
                            ? "/brand/about/ghibli-damascato.webp"
                            : index % 2 === 0
                              ? "/brand/material-culture/gesture.webp"
                              : "/brand/spaces/domazlicka.webp"
                        }
                        alt={
                          index === 0
                            ? "Beige Ghibli-Damascato-Oberfläche mit Rundbogen und Stillleben"
                            : index % 2 === 0
                              ? "Detail aus der handwerklichen Oberflächengestaltung"
                              : "Innenraum mit grauer Spachtelwand und schwarzen Akzenten"
                        }
                        fill
                        quality={90}
                        sizes="(max-width: 700px) 88vw, 47vw"
                      />
                    </div>
                  </section>
                ))}
                <InteriorGallery />
                <section
                  className={styles.materialScene}
                  aria-label="Material und Raum"
                  data-scroll-scene
                >
                  <MaterialStudy />
                </section>
              </Fragment>
            ),
          )
        ) : (
          <div className={styles.unavailable}>
            <p>Die Inhalte sind vorübergehend nicht verfügbar.</p>
            <a href={source}>Über uns im Viero-Shop ↗</a>
          </div>
        )}
        <section
          className={styles.closing}
          aria-label="Produkte und Kontakt"
          data-scroll-scene
        >
          <Image
            src="/brand/about/spatolato-rustico.webp"
            alt=""
            fill
            quality={90}
            sizes="100vw"
          />
          <div className={styles.actions}>
            <Link href="/produkte">Produkte entdecken</Link>
            <Link href={contact?.href ?? "/showroom"}>Kontakt aufnehmen</Link>
          </div>
        </section>
      </SectionStack>
    </article>
  );
}
