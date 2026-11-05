import { test } from "node:test";
import assert from "node:assert/strict";
import { footerGroups } from "../lib/content/footer-model";
import {
  parseCookieMarkup,
  allChoices,
  normalizeChoices,
  type ConsentConfig,
} from "../lib/content/cookie-model";
import {
  consentWrites,
  readConsent,
  CONSENT_COOKIE,
} from "../lib/content/consent-policy";
import { parseRichText } from "../lib/content/rich-text";
const markup = `<div class="offcanvas-cookie-description"><p>Ihre Cookies. <a href="/privacy">Mehr Informationen ...</a></p></div>
<div class="offcanvas-cookie-group"><input class="offcanvas-cookie-parent-input" id="required" data-cookie-required="true"><label for="required">Technisch erforderlich</label><div class="offcanvas-cookie-entries collapse"><p>Notwendige Funktionen.</p><div class="offcanvas-cookie-entry form-check"><input data-cookie="session-" data-cookie-required="true"><label>Sitzung</label></div></div></div>
<div class="offcanvas-cookie-group"><input class="offcanvas-cookie-parent-input" id="stats"><label for="stats">Statistiken</label><div class="offcanvas-cookie-entries collapse"><p>Analyse.</p><div class="offcanvas-cookie-entry form-check"><input data-cookie="google-analytics-enabled" data-cookie-value="1" data-cookie-expiration="30"><label>Google Analytics</label></div><div class="offcanvas-cookie-entry form-check"><input data-cookie="bad;path=x"><label>Invalid</label></div></div></div>`;
const config: ConsentConfig = {
  ...parseCookieMarkup(markup),
  version: "source-v1",
  available: true,
};
test("footer follows the backend hierarchy, keeps real destinations and excludes inactive or unsafe links", () => {
  const groups = footerGroups(
    [
      { id: "root" },
      { id: "service", parentId: "root", name: "Shopservice**" },
      {
        id: "terms",
        parentId: "service",
        name: "AGB",
        cmsPageId: "cms",
        seoUrls: [{ isCanonical: true, seoPathInfo: "AGB/" }],
      },
      { id: "inactive", parentId: "service", name: "Draft", active: false },
      {
        id: "unsafe",
        parentId: "service",
        name: "Bad",
        type: "link",
        externalLink: "javascript:alert(1)",
      },
      {
        id: "external",
        parentId: "service",
        name: "External",
        type: "link",
        externalLink: " https://example.test/ ",
      },
    ],
    "root",
    "https://shop.example",
  );
  assert.equal(groups[0].title, "Shopservice");
  assert.deepEqual(
    groups[0].links.map((l) => l.id),
    ["terms", "external"],
  );
  assert.equal(groups[0].links[0].href, "/informationen/terms");
  assert.equal(groups[0].links[0].cmsPageId, "cms");
  assert.equal(groups[0].links[1].href, "https://example.test/");
});
test("legacy Shopware cookie configuration retains actual categories, entries, durations and required status", () => {
  assert.equal(config.description, "Ihre Cookies.");
  assert.equal(config.groups.length, 2);
  assert.equal(config.groups[0].required, true);
  assert.equal(config.groups[0].entries[0].name, "session-");
  assert.equal(config.groups[1].entries.length, 1);
  assert.equal(config.groups[1].entries[0].days, 30);
  assert.equal(config.groups[1].entries[0].value, "1");
});
test("consent is opt-in, only declared optional cookies can be written, and required sessions are never forged", () => {
  const defaults = allChoices(config.groups, false);
  assert.equal(defaults["session-"], true);
  assert.equal(defaults["google-analytics-enabled"], false);
  const writes = consentWrites(config, allChoices(config.groups, true));
  assert.ok(!writes.some((w) => w.name === "session-"));
  assert.ok(!writes.some((w) => w.name === "viero-context"));
  assert.equal(
    writes.find((w) => w.name === "google-analytics-enabled")?.value,
    "1",
  );
  const revoked = consentWrites(config, defaults).find(
    (w) => w.name === "google-analytics-enabled",
  );
  assert.equal(revoked?.maxAge, 0);
  const sanitized = normalizeChoices(config.groups, {
    "session-": false,
    "google-analytics-enabled": true,
    evil: true,
  });
  assert.equal(sanitized["session-"], true);
  assert.equal(sanitized.evil, undefined);
  const stored = writes.find((w) => w.name === CONSENT_COOKIE)!;
  assert.deepEqual(
    readConsent(encodeURIComponent(stored.value), config),
    allChoices(config.groups, true),
  );
  assert.equal(
    readConsent(stored.value, { ...config, version: "new-source" }),
    null,
  );
  assert.equal(readConsent("broken", config), null);
});
test("CMS rich text preserves headings, lists and links without allowing executable markup or unsafe attributes", () => {
  const nodes = parseRichText(
    '<h2 id="section">Datenschutz</h2><p>Text <strong>klar</strong> <a href="https://example.test" onclick="bad()">Quelle</a><a href="javascript:bad()">Bad</a></p><script>steal()</script><img src=x onerror=bad()><ul><li>Eintrag</li></ul>',
    (value) => (value.startsWith("https://") ? value : undefined),
  );
  const serialized = JSON.stringify(nodes);
  assert.match(serialized, /Datenschutz/);
  assert.match(serialized, /https:\/\/example.test/);
  assert.match(serialized, /"tag":"li"/);
  assert.ok(!serialized.includes("onclick"));
  assert.ok(!serialized.includes("steal"));
  assert.ok(!serialized.includes("javascript:"));
  assert.ok(!serialized.includes('"tag":"img"'));
});
