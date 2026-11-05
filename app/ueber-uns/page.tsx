import { Fragment } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { CmsRichText } from "@/components/content/cms-rich-text";
import { getAbout } from "@/lib/content/about";
import { aboutPath } from "@/lib/content/about-route";
import { getFooterContent } from "@/lib/content/footer";
import { metadata } from "@/lib/seo";
import { MaterialStudy } from "./material-study";
import { SectionStack } from "./section-stack";
import styles from "./about.module.css";

const source = "https://viero-deutschland.de/UEber-uns/";
const heroImage = "/brand/about/lavender-interior-wide.webp";
const gallery = [
  {
    src: "/brand/about/kyle-house.jpg",
    alt: "Freistehende dunkle Badewanne neben einem Fenster",
    width: 1600,
    height: 2400,
  },
  {
    src: "/brand/about/dubai-apartment.jpg",
    alt: "Wohnraum mit horizontal strukturierter Wand und Ledersofa",
    width: 2000,
    height: 1022,
  },
  {
    src: "/brand/about/cafe-interior.jpg",
    alt: "Café mit strukturierten Wänden und einer beleuchteten Theke",
    width: 1920,
    height: 1080,
  },
];
const { props: portraitHero } = getImageProps({
  src: "/brand/about/lavender-interior.webp",
  alt: "Lavendelfarbene Putzbögen und eine Treppe im Tageslicht",
  width: 800,
  height: 1200,
  unoptimized: true,
  loading: "eager",
  fetchPriority: "high",
});

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
        <picture className={styles.heroArt}>
          <source media="(min-width: 701px)" srcSet={heroImage} />
          {/* Art-directed picture with pre-encoded WebP sources. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...portraitHero} />
        </picture>
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
                          index % 2 === 0
                            ? "/brand/material-culture/gesture.webp"
                            : "/brand/spaces/domazlicka.webp"
                        }
                        alt={
                          index % 2 === 0
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
                <section
                  className={styles.gallery}
                  aria-label="Innenräume"
                  data-scroll-scene
                >
                  {gallery.map((photo) => (
                    <figure key={photo.src}>
                      <Image
                        {...photo}
                        quality={90}
                        sizes="(max-width: 700px) 88vw, 34vw"
                      />
                    </figure>
                  ))}
                </section>
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
            src="/brand/about/travertine-kitchen-restored.webp"
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
