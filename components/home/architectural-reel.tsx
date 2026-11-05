"use client";

import type { ReactNode } from "react";

// Keyboard navigation switches permanently to the editorial document layout.
// No scroll listeners, state updates or frame loop are needed for the reel.
export function ArchitecturalReel({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      className={className}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) {
          event.currentTarget.dataset.static = "true";
        }
      }}
    >
      {children}
    </div>
  );
}
