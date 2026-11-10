import { productName, productPath } from "../shopware/urls";
import type { Product } from "../shopware/types";
import { plainText } from "../seo";
import { approvedTextures } from "./approvals";
import type { Material } from "./model";

const decorativeWallCategory = "019091b56cc87f79ae89fafdfb77fa2a";

// Representative finish photographs. Crops exclude fixtures and are separate
// from calibrated textures and from the selected Shopware color variant.
const photoSamples: Partial<
  Record<string, NonNullable<Material["photoSample"]>>
> = {
  "019091a18051717ca7e33783dbabb651": {
    src: "/brand/wall-finishes/allure-damascato.webp",
    crop: [0.02, 0.03, 0.39, 0.45],
    name: "Allure Damascato",
  },
  "01909209e9c972599fb09f3ca0a6a181": {
    src: "/brand/about/ghibli-damascato.webp",
    crop: [0.39, 0.27, 0.44, 0.29],
    name: "Ghibli Damascato",
  },
  "0190a15886267e59a54d7152d79fff7f": {
    src: "/brand/about/gallery/2.webp",
    crop: [0.065, 0.12, 0.23, 0.32],
    name: "Marmorin Hydro",
  },
};

export function mapVisualizerMaterials(products: Product[]): Material[] {
  return products
    .filter(
      (product) =>
        product.categories?.some(
          (category) => category.id === decorativeWallCategory,
        ) ||
        approvedTextures[product.id] ||
        photoSamples[product.id],
    )
    .map((product) => ({
      id: product.id,
      name: productName(product),
      family: "Wanddekoration",
      description: plainText(
        product.translated?.description ||
          (typeof product.description === "string"
            ? product.description
            : undefined),
      ),
      image: product.cover?.media?.url,
      href: productPath(product),
      color:
        product.options?.find((option) =>
          /farbton|farbe/i.test(option.group?.name || ""),
        )?.name ?? undefined,
      photoSample: photoSamples[product.id],
      ...approvedTextures[product.id],
    }))
    .sort(
      (a, b) =>
        Number(Boolean(b.texture || b.photoSample)) -
          Number(Boolean(a.texture || a.photoSample)) ||
        a.name.localeCompare(b.name, "de"),
    );
}
