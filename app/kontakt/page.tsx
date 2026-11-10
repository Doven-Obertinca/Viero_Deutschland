import { getVisualizerMaterials } from "@/lib/visualizer/catalog";
import { isShopwareId } from "@/lib/shopware/urls";
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

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string | string[] }>;
}) {
  const { material } = await searchParams;
  const ids = (Array.isArray(material) ? material : [material ?? ""])
    .filter(isShopwareId)
    .slice(0, 12);
  const [form, footer, materials] = await Promise.all([
    getContactForm(),
    getFooterContent(),
    ids.length ? getVisualizerMaterials().catch(() => []) : [],
  ]);
  const selected = materials.filter(
    (item) => item.texture && ids.includes(item.id),
  );
  const initialMessage = selected.length
    ? [
        "Ich interessiere mich für folgende Oberflächen aus dem Raumvisualisierer:",
        ...selected.map(
          (item) =>
            `• ${item.name}${item.color ? ` · ${item.color}` : ""} (${item.id})`,
        ),
      ].join("\n")
    : undefined;
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
              initialMessage={initialMessage}
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
