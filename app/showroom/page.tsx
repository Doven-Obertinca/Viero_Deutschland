import Image from "next/image";
import Link from "next/link";
import { getShowroom } from "@/lib/home/showroom";
import { getShowroomForm } from "@/lib/home/showroom-form";
import { EnquiryForm } from "@/components/showroom/enquiry-form";
import { metadata as pageMetadata } from "@/lib/seo";
import styles from "@/components/showroom/showroom-page.module.css";
import { SectionStack } from "../ueber-uns/section-stack";
export const metadata = pageMetadata("Showroom", "/showroom");
export default async function ShowroomPage() {
  const [showroom, form] = await Promise.all([
    getShowroom(),
    getShowroomForm(),
  ]);
  if (!showroom)
    return (
      <section className={styles.unavailable}>
        <h1>Showroom</h1>
        <p>
          Die Showroom-Informationen sind vorübergehend nicht verfügbar. Bitte
          versuchen Sie es später erneut.
        </p>
        <Link href="/">Zur Startseite</Link>
      </section>
    );
  const primary = showroom.media[0];
  return (
    <div className={styles.page}>
      <SectionStack id="showroom-inhalt">
        <div className={styles.opening} data-scroll-scene>
          <header className={styles.intro}>
            <Link href="/" className={styles.back}>
              VIERO / DEUTSCHLAND
            </Link>
            <p className={styles.label}>MATERIAL. GANZ PERSÖNLICH.</p>
            <h1>{showroom.title}</h1>
            <div className={styles.invitation}>
              <p>{showroom.headline}</p>
              {form && <a href="#beratung">Ihren Besuch anfragen</a>}
            </div>
          </header>
          {primary && (
            <figure className={styles.hero}>
              <div>
                <Image
                  src={primary.url}
                  alt={primary.alt}
                  fill
                  sizes="(max-width: 639px) 100vw, 90vw"
                  loading="eager"
                />
              </div>
              <figcaption>
                <span>VIERO / {showroom.title.toLocaleUpperCase("de")}</span>
                <span>OBERFLÄCHEN IM RAUM</span>
              </figcaption>
            </figure>
          )}
        </div>
        <section
          className={styles.story}
          aria-labelledby="experience-title"
          data-scroll-scene
        >
          <div>
            <p className={styles.label}>01 / VOR ORT</p>
            <h2 id="experience-title">
              Sehen.
              <br />
              Berühren.
              <br />
              Entdecken.
            </h2>
          </div>
          <div className={styles.storyCopy}>
            {showroom.paragraphs?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {(showroom.address.length > 0 ||
              showroom.phone ||
              showroom.email ||
              showroom.openingHours.length > 0) && (
              <div className={styles.practical}>
                {showroom.address.length > 0 && (
                  <address>
                    {showroom.address.map((line, index) => (
                      <span key={index}>{line}</span>
                    ))}
                  </address>
                )}
                {showroom.openingHours.length > 0 && (
                  <div>
                    <h3>Öffnungszeiten</h3>
                    <dl>
                      {showroom.openingHours.map((hour, index) => (
                        <div key={index}>
                          <dt>{hour.label}</dt>
                          <dd>{hour.ranges.join(" / ")}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                {showroom.phone && (
                  <a href={showroom.phone.href}>{showroom.phone.label}</a>
                )}
                {showroom.email && (
                  <a href={showroom.email.href}>{showroom.email.label}</a>
                )}
                {showroom.directionsUrl && (
                  <a href={showroom.directionsUrl}>Route planen</a>
                )}
              </div>
            )}
          </div>
        </section>
        {showroom.media.length > 1 && (
          <div className={styles.additional} data-scroll-scene>
            {showroom.media.slice(1).map((media) => (
              <Image
                key={media.id}
                src={media.url}
                alt={media.alt}
                width={media.width}
                height={media.height}
                sizes="(max-width: 639px) 90vw, 55vw"
                loading="lazy"
              />
            ))}
          </div>
        )}
        <section
          className={styles.consultation}
          id="beratung"
          tabIndex={-1}
          data-scroll-scene
          aria-labelledby="consultation-title"
        >
          <div className={styles.consultationIntro}>
            <p className={styles.label}>02 / IHR BESUCH</p>
            <h2 id="consultation-title">
              Raum für
              <br />
              Ihre Ideen.
            </h2>
            <p>{showroom.appointmentNote}</p>
          </div>
          <div className={styles.formColumn}>
            {form ? (
              <>
                <p className={styles.formTitle}>{form.title}</p>
                <EnquiryForm definition={form} />
              </>
            ) : (
              <p>
                Das Anfrageformular ist vorübergehend nicht verfügbar. Bitte
                versuchen Sie es später erneut.
              </p>
            )}
          </div>
        </section>
        <div className={styles.closing} data-scroll-scene>
          <span>VIERO / THE ITALIAN EXPERIENCE</span>
          <Link href="/">Zurück zur Materialwelt</Link>
        </div>
      </SectionStack>
    </div>
  );
}
