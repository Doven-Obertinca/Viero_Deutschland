# Phase 4 — Architectural lookbook

Implemented 2 November 2026. Preview: http://localhost:3002/#inspiration

## Art direction

An architectural film strip continues the existing concrete field and diagonal shading. An offset “Räume mit Charakter.” opening sets the scale; six uncropped photographic references progress through curved living space, quiet bathing, horizontal wall structure, retail, warm restaurant light and a bright bedroom/bathroom. Small numbers, project/location labels and finish names annotate the images outside their boundaries. The final statement, “Oberflächen werden Räume.”, resolves the sequence with one understated link to VIERO’s actual reference archive.

No cards, masonry, rounded frames, shadows, carousel controls, autoplay, fake metadata, new fonts or gradients. Phase 1–3 files and globals.css were checksummed before implementation and verified unchanged afterward. Only the homepage import and insertion after MaterialCulture were required for integration. The existing footer is untouched; Phase 5 was not started.

## Audit and data

Reviewed homepage markup, hero/product story, gallery source/motion/CSS, Phase 3 markup/CSS, global typography/background, existing routes, Next Image documentation and configuration, local brand imagery, the 225-item catalogue audit, and the live Shopware category/CMS response. The catalogue’s application imagery is predominantly 800px square still-life photography. The CMS Inspiration category has no CMS page and the local app has no project route. Official VIERO references supplied stronger architectural photography and real destinations.

Official archive: https://www.vierodecoratives.com/projects-references/

All six image URLs were discovered in this archive, visually inspected at original size, and matched to their containing reference link. All six linked project pages returned HTTP 200. The captions are curated source-backed content, not a new live CMS feed.

Verified and displayed: project name (or location for Brighton) and decorative product. Omitted: architect/designer credits, dates, area, performance claims, certifications and statistics. The Sha-Lu source has differing designer names between its metadata and body, so no attribution was carried over. The restaurant page spells its title “Coal Sheed”; its verified location “Brighton” is used as the caption instead. No unverified product attribution was inferred from visual appearance or filenames.

## Image curation and exact sources

| Local asset                                | Verified caption / finish         | Why selected                                                                                                        | Reference page                                                            |
| ------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `public/brand/spaces/sha-lu.webp`          | Sha-Lu Taichung / Ghibli          | Large sculptural living room; continuous wall, column and ceiling treatment establishes architecture as the subject | https://www.vierodecoratives.com/projects/sha-lu-taichung-mansion-taiwan/ |
| `public/brand/spaces/kyle-house.webp`      | Kyle House / Marmorin Hydro       | Natural portrait view; lateral light reveals the wall without losing the freestanding bath                          | https://www.vierodecoratives.com/projects/kyle-house/                     |
| `public/brand/spaces/dubai-apartment.webp` | Apartment in Dubai / Travertine   | Broad, horizontal surface field; daylight and furniture establish scale                                             | https://www.vierodecoratives.com/projects/apartment-in-dubai-uae/         |
| `public/brand/spaces/brother2brother.webp` | Brother2Brother / Ghibli          | A commercial interior adds a different use and rhythm; wall texture stays visible above the clothing                | https://www.vierodecoratives.com/projects/brother2brother/                |
| `public/brand/spaces/coal-shed.webp`       | Brighton / Lithos                 | Warm restaurant lighting emphasizes the decorative surface and contrasts with daylight imagery                      | https://www.vierodecoratives.com/projects/coal-sheed/                     |
| `public/brand/spaces/domazlicka.webp`      | Domazlicka, Prag / Marmorin Hydro | Bright final frame brings the sequence back to daylight and a complete spatial atmosphere                           | https://www.vierodecoratives.com/projects/domazlicka-apartment-in-prague/ |

Exact original image URLs are retained with the caption data in `lib/home/spaces.ts`:

1. https://www.vierodecoratives.com/wp-content/uploads/2026/02/ne_img-3.jpg
2. https://www.vierodecoratives.com/wp-content/uploads/2021/11/kyle-house2.jpg
3. https://www.vierodecoratives.com/wp-content/uploads/2021/11/Concreto-Reale_-Viero-50-years-anniversary-contest-_COVER.jpg
4. https://www.vierodecoratives.com/wp-content/uploads/2021/11/50-anniversary_brothers-and-Brothers-UK-1.jpg
5. https://www.vierodecoratives.com/wp-content/uploads/2021/11/Viero_Coal-Shed_Lithos-Matt_UK-5-1.jpg
6. https://www.vierodecoratives.com/wp-content/uploads/2021/11/prague-appartment-1.jpg

All images retain their original aspect ratio and full composition at every breakpoint; there is no indiscriminate object-fit crop. The portrait was selected as a portrait. The hover enlargement crops only the outer 1.5% within the image link.

## Desktop reel and motion

The underlying static layout is a twelve-column editorial journal: a large right-offset opening photograph, portrait/landscape pairing, an inset retail image, and a final unequal pair. Content and DOM reading order remain 01–06.

Progressive enhancement requires support for both view timelines and animation ranges, a fine pointer with hover, viewport width ≥1100px, height ≥700px, and no reduced-motion preference. It replaces the journal layout with a max-content flex strip inside one native sticky canvas. A CSS view timeline moves the strip from zero translation to precisely its width minus the viewport width. Vertical scroll input is never intercepted or converted through JavaScript. There is no snap, forced position, autoplay or wheel handler.

The strip uses different landscape/portrait widths and restrained vertical offsets; it does not rotate, blur, scale continuously or layer competing parallax effects. Source images determine proportions. Height-aware width caps keep photographs and captions within the stage. A small, stationary film identifier provides continuity. The scroll span is 220vw plus the viewport height, proportional to the six-image lateral distance. The closing statement is outside the sticky stage, returning to normal document flow.

Fine-pointer hover allows a 1.015 image scale and a 2px caption-arrow movement. Reduced motion removes these movements too.

## Tablet and mobile

At 1099px and below, the horizontal stage is absent. Tablet keeps asymmetric grid placements, a substantial portrait and offset wide images. Mobile uses a dedicated vertical composition with image spans of 100%, 75%, 92%, 83%, 92% and 92% of the inner canvas. No horizontal touch interaction is required. All captions and reference links remain visible.

Reviewed requested widths: 1920, 1600, 1440, 1366, 1280, 1024, 834, 768, 430, 390, 360, 320. Additional checks: 1100, 1099, 960, 640, 639. No document overflow, escaped static figure/text boxes or caption text overflow. Desktop enhancement is active at 1100px and inactive at 1099px. Desktop frames were inspected at entry and later progression; tablet/mobile and the Phase 3→4 and Phase 4→existing-footer transitions were visually inspected.

## Accessibility

Named semantic section with one h2, six figures with captions and meaningful German alt text. Links have clear accessible names, visible black focus outlines and remain obvious on touch. Source order matches the reading sequence; no CSS ordering. Text uses brand black on the existing concrete background.

The only new client component is a focus-access wrapper. On keyboard-visible focus, it sets a persistent data attribute that restores the full static journal, preventing offscreen animated links from trapping keyboard users. It has no React state or scroll code. CSS :focus-within independently supplies the accessible layout before hydration or without JavaScript. Native Tab traversal through all 12 image/caption links and the closing archive link was verified; each target had a visible solid outline, and no sticky element remained after keyboard activation.

Reduced-motion styling uses the same static journal, with no lateral animation or hover movement. Source/media-query review confirms that complete content remains visible. The selected browser exposes viewport controls but no media or JavaScript emulation, so a separate reduced-motion browser session and JavaScript-disabled interactive session were not run. The actual static journal was inspected through the keyboard fallback at desktop and through tablet/mobile layouts.

## Performance

Six local WebP assets, approximately 724 KiB combined, derived from authentic originals without upscaling:

| Image           | Intrinsic size | Bytes   |
| --------------- | -------------- | ------- |
| Sha-Lu          | 1200 × 800     | 92,542  |
| Kyle House      | 1600 × 2400    | 215,828 |
| Dubai           | 2000 × 1022    | 127,830 |
| Brother2Brother | 1152 × 768     | 123,662 |
| Brighton        | 1024 × 683     | 90,536  |
| Domazlicka      | 1619 × 1060    | 90,300  |

next/image supplies responsive optimized derivatives. All six are lazy-loaded; none is preloaded. Explicit dimensions reserve geometry, and intrinsic aspect ratios avoid layout changes when images decode. Individual sizes account for portrait and landscape presentation. All six optimized images were observed loaded. Browser lazy-loading distance remains browser-controlled; nearby frames may be prefetched as they approach the visible canvas.

Markup, image descriptions and captions are server-rendered. Raw HTTP response verification: status 200, six figures, six images, all six loading="lazy", twelve real project links, no placeholder href. The focus wrapper is the only new client boundary. No new dependency, scroll handler, requestAnimationFrame loop, repeated layout measurement or per-frame React render was added. No claim of measured CLS or FPS benchmarking.

## Files created / modified

Created:

- `components/home/architectural-lookbook.tsx`
- `components/home/architectural-lookbook.module.css`
- `components/home/architectural-reel.tsx`
- `lib/home/spaces.ts`
- Six assets in `public/brand/spaces/`, listed above
- `viero-phase4-desktop-preview.png`
- `viero-phase4-mobile-preview.png`
- `PHASE-4-VERIFICATION.md`

Modified for Phase 4: `app/page.tsx` — one import and one component insertion. Existing Phase 3 changes in this file predate this phase. Existing `next-env.d.ts` modifications predate this work and were not manually edited.

## Validation

- TypeScript: pass.
- ESLint: pass.
- Existing tests: 9/9 pass.
- Production build: pass.
- Prettier for Phase 4 sources: pass.
- git diff --check: pass.
- Phase 1–3 / global CSS checksum verification: pass.
- Six official reference URLs: HTTP 200.
- Server-rendered content, optimized image loading, keyboard traversal and responsive geometry: verified as described above.

## Open issues

No missing assets or metadata block this curated edition. There is no local inspiration/project route to link to, so the links intentionally open the verified official VIERO pages in the same tab. The CMS Inspiration category has no page content; no empty local route was exposed. A future decision could provide a local editorial destination, but no route or CMS project was invented for this phase.

Browser-emulated reduced motion / JavaScript-disabled interaction and measured performance benchmarks remain outside the available browser controls. The corresponding static and source checks are documented above. Phase 5 and all other sections are out of scope.
