"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Toaster de Cartwise. Tematizado con los tokens verdes vía CSS vars de sonner.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
