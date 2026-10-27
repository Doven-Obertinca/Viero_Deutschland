import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section">
      <h1>Seite nicht gefunden.</h1>
      <Link href="/produkte">Zum Produktkatalog</Link>
    </div>
  );
}
