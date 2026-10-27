import Link from "next/link";
import type { Product } from "@/lib/shopware/types";
import { productName, productPath } from "@/lib/shopware/urls";
import { ProductMedia } from "./media";
export function ProductPrice({
  product,
  currency = "EUR",
  taxState,
}: {
  product: Product;
  currency?: string;
  taxState?: string;
}) {
  const price = product.calculatedPrice;
  return (
    <div>
      {price ? (
        <>
          <span>
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency,
            }).format(price.unitPrice)}
          </span>
          {taxState && (
            <small>
              {taxState === "gross"
                ? "inkl. MwSt."
                : taxState === "net"
                  ? "zzgl. MwSt."
                  : "steuerfrei"}
            </small>
          )}
          {price.referencePrice && (
            <small>
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency,
              }).format(price.referencePrice.price)}{" "}
              / {price.referencePrice.referenceUnit}{" "}
              {price.referencePrice.unitName}
            </small>
          )}
        </>
      ) : (
        <span>Preis nicht verfügbar</span>
      )}
    </div>
  );
}
export function ProductBadge({ product }: { product: Product }) {
  return product.available === false ? (
    <span className="badge">Zurzeit nicht verfügbar</span>
  ) : null;
}
export function ProductCard({
  product,
  currency,
  taxState,
}: {
  product: Product;
  currency?: string;
  taxState?: string;
}) {
  return (
    <article className="product-card">
      <Link href={productPath(product)}>
        <ProductMedia
          src={product.cover?.media?.url}
          alt={product.cover?.media?.alt || productName(product)}
        />
        <h2>{productName(product)}</h2>
      </Link>
      <p className="muted">{product.productNumber}</p>
      <ProductPrice product={product} currency={currency} taxState={taxState} />
      <ProductBadge product={product} />
    </article>
  );
}
export function ProductGrid({
  products,
  currency,
  taxState,
}: {
  products: Product[];
  currency?: string;
  taxState?: string;
}) {
  return products.length ? (
    <div className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currency={currency}
          taxState={taxState}
        />
      ))}
    </div>
  ) : (
    <p className="notice">
      In diesem Katalog sind derzeit keine Produkte verfügbar.
    </p>
  );
}
export function ProductOptions({
  product,
  variants,
}: {
  product: Product;
  variants: Product[];
}) {
  return (
    <div>
      {!!product.options?.length && (
        <dl>
          {product.options.map((option) => (
            <div key={option.id}>
              <dt>{option.group?.name || "Ausführung"}</dt>
              <dd>{option.name}</dd>
            </div>
          ))}
        </dl>
      )}
      {variants.length > 0 && (
        <nav aria-label="Verfügbare Ausführungen">
          <h2>Ausführungen</h2>
          {variants.map((variant) => (
            <Link
              className="variant-link"
              key={variant.id}
              href={productPath(variant)}
            >
              {variant.options?.map((o) => o.name).join(" / ") ||
                productName(variant)}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
