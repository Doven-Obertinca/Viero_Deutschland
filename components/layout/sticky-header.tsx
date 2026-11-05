"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function StickyHeader({ children }: { children: ReactNode }) {
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = header.current;
    if (!element) return;

    const update = () => {
      element.toggleAttribute("data-scrolled", window.scrollY > 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="header" ref={header}>
      {children}
    </header>
  );
}
