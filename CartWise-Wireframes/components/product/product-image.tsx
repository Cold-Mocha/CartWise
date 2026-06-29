"use client";

import * as React from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Imagen de producto. Las fotos reales viven en /public/images/products/{ean}.jpg
  (descargadas por el Scrapper). Si no hay EAN o falla la carga, se usa un
  placeholder limpio (plan §13.4).
*/
export function ProductImage({
  ean,
  alt,
  className,
}: {
  ean?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!ean || failed) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-md bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <Package className="size-1/3" />
      </span>
    );
  }

  return (
    <img
      src={`/images/products/${ean}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("rounded-md bg-white object-contain", className)}
    />
  );
}
