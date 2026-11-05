"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./about.module.css";

export function SectionStack({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  const stack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stack.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    // Pin taller sections only after their bottom edge reaches the viewport.
    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const section = target as HTMLElement;
        section.style.setProperty(
          "--scene-height",
          `${section.offsetHeight}px`,
        );
      }
    });
    container.querySelectorAll("[data-scroll-scene]").forEach((section) => {
      observer.observe(section, { box: "border-box" });
    });
    return () => observer.disconnect();
  }, [children]);

  return (
    <div id={id} className={styles.story} tabIndex={-1} ref={stack}>
      {children}
    </div>
  );
}
