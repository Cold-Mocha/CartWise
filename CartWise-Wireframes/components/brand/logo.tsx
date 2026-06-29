import { cn } from "@/lib/utils";

/*
  Logotipo Cartwise: hoja + carro en un disco verde. Marca de supermercado/ahorro
  doméstico, no genérica. Escala con `size`.
*/
export function Logo({ size = 34, withWordmark = true, className }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2l2.4 11.4a1.5 1.5 0 0 0 1.5 1.2h7.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6" />
          <circle cx="9.5" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
          <path d="M13 8c0-2 1.5-3.5 3.5-3.5C16.5 7 15 8 13 8Z" fill="currentColor" stroke="none" />
        </svg>
      </span>
      {withWordmark && (
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          Cart<span className="text-primary">wise</span>
        </span>
      )}
    </span>
  );
}
