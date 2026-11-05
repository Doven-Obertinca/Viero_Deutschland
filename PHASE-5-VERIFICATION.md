# Phase 5 — Showroom and local consultation page

Completed 3 November 2026.

- Homepage chapter: http://localhost:3002/#showroom
- Local showroom page: http://localhost:3002/showroom
- Local consultation form: http://localhost:3002/showroom#beratung
- Local privacy information: http://localhost:3002/showroom/datenschutz

## Shopware source of truth

Live resolved category: `POST /store-api/category/019529e557527a44b6b89df9dc88f2f0`.
Assigned CMS page: `019529e81dee7fab86a822e587287aa6` (`Viero-Showroom`).

| Displayed information                                                    | Backend source                                                                                                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Showroom title                                                           | Category translated.name                                                                                                                                 |
| Invitation headline                                                      | First real heading in resolved CMS text slot `019529efa3d0712987a2091a157f11e7`                                                                          |
| Homepage description                                                     | First complete sentence of the first CMS paragraph                                                                                                       |
| Local page description                                                   | All CMS body paragraphs, rendered safely as text                                                                                                         |
| Consultation invitation                                                  | CMS paragraph mentioning appointment/arrangement                                                                                                         |
| Primary image                                                            | Category media `0195232a1840715ab62fece07c9513da`                                                                                                        |
| Original page / form context                                             | Category canonical seoUrls entry, resolved against the configured Shopware origin                                                                        |
| Local form title, field definitions, requirements, options, success text | Resolved `custom-form` slot `01952a64c4f177f984f05990124c52f5`, extension `swagCmsExtensionsForm`                                                        |
| Native submission form ID                                                | `01952a64de5976ac95b8b8eadedcfd51`                                                                                                                       |
| Privacy text                                                             | Resolved Datenschutz category `01910c8b18437cdfb13edf2d4f597a7d`; source storefront privacy widget points to CMS page `01916b602603738ea01c74d7c10fe3a5` |

The old hero slot contains technical theme placeholder text and an administration preview mountain reference. These are ignored; the actual category media is used. The custom form's receivers, template IDs and internal routing configuration are never exposed as public contact details or client props.

No business information was copied into frontend constants. The category ID is a content locator, configurable with `SHOPWARE_SHOWROOM_CATEGORY_ID`. Presentation labels and editorial headings are frontend design copy; business content stays in Shopware.

## Backend audit / missing information

Reviewed the existing Next.js/Store API architecture, navigation, public storefront Showroom and Kontakt pages, category/CMS slots, custom fields, media/thumbnails and resolved custom-form extension. No local Twig/custom showroom plugin implementation exists. The existing storefront uses Swag CMS Extensions for its consultation form. Public storefront form markup and its validation JavaScript were inspected to preserve field names, native POST destination, form ID and honeypot.

Available now: one authentic showroom image, invitation/body copy, consultation invitation, existing form and canonical showroom URL.

Not present as showroom-specific CMS data: street, postal code, city, country, showroom telephone/email, structured opening hours, directions URL, coordinates, video and additional images. These are omitted, not replaced with invented values. General footer contact information and form recipients were deliberately not assumed to be showroom-specific data. No LocalBusiness JSON-LD was added without adequate location data.

The adapter supports public telephone/mail anchors, semantic address blocks, an opening-hours table, explicit consultation/directions links and standard resolved CMS image/image-slider/image-gallery blocks if editors add them to this showroom layout. It retains multiple time ranges per day and omits empty fields. Only five images at most (one primary plus four supporting) are selected, in backend order, with deduplication.

## Architecture and admin editing

Shopware resolved category → Zod validation → pure showroom adapter → server-rendered homepage/page. React request cache shares the category request between content and form definitions. The existing transport's `no-store` policy, session behavior and timeout are preserved. No client-side content fetching or new package was introduced.

Administrators can change category name/media/SEO URL and assigned Shopping Experience text/form using the existing Shopware interfaces. Current form labels, placeholders, required flags, option IDs and confirmation text come directly from its CMS definition. No custom CMS element or admin preview was added because standard existing blocks already provide the content.

The standard form fields currently are:

1. Anrede — required select; actual Shopware salutation option IDs.
2. Vorname Ansprechpartner — required text.
3. Nachname Ansprechpartner — required text.
4. Ihre E-Mail-Adresse — required email.
5. Telefon — required contact field, displayed with a telephone keyboard.
6. Betreff — required text.
7. Nachricht — required textarea.
8. Required privacy acknowledgement, as on the original form.

The original textarea's placeholder is kept as a placeholder, rather than prefilled as a user's actual message.

## Local routing and enquiry functionality

The homepage's “Beratungstermin anfragen” now points to `/showroom#beratung`. The actual Showroom navigation category points to `/showroom`. Both paths were verified in the live browser. Opening the navbar and selecting Showroom stays on localhost. The original Shopware site is not used as a frontend navigation destination for these actions.

The local page preserves the full Showroom CMS text and form in a new editorial design. Its privacy link opens a local privacy route in a separate tab, preserving entered form values.

Submissions use a local Next.js Server Action. It reloads the current CMS definition, validates required fields/email/options/privacy/honeypot/length, and forwards only allowed values to the original native `/swag/cms-extensions/form` endpoint with its CMS form ID. The existing backend delivery/recipient setup is preserved; no alternative email provider or recipient is invented. Anonymous Shopware cookies remain server-side. Customer login cookies and Store API keys are not forwarded to the form endpoint. Redirects are followed only within the configured backend origin.

Success is shown locally only after an affirmative backend response (success alert or explicit JSON success). Failure or uncertain delivery keeps the user on the local page, retains field values and does not claim success or automatically retry. Field errors and status messages are keyboard/screen-reader accessible.

No live test enquiry was sent. Validation, redirect/cookie forwarding, affirmative confirmation, uncertain responses and network failures were tested with mocked responses. A real successful SMTP/mailbox delivery is therefore not claimed as verified; it must be observed with an intentional genuine enquiry. The backend form markup and existing form endpoint were verified read-only.

## Homepage design and portal

Three movements: oversized source-derived Showroom title and invitation; a single authentic architectural portal; a precise ruled information/consultation area. No cards, maps, pills, carousel, stock imagery or arrow icons were added.

The image reserves its final geometry from the start. On supporting desktop browsers, CSS view timelines open a mask from 18% inset on each side (64% visible width) to the full image, with a small 1.035→1 internal scale. Only clipping/transforms animate; width/layout do not. No sticky stage, wheel listener, forced scroll or fixed overlay is needed. The portal was observed in partially open and fully open states with its wrapper height unchanged.

Tablet uses a complete static landscape image. Mobile uses a nearly full-width 4:5 crop centered at 61% horizontally to emphasize the sample shelving and material displays, followed by indented editorial information. Reduced motion and unsupported timelines show the final composition immediately.

## Local page design

A very large asymmetric showroom wordmark-style title, restrained invitation, panoramic image and a vertical material narrative lead into a precise consultation form. The form uses thin rules, source-defined column widths, underlined links and a plain rectangular submit control. No new font, cards, rounded form panels, gradients or arrow icons.

Desktop shows the form beside an editorial introduction; tablet reorganizes smaller fields; mobile becomes a comfortable single-column form with 16px input text. The standard header needed a narrowly scoped spacing/logo adjustment at small widths on these new routes to avoid a 320px overflow. It does not affect the approved homepage header.

## Imagery and performance

Original Shopware image:
`https://viero-deutschland.de/media/7e/13/78/1740051716/showroom-viero-owelt.jpg?ts=1740051716`

Selected existing 1920px thumbnail:
`https://viero-deutschland.de/thumbnail/7e/13/78/1740051716/showroom-viero-owelt_1920x1920.jpg?ts=1740051724`

Actual intrinsic size: 1920 × 1080. Thumbnail: 301,414 bytes, versus original media metadata size 1,565,252 bytes. Thumbnail bounding-box labels do not change the original aspect ratio. URLs come from the media response; none are constructed from filename assumptions.

next/image supplies responsive optimized derivatives. Homepage image is lazy and never preloaded. The local page's top image loads eagerly without an unnecessary preload. Supporting images, if later provided, remain lazy. Fixed/aspect-ratio geometry reserves image space. No new homepage client boundary or animation library. The local form's client code only manages pending/status/focus; inputs are otherwise uncontrolled.

No numerical CLS, FPS or Core Web Vitals benchmark is claimed. Native CSS architecture and stable geometry were reviewed; the optimized source was observed loaded.

## Accessibility / responsive validation

Named semantic homepage section; logical h1/h2 hierarchy on the local route; meaningful alt text; real links; visible focus; native form labels, required flags, input types, autocomplete and privacy consent. Field errors are linked from a focusable error summary. Successful/failed submission messages receive focus and a status/alert role. Practical address/telephone/email/hours render semantically only if provided.

Native empty-form submission was tested: the browser blocked delivery and focused Anrede, reporting all seven required CMS fields plus privacy. No enquiry was sent. Homepage consultation-link navigation, navbar navigation and consultation-anchor navigation were tested. The local showroom and privacy pages return HTTP 200 with server-rendered content. Raw HTML includes one form, eight required controls, no recipient configuration and no arrow icons in page content.

Homepage and local page inspected at 1920, 1600, 1440, 1366, 1280, 1024, 834, 768, 430, 390, 360 and 320; intermediate checks at 1100, 1099, 640 and 639. No final horizontal overflow or escaping field/heading boxes. The discovered shared-header overflow at 320px was corrected only for the new page routes. Desktop/mobile portal and form screenshots were saved. Captured browser warnings/errors: none during reviewed showroom interactions.

The selected browser only exposes viewport controls, not reduced-motion/JavaScript emulation. Reduced-motion media scoping and complete static content were reviewed in source; actual static tablet/mobile layouts and raw server HTML were checked. No separate emulated reduced-motion or JS-disabled interactive run is claimed.

## Checks

- TypeScript: pass.
- ESLint: pass.
- Tests: 17/17 pass, including eight new showroom/content/submission tests.
- Production build: pass, including `/showroom` and `/showroom/datenschutz`.
- Prettier and git diff --check: pass.
- Phases 1–4 and global CSS checksums: unchanged. Header navigation gained only the explicitly requested local Showroom destination.
- Native enquiry transport tested with mocks; real delivery intentionally untested.

## Files

Created:

- `components/home/showroom.tsx`
- `components/home/showroom.module.css`
- `lib/home/showroom-content.ts`
- `lib/home/showroom.ts`
- `lib/home/showroom-form.ts`
- `lib/shopware/showroom-enquiry.ts`
- `app/showroom/page.tsx`
- `app/showroom/actions.ts`
- `app/showroom/datenschutz/page.tsx`
- `components/showroom/enquiry-form.tsx`
- `components/showroom/showroom-page.module.css`
- `tests/showroom.test.ts`
- `tests/showroom-enquiry.test.ts`
- This report and the Phase 5 / local-showroom review screenshots.

Modified:

- `app/page.tsx` — Phase 5 import and insertion only for this phase.
- `components/layout/header.tsx` — map existing Showroom category to the new local page.

No backend data/configuration was changed. No footer redesign, dealer/professional section, newsletter or Phase 6 work was added.
