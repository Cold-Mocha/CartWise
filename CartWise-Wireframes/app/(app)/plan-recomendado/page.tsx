"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, Scale, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useComparison } from "@/components/state/comparison-provider";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StoreLogo } from "@/components/brand/store-logo";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { itemKey, lineFor, buildPlan } from "@/lib/comparison-plan";
import { money } from "@/lib/format";

/*
  Paso final del flujo: la compra ya quedó planificada al confirmar el plan en
  /comparar. Muestra el resumen (total combinado) y la distribución por tienda
  de lo que el usuario seleccionó, con un botón para compartir el plan. Cada
  producto indica en letra pequeña en qué otras tiendas está disponible, por
  si no se encuentra en el supermercado al que se planea ir. Sin botón de
  confirmar: aquí no queda nada pendiente.
*/

export default function PlanRecomendadoPage() {
  const { hydrated, comparison, selection } = useComparison();
  const plan = comparison ? buildPlan(comparison, selection) : null;

  // Evita el parpadeo del estado vacío mientras se lee lo persistido.
  if (!hydrated) return null;

  if (!comparison || !plan || plan.covered === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Resumen de selección" />
        <EmptyState
          icon={ClipboardList}
          title="Todavía no hay un plan"
          description="Selecciona dónde comprar cada producto y confirma tu plan para verlo aquí."
          action={
            <Button asChild>
              <Link href="/comparar">
                <Scale /> Ir a la selección
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const totalItems = comparison.items.length;

  // Texto plano del plan para compartirlo (Web Share API o portapapeles).
  const planText = () => {
    const out: string[] = [
      `Plan de compra Cartwise — ${money(plan.total)} (${plan.covered}/${totalItems} productos · ${plan.groups.length} ${plan.groups.length === 1 ? "tienda" : "tiendas"})`,
    ];
    for (const { store, lines, subtotal } of plan.groups) {
      out.push("", `${store.store.label} — ${money(subtotal)}:`);
      for (const { item, lineTotal } of lines) {
        out.push(`• ${item.nombre} ×${item.quantity} — ${money(lineTotal)}`);
      }
    }
    return out.join("\n");
  };

  // Copia con textarea + execCommand cuando el portapapeles asíncrono está
  // bloqueado (contextos sin permiso de clipboard).
  const copyFallback = (text: string) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  };

  const sharePlan = async () => {
    const text = planText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Plan de compra Cartwise", text });
        return;
      } catch {
        // Compartir cancelado por el usuario: no hacemos nada.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Plan copiado al portapapeles");
    } catch {
      if (copyFallback(text)) toast.success("Plan copiado al portapapeles");
      else toast.error("No se pudo copiar el plan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con flecha de volver a la izquierda del título */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link href="/comparar" aria-label="Volver a la selección" title="Volver a la selección">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Resumen de selección
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Tu plan quedó creado. Este es el resumen y la distribución por tienda de lo que
              seleccionaste.
            </p>
          </div>
        </div>
        <Button onClick={sharePlan}>
          <Share2 /> Compartir plan
        </Button>
      </div>

      {/* Resumen: total combinado */}
      <div className="rounded-2xl bg-primary px-5 py-4 text-center text-primary-foreground shadow-sm">
        <p className="text-xs font-medium text-primary-foreground/80">Total combinado</p>
        <p className="cw-price mt-0.5 text-3xl font-bold tracking-tight">{money(plan.total)}</p>
        <p className="mt-1 text-xs text-primary-foreground/80">
          {plan.covered}/{totalItems} productos · {plan.groups.length}{" "}
          {plan.groups.length === 1 ? "tienda" : "tiendas"}
        </p>
      </div>

      {/* Distribución por tienda */}
      <div className="grid gap-4 sm:grid-cols-2">
        {plan.groups.map(({ store, lines, subtotal }) => (
          <Card key={store.store.id} className="overflow-hidden rounded-2xl">
            <div className="flex items-center gap-3 border-b border-border/60 p-4">
              <StoreLogo
                name={store.store.label}
                size={36}
                className="rounded-full ring-1 ring-border"
              />
              <div className="flex-1">
                <p className="font-semibold leading-tight text-foreground">{store.store.label}</p>
                <p className="text-xs text-muted-foreground">
                  {lines.length} {lines.length === 1 ? "producto" : "productos"}
                </p>
              </div>
              <p className="cw-price text-lg font-bold text-primary">{money(subtotal)}</p>
            </div>
            <ul className="divide-y divide-border/60">
              {lines.map(({ item, lineTotal }) => {
                // Otras tiendas donde está el producto, por si no se encuentra
                // en la tienda planificada al ir en persona.
                const alternatives = plan.stores.filter(
                  (s) => s.store.id !== store.store.id && lineFor(s, item)?.price != null,
                );
                return (
                  <li key={itemKey(item)} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                      <ProductImage
                        ean={item.ean}
                        alt={item.nombre}
                        category={item.categoria}
                        className="size-7 object-contain"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-tight text-foreground">
                        {item.nombre}{" "}
                        <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                        {alternatives.length > 0
                          ? `También en ${alternatives
                              .map((s) => `${s.store.label} (${money(lineFor(s, item)?.lineTotal)})`)
                              .join(" · ")}`
                          : "Solo disponible en esta tienda"}
                      </span>
                    </span>
                    <span className="cw-price shrink-0 text-sm font-medium text-foreground">
                      {money(lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
