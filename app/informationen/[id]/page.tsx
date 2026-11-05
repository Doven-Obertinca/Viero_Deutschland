import Link from "next/link";
import { notFound } from "next/navigation";
import { getFooterDocument } from "@/lib/content/document";
import { CmsRichText } from "@/components/content/cms-rich-text";
import { parseCmsForm } from "@/lib/home/showroom-form";
import { EnquiryForm } from "@/components/showroom/enquiry-form";
import { metadata as pageMetadata } from "@/lib/seo";
import styles from "@/components/content/document.module.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getFooterDocument(id);
  return document
    ? pageMetadata(document.title, `/informationen/${id}`)
    : { title: "Information nicht verfügbar", robots: { index: false } };
}
export default async function InformationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getFooterDocument(id);
  if (!document) notFound();
  const form = parseCmsForm(document.category);
  return (
    <article className={styles.page}>
      <header>
        <Link href="/">VIERO / DEUTSCHLAND</Link>
        <h1>{document.title}</h1>
        <p>Informationen von VIERO</p>
      </header>
      {document.html && (
        <div className={styles.content}>
          <CmsRichText
            html={document.html}
            origin={document.footer.origin}
            links={document.footer.groups.flatMap((g) => g.links)}
          />
        </div>
      )}
      {form && (
        <section className={styles.form} aria-label={form.title}>
          <h2>{form.title}</h2>
          <EnquiryForm
            definition={form}
            categoryId={id}
            privacyHref={document.footer.privacy?.href}
          />
        </section>
      )}
      {!document.html && !form && (
        <p>
          Der Inhalt wird derzeit aktualisiert. Bitte versuchen Sie es später
          erneut.
        </p>
      )}
      <Link className={styles.back} href="/">
        Zurück zur Materialwelt
      </Link>
    </article>
  );
}
