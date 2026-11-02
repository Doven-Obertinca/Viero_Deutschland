import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/shopware/account";
import { signOut } from "./actions";
import styles from "@/components/account/account.module.css";
export const metadata = { title: "Mein Konto" };
export default async function AccountPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/konto/anmelden");
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <p className="eyebrow">VIERO / MEIN KONTO</p>
        <h1>
          Guten Tag,
          <br />
          {customer.firstName}.
        </h1>
        <p>Willkommen in Ihrer Viero Materialwelt.</p>
        <Link href="/produkte" className={styles.back}>
          Produkte entdecken
        </Link>
      </div>
      <section className={styles.card}>
        <p className="eyebrow">IHR KUNDENKONTO</p>
        <h2>Ihre Zugangsdaten</h2>
        <dl className={styles.profile}>
          <dt>Name</dt>
          <dd>
            {customer.firstName} {customer.lastName}
          </dd>
          <dt>E-Mail-Adresse</dt>
          <dd>{customer.email}</dd>
        </dl>
        <form action={signOut}>
          <button className={styles.secondary} type="submit">
            Sicher abmelden
          </button>
        </form>
      </section>
    </div>
  );
}
