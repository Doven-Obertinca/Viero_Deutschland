import { test } from "node:test";
import assert from "node:assert/strict";
import { getShowcaseProducts, showcaseProductIds } from "../lib/home/showcase";
import { productPath } from "../lib/shopware/urls";

test("showcase preserves curated order, uses resolved routes, and tolerates partial catalogue failures", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SHOPWARE_STORE_API_URL;
  const originalKey = process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  process.env.SHOPWARE_STORE_API_URL = "https://shop.example/store-api";
  process.env.SHOPWARE_STORE_API_ACCESS_KEY = "test-key";
  try {
    globalThis.fetch = async (url) => {
      const index = showcaseProductIds.findIndex((id) =>
        String(url).endsWith(id),
      );
      if (index === 1) return new Response(null, { status: 503 });
      const id = index === 4 ? "resolved-0" : `resolved-${index}`;
      return Response.json({
        product: {
          id,
          productNumber: `sku-${index}`,
          name: `Source name ${index}`,
          cover:
            index === 2
              ? null
              : { media: { url: `https://shop.example/${index}.jpg` } },
        },
      });
    };
    const products = await getShowcaseProducts();
    assert.deepEqual(
      products.map((p) => p.id),
      ["resolved-0", "resolved-3", "resolved-5", "resolved-6"],
    );
    assert.equal(products[0].name, "Source name 0");
    assert.equal(productPath(products[0]), "/produkt/resolved-0");
    assert.equal(products[0].cover?.media?.url, "https://shop.example/0.jpg");
    globalThis.fetch = async () => new Response(null, { status: 503 });
    assert.deepEqual(await getShowcaseProducts(), []);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SHOPWARE_STORE_API_URL;
    else process.env.SHOPWARE_STORE_API_URL = originalUrl;
    if (originalKey === undefined)
      delete process.env.SHOPWARE_STORE_API_ACCESS_KEY;
    else process.env.SHOPWARE_STORE_API_ACCESS_KEY = originalKey;
  }
});
