import { cookies } from "next/headers";
import Link from "next/link";
import { getCookieConfiguration } from "@/lib/content/cookies";
import { getFooterContent } from "@/lib/content/footer";
import {
  CONSENT_COOKIE,
  readConsent,
  consentDays,
} from "@/lib/content/consent-policy";
import { allChoices } from "@/lib/content/cookie-model";
import { saveCookies } from "./actions";
import styles from "@/components/content/document.module.css";
import cookieStyles from "@/components/consent/cookie-consent.module.css";
export const metadata = { title: "Cookie-Einstellungen" };
export default async function CookiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [config, footer, store, params] = await Promise.all([
    getCookieConfiguration(),
    getFooterContent(),
    cookies(),
    searchParams,
  ]);
  const choices =
    readConsent(store.get(CONSENT_COOKIE)?.value, config) ||
    allChoices(config.groups, false);
  return (
    <article className={styles.page}>
      <header>
        <Link href="/">VIERO / DEUTSCHLAND</Link>
        <h1>Cookie-Einstellungen</h1>
        <p>Ihre Privatsphäre</p>
      </header>
      <div className={styles.content}>
        {params.status === "saved" && (
          <p role="status">Ihre Cookie-Auswahl wurde gespeichert.</p>
        )}
        <p>{config.description}</p>
        {!config.available && (
          <p role="status">
            Die Shopware-Einstellungen sind derzeit nicht verfügbar. Optionale
            Dienste bleiben deaktiviert.
          </p>
        )}
        <form action={saveCookies}>
          {config.groups.map((group) => (
            <section key={group.id} className={cookieStyles.group}>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              {group.required && (
                <p>
                  Immer aktiv. Diese Oberfläche verwendet außerdem
                  „viero-context“ für Ihre Anmeldung und „viero-cookie-consent“
                  für Ihre Cookie-Auswahl.
                </p>
              )}
              <ul>
                {group.entries.map((entry) => (
                  <li key={entry.name}>
                    <label>
                      <input
                        type="checkbox"
                        name={entry.name}
                        defaultChecked={entry.required || choices[entry.name]}
                        disabled={entry.required}
                      />{" "}
                      {entry.label}
                    </label>
                    <p>
                      <code>{entry.name}</code>
                      {!entry.required && ` · ${entry.days} Tage`}
                    </p>
                    {entry.description && <p>{entry.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p>
            Ihre Auswahl wird für {consentDays(config)} Tage gespeichert. Sie
            können sie jederzeit hier oder im Footer ändern.
          </p>
          <div className={cookieStyles.buttons}>
            <button
              type="submit"
              name="selection"
              value="all"
              disabled={!config.available}
            >
              Alle akzeptieren
            </button>
            <button
              type="submit"
              name="selection"
              value="necessary"
              disabled={!config.available}
            >
              Nur erforderliche
            </button>
            <button
              type="submit"
              name="selection"
              value="custom"
              disabled={!config.available}
            >
              Auswahl speichern
            </button>
          </div>
        </form>
        {footer.privacy && (
          <p>
            <Link href={footer.privacy.href}>
              Datenschutzbestimmungen lesen
            </Link>
          </p>
        )}
      </div>
    </article>
  );
}
