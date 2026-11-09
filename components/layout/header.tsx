import {
  contactCategoryId,
  contactPath,
  inspirationCategoryId,
  inspirationPath,
} from "@/lib/content/contact-route";
import { academyCategoryId, academyPath } from "@/lib/content/academy-route";
import { aboutCategoryId, aboutPath } from "@/lib/content/about-route";
import { StickyHeader } from "./sticky-header";
import { BrandLogo } from "./brand-logo";
import { AccountNavigation } from "@/components/account/account-navigation";
import { getCustomer } from "@/lib/shopware/account";
import Link from "next/link";
import { getNavigation } from "@/lib/shopware/navigation";
import { HamburgerNavigation } from "./hamburger-navigation";
import { showroomCategoryId } from "@/lib/home/showroom";
import { getContext } from "@/lib/shopware/context";
export async function Header() {
  const [categories, context, customer] = await Promise.all([
    getNavigation().catch(() => []),
    getContext().catch(() => null),
    getCustomer().catch(() => null),
  ]);
  const pageLinks = new Map([
    [aboutCategoryId, aboutPath],
    [academyCategoryId, academyPath],
    [contactCategoryId, contactPath],
    [inspirationCategoryId, inspirationPath],
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
      href:
        pageLinks.get(category.id) ??
        ((category.translated?.name || category.name || "")
          .trim()
          .toLocaleLowerCase("de") === "produkte"
          ? "/produkte"
          : category.id === "01916a06b51071a7affd12d4b056dc15" ||
              /tönung|toenung/i.test(
                category.translated?.name || category.name || "",
              )
            ? "/toenung"
            : category.id ===
                (process.env.SHOPWARE_SHOWROOM_CATEGORY_ID ||
                  showroomCategoryId)
              ? "/showroom"
              : `/kategorie/${category.id}`),
    }));
  if (!items.some((item) => item.href === "/produkte"))
    items.unshift({ id: "products", name: "Produkte", href: "/produkte" });
  if (!items.some((item) => item.href === "/toenung"))
    items.push({ id: "tinting", name: "Tönungs-Service", href: "/toenung" });
  if (!items.some((item) => item.href === aboutPath))
    items.push({ id: aboutCategoryId, name: "Über uns", href: aboutPath });
  if (!items.some((item) => item.href === academyPath))
    items.push({ id: academyCategoryId, name: "Akademie", href: academyPath });
  if (!items.some((item) => item.href === inspirationPath))
    items.push({
      id: inspirationCategoryId,
      name: "Inspiration",
      href: inspirationPath,
    });
  if (!items.some((item) => item.href === contactPath))
    items.push({ id: contactCategoryId, name: "Kontakt", href: contactPath });
  return (
    <StickyHeader>
      <Link
        href="/"
        aria-label="Viero Deutschland Startseite"
        className="wordmark"
      >
        <BrandLogo />
      </Link>
      <div className="header-actions">
        <span id="header-product-search" style={{ display: "contents" }} />
        <AccountNavigation signedIn={!!customer} />
        <HamburgerNavigation items={items} />
      </div>
    </StickyHeader>
  );
}
