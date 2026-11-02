import { test } from "node:test";
import assert from "node:assert/strict";
import { loginCustomer, logoutCustomer } from "../lib/shopware/account";
import { ShopwareError } from "../lib/shopware/client";
import { loginSchema } from "../lib/shopware/account-validation";
import { validContextToken } from "../lib/shopware/session";

test("login validates credentials with Shopware and reads the customer using the returned session", async () => {
  const original = globalThis.fetch;
  process.env.SHOPWARE_STORE_API_URL = "https://shop.example/store-api";
  process.env.SHOPWARE_STORE_API_ACCESS_KEY = "test-key";
  const token = "a".repeat(32);
  const calls: string[] = [];
  try {
    globalThis.fetch = async (url, options) => {
      calls.push(String(url));
      assert.equal(options?.cache, "no-store");
      if (String(url).endsWith("/account/login")) {
        assert.deepEqual(JSON.parse(String(options?.body)), {
          username: "existing@example.test",
          password: "existing-password",
        });
        return Response.json({ contextToken: token });
      }
      assert.equal(
        (options?.headers as Record<string, string>)["sw-context-token"],
        token,
      );
      if (String(url).endsWith("/account/logout"))
        return Response.json({ contextToken: "b".repeat(32) });
      return Response.json({
        id: "customer-id",
        email: "existing@example.test",
        firstName: "Test",
        lastName: "Customer",
        guest: false,
        defaultBillingAddress: { street: "private data omitted from DTO" },
      });
    };
    const result = await loginCustomer(
      "existing@example.test",
      "existing-password",
    );
    assert.equal(result.token, token);
    assert.equal(result.customer.email, "existing@example.test");
    assert.ok(!("defaultBillingAddress" in result.customer));
    await logoutCustomer(token);
    assert.deepEqual(
      calls.map((c) => new URL(c).pathname),
      [
        "/store-api/account/login",
        "/store-api/account/customer",
        "/store-api/account/logout",
      ],
    );
    globalThis.fetch = async () =>
      new Response("secret backend details", { status: 401 });
    await assert.rejects(
      loginCustomer("existing@example.test", "wrong"),
      (e: unknown) =>
        e instanceof ShopwareError &&
        e.code === "CREDENTIALS" &&
        e.message === "CREDENTIALS",
    );
    globalThis.fetch = async () =>
      new Response("rate limiter details", { status: 429 });
    await assert.rejects(
      loginCustomer("existing@example.test", "wrong"),
      (e: unknown) => e instanceof ShopwareError && e.code === "THROTTLED",
    );
  } finally {
    globalThis.fetch = original;
    delete process.env.SHOPWARE_STORE_API_URL;
    delete process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  }
});
test("credential validation preserves passwords and rejects malformed session tokens", () => {
  assert.equal(
    loginSchema.safeParse({ email: "invalid", password: "x" }).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ email: "user@example.test", password: "" }).success,
    false,
  );
  const result = loginSchema.parse({
    email: " user@example.test ",
    password: " spaces are part of the password ",
  });
  assert.equal(result.email, "user@example.test");
  assert.equal(result.password, " spaces are part of the password ");
  assert.equal(validContextToken("a".repeat(32)), true);
  assert.equal(validContextToken("invalid; token"), false);
  assert.equal(validContextToken("a".repeat(257)), false);
});
