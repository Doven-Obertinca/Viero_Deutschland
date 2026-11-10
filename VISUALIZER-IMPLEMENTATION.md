# VIERO Raumvisualisierer

The editor lives at `/raumvisualisierer` in the Next.js App Router. It uses the existing root layout, header menu, SEO helper, sitemap, VIERO design tokens and UI primitives. Shopware remains the source for the decorative category, variant IDs, color labels, descriptions and product routes. The workspace is loaded on demand. The introduction and example-room controls can render while the catalog request is pending.

## Product and room assets

The approval manifest in `lib/visualizer/approvals.ts` is intentionally empty. **Zero VIERO products are currently approved for projection.** The supplied catalog and brand files include finish and room photography. A projection texture needs separate review for fidelity, repeatability and usage rights.

1. Obtain a reviewed, tileable albedo for an exact Shopware product or color variant, with capture and color-reference information. Retain that source information and the commercial approval in the asset handoff.
2. Host the texture under `public/visualizer/materials/` and register its local URL against the exact Shopware ID. Verify scale, color, rotation and the finished render against a physical sample. The material picker, product CTA and contact prefill use that ID.
3. Verify each registered asset in the production deployment. A missing image surfaces a preview error and the compositor preserves the original photo.
4. Confirm visualization reuse rights for the existing Dubai apartment and travertine kitchen photography before launch. Their paths, normalized wall outlines, fixture cutouts and projection planes are maintained together in `lib/visualizer/model.ts`.

Two procedural structure studies are explicitly separate from the VIERO catalog. Exports containing a study carry a study label. The optional VIERO watermark is controlled independently.

## Processing and storage

The browser validates photo signatures, decodes the image, enforces a 20 MB file limit and a 48 megapixel decoded limit, then re-encodes the normalized photo with the long edge capped at 2,400 pixels. HEIC depends on browser decoding support. The normalized photo is the comparison source. An upload progress message reports processing stages because the file never leaves the browser.

A same-origin worker proposes a coarse wall region by color and edge continuity. It can mistake a similarly colored object or ceiling for wall and may return no usable region. It does not classify objects or discover separate wall instances. The editor supports drawing independent wall outlines, adding or erasing pixels with a brush, redefining the projected quadrilateral and undoing edits.

Canvas 2D rasterizes masks and evaluates an inverse homography with scale and rotation controls. Photo luminance modulates the rendered color to retain some room shading. The preview is capped at 1,080 pixels on its long edge. PNG and JPEG exports re-render at the source size up to 2,400 pixels and omit the editor overlays. The engine caches masks and a bounded set of textures. It uses CPU pixel compositing and can stall on larger exports or slower devices. Mobile uses a canvas-first layout with a bottom material drawer, horizontally browsable products and native scrolling when zoomed. The editorial landing includes an interactive study that renders on demand. The workspace uses the previous composite under a directional reveal for material changes, with a reduced-motion fallback.

The active project stays in tab memory and can be closed. Explicit local save stores one versioned project in IndexedDB until the visitor deletes the local copy or clears site data. No photo, filename or project is sent to Shopware, an AI service or an upload endpoint. The existing contact form can prefill an editable list of approved product IDs and catalog color labels. It receives those IDs only, and submission still uses its existing validation and consent flow.

## Verification and launch status

The example-room flow was exercised in Chrome with two independent study assignments, split comparison, local save, PNG export and an Allure product-page round trip. The exported PNG measured 2,000 × 1,022. A repository JPEG was opened through the upload control and reached the uploaded-room editor. The automated suite covers projection geometry, independent assignments and history, project serialization, file signatures, and the Shopware mapping and approval gate.

The brief’s full launch acceptance criteria remain open. Approved VIERO assets are required to validate the product-specific CTA, authentic finish projection and prefilled inquiry together. The upload workflow needs a commercially cleared, benchmarked semantic segmentation provider with reliable multi-wall masks, wall geometry and foreground exclusions. A self-hosted browser model is a candidate if the weights and training-data terms, download budget and device coverage pass review. SegFormer ADE20K can be evaluated for semantic labels, with separate work required for wall instances and occlusion quality. The implemented editor requires no inference service.

GPU acceleration, dedicated pinch and pan gestures, automated browser and visual regression coverage, rendering benchmarks, and cross-browser/accessibility validation remain open. Production deployment requires those checks, reference renders for approved finishes, and room-image rights confirmation.
