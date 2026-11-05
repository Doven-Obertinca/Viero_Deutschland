# Footer and cookie controls — 3 November 2026

Implemented the reference's light #e5e5e5 raised surface, inset contact panel and raised cookie controls, using the existing VIERO typography. No new arrow icons or dependencies. Existing hero, product discovery, material culture, architectural lookbook and global styles verified unchanged against the previous phase checksum snapshot.

## Shopware sources

Footer hierarchy comes from the configured sales channel footerCategoryId and active/visible categories. Contact introduction, email and social links come from sales-channel custom fields, with translated fields taking precedence. All seven actual information destinations are rendered locally from their Shopware CMS text: AGB, Versand & Zahlung, Rückgabe, Kontakt, Über uns, Datenschutz and Impressum. The Kontakt form reuses its real CMS field configuration and the existing validated Shopware submission integration. The source price/VAT notice is retrieved from the public storefront footer, with its shipping link resolved locally. No invented legal text, address or opening hours.

This Shopware installation does not expose the newer cookie-groups Store API. Cookie labels, descriptions, entries and expiry values are therefore parsed server-side from its existing /cookie/offcanvas endpoint. The source has five groups: Technisch erforderlich, Statistiken, Marketing, Komfortfunktionen and Shopware Analytics. Source scripts are never copied or executed.

## Consent behavior

New visitors can accept all, accept necessary only, or configure groups. Optional choices default off; required entries cannot be disabled. Versioned preferences persist for at most 30 days and are editable from the footer. Known optional provider cookies and Shopware Analytics local-storage identifiers are cleared when their corresponding groups are declined. Authentication cookies are preserved. There is a native modal with keyboard containment, Escape dismissal, focus restoration and visible focus states. /cookies provides a server-rendered settings form that also works without JavaScript.

The Next application currently loads no optional analytics, advertising or embedded-video tracker libraries. This implements source-backed consent preferences and flag cookies, plus a consent-change event for integrations; it does not import the legacy storefront's tracking scripts. Cookie choices are scoped to the current website domain and are not shared across localhost and the existing production storefront.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Tests: 21 passed, 0 failed.
- Production build: passed.
- Browser: all seven local information routes display their source content; Kontakt displays the configured form. No console warnings/errors observed during those route checks.
- Accept all persisted through reload; reopening settings showed all optional groups selected. Necessary-only revoked them, and reopening showed optional groups unchecked.
- Escape closes the native settings dialog and returns focus to the footer trigger.
- Footer inspected on desktop, tablet and mobile. Geometry checked at 1920, 1440, 1024, 768, 390 and 320px: no horizontal document overflow.
- Preview artifacts: viero-footer-desktop.png and viero-footer-mobile.png.
- No real enquiry was sent; delivery integration tests use mocks.

## Main files

components/layout/footer.tsx, footer.module.css; components/consent/*; components/content/*; lib/content/*; app/informationen/[id]/*; app/cookies/*; tests/footer-consent.test.ts. Existing showroom form parsing/component were generalized for the source Contact form, and the older showroom privacy URL redirects to the canonical local source-backed Datenschutz page.

## Source limitations

CMS copy is displayed as maintained in Shopware, including its original privacy-policy date and any source mistakes. No optional tracking provider has been newly enabled. Source failures do not fabricate legal information or enable optional consent.
