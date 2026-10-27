# Viero Deutschland

Premium Viero storefront foundation built with Next.js App Router, React and TypeScript. **Next.js is the presentation layer; Shopware 6 remains the commerce source of truth.** No backend configuration, catalog records, payments or orders are changed by this application.

## Repository audit

The initial repository contained only a 19-byte README.md and Git metadata. There was no application, package manifest, environment configuration or brand asset directory. The working tree was clean. The supplied PDFs are reference documents outside the repository; no price-list data is used as commerce data.

## Local development

Requires Node.js 22+ and npm.

```sh
npm install
cp .env.example .env.local
# Set your Sales Channel Store API key in .env.local
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/dev/shopware. Without credentials the catalog presents a controlled unavailable state; no mock products are substituted.

```sh
npm run shopware:check
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Environment

- `SHOPWARE_STORE_API_URL`: full Store API base URL, normally `https://viero-deutschland.de/store-api`.
- `SHOPWARE_STORE_API_ACCESS_KEY`: Sales Channel Store API key. Required for catalog access, server-only. Never use an Administration password or Admin integration secret.
- `SHOPWARE_MEDIA_HOSTS`: optional comma-separated HTTPS CDN hostnames for next/image. The Store API hostname and viero-deutschland.de are allowed automatically. Restart after changing this value.
- `SITE_URL`: public frontend origin for metadata, canonical URLs, robots and sitemap. Set the actual deployed frontend URL before production; localhost is the development fallback.

Environment files are ignored except `.env.example`. No `NEXT_PUBLIC_*` credential variables are used.

## Shopware configuration

In https://viero-deutschland.de/admin, open **Sales Channels → the intended active Storefront/headless Sales Channel → API access**, and copy its **API access key**. Set `SHOPWARE_STORE_API_ACCESS_KEY` in `.env.local`. Labels can vary by installed Shopware version. Use the intended channel so currency, language, product visibility, tax and rules are appropriate. Copy the existing key; generating a replacement could affect the current storefront. Do not change the backend for this task.

Official setup reference: https://developer.shopware.com/docs/guides/development/integrations-api/

## Architecture and data flow

Shopware → Store API → `lib/shopware` → async Server Components → UI.

- `app/`: App Router, root layout, controlled errors, loading state, metadata, robots and sitemap.
- `app/(store)/produkte`: paginated real product catalog; category links derive from Shopware.
- `app/(store)/produkt/[...slug]`: UUID product routes; Shopware SEO paths can be resolved through `/seo-url` and redirect to the stable UUID canonical URL. No assumption that the backend domain or route namespace matches this frontend. Human-readable canonical routes can follow after confirming the backend SEO route data.
- `app/(store)/kategorie/[id]`: category-specific paginated listing.
- `lib/shopware`: server-only transport, validated response schemas, configuration, context, navigation, products, categories and SEO resolution. Responses bypass shared caches. Timeouts, credentials, malformed JSON/schema responses and missing records are handled explicitly. Cart only has a future per-visitor session contract; checkout is not implemented.
- `components/`: purposeful layout, UI, product, category and motion primitives. Navigation uses native accessible disclosure controls. Only image fallback and gallery selection require client state.
- `lib/seo`: metadata, canonical URL helpers and script-safe JSON-LD. Product descriptions come from Shopware; HTML is rendered as plain text to avoid executing untrusted catalog markup.
- `public/brand`, `public/images`, `public/icons`: reserved for licensed frontend assets. No fabricated logo or proprietary fonts are bundled. The header is a text brand label pending the official logo asset.

### Store API endpoints

`GET /context`; `POST /navigation/{root}/{root}`; `POST /category`; `POST /category/{id}`; `POST /product`; `POST /product-listing/{categoryId}`; `POST /product/{id}`; `POST /seo-url`.

Product associations request media, cover, options and groups, manufacturer, categories, taxes and SEO URLs. Custom fields are retained when returned. Availability and prices are shown only from API responses. Variants link to their actual product records. API pagination is used for products and listings; category browsing currently retrieves up to 100 categories and variant discovery up to 100 siblings. These limits should be revisited after inspecting the actual catalog size.

The transport supports `sw-access-key`, `sw-context-token`, and `sw-include-seo-urls`. Navigation forwards the anonymous context token. This phase displays anonymous default-channel catalog pricing; it does not create customer sessions. Before customer/cart functionality, persist a per-visitor token in a secure HttpOnly cookie and pass it consistently to all contextual operations. Never share customer context tokens across users or cache their prices globally.

### Development diagnostics

`/dev/shopware` works **only when NODE_ENV is development** and returns 404 in production. It is absent from production navigation, marked noindex, and disallowed in robots. It independently reports context, product, category and navigation results, retrieved counts, real product cards, availability, stock and raw catalog panels. Context output is allowlisted and excludes the session token. Diagnostics never print the access key, raw API error bodies or request headers.

`npm run shopware:check` makes an actual authenticated context request and fails with a clear configuration error when no key exists. A reachable web domain alone is not proof of authenticated Store API connectivity.

## Design system

Official colors are centralized in `app/globals.css`: Viero Green #5E7975, Black #2D2926 and Grey #646566, supported by warm white, limestone, stone and border neutrals. Typography uses `--font-brand` / `--font-display` fallback stacks, ready for licensed Trade Gothic LT Std assets. Oblique section/image primitives reference the brand's diagonal device without recreating the official logo. Motion uses brief transform/opacity transitions and respects reduced-motion preferences. This is a restrained foundation, not a complete shop redesign.

## SEO and production readiness

Metadata and Open Graph use a configured frontend origin. Product and breadcrumb JSON-LD use actual API values. Sitemap enumerates product pages (safety cap 2,000 pages) and currently fetched categories; absent API connectivity it includes only static routes. Large catalogs should use segmented sitemaps and full category pagination. Review tax/shipping disclosures, legal pages, licensed brand assets, translations, sales-channel domains, canonical route strategy, session persistence and real API shapes before publishing. Checkout, filtering and customer accounts are intentionally outside this phase.

## Validation status

See `SHOPWARE-VERIFICATION.md` for the successful live connection, three-product proof, checks and caching recommendations. `IMPLEMENTATION.md` records the historical foundation phase. Run `npm run shopware:verify` to repeat the read-only verification. Installing dependencies or a successful frontend build does not demonstrate Store API connectivity.
