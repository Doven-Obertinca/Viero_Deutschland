# Phase 3 — Material culture

Implemented 2 November 2026. Preview: http://localhost:3002/#materialkultur

## Scope and design

Only Phase 3 was added after ProductShowcase. Existing hero/gallery files were checksummed before implementation and verified unchanged afterward. The existing concrete field, diagonal shading, Arial typography and footer remain unchanged by this phase.

A spacious opening gives way to a twelve-column editorial sequence: oversized material typography opposite an authentic surface, an offset landscape application image, and staggered Made / in / Italy typography beside an interior detail. Tablet uses offset, overlapping grid spans without reordering the DOM. Mobile has separately placed, indented text and alternating image widths. No cards, badges, rounded frames or new dependencies.

## Verified brand content

Source: `/Users/doven/Downloads/Brand_Manual_2021_02_bassa.pdf`, 33 PDF pages. Page references below are PDF page numbers, not printed folios. No brand manual was found inside the repository; this local source was inspected directly. The live Shopware catalogue was also inspected (Travertine, Marmorin, Oltre); final copy uses the manual rather than extra product claims.

| Rendered claim / idea                                              | Source                                                                      |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Made in Italy / Italian decorative identity                        | pp. 2 and 7, brand promise and positioning                                  |
| THE ITALIAN EXPERIENCE                                             | p. 3                                                                        |
| Selection of raw materials, processing to achieve an effect        | pp. 14–15, material selection                                               |
| An applicator can reinterpret and individualize decorative effects | pp. 14–15, personalization of effect                                        |
| Italian style and attention to detail                              | p. 7, brand attributes; p. 10, sensory experience                           |
| Dialogue between tradition and modernity                           | pp. 14–15, collections                                                      |
| Material → gesture → space                                         | Editorial narrative grounded in the above; no historical or technical claim |

German prose is a concise paraphrase. No dates, statistics, sustainability, certification, composition-wide mineral claims or manufacturing-process promises were added. Descriptive image captions identify visible details. The optional brand CTA is omitted because no About/brand route exists; no placeholder link or new route was invented.

## Exact assets

Embedded photographs were extracted from the original brand manual and converted to WebP, without upscaling, generating or inventing imagery. These images are brand illustrations, not identified product swatches; no product names are assigned to them.

| File                                          | Source             | Dimensions  | File size     | Purpose                                     |
| --------------------------------------------- | ------------------ | ----------- | ------------- | ------------------------------------------- |
| `public/brand/material-culture/material.webp` | PDF p. 7, image 0  | 869 × 1186  | 37,222 bytes  | Pale surface close-up, visible trowel marks |
| `public/brand/material-culture/gesture.webp`  | PDF p. 17, image 0 | 1195 × 870  | 55,288 bytes  | Authentic brush application                 |
| `public/brand/material-culture/space.webp`    | PDF p. 14, image 0 | 1438 × 1186 | 217,494 bytes | Textured wall in an interior                |

## Motion and performance

Server component, no new client boundary or scroll listener. Native document flow; no pinned segment, wheel interception or forced scrolling. Supporting browsers receive CSS view-timeline enhancements: per-element fade-in with a 24px upward arrival across opening labels, typography, images, copy and closing signature, a restrained 12% material-image clip reveal, and a 1.035→1 craft-image scale. Unsupported browsers receive the complete static layout. Motion runs only under `prefers-reduced-motion: no-preference`; existing global reduced-motion rules also disable animations. Opacity reveals are scoped to supported view timelines with no reduced-motion preference; the default and reduced-motion layouts remain fully visible.

Images use next/image, lazy loading, explicit intrinsic dimensions, responsive sizes and reserved aspect ratios. No Phase 3 preloads. Local source images total approximately 303 KiB; the browser requests optimized responsive derivatives. No new network content dependency for this section. No continuously updating React state.

## Accessibility and validation

- Named semantic section, one h2 and three h3 headings; Made in Italy has an explicit accessible heading label.
- Figures, descriptive alt text, captions, logical DOM reading order. No CSS order changes or hover-only content.
- No new interactive controls or focus targets; existing navigation/focus behavior remains unchanged.
- Captions use brand black, rather than the existing gray that falls below 4.5:1 against the concrete base.
- All eleven requested widths checked for section/document overflow: 1920, 1440, 1366, 1280, 1024, 834, 768, 430, 390, 360, 320. No horizontal overflow or escaping phase text/figure boxes. Desktop material, craft and origin, plus mobile opening and closing compositions inspected visually.
- All three images observed loading successfully through next/image.
- Reduced motion and JavaScript-free completeness reviewed in source; browser media emulation and a separate JavaScript-disabled browser run were not available through the selected browser controls. No claim of measured CLS or frame-rate benchmarking.
- TypeScript: pass. ESLint: pass. Existing tests: 9/9 pass. Production build: pass. Prettier for changed sources: pass. git diff --check: pass.
- Locked hero/gallery checksums: pass.

## Files

Created: components/home/material-culture.tsx, components/home/material-culture.module.css, three WebP assets above, this report, viero-phase3-desktop-preview.png, viero-phase3-mobile-preview.png.
Modified for Phase 3: app/page.tsx (import and render only).
Earlier background changes in app/globals.css predate Phase 3 and were not modified here.

## Remaining design decision

Optional brand CTA destination, if a real About/VIERO route is added later. Otherwise Phase 3 is ready for visual approval. Phase 4 was not started.
