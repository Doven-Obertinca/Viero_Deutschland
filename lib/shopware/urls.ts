import type { Product } from "./types";
export const isShopwareId = (id: string) => /^[a-f0-9]{32}$/i.test(id);
export function productPath(product: Product) {
  return `/produkt/${product.id}`;
}
export function productName(product: Product) {
  return product.translated?.name || product.name || product.productNumber;
}
