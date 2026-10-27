import { cache } from "react";
import { z } from "zod";
import { storeRequest } from "./client";
import { productListSchema, productSchema } from "./types";
export const productAssociations = {
  cover: { associations: { media: {} } },
  media: { associations: { media: {} } },
  manufacturer: {},
  categories: {},
  options: { associations: { group: {} } },
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
