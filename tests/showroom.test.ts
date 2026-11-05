import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseShowroom,
  showroomCategorySchema,
} from "../lib/home/showroom-content";
import { getShowroom, showroomCategoryId } from "../lib/home/showroom";

const origin = "https://shop.example";
function image(id = "media-1") {
  return {
    id,
    url: `${origin}/original/${id}.jpg`,
    mimeType: "image/jpeg",
    metaData: { width: 2400, height: 1350 },
    thumbnails: [
      { width: 800, url: `${origin}/thumb/${id}-800.jpg` },
      { width: 1920, url: `${origin}/thumb/${id}-1920.jpg` },
    ],
  };
}
function fixture(
  html = "<h3>Materialien im Raum erleben.</h3><p>Eine echte Einladung &amp; Beratung. Ein weiterer Satz.</p><p>Termin nach Vereinbarung.</p>",
) {
  return {
    id: showroomCategoryId,
    active: true,
    translated: { name: "CMS Ausstellung" },
    media: image(),
    seoUrls: [{ isCanonical: true, seoPathInfo: "ausstellung/" }],
    cmsPage: {
      sections: [
        {
          position: 0,
          blocks: [
            {
              position: 0,
              slots: [
                {
                  type: "text",
                  data: {
                    content: "Headline: category.name<br>Image: category.media",
                  },
                },
                { type: "text", data: { content: html } },
                {
                  type: "custom-form",
                  extensions: { receivers: ["internal@example.test"] },
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

test("showroom remains editable through category, resolved CMS text, media and canonical route", () => {
  const data = fixture();
  const showroom = parseShowroom(showroomCategorySchema.parse(data), origin)!;
  assert.equal(showroom.title, "CMS Ausstellung");
  assert.equal(showroom.headline, "Materialien im Raum erleben.");
  assert.equal(showroom.description, "Eine echte Einladung & Beratung.");
  assert.equal(showroom.appointmentNote, "Termin nach Vereinbarung.");
  assert.equal(showroom.appointmentUrl, `${origin}/ausstellung/`);
  assert.equal(showroom.media[0].url, `${origin}/thumb/media-1-1920.jpg`);
  assert.equal(showroom.media[0].width / showroom.media[0].height, 16 / 9);
  assert.equal(
    showroom.email,
    undefined,
    "form recipients must never become public contact data",
  );
  data.translated.name = "Geänderter CMS Name";
  data.media = image("changed");
  data.seoUrls[0].seoPathInfo = "neues-ziel/";
  const changed = parseShowroom(showroomCategorySchema.parse(data), origin)!;
  assert.equal(changed.title, "Geänderter CMS Name");
  assert.equal(changed.appointmentUrl, `${origin}/neues-ziel/`);
  assert.match(changed.media[0].url, /changed-1920/);
});

test("missing fields and media produce no invented contact details or links", () => {
  const showroom = parseShowroom(
    showroomCategorySchema.parse({ id: "empty", name: "Nur Text" }),
    origin,
  )!;
  assert.deepEqual(showroom.media, []);
  assert.deepEqual(showroom.address, []);
  assert.deepEqual(showroom.openingHours, []);
  for (const key of [
    "phone",
    "email",
    "appointmentUrl",
    "directionsUrl",
    "pageUrl",
  ] as const)
    assert.equal(showroom[key], undefined);
  assert.equal(
    parseShowroom(showroomCategorySchema.parse({ id: "empty" }), origin),
    null,
  );
  assert.equal(
    parseShowroom(
      showroomCategorySchema.parse({
        id: "inactive",
        name: "Draft",
        active: false,
      }),
      origin,
    ),
    null,
  );
  assert.equal(
    parseShowroom(showroomCategorySchema.parse(fixture()), origin)!.media
      .length,
    1,
  );
  const noForm = fixture();
  noForm.cmsPage.sections[0].blocks[0].slots.pop();
  assert.equal(
    parseShowroom(showroomCategorySchema.parse(noForm), origin)!.appointmentUrl,
    undefined,
  );
});

test("semantic showroom CMS information preserves long addresses, contacts and multiple hour ranges", () => {
  const longStreet =
    "Sehr lange Ausstellungsgebäudeanschrift mit mehreren Gebäudeteilen und Eingang im Innenhof";
  const html = `<h3>Eine lange deutsche Einladung für individuelle Materialgestaltung und Oberflächenberatung.</h3>
    <address>Ausstellungshaus<br>${longStreet}<br>12345 Beispielstadt</address>
    <p><a href="tel:+49 123 456-78">+49 123 456-78</a><br><a href="mailto:visit@example.test">visit@example.test</a></p>
    <table><caption>Öffnungszeiten</caption><tr><th>Mo – Fr</th><td>09:00 – 12:00<br>14:00 – 18:00</td></tr><tr><th>Sa</th><td>Nach Vereinbarung</td></tr></table>
    <a href="/beratung?showroom=1">Termin vereinbaren</a><a href="https://maps.example/route">Route planen</a>`;
  const showroom = parseShowroom(
    showroomCategorySchema.parse(fixture(html)),
    origin,
  )!;
  assert.deepEqual(showroom.address, [
    "Ausstellungshaus",
    longStreet,
    "12345 Beispielstadt",
  ]);
  assert.equal(showroom.phone?.href, "tel:+4912345678");
  assert.equal(showroom.email?.href, "mailto:visit@example.test");
  assert.deepEqual(showroom.openingHours, [
    { label: "Mo – Fr", ranges: ["09:00 – 12:00", "14:00 – 18:00"] },
    { label: "Sa", ranges: ["Nach Vereinbarung"] },
  ]);
  assert.equal(showroom.appointmentUrl, `${origin}/beratung?showroom=1`);
  assert.equal(showroom.directionsUrl, "https://maps.example/route");
});

test("CMS markup is rendered as text; unsafe URLs, private media and missing dimensions are excluded", () => {
  const data = fixture(
    '<h3>Erleben &#x26; Berühren</h3><script>secret()</script><p>Material &lt;em&gt;pur&lt;/em&gt;.</p><a href="javascript:alert(1)">Termin</a><a href="data:text/html,bad">Route planen</a><a href="mailto:visit@example.test?bcc=other@example.test">E-Mail</a>',
  );
  const showroom = parseShowroom(showroomCategorySchema.parse(data), origin)!;
  assert.equal(showroom.headline, "Erleben & Berühren");
  assert.equal(showroom.description, "Material <em>pur</em>.");
  assert.equal(showroom.directionsUrl, undefined);
  assert.equal(showroom.email, undefined);
  assert.equal(showroom.appointmentUrl, `${origin}/ausstellung/`);
  for (const media of [
    { ...image(), private: true },
    { ...image(), metaData: null },
    { ...image(), mimeType: "video/mp4" },
  ]) {
    const parsed = showroomCategorySchema.parse({ ...data, media });
    assert.deepEqual(parseShowroom(parsed, origin)!.media, []);
  }
});

test("resolved standard CMS image blocks extend the gallery without repeating the category image", () => {
  const data = fixture();
  const slots: unknown[] = data.cmsPage.sections[0].blocks[0].slots;
  slots.push({
    type: "image-slider",
    data: {
      sliderItems: [
        image(),
        ...Array.from({ length: 6 }, (_, i) => ({
          media: image(`extra-${i}`),
        })),
      ],
    },
  });
  const showroom = parseShowroom(showroomCategorySchema.parse(data), origin)!;
  assert.equal(showroom.media.length, 5);
  assert.equal(new Set(showroom.media.map((media) => media.id)).size, 5);
});

test("showroom loader requests resolved content server-side and safely omits unavailable content", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SHOPWARE_STORE_API_URL;
  const originalKey = process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  const originalId = process.env.SHOPWARE_SHOWROOM_CATEGORY_ID;
  process.env.SHOPWARE_STORE_API_URL = `${origin}/store-api`;
  process.env.SHOPWARE_STORE_API_ACCESS_KEY = "test-key";
  delete process.env.SHOPWARE_SHOWROOM_CATEGORY_ID;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(
        String(url),
        `${origin}/store-api/category/${showroomCategoryId}`,
      );
      assert.equal(options?.cache, "no-store");
      assert.match(String(options?.body), /thumbnails/);
      return Response.json(fixture());
    };
    assert.equal((await getShowroom())?.title, "CMS Ausstellung");
    globalThis.fetch = async () => new Response(null, { status: 503 });
    assert.equal(await getShowroom(), null);
    globalThis.fetch = async () => Response.json({ unexpected: true });
    assert.equal(await getShowroom(), null);
    process.env.SHOPWARE_SHOWROOM_CATEGORY_ID = "invalid";
    globalThis.fetch = async () => {
      throw new Error("must not fetch an invalid locator");
    };
    assert.equal(await getShowroom(), null);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries({
      SHOPWARE_STORE_API_URL: originalUrl,
      SHOPWARE_STORE_API_ACCESS_KEY: originalKey,
      SHOPWARE_SHOWROOM_CATEGORY_ID: originalId,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
