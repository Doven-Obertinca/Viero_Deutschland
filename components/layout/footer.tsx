import Link from "next/link";
import { cookies } from "next/headers";
import { CONSENT_COOKIE } from "@/lib/content/consent-policy";
import { SocialIcon } from "./social-icon";
import { BrandLogo } from "./brand-logo";
import { getFooterContent, getFooterPriceNotice } from "@/lib/content/footer";
import { getCookieConfiguration } from "@/lib/content/cookies";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { CmsRichText } from "@/components/content/cms-rich-text";
import styles from "./footer.module.css";
export async function Footer() {
  const [content, config, cookieStore, priceNotice] = await Promise.all([
    getFooterContent(),
    getCookieConfiguration(),
    cookies(),
    getFooterPriceNotice(),
  ]);
  return (
    <footer className={styles.footer} aria-label="VIERO Seiteninformationen">
      <div className={styles.surface}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <Link
              href="/"
              className={styles.logo}
              aria-label="VIERO Deutschland Startseite"
            >
              <BrandLogo />
            </Link>
            <div className={styles.contact}>
              {content.contactIntro && <p>{content.contactIntro}</p>}
              {content.email && (
                <a href={`mailto:${content.email}`}>{content.email}</a>
              )}
              {content.phone && (
                <a href={`tel:${content.phone.replace(/[^\d+]/g, "")}`}>
                  {content.phone}
                </a>
              )}
              <Link href="/showroom">Showroom erleben</Link>
            </div>
          </div>
          {content.groups.map((group) => (
            <nav
              key={group.id}
              aria-labelledby={`footer-${group.id}`}
              className={styles.navigation}
            >
              <h2 id={`footer-${group.id}`}>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} prefetch={false}>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {content.social.length > 0 && (
            <div className={styles.social}>
              <h2>{content.socialTitle || "Social Media"}</h2>
              {content.socialText && <p>{content.socialText}</p>}
              <ul>
                {content.social.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-label={link.title}
                      title={link.title}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon name={link.title} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {priceNotice && (
          <div className={styles.priceNotice}>
            <CmsRichText
              html={priceNotice}
              origin={content.origin}
              links={content.groups.flatMap((group) => group.links)}
            />
          </div>
        )}
        <div className={styles.utilities}>
          <span>
            © {new Date().getFullYear()} {content.brand} / DEUTSCHLAND
          </span>
          <CookieConsent
            config={config}
            initialCookie={cookieStore.get(CONSENT_COOKIE)?.value}
            privacyHref={content.privacy?.href}
          />
          <a href="#main">Zurück zum Inhalt</a>
        </div>
      </div>
    </footer>
  );
}
