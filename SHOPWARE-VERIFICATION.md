# Shopware end-to-end verification

Verified 26 October 2026. This report supersedes the missing-key blocker in the historical foundation report (IMPLEMENTATION.md).

## Connection

- Store API: `https://viero-deutschland.de/store-api`
- Connection successful: **yes**, both `npm run shopware:check` and independent calls through the existing typed server-only client succeeded.
- Sales Channel: **Viero**, `01907421f12572c39efe08062d1036d5`.
- Currency: **EUR**.
- Language: **Deutsch**, `2fbb5fe2e29a4d70aa5854ce7ce3e20b`; the language endpoint was queried to identify the channel language.
- Key loaded from ignored `.env.local`; not printed, hardcoded, or exposed through a public variable.

## Catalog and frontend

- **225 product records** retrieved across all pages, including parent products and variants. This is not a count of distinct product families.
- **32 categories** retrieved.
- **8 navigation roots**, with 7 children beneath Produkte. Navigation includes existing content/footer categories; filtering these for the final storefront is future discovery/design work.
- Category detail and product-listing endpoints verified for **Wanddekoration**, returning 9 entries.
- Prices, availability flags, cover images, variants/options, manufacturer and SEO data verified on all three proof products.
- Custom download fields returned for Allure and Ghibli. Erametal returned no custom field keys; no values were invented.
- All three cover media URLs returned HTTP 200 and rendered visibly through next/image in the browser.
- `/dev/shopware` showed all connection checks passing in development. It displays 24 products from its first page, the API total of 225, and 32 categories.
- `/produkte` showed real product names, numbers, images, prices and pagination.
- All three exact variant pages below were opened in the local browser and checked for name, product number, price, image, category, manufacturer, options and description.
- Ghibli variant navigation was clicked: Weiß / 4 l loaded product `455154G500001` at EUR 68.53, distinct from the proof variant below.
- The Wanddekoration category link was clicked and its real nine-product listing verified in the browser.
- The verified path contains no mock commerce data and reads no snapshot as a catalog source.

## Three-product proof

The path is Shopware backend → Store API → `lib/shopware` → async Server Component → product React components → local browser. Requests for a parent detail can resolve to a Shopware default variant. The IDs and prices below are the actual returned variants, verified directly at their own local URLs. The parent calculated price returned in a catalog listing can differ from the selected variant's price; no prices were rewritten to conceal that distinction.

### Allure

- Product ID: `019091e09a637242bb7b12f6316a7b08`
- Product number: `455149E010001`
- Price: **EUR 45.28**
- Options: Silber, 1 l
- Category: Wanddekoration (`019091b56cc87f79ae89fafdfb77fa2a`)
- Manufacturer: Cromology Italia S.p.A.
- Availability: API `available=true`; returned `stock=0`. Availability is preserved from Shopware, not inferred from stock alone.
- Variant records retrieved: 4
- Cover: [Shopware media](https://viero-deutschland.de/media/55/a0/49/1720431000/Viero%20Allure.jpg?ts=1720431000)
- Local URL: [Allure](http://localhost:3000/produkt/019091e09a637242bb7b12f6316a7b08)
- Canonical Shopware SEO path: `Allure/455149E010001`; resolved back to this variant ID successfully.

### Erametal

- Product ID: `019091fa30e970eab7b1dbb8bd5073aa`
- Product number: `455161D300002`
- Price: **EUR 80.86**
- Options: Silber, 0,75 l
- Category: Wanddekoration (`019091b56cc87f79ae89fafdfb77fa2a`)
- Manufacturer: Cromology Italia S.p.A.
- Availability: API `available=true`; returned `stock=0`. Availability is preserved from Shopware, not inferred from stock alone.
- Variant records retrieved: 2
- Cover: [Shopware media](https://viero-deutschland.de/media/6d/0d/65/1720432956/Viero%20Erametal.jpg?ts=1720432956)
- Local URL: [Erametal](http://localhost:3000/produkt/019091fa30e970eab7b1dbb8bd5073aa)
- Canonical Shopware SEO path: `Erametal/455161D300002`; resolved back to this variant ID successfully.

### Ghibli

- Product ID: `01909209e9c972599fb09f3ca0a6a181`
- Product number: `455154D300001`
- Price: **EUR 21.35**
- Options: Weiß, 0,75 l
- Category: Wanddekoration (`019091b56cc87f79ae89fafdfb77fa2a`)
- Manufacturer: Cromology Italia S.p.A.
- Availability: API `available=true`; returned `stock=0`. Availability is preserved from Shopware, not inferred from stock alone.
- Variant records retrieved: 3
- Cover: [Shopware media](https://viero-deutschland.de/media/eb/ac/a5/1720436568/Viero%20Ghibli.jpg?ts=1720436568)
- Local URL: [Ghibli](http://localhost:3000/produkt/01909209e9c972599fb09f3ca0a6a181)
- Canonical Shopware SEO path: `Ghibli/455154D300001`; resolved back to this variant ID successfully.

## Local integration fixes

Only frontend files were adjusted:

- Accept legitimate `null` values for unloaded category children/SEO associations and variant child counts; malformed non-null field types still fail validation.
- Send `sw-inheritance: true` so variant names, media and descriptions inherit correctly through the Store API.
- Resolve the channel language through `/language` instead of assuming the context contains a language chain.
- Show returned product category links on detail pages.
- Add regression coverage for the live response shapes and inherited-field header.
- Add `npm run shopware:verify`, which runs bounded read-only catalog enumeration and writes the allowlisted verification snapshot `SHOPWARE-VERIFICATION.json`. That file is evidence only and is not imported by the storefront.

## Validation

- `npm run shopware:check`: passed against the real installation.
- `npm run shopware:verify`: passed, including catalog pagination, product details, variants, media HEAD checks, category listing and SEO-path resolution.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: all 3 tests passed.
- `npm run build`: passed with `.env.local` configured.
- Browser visual checks: development diagnostics, catalog, three product detail pages, variant switch and category listing passed.
- `.env.local` confirmed ignored by Git. Exact-key scan of source/artifact files and production browser bundles found no key outside the local environment file. No commit or deployment created.

## Caching strategy

Current verification uses `cache: no-store` for every Store API request. React `cache()` only deduplicates calls within a server render; it does not create a persistent commerce cache. The frontend keeps no separate catalog database.

| Data                  | Current                          | Recommended later                                                                                                                                         |
| --------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product listings      | Fresh server request             | Cache descriptive listing data briefly (e.g. 30–60 seconds), invalidate on catalog changes, and overlay fresh contextual prices/availability.             |
| Product details       | Fresh server request             | Cache descriptive data (e.g. 60 seconds) with product-specific invalidation; refresh sellability separately.                                              |
| Navigation/categories | Fresh server request             | 5-minute cache with category-change invalidation.                                                                                                         |
| Prices                | Fresh Store API calculated price | Fetch with the visitor's current currency, rules and customer context. Never globally share personalized prices; revalidate during cart operations later. |
| Availability          | Fresh Store API flag             | Keep fresh at interaction time; revalidate before adding to cart and during checkout in a later phase.                                                    |

Cache keys must include Sales Channel, language and relevant pricing/session context. An authenticated customer context must never populate a public shared cache. Use server-side invalidation from a later authenticated Shopware event integration, with bounded TTLs as a fallback. No webhook or production configuration was installed in this phase.

## Shopware safety

**No Shopware commerce data, storefront configuration, DNS, domain routing or production configuration was modified.** Only read-only Store API search/context/detail calls and media HEAD requests were made. No Admin credentials, Admin API mutations, cart/order writes, migrations, plugin changes or deployments were used. The existing Shopware storefront remains the live customer-facing system.

## Next step

Viero Premium Storefront – Phase 2: Homepage, Header, Mega Menu, Product Discovery and Editorial Design. This phase was recommended only, not implemented. Before presenting final catalog pricing, explicitly design parent/variant selection and price labels around the verified Shopware behavior.
