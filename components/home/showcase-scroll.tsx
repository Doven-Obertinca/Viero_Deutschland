"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./product-showcase.module.css";
import { getShowcaseMotion } from "@/lib/home/showcase-motion";

export function ShowcaseScroll({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !root.current ||
      count < 2 ||
      !("IntersectionObserver" in window) ||
      !("ResizeObserver" in window)
    )
      return;
    const node = root.current;
    const stage = node.querySelector<HTMLElement>("[data-showcase-stage]")!;
    const capability = window.matchMedia(
      "(min-width: 900px) and (min-height: 650px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    const products = [
      ...node.querySelectorAll<HTMLElement>("[data-showcase-product]"),
    ];
    let start = 0;
    let travel = 1;
    let enabled = false;
    let inView = false;
    let renderedProgress = 0;
    let lastTime = 0;
    let initialized = false;
    function paint(now = performance.now()) {
      frame = 0;
      if (!enabled) return;
      const progress = Math.max(
        -0.55,
        Math.min(1, (window.scrollY - start) / travel),
      );
      if (!initialized) {
        renderedProgress = progress;
        initialized = true;
      }
      // Frame-rate-independent easing follows native scrolling, never drives it.
      const elapsed = lastTime ? Math.min(64, now - lastTime) : 16.67;
      const follow = 1 - Math.exp(-elapsed / 120);
      renderedProgress += (progress - renderedProgress) * follow;
      const unsettled = Math.abs(progress - renderedProgress) > 0.00008;
      if (!unsettled) renderedProgress = progress;
      lastTime = unsettled ? now : 0;
      const motion = getShowcaseMotion(renderedProgress);
      node.style.setProperty("--center-scale", String(motion.centerScale));
      node.style.setProperty("--portrait", String(motion.portrait));
      products.forEach((product, index) => {
        const side = motion.sides[index - 1];
        const opacity =
          index === 0 ? motion.centerOpacity : (side?.opacity ?? 1);
        product.style.setProperty("--card-opacity", String(opacity));
        product.style.setProperty("--card-shift", `${side?.shift ?? 0}px`);
        product.dataset.revealed = String(opacity > 0.01);
        product.dataset.featured = String(index === 0);
      });
      if (unsettled && inView) frame = requestAnimationFrame(paint);
    }
    function schedule() {
      if (enabled && inView && !frame) frame = requestAnimationFrame(paint);
    }
    function measure() {
      if (!enabled) return;
      start = node.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, node.offsetHeight - stage.offsetHeight);
      cancelAnimationFrame(frame);
      frame = 0;
      initialized = false;
      lastTime = 0;
      paint();
    }
    function configure() {
      enabled = capability.matches && node.dataset.keyboard !== "true";
      node.dataset.enhanced = String(enabled);
      if (!enabled) {
        cancelAnimationFrame(frame);
        frame = 0;
        node.style.setProperty("--center-scale", "1");
        node.style.setProperty("--portrait", "1");
        products.forEach((product, index) => {
          product.dataset.featured = String(index === 0);
          product.style.setProperty("--card-opacity", "1");
          product.style.setProperty("--card-shift", "0px");
          product.dataset.revealed = "true";
        });
      }
      measure();
    }
    function keyboardNavigation(event: FocusEvent) {
      if (
        !(event.target instanceof HTMLAnchorElement) ||
        !event.target.matches(":focus-visible") ||
        !enabled
      )
        return;
      // Reveal the complete composition immediately so native Tab reaches every image.
      node.dataset.keyboard = "true";
      configure();
      event.target.scrollIntoView({ block: "center", behavior: "instant" });
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) measure();
      },
      { rootMargin: "100% 0px" },
    );
    const resize = new ResizeObserver(measure);
    const images = [...node.querySelectorAll("img")];
    function onImageError(event: Event) {
      (event.currentTarget as HTMLImageElement).parentElement!.dataset.failed =
        "true";
    }
    images.forEach((img) => {
      img.addEventListener("error", onImageError);
      if (img.complete && !img.naturalWidth)
        img.parentElement!.dataset.failed = "true";
    });
    configure();
    observer.observe(node);
    resize.observe(node);
    resize.observe(stage);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    capability.addEventListener("change", configure);
    node.addEventListener("focusin", keyboardNavigation);
    return () => {
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      capability.removeEventListener("change", configure);
      node.removeEventListener("focusin", keyboardNavigation);
      images.forEach((img) => img.removeEventListener("error", onImageError));
      delete node.dataset.enhanced;
      delete node.dataset.keyboard;
    };
  }, [count]);
  return (
    <div ref={root} className={styles.sequence}>
      <div className={styles.stage} data-showcase-stage>
        {children}
      </div>
    </div>
  );
}
