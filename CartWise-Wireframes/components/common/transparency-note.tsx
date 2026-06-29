import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRANSPARENCIA } from "@/lib/constants";

// Aviso de transparencia (plan §15): precios referenciales según snapshot.
export function TransparencyNote({ className }: { className?: string }) {
  return (
    <p className={cn("inline-flex items-start gap-2 text-xs text-muted-foreground", className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{TRANSPARENCIA}</span>
    </p>
  );
}
