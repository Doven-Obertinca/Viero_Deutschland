import Link from "next/link";
import type { Category } from "@/lib/shopware/types";
export function Navigation({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Hauptnavigation" className="desktop-navigation">
      <Link href="/produkte">Produkte</Link>
      {categories.slice(0, 5).map((category) => (
        <Link key={category.id} href={`/kategorie/${category.id}`}>
          {category.translated?.name || category.name}
        </Link>
      ))}
    </nav>
  );
}
export function MegaMenu({ categories }: { categories: Category[] }) {
  return (
    <details className="mega-menu">
      <summary>Kollektionen</summary>
      <nav aria-label="Kollektionen">
        {categories.map((category) => (
          <Link key={category.id} href={`/kategorie/${category.id}`}>
            {category.translated?.name || category.name}
          </Link>
        ))}
      </nav>
    </details>
  );
}
export function MobileNavigation({ categories }: { categories: Category[] }) {
  return (
    <details className="mobile-navigation">
      <summary>Menü</summary>
      <nav aria-label="Mobile Navigation">
        <Link href="/produkte">Alle Produkte</Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/kategorie/${category.id}`}>
            {category.translated?.name || category.name}
          </Link>
        ))}
      </nav>
    </details>
  );
}
