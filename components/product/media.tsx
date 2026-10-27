"use client";
import Image from "next/image";
import { useState } from "react";
export function ImageWithFallback({
  src,
  alt,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const allowed = (() => {
    try {
      return src && new URL(src).protocol === "https:";
    } catch {
      return false;
    }
  })();
  return (
    <div className="product-image">
      {allowed && !failed ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="media-placeholder">Abbildung nicht verfügbar</span>
      )}
    </div>
  );
}
export const ProductMedia = ImageWithFallback;
export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt?: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <ProductMedia
        key={images[active]?.url ?? "empty"}
        src={images[active]?.url}
        alt={images[active]?.alt || name}
        priority
      />
      {images.length > 1 && (
        <div className="gallery-controls">
          {images.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              aria-label={`Bild ${index + 1} anzeigen`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
