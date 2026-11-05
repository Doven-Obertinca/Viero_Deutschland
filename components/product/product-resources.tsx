import type { Product } from "@/lib/shopware/types";
import { productName } from "@/lib/shopware/urls";
import { getProductResources } from "@/lib/content/product-resources";
import { CmsRichText } from "@/components/content/cms-rich-text";
import { ProductVideoPlayer } from "./product-video";
import styles from "./product-resources.module.css";
export async function ProductResources({ product }: { product: Product }) {
  const resources = await getProductResources(product);
  return (
    <section
      className={`${styles.resources} ${resources.videos.length ? styles.withVideo : ""}`}
      aria-labelledby="product-knowledge-title"
    >
      <header>
        <p>VIERO / MATERIALWISSEN</p>
        <h2 id="product-knowledge-title">Alles zum Material.</h2>
      </header>
      <div className={styles.information}>
        <div>
          <h3>Beschreibung</h3>
          <div className={styles.copy}>
            <CmsRichText
              html={
                product.translated?.description ||
                (product.description as string) ||
                ""
              }
              origin={resources.origin}
              links={[]}
            />
          </div>
        </div>
      </div>
      {resources.videos.length > 0 && (
        <div className={styles.films}>
          <h3>{productName(product)} im Film.</h3>
          {resources.videos.map((video, index) => (
            <ProductVideoPlayer
              key={video.url}
              video={video}
              name={productName(product)}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export async function ProductDownloads({ product }: { product: Product }) {
  const resources = await getProductResources(product);
  return (
    <>
      {(resources.downloads.length > 0 || resources.unavailable) && (
        <div className={styles.downloadsCompact}>
          <div>
            <p className={styles.label}>DOKUMENTATION</p>
            <h3>Datenblätter & Downloads</h3>
          </div>
          <div>
            {resources.downloads.map((download, index) => (
              <a
                className={styles.download}
                key={download.url}
                href={download.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.documentIcon} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  >
                    <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6" />
                  </svg>
                </span>
                <span>
                  <small>DOKUMENT {String(index + 1).padStart(2, "0")}</small>
                  {download.title}
                </span>
                <span className={styles.open}>Öffnen</span>
              </a>
            ))}
            {resources.unavailable && (
              <p role="status">
                Die Produktdokumente sind derzeit nicht erreichbar. Bitte
                versuchen Sie es später erneut.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
