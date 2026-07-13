"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CircleCheck,
  CircleX,
  ClipboardList,
  History,
  MapPin,
  PackageCheck,
  ReceiptText,
  Repeat,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { usePurchaseHistory } from "@/components/state/purchase-history-provider";
import { useGeneratedPurchases } from "@/components/state/generated-purchases-provider";
import { usePlanWorkflows } from "@/hooks/use-plan-workflows";
import { ConfirmPurchaseDialog } from "@/components/history/confirm-purchase-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { ProductImage } from "@/components/product/product-image";
import { StoreLogo } from "@/components/brand/store-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GENERATED_PURCHASE_STATUS_LABELS } from "@/lib/constants";
import { money, shortDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ConfirmedPurchase,
  GeneratedPurchase,
  GeneratedPurchaseStatus,
  SavedPlan,
} from "@/types/cartwise";

function nextGeneratedStatus(status: GeneratedPurchaseStatus): GeneratedPurchaseStatus | null {
  if (status === "generated") return "preparing";
  if (status === "preparing") return "ready_external";
  return null;
}

function generatedProductCount(purchase: GeneratedPurchase) {
  return purchase.stores.reduce(
    (sum, store) => sum + store.products.reduce((storeSum, item) => storeSum + item.quantity, 0),
    0,
  );
}

/*
  Compras separa dos semánticas:
  - Planificadas: planes creados desde /comparar y luego confirmados a historial.
  - Generadas: checkout con pago, despacho y boletas por supermercado.
*/
export default function ComprasPage() {
  const { hydrated, history, confirmed, highlightedPlanId, deletePlan, deletePurchase } =
    usePurchaseHistory();
  const {
    hydrated: generatedHydrated,
    purchases: generatedPurchases,
    deleteGeneratedPurchase,
    updateGeneratedPurchaseStatus,
  } = useGeneratedPurchases();
  const { confirmPurchase, repeatPlan } = usePlanWorkflows();

  const [confirming, setConfirming] = useState<SavedPlan | null>(null);
  const [selected, setSelected] = useState<ConfirmedPurchase | null>(null);
  const [selectedGenerated, setSelectedGenerated] = useState<GeneratedPurchase | null>(null);

  if (!hydrated || !generatedHydrated) return null;

  const pendientes = history.filter((p) => p.status !== "purchased");
  const purchases = [...confirmed].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const generated = [...generatedPurchases].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hasPlannedPurchases = pendientes.length > 0 || purchases.length > 0;

  const planFor = (purchase: ConfirmedPurchase) =>
    history.find((p) => p.id === purchase.planId) ?? null;

  const selectedPlan = selected ? planFor(selected) : null;

  const detailEntries =
    selected == null
      ? []
      : selectedPlan?.recommendedLines?.length
        ? selectedPlan.recommendedLines.map((r) => {
            const line = selectedPlan.lines?.find((l) => l.id === r.itemId && l.kind === r.kind);
            const name = r.matchedProductName || r.name;
            return {
              key: `${r.kind}-${r.itemId}`,
              name,
              quantity: r.quantity,
              store: r.storeLabel ?? selectedPlan.store,
              ean: r.ean ?? line?.ean,
              category: line?.categoria ?? null,
              price: r.price != null ? r.price * r.quantity : null,
              found: selected.items.some((it) => it.productName === name),
            };
          })
        : selected.items.map((it, i) => ({
            key: `${it.productName}-${i}`,
            name: it.productName,
            quantity: it.quantity,
            store: it.store ?? selected.store,
            ean: it.ean,
            category: it.category ?? null,
            price: it.paidPrice != null ? it.paidPrice * it.quantity : null,
            found: true,
          }));

  const detailGroups = detailEntries.reduce<{ store: string; items: typeof detailEntries }[]>(
    (groups, entry) => {
      const group = groups.find((g) => g.store === entry.store);
      if (group) group.items.push(entry);
      else groups.push({ store: entry.store, items: [entry] });
      return groups;
    },
    [],
  );

  if (pendientes.length === 0 && purchases.length === 0 && generated.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Compras" />
        <EmptyState
          icon={ShoppingBag}
          title="Aún no tienes compras"
          description="Arma tu carrito y genera un plan o una compra para verla aquí."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Armar una compra
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        title="Compras"
        description="Compras realizadas y compras planificadas."
      />

      <section className="order-2 space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Compras planificadas</h3>
        </div>

        {!hasPlannedPurchases && (
          <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">
            Aún no has creado nada.
          </Card>
        )}

          {pendientes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                <h4 className="text-base font-extrabold text-foreground">
                  Pendientes por confirmar
                </h4>
                <span className="text-sm text-muted-foreground">({pendientes.length})</span>
              </div>

              <div className="space-y-3">
                {pendientes.map((plan) => (
                  <Card
                    key={plan.id}
                    className={
                      highlightedPlanId === plan.id ? "border-primary ring-2 ring-primary/30" : ""
                    }
                  >
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <div className="min-w-[160px] flex-1">
                        <p className="text-base font-extrabold text-foreground">{plan.store}</p>
                        <p className="text-xs text-muted-foreground">
                          {shortDate(plan.createdAt) || plan.date} · {plural(plan.items, "producto")}
                        </p>
                      </div>
                      <p className="cw-price text-lg font-extrabold text-foreground">
                        {money(plan.total)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" onClick={() => setConfirming(plan)}>
                          <BadgeCheck /> Confirmar compra
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deletePlan(plan.id)}
                          aria-label="Eliminar compra pendiente"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {purchases.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <History className="size-4 text-primary" />
                <h4 className="text-base font-extrabold text-foreground">Historial confirmado</h4>
                <span className="text-sm text-muted-foreground">({purchases.length})</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {purchases.map((purchase) => {
                  const planLines = planFor(purchase)?.lines ?? [];
                  const thumbs = purchase.items.map((item) => {
                    const line = planLines.find((l) => l.nombre === item.productName);
                    return {
                      key: item.productName,
                      ean: item.ean ?? line?.ean,
                      category: item.category ?? line?.categoria,
                    };
                  });
                  return (
                    <div key={purchase.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelected(purchase)}
                        className="h-full w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <Card className="h-full rounded-2xl p-4 transition-all hover:border-primary/40 hover:shadow-md">
                          <div className="flex items-center gap-3 pr-9">
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                              <ShoppingBag className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-extrabold text-foreground">
                                {shortDate(purchase.purchaseDate)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {plural(purchase.items.length, "producto")}
                              </p>
                            </div>
                          </div>

                          {thumbs.length > 0 && (
                            <div className="mt-3 flex items-center gap-1.5">
                              {thumbs.slice(0, 4).map((thumb) => (
                                <span
                                  key={thumb.key}
                                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"
                                >
                                  <ProductImage
                                    ean={thumb.ean}
                                    alt={thumb.key}
                                    category={thumb.category}
                                    className="size-8 object-contain"
                                  />
                                </span>
                              ))}
                              {thumbs.length > 4 && (
                                <span className="text-xs font-semibold text-muted-foreground">
                                  +{thumbs.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-3 flex items-end justify-between gap-2 border-t border-border/60 pt-3">
                            <span className="text-xs text-muted-foreground">Total compra</span>
                            <span className="cw-price text-xl font-extrabold text-primary">
                              {money(purchase.realTotal)}
                            </span>
                          </div>
                        </Card>
                      </button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 text-destructive"
                        onClick={() => deletePurchase(purchase.id)}
                        aria-label="Eliminar compra del historial"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </section>

      <section className="order-1 space-y-4">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Compras realizadas</h3>
          <span className="text-sm text-muted-foreground">({generated.length})</span>
        </div>

        <div className="space-y-3">
          {generated.length === 0 ? (
            <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">
              Aún no tienes compras realizadas.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {generated.map((purchase) => (
                <div key={purchase.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedGenerated(purchase)}
                    className="h-full w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Card className="h-full rounded-2xl p-4 transition-all hover:border-primary/40 hover:shadow-md">
                      <div className="flex items-start gap-3 pr-9">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <ReceiptText className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-extrabold text-foreground">
                              {shortDate(purchase.createdAt)}
                            </p>
                            <Badge variant="savings">
                              {GENERATED_PURCHASE_STATUS_LABELS[purchase.status]}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {plural(generatedProductCount(purchase), "producto")} ·{" "}
                            {purchase.stores.length}{" "}
                            {purchase.stores.length === 1 ? "supermercado" : "supermercados"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5">
                        {purchase.stores.slice(0, 4).map((store) => (
                          <StoreLogo
                            key={store.storeId}
                            name={store.storeLabel}
                            size={34}
                            className="rounded-full ring-1 ring-border"
                          />
                        ))}
                        {purchase.stores.length > 4 && (
                          <span className="text-xs font-semibold text-muted-foreground">
                            +{purchase.stores.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {purchase.buyer.firstNames} {purchase.buyer.lastNames}
                        </p>
                        <div className="mt-1 flex items-end justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Total final</span>
                          <span className="cw-price text-xl font-extrabold text-primary">
                            {money(purchase.total)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 text-destructive"
                    onClick={() => deleteGeneratedPurchase(purchase.id)}
                    aria-label="Eliminar compra generada"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfirmPurchaseDialog
        plan={confirming}
        onClose={() => setConfirming(null)}
        onConfirm={confirmPurchase}
      />

      <Dialog open={selected != null} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de la compra planificada</DialogTitle>
                <DialogDescription>
                  Comprada el {shortDate(selected.purchaseDate)}
                  {selectedPlan ? ` · plan creado el ${selectedPlan.date}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl bg-primary px-4 py-3 text-center text-primary-foreground">
                <p className="text-xs font-medium text-primary-foreground/80">Total compra</p>
                <p className="cw-price text-2xl font-bold tracking-tight">
                  {money(selected.realTotal)}
                </p>
                <p className="text-xs text-primary-foreground/80">
                  {plural(selected.items.length, "producto")}
                </p>
              </div>

              <div className="space-y-4">
                {detailGroups.map((group) => (
                  <div key={group.store}>
                    <div className="flex items-center gap-2.5 pb-2">
                      <StoreLogo
                        name={group.store}
                        size={30}
                        className="rounded-full ring-1 ring-border"
                      />
                      <span className="text-base font-bold text-foreground">{group.store}</span>
                    </div>
                    <ul className="space-y-2">
                      {group.items.map((item) => (
                        <li
                          key={item.key}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3",
                            item.found
                              ? "border-primary/40 bg-primary/5"
                              : "border-border opacity-70",
                          )}
                        >
                          {item.found ? (
                            <CircleCheck className="size-5 shrink-0 text-savings" />
                          ) : (
                            <CircleX className="size-5 shrink-0 text-destructive" />
                          )}
                          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                            <ProductImage
                              ean={item.ean}
                              alt={item.name}
                              category={item.category}
                              className="size-11 object-contain"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-[15px] leading-snug text-foreground",
                                !item.found && "line-through",
                              )}
                            >
                              {item.name}{" "}
                              <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                            </span>
                            {!item.found && (
                              <span className="mt-0.5 block text-xs font-semibold text-destructive">
                                No encontrado
                              </span>
                            )}
                          </span>
                          {item.price != null && (
                            <span
                              className={cn(
                                "cw-price shrink-0 text-base font-semibold",
                                item.found
                                  ? "text-foreground"
                                  : "text-muted-foreground line-through",
                              )}
                            >
                              {money(item.price)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  disabled={!selectedPlan?.lines?.length}
                  onClick={() => {
                    const plan = selectedPlan;
                    setSelected(null);
                    if (plan) repeatPlan(plan);
                  }}
                >
                  <Repeat /> Repetir
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={selectedGenerated != null} onOpenChange={(v) => !v && setSelectedGenerated(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          {selectedGenerated && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de compra</DialogTitle>
                <DialogDescription>
                  Creada el {shortDate(selectedGenerated.createdAt)} ·{" "}
                  {GENERATED_PURCHASE_STATUS_LABELS[selectedGenerated.status]}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl bg-primary px-4 py-3 text-center text-primary-foreground">
                <p className="text-xs font-medium text-primary-foreground/80">Total final</p>
                <p className="cw-price text-2xl font-bold tracking-tight">
                  {money(selectedGenerated.total)}
                </p>
                <p className="text-xs text-primary-foreground/80">
                  Productos {money(selectedGenerated.subtotalProducts)} · Envíos{" "}
                  {money(selectedGenerated.deliveryTotal)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 font-extrabold text-foreground">
                    <UserRound className="size-4 text-primary" /> Comprador
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      {selectedGenerated.buyer.firstNames} {selectedGenerated.buyer.lastNames}
                    </p>
                    <p>RUT {selectedGenerated.buyer.rut}</p>
                    <p>{selectedGenerated.buyer.phone}</p>
                    <p>{selectedGenerated.buyer.email}</p>
                    <p>
                      {selectedGenerated.buyer.dwellingType === "apartment"
                        ? `Apartamento ${selectedGenerated.buyer.apartmentNumber ?? ""}`.trim()
                        : "Casa"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 font-extrabold text-foreground">
                    <MapPin className="size-4 text-primary" /> Dirección de pedido
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedGenerated.location.address}</p>
                    <p>
                      {selectedGenerated.location.city || "Temuco"},{" "}
                      {selectedGenerated.location.country || "Chile"}
                    </p>
                    <p>{selectedGenerated.location.comunaSector}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-foreground">Supermercados seleccionados</h3>
                {selectedGenerated.stores.map((store) => (
                  <div key={store.storeId} className="rounded-xl border border-border">
                    <div className="flex items-center gap-3 border-b border-border p-4">
                      <StoreLogo name={store.storeLabel} size={38} className="rounded-full ring-1 ring-border" />
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-foreground">{store.storeLabel}</p>
                        <p className="text-sm text-muted-foreground">{store.branchName}</p>
                        <p className="text-xs text-muted-foreground">
                          {store.branchAddress} ·{" "}
                          {store.distanceKm.toLocaleString("es-CL", { maximumFractionDigits: 1 })} km
                        </p>
                      </div>
                    </div>
                    <ul className="divide-y divide-border/60">
                      {store.products.map((item) => (
                        <li key={item.productName} className="flex items-center gap-3 px-4 py-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                            <ProductImage
                              ean={item.ean}
                              alt={item.productName}
                              category={item.category}
                              className="size-9 object-contain"
                            />
                          </span>
                          <span className="min-w-0 flex-1 text-sm leading-tight text-foreground">
                            {item.productName}{" "}
                            <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                          </span>
                          <span className="cw-price text-sm font-semibold">{money(item.lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-1 border-t border-border bg-muted/45 p-4 text-sm">
                      <SummaryLine label="Subtotal" value={money(store.subtotal)} />
                      <SummaryLine label="Envío" value={money(store.deliveryPrice)} />
                      <SummaryLine label="Total supermercado" value={money(store.total)} strong />
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                {nextGeneratedStatus(selectedGenerated.status) && (
                  <Button
                    onClick={() => {
                      const next = nextGeneratedStatus(selectedGenerated.status);
                      if (!next) return;
                      updateGeneratedPurchaseStatus(selectedGenerated.id, next);
                      setSelectedGenerated({ ...selectedGenerated, status: next });
                    }}
                  >
                    Actualizar estado
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", strong && "pt-1 text-base font-extrabold")}>
      <span className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={cn("cw-price", strong ? "text-primary" : "font-semibold text-foreground")}>{value}</span>
    </div>
  );
}
