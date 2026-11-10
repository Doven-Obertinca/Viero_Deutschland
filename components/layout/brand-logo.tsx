import Image from "next/image";
import styles from "./brand-logo.module.css";

/** Original joined Viero vector outlines from the supplied 2021 brand manual. */
export function BrandLogo() {
  return (
    <span className={styles.logo}>
      <Image
        src="/brand/viero-logo.svg"
        width={156}
        height={60}
        alt="Viero"
        loading="eager"
        unoptimized
      />
      <span className={styles.subtitle}>
        <span className={styles.country}>GERMANY</span>
        <span className={styles.credit}>by DRADOG</span>
      </span>
    </span>
  );
}
