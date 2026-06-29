"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/*
  Logo/ícono de supermercado. Usa assets locales en /public/brands/ (plan §9.1):
  no hotlinks externos. Si el logo no existe o falla la carga, cae a un
  placeholder con iniciales y color de marca, dejando el código listo para
  reemplazar por logos reales. Acepta tanto el nombre legible ("Santa Isabel")
  como la clave del bridge ("santa_isabel").
*/

type StoreStyle = { initials: string; file?: string; className: string };

const STORE_STYLE: Record<string, StoreStyle> = {
  jumbo: { initials: "J", file: "/brands/jumbo.png", className: "bg-green-600 text-white" },
  "santa isabel": { initials: "SI", file: "/brands/santa-isabel.png", className: "bg-red-600 text-white" },
  unimarc: { initials: "U", file: "/brands/unimarc.png", className: "bg-amber-500 text-white" },
  "el trebol": { initials: "ET", file: "/brands/el-trebol.jpeg", className: "bg-emerald-700 text-white" },
  tottus: { initials: "T", className: "bg-muted text-muted-foreground" },
  lider: { initials: "L", className: "bg-muted text-muted-foreground" },
};

function normalize(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();
}

export function StoreLogo({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const style = STORE_STYLE[normalize(name)] ?? {
    initials: name.slice(0, 2).toUpperCase(),
    className: "bg-muted text-muted-foreground",
  };
  const [failed, setFailed] = React.useState(false);
  const showImage = style.file && !failed;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
        showImage ? "border border-border bg-white" : style.className,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
      title={name}
    >
      {showImage ? (
        <img
          src={style.file}
          alt=""
          className="h-full w-full object-contain p-1"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xs font-extrabold" style={{ fontSize: size * 0.34 }}>
          {style.initials}
        </span>
      )}
    </span>
  );
}
