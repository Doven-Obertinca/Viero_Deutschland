import { cache } from "react";
import { z } from "zod";
import { storeRequest } from "./client";
import { categorySchema, productListSchema } from "./types";
import { productAssociations } from "./products";
export const getCategories = cache(() =>
  storeRequest(
    "/category",
    z.object({
      elements: z.array(categorySchema),
      total: z.number().optional(),
    }),
    { body: { limit: 100, associations: { seoUrls: {}, media: {} } } },
  ),
);
export const getCategory = cache((id: string) =>
  storeRequest(`/category/${id}`, categorySchema),
);
export const getCategoryProducts = cache((id: string, page = 1) =>
  storeRequest(`/product-listing/${id}`, productListSchema, {
    body: {
      limit: 24,
      page,
      "total-count-mode": 1,
      associations: productAssociations,
    },
  }),
);
