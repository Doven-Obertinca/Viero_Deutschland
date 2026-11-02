# VIERO Phase 2B — implementation and verification

Verified 29 October 2026.

## Implementation

Latest revision: reconstructed the actual Bellucci Impressionen zoom-out timeline from stationary rendered browser measurements. This replaces the longer seven-chapter reveal. The enlarged central square scales down and becomes a portrait while horizontal side-image fades overlap; the gallery then exits after 120vh of pinned travel.

Replaced the short homepage placeholder below the approved hero with the requested OBERFLÄCHEN introduction and seven-product editorial gallery. No Phase 2C content was added. The existing hero, header, and global stylesheet are byte-for-byte unchanged from the beginning of this task (checked with SHA-1 snapshots). Earlier uncommitted work was preserved.

The Bellucci Impressionen gallery was inspected in the browser as a composition reference. Its source, typography, branding and implementation were not copied.

## Products, assets and routing

All names, categories, description excerpts, cover media and links are retrieved through the existing Shopware integration. The only curated content in code is the seven parent product IDs and their order. The existing getProduct call resolves parents to actual variant IDs, then productPath creates the destination. The route IDs below reflect those verified live responses, not the selection IDs.

| Product        | Verified destination                        | Exact source image                                                                                                           |
| -------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Oltre          | `/produkt/019391f15b397389836c18cc616c0dc2` | [Original Shopware asset](https://viero-deutschland.de/media/d4/d5/eb/1739887855/Viero%20Oltre%20Style_1.jpg?ts=1739887855)  |
| Allure         | `/produkt/019091e09a637242bb7b12f6316a7b08` | [Original Shopware asset](https://viero-deutschland.de/media/55/a0/49/1720431000/Viero%20Allure.jpg?ts=1720431000)           |
| Marmorin Hydro | `/produkt/0190a163245f7006a70e36cf77e2a1fb` | [Original Shopware asset](https://viero-deutschland.de/media/47/aa/34/1720694158/Viero%20Marmorin%20Hydro.jpg?ts=1720694158) |
| Erametal       | `/produkt/019091fa30e970eab7b1dbb8bd5073aa` | [Original Shopware asset](https://viero-deutschland.de/media/6d/0d/65/1720432956/Viero%20Erametal.jpg?ts=1720432956)         |
| Travertine     | `/produkt/01910ed63acc7150a85b897d6e8fe960` | [Original Shopware asset](https://viero-deutschland.de/media/83/fd/00/1722530102/Viero%20Travertine.png?ts=1722530102)       |
| Rusten Finish  | `/produkt/0190a0fc3ee6733bbfb9d31c5410fc6b` | [Original Shopware asset](https://viero-deutschland.de/media/7f/9e/39/1720687519/Viero%20Rusten%20Finish.jpg?ts=1720687519)  |
| Marmorin Sand  | `/produkt/0190a5c4545373ebb1e24a9b10f28ac9` | [Original Shopware asset](https://viero-deutschland.de/media/e5/05/6e/1720767648/Viero%20Marmorin%20Sand.jpg?ts=1720767648)  |

All seven source covers were visually inspected. They are square, 800 × 800 assets. Desktop uses deliberate portrait and landscape windows to match the reference composition; mobile retains complete square images.

## Scroll architecture

The central card now has a separate pre-pin entrance: it fades from invisible and zooms from 0.9× to 1.5× as the stage approaches. At the pin boundary it joins the measured reference timeline without changing any subsequent timings or side reveals. The entrance reverses naturally on upward scroll.

The reference was inspected live at 1440 × 900, including entry, incremental downward scroll, reverse scroll, completed state and mobile fallback. Its pinned wrapper measured 1980px (900px stage plus 1080px scroll travel), so the native CSS implementation uses a 220svh section with a 100svh sticky stage.

The measured normalized timeline is independently implemented in lib/home/showcase-motion.ts:

- Center scale: 1.5 to 1 over progress 0–0.8, quadratic ease-out.
- Center shape: square to portrait over progress 0.24–0.8, quadratic ease-out. At the measured desktop size, this corresponds to 450px width and 450–650px height.
- Upper inner images: fade and slide inward from 80px at progress 0.28, over 0.48 of the timeline, cubic ease-out.
- Lower right: same motion starting at 0.36.
- Far left and far right: fade and slide inward from 120px starting at 0.44.
- Lower left: the final reveal, starting at 0.52.
- Once complete, the stage leaves naturally; reverse scrolling retraces the same timeline.

Measured reference fixtures are covered by tests: at 40%, center scale 1.125, center height approximately 548px, inner opacity 0.5781 and left offset −33.75px. At 60%, center scale 1.0313, center height approximately 624px, outer opacity 0.7037 and lower-left opacity 0.4213. At 90%, lower-left opacity 0.991 and offset approximately −1.0851px. Tests also cover fast jumps and reversing to the initial state.

The client uses a passive scroll listener, cached section measurements, a small frame-rate-independent visual follow and requestAnimationFrame. The loop stops when settled. No animation dependency, wheel handler, body scroll modification, slot swapping or unrelated page motion is added. Reduced motion, keyboard focus and missing browser APIs retain all content.

## Hover content and room suitability

All gallery arrows have been removed. Every image remains a direct product link. Hover and keyboard focus expose a longer description (up to 320 characters) taken from the live Shopware description. The featured central card allows more text than the side cards. Its description is also connected through aria-describedby.

Room labels are extracted only from explicit catalogue wording. Oltre supports Badezimmer, Küche, Wohnbereich and Treppenhaus. Allure explicitly identifies Innenräume. Marmorin Sand supports Innen- und Außenbereich. Other products retain their verified finish description instead of receiving unverified wet-room or room-specific recommendations.

## Responsive behaviour

At 900px and wider, the desktop collage is the baseline. Animation requires a fine pointer, hover, at least 650px height and no reduced-motion preference. Otherwise all seven images appear in the completed static composition. Below 900px, the same content becomes a vertical editorial sequence with full images and captions. Reduced motion never hides products. Touch devices with a desktop-sized viewport retain visible product captions.

## Accessibility

Every image is one real product link with a product-specific accessible name. The section has an h2, product h3 headings, descriptive alt text, and visible keyboard focus. Desktop labels appear on hover or focus; mobile labels are always visible. Keyboard focus immediately reveals the complete composition, allowing native Tab through all seven image links. Longer descriptions are associated with the product links for assistive technology. The focus handler brings the selected image into view and does not manipulate normal scrolling.

## Performance

Next Image supplies responsive optimized sources and native lazy loading. Every product can become the central image, so responsive sources allow up to 48vw on desktop and 90vw on mobile. All seven images eventually appear simultaneously, so all seven appropriately sized assets load near the stage. Fixed geometry reserves image space. Product route prefetching is disabled. No package dependencies changed.

## Files changed

- app/page.tsx — insert Phase 2B after the unchanged hero.
- components/home/product-showcase.tsx — server-rendered content and imagery.
- components/home/product-showcase.module.css — scoped editorial and sticky layouts.
- components/home/showcase-scroll.tsx — focused progressive interaction layer.
- lib/home/showcase.ts — curated selection using existing Shopware product types and helpers.
- lib/home/showcase-motion.ts — independently implemented measured animation timeline.
- tests/showcase-motion.test.ts — reference measurement fixtures, fast jumps and reverse-scroll boundaries.
- tests/showcase.test.ts — partial/complete API failures, missing imagery, deduplication, ordering and resolved-route checks.
- PHASE-2B-VERIFICATION.md — this verification record.
- viero-showcase-desktop-preview.jpg — completed collage screenshot.
- viero-showcase-focus-preview.jpg — initial central-image screenshot.
- viero-showcase-mobile-preview.jpg — mobile browser screenshot.

## Validation

- npm run typecheck — passed.
- npm run lint — passed.
- npm test — all 9 tests passed.
- npm run build — production build passed.
- git diff --check — passed.
- Production HTTP integration: homepage returned 200 with seven articles and seven links in server HTML before enhancement. All seven destination pages returned 200 and matching product h1 headings.
- Browser checks at 1440, 1280, 1100, 1024, 900, 768, 430, 390 and 360px: no horizontal overflow; all seven products and links remain present. The revised collage and smaller-screen document flow were verified.
- Fast forward/reverse native scrolling, measured zoom/reveal timing, reverse scrolling, central-image/collage states, clean footer exit, resizing and keyboard Tab navigation were exercised in the browser.
- Desktop and mobile screenshots were captured. The browser viewport override was reset after testing.
- Server HTML verifies the no-JavaScript content baseline. Reduced-motion behaviour was reviewed in the matching CSS/JS media conditions; OS-level emulation was not available in this browser tool.

## Remaining issues and limits

No missing content or blocking asset decisions. Original cover resolution is 800 × 800; higher-resolution originals would improve large high-density displays. Physical touchscreen, mouse-wheel and trackpad hardware were not separately tested. No field Core Web Vitals measurement was performed. Existing development LCP advisories for the locked logo/hero imagery were observed and those files were left untouched.
