import { CmsRichText } from "@/components/content/cms-rich-text";
import { EnquiryForm } from "@/components/showroom/enquiry-form";
import { getAcademy } from "@/lib/content/academy";
import { academyPath } from "@/lib/content/academy-route";
import { getFooterContent } from "@/lib/content/footer";
import { metadata } from "@/lib/seo";
import { SectionStack } from "../ueber-uns/section-stack";
import { submitAcademy } from "./actions";
import { AcademyVideo } from "./hero-video";
import styles from "./academy.module.css";

export const dynamic = "force-dynamic";
export const generateMetadata = async () => {
  const academy = await getAcademy();
  return metadata(academy?.title ?? "Akademie", academyPath);
};

export default async function AcademyPage() {
  const [academy, footer] = await Promise.all([
    getAcademy(),
    getFooterContent(),
  ]);
  const links = footer.groups.flatMap((group) => group.links);
  const title = academy?.title ?? "Akademie";
  const rich = (html?: string) =>
    html && (
      <CmsRichText
        html={html}
        origin={academy?.origin ?? footer.origin}
        links={links}
      />
    );

  return (
    <article className={styles.page}>
      <header className={styles.hero} data-fullscreen-hero>
        {academy?.video && <AcademyVideo src={academy.video} />}
        <h1>
          <span>{title}</span>
        </h1>
        {academy?.intro && (
          <a
            className={styles.scroll}
            href="#akademie-inhalt"
            aria-label="Zum Akademie-Inhalt"
          >
            ↓
          </a>
        )}
      </header>

      <SectionStack id="akademie-inhalt">
        {academy ? (
          <>
            {academy.intro && (
              <section
                className={`${styles.panel} ${styles.intro}`}
                data-scroll-scene
              >
                <div className={styles.content}>{rich(academy.intro)}</div>
              </section>
            )}
            {academy.offers.length > 0 && (
              <section
                className={`${styles.panel} ${styles.offers}`}
                id="seminare"
                tabIndex={-1}
                data-scroll-scene
              >
                <div className={styles.content}>
                  <h2>
                    {rich(
                      academy.offerHeading?.replace(
                        /^\s*<p\b[^>]*>|<\/p>\s*$/gi,
                        "",
                      ),
                    )}
                  </h2>
                  <div className={styles.offerGrid}>
                    {academy.offers.map((offer, index) => (
                      <div key={index} className={styles.offer}>
                        {rich(offer)}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {academy.syllabus && (
              <section
                className={`${styles.panel} ${styles.syllabus}`}
                data-scroll-scene
              >
                <div className={styles.content}>
                  {rich(academy.syllabus.replace(/<(\/?)(h3)\b/gi, "<$1h2"))}
                </div>
              </section>
            )}
            <section
              className={`${styles.panel} ${styles.enquiry}`}
              id="seminar-anfrage"
              tabIndex={-1}
              data-scroll-scene
            >
              <div className={styles.formLayout}>
                {academy.form ? (
                  <>
                    <h2>{academy.form.title}</h2>
                    <EnquiryForm
                      definition={academy.form}
                      privacyHref={footer.privacy?.href}
                      submitAction={submitAcademy}
                      copy={{
                        requiredNote:
                          "Die mit einem Stern (*) markierten Felder sind Pflichtfelder.",
                        submitLabel: "Absenden",
                        returnHref: academyPath,
                        returnLabel: title,
                      }}
                    />
                  </>
                ) : (
                  <a href={`${academy.source}#seminar-anfrage`}>
                    Seminar Anfragen
                  </a>
                )}
              </div>
            </section>
          </>
        ) : (
          <p className={styles.unavailable}>
            <a href="https://viero-deutschland.de/Akademie/">
              {title} im Viero-Shop
            </a>
          </p>
        )}
      </SectionStack>
    </article>
  );
}
