import { redirect } from "next/navigation";
import { getFooterContent } from "@/lib/content/footer";
export default async function PrivacyPage() {
  const footer = await getFooterContent();
  if (footer.privacy) redirect(footer.privacy.href);
  return (
    <section className="container section">
      <h1>Datenschutz</h1>
      <p>
        Die Datenschutzbestimmungen sind derzeit nicht verfügbar. Bitte
        versuchen Sie es später erneut.
      </p>
    </section>
  );
}
