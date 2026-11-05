import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTintCatalog,
  readSaved,
  sharedSelection,
  similarColours,
  oklab,
  type TintColour,
} from "../lib/tinting/model";
import {
  tintEnquirySchema,
  formatTintEnquiry,
  nativeTintFormId,
} from "../lib/tinting/enquiry";
import { submitTintEnquiry } from "../app/toenung/actions";
const material = "a".repeat(32),
  variant = "b".repeat(32);
const catalog = buildTintCatalog([
  { id: material, productNumber: "M", name: "Marmorin" },
  {
    id: variant,
    parentId: material,
    productNumber: "V",
    name: "Marmorin",
    options: [
      { id: "1", name: "MAR01", group: { name: "Farbton | Marmorini" } },
      { id: "2", name: "Grün", group: { name: "Farbton | Marmorini" } },
      {
        id: "3",
        name: "Sonderton",
        colorHexCode: "#123456",
        group: { name: "Farbton | Marmorini" },
      },
    ],
  },
]);
test("tint catalogue distinguishes official digital values, illustrative values, and absent values", () => {
  assert.equal(catalog.materials.length, 1);
  const unknown = catalog.colours.find((c) => c.name === "MAR01")!;
  assert.equal(unknown.hex, undefined);
  assert.equal(unknown.code, "MAR01");
  assert.equal(unknown.accuracy, "unavailable");
  assert.equal(
    catalog.colours.find((c) => c.name === "Grün")?.accuracy,
    "illustrative",
  );
  assert.equal(
    catalog.colours.find((c) => c.name === "Sonderton")?.accuracy,
    "catalogue",
  );
  assert.deepEqual(unknown.materialIds, [material]);
});
test("saved colour data is versioned, bounded and rejects corrupted state", () => {
  assert.equal(readSaved("{broken").projects.length, 0);
  assert.equal(
    readSaved(JSON.stringify({ version: 2, favourites: [], projects: [] }))
      .version,
    1,
  );
  assert.equal(
    readSaved(JSON.stringify({ version: 1, favourites: ["one"], projects: [] }))
      .favourites[0],
    "one",
  );
  assert.equal(
    readSaved(
      JSON.stringify({
        version: 1,
        favourites: Array(501).fill("x"),
        projects: [],
      }),
    ).favourites.length,
    0,
  );
});
test("shared URLs only accept known catalogue IDs", () => {
  const selected = sharedSelection(
    new URLSearchParams({
      farben: `unknown,${catalog.colours[0].id}`,
      materialien: `bad,${material}`,
      name: "Private name",
      notes: "Private notes",
    }),
    catalog,
  );
  assert.deepEqual(selected, {
    colourIds: [catalog.colours[0].id],
    materialIds: [material],
  });
});
test("perceptual suggestions only use source catalogue digital values", () => {
  const colours: TintColour[] = [
    {
      id: "red",
      name: "Red",
      family: "Rot",
      collection: "Source",
      materialIds: [],
      hex: "#ff0000",
      accuracy: "catalogue",
    },
    {
      id: "blue",
      name: "Blue",
      family: "Blau",
      collection: "Source",
      materialIds: [],
      hex: "#0000ff",
      accuracy: "catalogue",
    },
    {
      id: "fake",
      name: "Approximation",
      family: "Rot",
      collection: "Source",
      materialIds: [],
      hex: "#ff0101",
      accuracy: "illustrative",
    },
  ];
  assert.equal(similarColours("#ff0202", colours)[0].id, "red");
  assert.ok(!similarColours("#ff0202", colours).some((c) => c.id === "fake"));
  assert.deepEqual(similarColours("bad", colours), []);
  assert.ok(Math.abs(oklab("#ffffff")[0] - 1) < 0.00001);
});
const values = {
  material: "Marmorin",
  reference: "MAR01 / Marmorini",
  area: "12,5",
  quantity: "5 kg",
  application: "Innenbereich",
  date: "2027-02-01",
  details: "Project",
  salutation: "8d43c89f7bed473ca0e5a2f25860f1ba",
  firstName: "Test",
  lastName: "Person",
  email: "test@example.test",
  phone: "+49 000",
  company: "",
  customerType: "Privatkunde",
  message: "Test enquiry",
  privacy: "on",
  honeypot: "",
};
const form = () => {
  const data = new FormData();
  Object.entries(values).forEach(([k, v]) => data.set(k, v));
  return data;
};
test("shared enquiry validation checks consent, contact, numeric area and spam fields", () => {
  assert.ok(tintEnquirySchema.safeParse(values).success);
  for (const patch of [
    { privacy: "" },
    { email: "invalid" },
    { phone: "" },
    { area: "-3" },
    { honeypot: "spam" },
  ])
    assert.equal(
      tintEnquirySchema.safeParse({ ...values, ...patch }).success,
      false,
    );
  assert.match(formatTintEnquiry(tintEnquirySchema.parse(values)), /12,5 m²/);
});
test("enquiry uses native CMS delivery and requires explicit backend success; no real email is sent", async () => {
  const original = globalThis.fetch,
    previous = process.env.SHOPWARE_STORE_API_URL,
    previousKey = process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  process.env.SHOPWARE_STORE_API_ACCESS_KEY = "unit-test-key";
  process.env.SHOPWARE_STORE_API_URL = "https://viero-deutschland.de/store-api";
  const calls: { url: string; body?: FormData }[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({
      url,
      body: init?.body instanceof FormData ? init.body : undefined,
    });
    return new Response(
      url.includes("/swag/")
        ? JSON.stringify({ success: true })
        : `<input value="form-${nativeTintFormId}">`,
      { status: 200, headers: { "set-cookie": "session=test; HttpOnly" } },
    );
  };
  try {
    const result = await submitTintEnquiry({}, form());
    assert.ok(result.success);
    assert.equal(calls.length, 3);
    const sent = calls[2].body!;
    assert.equal(sent.get("formId"), `form-${nativeTintFormId}`);
    assert.equal(sent.get("E-Mail"), values.email);
    assert.match(String(sent.get("Nachricht")), /MAR01/);
    assert.equal(sent.has("recipient"), false);
    const spam = form();
    spam.set("honeypot", "bot");
    const before = calls.length;
    assert.ok((await submitTintEnquiry({}, spam)).error);
    assert.equal(calls.length, before);
    const upload = form();
    upload.set(
      "file",
      new Blob(["pdf"], { type: "application/pdf" }),
      "ref.pdf",
    );
    assert.ok((await submitTintEnquiry({}, upload)).error);
    assert.equal(calls.length, before);
    globalThis.fetch = async () => new Response("form changed");
    assert.ok((await submitTintEnquiry({}, form())).error);
  } finally {
    globalThis.fetch = original;
    if (previousKey === undefined)
      delete process.env.SHOPWARE_STORE_API_ACCESS_KEY;
    else process.env.SHOPWARE_STORE_API_ACCESS_KEY = previousKey;
    if (previous === undefined) delete process.env.SHOPWARE_STORE_API_URL;
    else process.env.SHOPWARE_STORE_API_URL = previous;
  }
});
