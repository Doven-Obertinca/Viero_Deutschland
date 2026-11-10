import Image from "next/image";
import hero from "../home/signature-hero.module.css";
import styles from "./arrival-intro.module.css";

export function ArrivalIntro() {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <video
        className={styles.video}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/brand/intro/arrival-poster.webp"
        src="/brand/intro/arrival-loader.mp4"
      />
      <div className={`${styles.outro} ${hero.geometry}`}>
        <div className={`${hero.stage} ${styles.outroStage}`}>
          <div className={`${hero.circle} ${styles.outroFrame}`}>
            <div className={styles.outroMark}>
              <Image
                src="/brand/viero-logo.svg"
                width={312}
                height={120}
                alt=""
                loading="eager"
                unoptimized
              />
              <div className={styles.byline}>
                Decoratives <span>by DRADOG</span>
              </div>
            </div>
          </div>
          <div className={`${hero.materialI} ${styles.outroSlash}`}>
            <span className={hero.materialDot} />
            <span className={hero.materialStem} />
          </div>
        </div>
      </div>
    </div>
  );
}
