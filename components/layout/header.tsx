import { BrandLogo } from "./brand-logo";
import { AccountNavigation } from "@/components/account/account-navigation";
import { getCustomer } from "@/lib/shopware/account";
import Link from "next/link";
import { getNavigation } from "@/lib/shopware/navigation";
import { HamburgerNavigation } from "./hamburger-navigation";
import { getContext } from "@/lib/shopware/context";
export async function Header() {
  const [categories, context, customer] = await Promise.all([
    getNavigation().catch(() => []),
    getContext().catch(() => null),
    getCustomer().catch(() => null),
  ]);
  const items = categories
    .filter(
      (category) =>
        category.id !== context?.salesChannel.footerCategoryId &&
        category.visible !== false,
    )
    .map((category) => ({
      id: category.id,
      name: category.translated?.name || category.name || "Kategorie",
      href: `/kategorie/${category.id}`,
    }));
  if (!items.length)
    items.push({ id: "products", name: "Produkte", href: "/produkte" });
  return (
    <header className="header">
      <Link
        href="/"
        aria-label="Viero Deutschland Startseite"
        className="wordmark"
      >
        <BrandLogo />
      </Link>
      <div className="header-actions">
        <AccountNavigation signedIn={!!customer} />
        <HamburgerNavigation items={items} />
      </div>
    </header>
  );
}
