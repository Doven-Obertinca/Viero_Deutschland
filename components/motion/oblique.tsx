import type { ReactNode } from "react";
export function ObliqueSection({ children }: { children: ReactNode }) {
  return <section className="oblique-section">{children}</section>;
}
export function ObliqueImageMask({ children }: { children: ReactNode }) {
  return <div className="oblique-mask">{children}</div>;
}
export function Reveal({ children }: { children: ReactNode }) {
  return <div className="reveal">{children}</div>;
}
