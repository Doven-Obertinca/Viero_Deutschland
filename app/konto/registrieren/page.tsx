import Link from "next/link";
import { shopwareAccountLinks } from "@/lib/shopware/account";
import styles from "@/components/account/account.module.css";
export const metadata = { title: "Registrieren" };
export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <p className="eyebrow">VIERO / REGISTRIERUNG</p>
        <h1>
          Raum für
          <br />
          Ihre Ideen.
        </h1>
        <p>Ihr Zugang zur Viero Produktwelt.</p>
      </div>
      <section className={styles.card}>
        <p className="eyebrow">FÜR GESCHÄFTSKUNDEN</p>
        <h2>Ihr Viero Kundenkonto.</h2>
        <p>
          Erstellen Sie Ihr Geschäftskonto über die bestehende Registrierung von
          Viero Deutschland. Dort werden Ihre Angaben und die Freigabe Ihres
          Kontos wie gewohnt bearbeitet.
        </p>
        <a href={shopwareAccountLinks.register} className={styles.submit}>
          Geschäftskonto registrieren
        </a>
        <p className={styles.hint}>
          Sie wechseln zum bestehenden Viero-Shop. Nach der Registrierung und
          gegebenenfalls der Freigabe können Sie sich auch hier anmelden.
        </p>
        <div className={styles.registerPrompt}>
          <p>Sie haben bereits ein Konto?</p>
          <Link href="/konto/anmelden">Hier anmelden</Link>
        </div>
      </section>
    </div>
  );
}
