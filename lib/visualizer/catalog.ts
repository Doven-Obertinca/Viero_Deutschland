import "server-only";
import { getCatalogProducts } from "@/lib/shopware/products";
import { mapVisualizerMaterials } from "./catalog-mapping";

export async function getVisualizerMaterials() {
  return mapVisualizerMaterials(await getCatalogProducts());
}
