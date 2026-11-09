import Image from "next/image";
import { CmsRichText } from "@/components/content/cms-rich-text";
import { EnquiryForm } from "@/components/showroom/enquiry-form";
import { getContactForm } from "@/lib/content/contact";
import { contactPath } from "@/lib/content/contact-route";
import { getFooterDocument } from "@/lib/content/document";
import { getFooterContent } from "@/lib/content/footer";
import { metadata as pageMetadata } from "@/lib/seo";
import { submitContact } from "./actions";
import styles from "@/components/showroom/shopware-form.module.css";

export const metadata = pageMetadata("Kontakt", contactPath);

export default async function ContactPage() {
  const [form, footer] = await Promise.all([
    getContactForm(),
    getFooterContent(),
  ]);
  const privacy = footer.privacy
    ? await getFooterDocument(footer.privacy.id)
    : null;

  return (
    <section className={styles.page} aria-labelledby="contact-title">
      <div className={styles.container}>
        <header className={styles.intro}>
          <p>VIERO / DEUTSCHLAND</p>
          <h1 id="contact-title">Kontakt</h1>
          <address>
            {footer.email && (
              <a href={`mailto:${footer.email}`}>{footer.email}</a>
            )}
            {footer.phone && (
              <a href={`tel:${footer.phone.replace(/[^+\d]/g, "")}`}>
                {footer.phone}
              </a>
            )}
          </address>
          <Image
            className={styles.materialImage}
            src="/brand/kontakt/abstract-sand-dunes.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 92vw, (max-width: 1440px) 38vw, 490px"
            quality={90}
          />
        </header>
        <div className={styles.formPanel}>
          <h2>{form?.title ?? "Kontaktformular"}</h2>
          {form ? (
            <EnquiryForm
              definition={form}
              submitAction={submitContact}
              privacyHref={
                footer.privacy?.href ??
                "https://viero-deutschland.de/Datenschutz/"
              }
              shopwareLayout
              privacyContent={
                privacy?.html ? (
                  <CmsRichText
                    html={privacy.html}
                    origin={footer.origin}
                    links={footer.groups.flatMap((group) => group.links)}
                  />
                ) : undefined
              }
              copy={{
                requiredNote:
                  "Die mit einem Stern (*) markierten Felder sind Pflichtfelder.",
                submitLabel: "Absenden",
                returnHref: contactPath,
                returnLabel: "Zurück zum Kontaktformular",
              }}
            />
          ) : (
            <a href="https://viero-deutschland.de/Kontakt/">
              Kontaktformular im Viero-Shop öffnen
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
