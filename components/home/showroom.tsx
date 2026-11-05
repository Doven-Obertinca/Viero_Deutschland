import Image from "next/image";
import { getShowroom } from "@/lib/home/showroom";
import type { ShowroomContent } from "@/lib/home/showroom-content";
import styles from "./showroom.module.css";

export function ShowroomExperience({
  showroom,
}: {
  showroom: ShowroomContent;
}) {
  const [primary, ...supporting] = showroom.media;
  return (
    <section
      id="showroom"
      className={styles.chapter}
      aria-labelledby="showroom-title"
    >
      <header className={styles.invitation}>
        <p className={styles.marker}>
          05 / {showroom.title.toLocaleUpperCase("de")}
        </p>
        <h2 id="showroom-title">{showroom.title}</h2>
        {showroom.headline && (
          <p className={styles.headline}>{showroom.headline}</p>
        )}
      </header>

      {primary && (
        <figure className={styles.portal}>
          <div className={styles.portalVisual}>
            <Image
              src={primary.url}
              alt={primary.alt}
              fill
              sizes="100vw"
              loading="lazy"
            />
          </div>
          <figcaption>
            <span>01 / {showroom.title}</span>
            <span>VIERO DEUTSCHLAND</span>
          </figcaption>
        </figure>
      )}

      {supporting.length > 0 && (
        <div className={styles.continuation}>
          {supporting.map((media, index) => (
            <figure key={media.id}>
              <Image
                src={media.url}
                alt={media.alt}
                width={media.width}
                height={media.height}
                sizes="(max-width: 639px) 85vw, 55vw"
                loading="lazy"
              />
              <figcaption>
                {String(index + 2).padStart(2, "0")} / {showroom.title}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className={styles.visit}>
        <h3 className={styles.visitTitle}>{showroom.title}</h3>
        {showroom.description && (
          <p className={styles.visitCopy}>{showroom.description}</p>
        )}
        {(showroom.appointmentUrl ||
          showroom.directionsUrl ||
          showroom.appointmentNote ||
          showroom.pageUrl) && (
          <div className={styles.actions}>
            {showroom.appointmentNote && <p>{showroom.appointmentNote}</p>}
            {showroom.appointmentUrl && (
              <a href="/showroom#beratung">Beratungstermin anfragen</a>
            )}
            {showroom.directionsUrl && (
              <a href={showroom.directionsUrl}>Route planen</a>
            )}
            {!showroom.appointmentUrl && showroom.pageUrl && (
              <a href="/showroom">{showroom.title} kennenlernen</a>
            )}
          </div>
        )}
        {showroom.address.length > 0 && (
          <div className={styles.address}>
            <h4>Adresse</h4>
            <address>
              {showroom.address.map((line, index) => (
                <span key={index}>{line}</span>
              ))}
            </address>
          </div>
        )}
        {showroom.openingHours.length > 0 && (
          <div className={styles.hours}>
            <h4>Öffnungszeiten</h4>
            <dl>
              {showroom.openingHours.map((hour, index) => (
                <div key={index}>
                  <dt>{hour.label}</dt>
                  <dd>
                    {hour.ranges.map((range, rangeIndex) => (
                      <span key={rangeIndex}>{range}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {(showroom.phone || showroom.email) && (
          <div className={styles.contact}>
            <h4>Kontakt</h4>
            {showroom.phone && (
              <a href={showroom.phone.href}>{showroom.phone.label}</a>
            )}
            {showroom.email && (
              <a href={showroom.email.href}>{showroom.email.label}</a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export async function Showroom() {
  const showroom = await getShowroom();
  return showroom ? <ShowroomExperience showroom={showroom} /> : null;
}
