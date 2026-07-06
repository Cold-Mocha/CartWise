"use client";

import Link from "next/link";
import { Scale, Search, Trash2, CircleCheck } from "lucide-react";
import { useComparison } from "@/components/state/comparison-provider";
import { usePlanWorkflows } from "@/hooks/use-plan-workflows";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StoreLogo } from "@/components/brand/store-logo";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { itemKey, lineFor, buildPlan } from "@/lib/comparison-plan";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
  Selección de dónde comprar: matriz de precios con supermercados en columnas
  y productos en filas. Cada celda con precio es seleccionable (parte en la
  opción más barata, rotulada "Menor precio"); tocarla de nuevo la quita.
  Debajo, el plan resultante: banner con el total combinado y tarjetas por
  tienda. "Confirmar plan" guarda la compra planificada y lleva al resumen
  final. La selección vive en ComparisonProvider (lib/comparison-plan).
*/

export default function CompararPage() {
  const { hydrated, comparison, selection, setSelection } = useComparison();
  const { confirmPlan } = usePlanWorkflows();

  // Evita el parpadeo del estado vacío mientras se lee lo persistido.
  if (!hydrated) return null;

  if (!comparison || comparison.items.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Selecciona dónde quieres comprar" />
        <EmptyState
          icon={Scale}
          title="Aún no hay una comparación"
          description="Arma tu carrito y compáralo para ver qué supermercado conviene."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Buscar productos
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const totalItems = comparison.items.length;
  const plan = buildPlan(comparison, selection);
  const { stores, lines: matrixLines, groups, total: matrixTotal, covered: matrixCovered } = plan;

  // Deselecciona todos los productos (ninguno queda asignado a una tienda).
  const clearSelection = () =>
    setSelection(Object.fromEntries(comparison.items.map((item) => [itemKey(item), null])));

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Selecciona dónde quieres comprar"
        description="Toca un precio para elegir dónde comprar cada producto. Tócalo de nuevo para quitarlo."
        action={
          <Button
            variant="destructive"
            size="sm"
            onClick={clearSelection}
            disabled={matrixCovered === 0}
          >
            <Trash2 /> Eliminar selección
          </Button>
        }
      />

      {/* Matriz de precios: el usuario elige dónde comprar cada producto */}
      <Card className="overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[38%] p-4 pl-5 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Productos
                  </span>
                </th>
                {stores.map((s) => (
                  <th key={s.store.id} className="p-4 align-bottom">
                    <span className="flex flex-col items-center gap-1.5">
                      <StoreLogo
                        name={s.store.label}
                        size={40}
                        className="rounded-full shadow-sm ring-1 ring-border"
                      />
                      <span className="text-center text-xs font-semibold leading-tight text-foreground">
                        {s.store.label}
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixLines.map(({ item, assigned }) => {
                const cells = stores.map((s) => lineFor(s, item));
                const best = Math.min(
                  ...cells.map((c) => (c?.price != null ? c.price : Infinity)),
                );
                return (
                  <tr key={itemKey(item)} className="border-b border-border/60 last:border-0">
                    {/* Producto */}
                    <td className="p-3 pl-5">
                      <span className="flex items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                          <ProductImage
                            ean={item.ean}
                            alt={item.nombre}
                            category={item.categoria}
                            className="size-10 object-contain"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-snug text-foreground">
                            {item.nombre}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            ×{item.quantity}
                          </span>
                        </span>
                      </span>
                    </td>

                    {/* Celdas de precio */}
                    {cells.map((c, i) => {
                      const s = stores[i];
                      if (c?.price == null) {
                        return (
                          <td key={s.store.id} className="p-2 text-center align-middle">
                            <span className="mx-auto block max-w-[120px] select-none rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground/50">
                              No disponible
                            </span>
                          </td>
                        );
                      }
                      const isAssigned = assigned?.store.id === s.store.id;
                      return (
                        <td key={s.store.id} className="p-2 text-center align-middle">
                          <button
                            type="button"
                            aria-pressed={isAssigned}
                            title={
                              isAssigned ? "Quitar de la selección" : `Comprar en ${s.store.label}`
                            }
                            onClick={() =>
                              setSelection((prev) => ({
                                ...prev,
                                [itemKey(item)]: isAssigned ? null : s.store.id,
                              }))
                            }
                            className={cn(
                              "mx-auto flex w-full max-w-[130px] flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 transition-all",
                              "focus:outline-none focus:ring-2 focus:ring-primary/50",
                              isAssigned
                                ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                                : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                            )}
                          >
                            {c.price === best && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Menor precio
                              </span>
                            )}
                            <span
                              className={cn(
                                "cw-price font-semibold",
                                c.price === best
                                  ? "text-savings"
                                  : isAssigned
                                    ? "text-primary"
                                    : "text-foreground",
                              )}
                            >
                              {money(c.lineTotal)}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumen del plan según la selección */}
      <section className="space-y-4 pt-4">
        {/* Banner de total combinado */}
        <div className="rounded-2xl bg-primary px-5 py-3.5 text-center text-primary-foreground shadow-sm">
          <p className="text-xs font-medium text-primary-foreground/80">Total combinado</p>
          <p className="cw-price text-2xl font-bold tracking-tight">{money(matrixTotal)}</p>
          <p className="text-xs text-primary-foreground/80">
            {matrixCovered}/{totalItems} productos · {groups.length}{" "}
            {groups.length === 1 ? "tienda" : "tiendas"}
          </p>
        </div>

        {/* Tarjetas por tienda con sus productos */}
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map(({ store, lines, subtotal }) => (
            <Card key={store.store.id} className="overflow-hidden rounded-2xl">
              <div className="flex items-center gap-3 border-b border-border/60 p-4">
                <StoreLogo
                  name={store.store.label}
                  size={36}
                  className="rounded-full ring-1 ring-border"
                />
                <div className="flex-1">
                  <p className="font-semibold leading-tight text-foreground">
                    {store.store.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lines.length} {lines.length === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <p className="cw-price text-lg font-bold text-primary">{money(subtotal)}</p>
              </div>
              <ul className="divide-y divide-border/60">
                {lines.map(({ item, lineTotal }) => (
                  <li key={itemKey(item)} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                      <ProductImage
                        ean={item.ean}
                        alt={item.nombre}
                        category={item.categoria}
                        className="size-7 object-contain"
                      />
                    </span>
                    <span className="flex-1 text-sm leading-tight text-foreground">
                      {item.nombre}
                    </span>
                    <span className="cw-price shrink-0 text-sm font-medium text-foreground">
                      {money(lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* CTA: crea la compra planificada y lleva al resumen final */}
        <div className="flex justify-center pt-2">
          <Button size="lg" onClick={confirmPlan} disabled={matrixCovered === 0}>
            Confirmar plan <CircleCheck />
          </Button>
        </div>
      </section>
    </div>
  );
}
