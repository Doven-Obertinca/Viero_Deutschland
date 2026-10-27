import Link from "next/link";
import type { Category } from "@/lib/shopware/types";
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link className="category-card" href={`/kategorie/${category.id}`}>
      {category.translated?.name || category.name}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
