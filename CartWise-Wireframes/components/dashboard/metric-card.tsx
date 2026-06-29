import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "savings" | "offer";
}) {
  const toneClass =
    tone === "savings"
      ? "text-savings"
      : tone === "offer"
        ? "text-offer-foreground"
        : "text-foreground";
  const iconBg =
    tone === "savings" ? "bg-savings/12 text-savings" : tone === "offer" ? "bg-offer/20 text-offer-foreground" : "bg-primary/10 text-primary";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", iconBg)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className={cn("cw-price mt-3 text-2xl font-extrabold", toneClass)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
