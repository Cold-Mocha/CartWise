"use client";

import * as React from "react";
import { categoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";

/*
  Imagen de producto. Las fotos reales viven en /public/images/products/{ean}.jpg
  (descargadas por el Scrapper). Si no hay EAN o falla la carga, se muestra un
  ícono referencial según la categoría del producto para no dejar el espacio
  vacío.
*/
export function ProductImage({
  ean,
  alt,
  category,
  className,
}: {
  ean?: string | null;
  alt: string;
  category?: string | null;
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
        {React.createElement(categoryIcon(category), { className: "size-1/3" })}
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
