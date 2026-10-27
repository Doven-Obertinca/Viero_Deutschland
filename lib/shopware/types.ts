import { z } from "zod";
export const seoSchema = z.object({
  seoPathInfo: z.string(),
  isCanonical: z.boolean().optional(),
});
export const mediaSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  alt: z.string().nullish(),
  title: z.string().nullish(),
});
export const categorySchema = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    translated: z
      .object({ name: z.string().nullish(), description: z.string().nullish() })
      .passthrough()
      .optional(),
    children: z.array(z.unknown()).nullish(),
    seoUrls: z.array(seoSchema).nullish(),
    media: mediaSchema.nullish(),
    metaTitle: z.string().nullish(),
    metaDescription: z.string().nullish(),
  })
  .passthrough();
export const productSchema = z
  .object({
    id: z.string(),
    productNumber: z.string(),
    name: z.string().nullish(),
    translated: z
      .object({
        name: z.string().nullish(),
        description: z.string().nullish(),
        metaTitle: z.string().nullish(),
        metaDescription: z.string().nullish(),
      })
      .passthrough()
      .optional(),
    calculatedPrice: z
      .object({
        unitPrice: z.number(),
        quantity: z.number().optional(),
        referencePrice: z
          .object({
            price: z.number(),
            purchaseUnit: z.number(),
            referenceUnit: z.number(),
            unitName: z.string(),
          })
          .nullish(),
      })
      .passthrough()
      .optional(),
    cover: z.object({ media: mediaSchema.nullish() }).nullish(),
    media: z.array(z.object({ media: mediaSchema.nullish() })).optional(),
    available: z.boolean().optional(),
    stock: z.number().optional(),
    availableStock: z.number().optional(),
    parentId: z.string().nullish(),
    childCount: z.number().nullish(),
    manufacturer: z
      .object({ name: z.string().nullish() })
      .passthrough()
      .nullish(),
    options: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().nullish(),
          group: z.object({ name: z.string().nullish() }).nullish(),
        }),
      )
      .optional(),
    categories: z.array(categorySchema).optional(),
    customFields: z.record(z.string(), z.unknown()).nullish(),
    seoUrls: z.array(seoSchema).nullish(),
    tax: z.object({ taxRate: z.number() }).nullish(),
  })
  .passthrough();
export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export const contextSchema = z
  .object({
    token: z.string().optional(),
    salesChannel: z
      .object({
        id: z.string(),
        name: z.string().nullish(),
        navigationCategoryId: z.string(),
        languageId: z.string().optional(),
      })
      .passthrough(),
    currency: z.object({ isoCode: z.string() }).passthrough(),
    languageIdChain: z.array(z.string()).optional(),
    taxState: z.string().optional(),
  })
  .passthrough();
export type StoreContext = z.infer<typeof contextSchema>;
export const productListSchema = z
  .object({ elements: z.array(productSchema), total: z.number().optional() })
  .passthrough();
