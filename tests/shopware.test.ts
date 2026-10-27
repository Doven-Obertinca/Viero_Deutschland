import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { storeRequest, ShopwareError } from "../lib/shopware/client";
import { productSchema, categorySchema } from "../lib/shopware/types";
import { jsonLd } from "../lib/seo";
test("Store API transport validates responses and never leaks credentials", async () => {
  const originalFetch = globalThis.fetch;
  process.env.SHOPWARE_STORE_API_URL = "https://shop.example/store-api";
  process.env.SHOPWARE_STORE_API_ACCESS_KEY = "test-only-key";
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://shop.example/store-api/context");
      const headers = options?.headers as Record<string, string>;
      assert.equal(headers["sw-access-key"], "test-only-key");
      assert.equal(headers["sw-context-token"], "visitor-token");
      assert.equal(headers["sw-inheritance"], "true");
      assert.equal(options?.cache, "no-store");
      return Response.json({ ok: true });
    };
    assert.deepEqual(
      await storeRequest("/context", z.object({ ok: z.boolean() }), {
        method: "GET",
        contextToken: "visitor-token",
      }),
      { ok: true },
    );
    globalThis.fetch = async () =>
      new Response("private infrastructure details", { status: 401 });
    await assert.rejects(
      storeRequest("/context", z.object({ ok: z.boolean() })),
      (error: unknown) =>
        error instanceof ShopwareError &&
        error.code === "CREDENTIALS" &&
        !error.message.includes("private"),
    );
    globalThis.fetch = async () => Response.json({ wrong: true });
    await assert.rejects(
      storeRequest("/context", z.object({ ok: z.boolean() })),
      (error: unknown) =>
        error instanceof ShopwareError && error.code === "RESPONSE",
    );
    globalThis.fetch = async () => {
      throw new DOMException("timeout", "TimeoutError");
    };
    await assert.rejects(
      storeRequest("/context", z.object({})),
      (error: unknown) =>
        error instanceof ShopwareError && error.code === "TIMEOUT",
    );
    delete process.env.SHOPWARE_STORE_API_ACCESS_KEY;
    await assert.rejects(
      storeRequest("/context", z.object({})),
      (error: unknown) =>
        error instanceof ShopwareError && error.code === "CONFIGURATION",
    );
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.SHOPWARE_STORE_API_URL;
    delete process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  }
});
test("catalog validation rejects malformed products and JSON-LD escapes script injection", () => {
  assert.equal(productSchema.safeParse({ id: "x" }).success, false);
  assert.ok(
    !jsonLd({ name: "</script><script>alert(1)</script>" }).includes("<"),
  );
});

test("live Shopware unloaded associations and variant counts may be null", () => {
  const category = { id: "category", children: null, seoUrls: null };
  assert.equal(categorySchema.safeParse(category).success, true);
  assert.equal(
    productSchema.safeParse({
      id: "variant",
      productNumber: "sku",
      name: null,
      translated: { name: "Inherited name" },
      childCount: null,
      categories: [category],
      seoUrls: null,
    }).success,
    true,
  );
  assert.equal(
    productSchema.safeParse({
      id: "variant",
      productNumber: "sku",
      childCount: "invalid",
    }).success,
    false,
  );
});
