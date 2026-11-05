import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateEnquiry,
  deliverEnquiry,
} from "../lib/shopware/showroom-enquiry";
import type { ShowroomFormDefinition } from "../lib/home/showroom-form";
const definition: ShowroomFormDefinition = {
  id: "a".repeat(32),
  title: "CMS Anfrage",
  successMessage: "Backend Bestätigung",
  fields: [
    {
      name: "Name",
      label: "Name",
      type: "text",
      required: true,
      width: 6,
      placeholder: "",
      options: [],
    },
    {
      name: "Email",
      label: "E-Mail",
      type: "email",
      required: true,
      width: 6,
      placeholder: "",
      options: [],
    },
    {
      name: "Anrede",
      label: "Anrede",
      type: "select",
      required: true,
      width: 12,
      placeholder: "",
      options: [["neutral", "Keine Angabe"]],
    },
  ],
};
function valid() {
  const f = new FormData();
  f.set("Name", "Testperson");
  f.set("Email", "test@example.test");
  f.set("Anrede", "neutral");
  f.set("privacy", "on");
  return f;
}
test("enquiry validates backend-required fields, email, configured options, privacy and honeypot before delivery", () => {
  assert.equal(validateEnquiry(definition, valid()).error, undefined);
  const empty = validateEnquiry(definition, new FormData());
  assert.ok(empty.errors?.Name);
  assert.ok(empty.errors?.Email);
  assert.ok(empty.errors?.Anrede);
  assert.ok(empty.errors?.privacy);
  const invalid = valid();
  invalid.set("Email", "not-an-email");
  invalid.set("Anrede", "invented");
  assert.ok(validateEnquiry(definition, invalid).errors?.Email);
  assert.ok(validateEnquiry(definition, invalid).errors?.Anrede);
  invalid.set("shopware_surname_confirm", "bot");
  assert.ok(validateEnquiry(definition, invalid).errors?.form);
  const file = valid();
  file.set("Name", new Blob(["file"]), "a.txt");
  assert.ok(validateEnquiry(definition, file).errors?.Name);
});
test("native Shopware form redirect and anonymous cookies stay server-side; success requires confirmation", async () => {
  const old = globalThis.fetch,
    oldUrl = process.env.SHOPWARE_STORE_API_URL,
    oldKey = process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  process.env.SHOPWARE_STORE_API_URL = "https://shop.example/store-api";
  process.env.SHOPWARE_STORE_API_ACCESS_KEY = "not-forwarded";
  try {
    let calls = 0;
    globalThis.fetch = async (url, options) => {
      calls++;
      if (calls === 1) {
        assert.equal(String(url), "https://shop.example/Showroom/");
        return new Response("form", {
          headers: { "set-cookie": "session=anonymous; HttpOnly; Secure" },
        });
      }
      if (calls === 2) {
        assert.equal(
          String(url),
          "https://shop.example/swag/cms-extensions/form",
        );
        const body = options?.body as FormData;
        assert.equal(body.get("formId"), `form-${definition.id}`);
        assert.equal(body.get("Email"), "test@example.test");
        assert.equal(body.get("unknown"), null);
        assert.equal(
          (options?.headers as Record<string, string>).Cookie,
          "session=anonymous",
        );
        assert.ok(!JSON.stringify(options?.headers).includes("not-forwarded"));
        return new Response(null, {
          status: 302,
          headers: { location: "/Showroom/" },
        });
      }
      return new Response('<div class="alert alert-success">Vielen Dank</div>');
    };
    const values = validateEnquiry(definition, valid()).values!;
    assert.deepEqual(
      await deliverEnquiry(
        definition,
        values,
        "https://shop.example/Showroom/",
      ),
      { success: "Backend Bestätigung" },
    );
    globalThis.fetch = async () => new Response("<html>Unconfirmed</html>");
    const uncertain = await deliverEnquiry(
      definition,
      values,
      "https://shop.example/Showroom/",
    );
    assert.equal(uncertain.success, undefined);
    assert.ok(uncertain.error);
    assert.equal(uncertain.values?.Email, "test@example.test");
    globalThis.fetch = async () => {
      throw Error("offline");
    };
    assert.ok(
      (
        await deliverEnquiry(
          definition,
          values,
          "https://shop.example/Showroom/",
        )
      ).error,
    );
    assert.ok(
      (await deliverEnquiry(definition, values, "https://other.example/"))
        .error,
    );
  } finally {
    globalThis.fetch = old;
    if (oldUrl === undefined) delete process.env.SHOPWARE_STORE_API_URL;
    else process.env.SHOPWARE_STORE_API_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SHOPWARE_STORE_API_ACCESS_KEY;
    else process.env.SHOPWARE_STORE_API_ACCESS_KEY = oldKey;
  }
});
