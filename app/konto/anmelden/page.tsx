import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer, shopwareAccountLinks } from "@/lib/shopware/account";
import { LoginForm } from "@/components/account/login-form";
import styles from "@/components/account/account.module.css";
export const metadata = { title: "Anmelden" };
export default async function LoginPage() {
  if (await getCustomer().catch(() => null)) redirect("/konto");
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <p className="eyebrow">VIERO / KUNDENKONTO</p>
        <h1>
          Willkommen
          <br />
          zurück.
        </h1>
        <p>
          Ihre Materialwelt.
          <br />
          Ihr persönlicher Zugang zu Viero.
        </p>
        <Link href="/produkte" className={styles.back}>
          Zur Kollektion
        </Link>
      </div>
      <section className={styles.card} aria-labelledby="login-title">
        <p className="eyebrow">SCHÖN, DASS SIE DA SIND</p>
        <h2 id="login-title">Anmelden</h2>
        <LoginForm />
        <a className={styles.textLink} href={shopwareAccountLinks.recover}>
          Passwort vergessen?
        </a>
        <div className={styles.registerPrompt}>
          <p>Noch kein Kundenkonto?</p>
          <Link href="/konto/registrieren">
            Als Geschäftskunde registrieren
          </Link>
        </div>
      </section>
    </div>
  );
}
