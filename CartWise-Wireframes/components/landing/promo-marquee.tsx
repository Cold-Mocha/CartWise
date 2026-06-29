import { COVERED_STORES, SNAPSHOT_FECHA } from "@/lib/constants";

const MESSAGES = [
  "Compara antes de comprar",
  `Snapshot ${SNAPSHOT_FECHA}`,
  ...COVERED_STORES,
  "Arma tu compra pendiente",
  "Encuentra dónde conviene",
  "Diferencias destacadas cada día",
];

// Franja superior en movimiento (marquesina). Pura presentación; respeta
// prefers-reduced-motion vía CSS (.cw-marquee).
export function PromoMarquee() {
  const loop = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden border-b border-primary/20 bg-primary text-primary-foreground">
      <div className="cw-marquee py-1.5">
        {loop.map((m, i) => (
          <span key={i} className="mx-5 text-xs font-bold uppercase tracking-widest">
            {m} <span className="opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
