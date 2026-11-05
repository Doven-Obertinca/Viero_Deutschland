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
        <h1 id="contact-title">{form?.title ?? "Kontaktformular"}</h1>
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
    </section>
  );
}
