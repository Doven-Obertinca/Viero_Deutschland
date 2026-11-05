# Single-product experience — 3 November 2026

Studied five extracted frames from the supplied eight-second recording: a split product visual and editorial information panel separated by a vertical colour selector. Implemented that composition using actual Shopware imagery, names, descriptions, variants, availability, prices and article numbers. The right panel transitions between selected colour previews, with contrast-adjusted text. The actual product image is preserved and changes only where the variant supplies different media; the source Allure Gold and Silver variants currently share one application photo.

Shopware option colourHexCode/media are now retained by the data schema. This catalogue's inspected options have colour names but no hex values. Recognised names use explicitly approximate digital preview values; the UI says that the original material sample is authoritative. Unknown codes such as MAR42 retain a neutral panel and explain that no digital colour preview is available. No guessed colours are attributed to those codes.

The interaction selects complete, existing colour/size combinations and displays the corresponding actual price and SKU. If a combination is absent, selection resolves to an existing variant for the newly chosen option and updates all radios together. A permalink opens the selected variant. Original metadata, canonical routing, Product and Breadcrumb JSON-LD remain server-rendered. The consultation link uses the existing showroom route. No new checkout or fake add-to-cart behavior was added.

Mobile uses a vertical image, horizontal wrapping swatches and details sequence. Native radios support keyboard navigation; fieldsets name each option group. Price/SKU changes have a polite live region. Reduced motion disables transitions and image entrance animation. Image uses the existing Next optimizer with responsive sizes. No dependency added.

Validation: TypeScript and lint passed. All 23 tests passed, including colour-source handling, unknown-colour fallback and complete variant-price matching. Production build passed. Browser verified Gold 1 l €80.86, Gold 4 l €273.28, Silver 4 l €150.42; no console warnings/errors observed. Responsive widths inspected: 1920, 1440, 1024, 834, 768, 430, 390, 360 and 320. Narrow header overflow was corrected with product-only styles; 320px recheck has document width 305px (15px scrollbar), no horizontal overflow.

Files: app/(store)/produkt/[...slug]/page.tsx; components/product/product-experience.tsx and .module.css; lib/content/product-colours.ts; lib/shopware/products.ts and types.ts; tests/product-colours.test.ts. Preview: viero-product-desktop.png and viero-product-mobile.png.

Open source constraints: full branded calibrated colour palettes and separate colour-specific photography are not supplied by the inspected Shopware variants. Existing variants endpoint remains capped at 100 as before this change; catalogue-scale variant pagination is a separate improvement if a family exceeds that limit.

## Product resources extension

Added source-backed full rich description, specifications, downloads and video below the product composition. On Allure, all three source PDF links were verified with HTTP 200 and application/pdf: technical sheet EN_VID455149T, safety sheet EN_VID455149S and Allure_2018-web colour card. Downloads are resolved from the product's actual public Shopware download blocks, including extension-defined additional files; document labels and URLs are preserved. Source failures show an unavailable status instead of fabricated links.

Product-specific translated CMS slot configuration contains YouTube AUio7P_0-LM, even though the shared resolved CMS layout does not currently output its video slot. It is now shown on the page. Browser verified the loaded YouTube privacy-enhanced player title: ALLURE Application - "DAMASCATO" Effect (Viero Decoratives). No autoplay; third-party player only mounts after explicit loading, with an external viewing alternative. Native MP4/WebM media and configured Vimeo slots are also supported. Non-image media are excluded from the photo viewer.

Specifications use the live selected variant through a small React context: Gold / 4 l updates both hero and specifications to article 455149G500002 with its actual price. Product CMS trees and unrelated API fields are stripped from the interactive product payload. Resource markup and description remain server-rendered.

TypeScript, lint and production build passed after integration; all 23 tests passed. Three PDFs verified reachable; YouTube player loaded successfully. Browser at 320px: no horizontal overflow. Preview: viero-product-resources.png.
