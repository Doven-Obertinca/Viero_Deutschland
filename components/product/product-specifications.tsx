"use client";
import { createContext, useContext } from "react";
import type { Product } from "@/lib/shopware/types";
import styles from "./product-resources.module.css";
export const ProductSelection = createContext<Product | null>(null);
export function ProductSpecifications({ product }: { product: Product }) {
  const selected = useContext(ProductSelection) || product;
  const properties = (product.properties || []) as {
    id: string;
    name?: string;
    group?: { name?: string };
  }[];
  const delivery = selected.deliveryTime as {
    name?: string;
    translated?: { name?: string };
  } | null;
  return (
    <dl className={styles.specs}>
      <div>
        <dt>Artikelnummer</dt>
        <dd>{selected.productNumber}</dd>
      </div>
      {product.manufacturer?.name && (
        <div>
          <dt>Hersteller</dt>
          <dd>{product.manufacturer.name}</dd>
        </div>
      )}
      {selected.options?.map((o) => (
        <div key={o.id}>
          <dt>{o.group?.name || "Ausführung"}</dt>
          <dd>{o.name}</dd>
        </div>
      ))}
      {properties.map((p) => (
        <div key={p.id}>
          <dt>{p.group?.name || "Eigenschaft"}</dt>
          <dd>{p.name}</dd>
        </div>
      ))}
      {(delivery?.translated?.name || delivery?.name) && (
        <div>
          <dt>Lieferzeit</dt>
          <dd>{delivery?.translated?.name || delivery?.name}</dd>
        </div>
      )}
    </dl>
  );
}
