import { cache } from "react";
import { z } from "zod";
import { storeRequest } from "./client";
import { productListSchema, productSchema } from "./types";
export const productAssociations = {
  cover: { associations: { media: {} } },
  media: { associations: { media: {} } },
  manufacturer: {},
  properties: { associations: { group: {} } },
  deliveryTime: {},
  unit: {},
  categories: {},
  options: { associations: { group: {}, media: {} } },
  seoUrls: {},
  tax: {},
};
export const getProducts = cache((page = 1) =>
  storeRequest("/product", productListSchema, {
    body: {
      limit: 24,
      page,
      "total-count-mode": 1,
      associations: productAssociations,
    },
  }),
);
export const getProduct = cache(
  async (id: string) =>
    (
      await storeRequest(
        `/product/${id}`,
        z.object({ product: productSchema }),
        { body: { associations: productAssociations } },
      )
    ).product,
);
export const getVariants = cache((parentId: string) =>
  storeRequest("/product", productListSchema, {
    body: {
      limit: 100,
      filter: [{ type: "equals", field: "parentId", value: parentId }],
      associations: productAssociations,
    },
  }),
);

// Read the complete catalogue so filtering never stops at the first page.
export const getCatalogProducts = cache(async () => {
  const products = new Map<string, z.infer<typeof productSchema>>();
  for (let page = 1; ; page++) {
    const result = await storeRequest("/product", productListSchema, {
      body: {
        limit: 100,
        page,
        "total-count-mode": 1,
        sort: [{ field: "id", order: "ASC" }],
        associations: productAssociations,
      },
    });
    const previous = products.size;
    result.elements.forEach((product) => products.set(product.id, product));
    if (
      !result.elements.length ||
      (result.total !== undefined && products.size >= result.total) ||
      result.elements.length < 100
    )
      break;
    if (previous === products.size)
      throw new Error("Catalogue pagination did not advance");
  }
  return [...products.values()];
});
