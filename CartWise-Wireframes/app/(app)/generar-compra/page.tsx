"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LocateFixed,
  MapPin,
  PackageCheck,
  ReceiptText,
  Search,
  Store,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductImage } from "@/components/product/product-image";
import { StoreLogo } from "@/components/brand/store-logo";
import { useComparison } from "@/components/state/comparison-provider";
import { useGeneratedPurchases } from "@/components/state/generated-purchases-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SNAPSHOT_FECHA } from "@/lib/constants";
import { buildPlan, itemKey, lineFor } from "@/lib/comparison-plan";
import { buildDeliveryQuote, TEMUCO_DEFAULT_LOCATION } from "@/lib/delivery";
import { money } from "@/lib/format";
import { uid } from "@/lib/id";
import { cn } from "@/lib/utils";
import type {
  BuyerIdentity,
  CheckoutLocation,
  GeneratedPaymentMethod,
  GeneratedPurchase,
} from "@/types/cartwise";

const LocationMap = dynamic(
  () => import("@/components/checkout/location-map").then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[360px] place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
        Cargando mapa...
      </div>
    ),
  },
);

const STEPS = ["Ubicación", "Identificación", "Comparación", "Supermercados", "Pago"];

const PAYMENT_METHOD_LABELS: Record<GeneratedPaymentMethod, string> = {
  debit: "Débito",
  credit: "Tarjeta crédito o débito",
  transfer: "Transferencia",
  visa: "Visa",
  mastercard: "Mastercard",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
  demo_card: "Tarjeta",
};

const COMUNA_SECTOR_OPTIONS = [
  "Temuco centro",
  "Avenida Alemania",
  "Pueblo Nuevo",
  "Amanecer",
  "Labranza",
  "Pedro de Valdivia",
  "Fundo El Carmen",
  "Santa Rosa",
  "Padre Las Casas",
  "Cajón",
  "Otro sector de Temuco",
] as const;

const emptyBuyer: BuyerIdentity = {
  firstNames: "",
  lastNames: "",
  rut: "",
  phone: "",
  email: "",
  address: "",
  comunaSector: "",
  dwellingType: "house",
  apartmentNumber: "",
  reference: "",
};

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeRut(value: string) {
  return value.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
}

function validateRut(value: string) {
  const clean = normalizeRut(value);
  if (!/^\d{7,8}[\dK]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedNumber = 11 - (sum % 11);
  const expected = expectedNumber === 11 ? "0" : expectedNumber === 10 ? "K" : String(expectedNumber);
  return verifier === expected;
}

function validatePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return digits.startsWith("9");
  if (digits.length === 11) return digits.startsWith("569");
  return false;
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buyerErrors(identity: BuyerIdentity) {
  const errors: Partial<Record<keyof BuyerIdentity, string>> = {};
  if (!identity.firstNames.trim()) errors.firstNames = "Ingresa nombres.";
  if (!identity.lastNames.trim()) errors.lastNames = "Ingresa apellidos.";
  if (!identity.rut.trim()) errors.rut = "Ingresa RUT.";
  else if (!validateRut(identity.rut)) errors.rut = "RUT inválido.";
  if (!identity.phone.trim()) errors.phone = "Ingresa celular.";
  else if (!validatePhone(identity.phone)) errors.phone = "Celular chileno inválido.";
  if (!identity.email.trim()) errors.email = "Ingresa email.";
  else if (!validateEmail(identity.email)) errors.email = "Email inválido.";
  if (!identity.address.trim()) errors.address = "Ingresa dirección.";
  if (!identity.comunaSector.trim()) errors.comunaSector = "Ingresa comuna o sector.";
  if (identity.dwellingType === "apartment" && !identity.apartmentNumber?.trim()) {
    errors.apartmentNumber = "Ingresa número de departamento.";
  }
  return errors;
}

function sectorFromReverse(area?: string, displayName?: string) {
  const source = normalizeText(`${area ?? ""} ${displayName ?? ""}`);
  if (source.includes("labranza")) return "Labranza";
  if (source.includes("padre las casas")) return "Padre Las Casas";
  if (source.includes("cajon")) return "Cajón";
  if (source.includes("amanecer")) return "Amanecer";
  if (source.includes("pueblo nuevo")) return "Pueblo Nuevo";
  if (source.includes("pedro de valdivia")) return "Pedro de Valdivia";
  if (source.includes("fundo el carmen")) return "Fundo El Carmen";
  if (source.includes("santa rosa")) return "Santa Rosa";
  if (source.includes("alemania")) return "Avenida Alemania";
  if (source.includes("temuco")) return "Temuco centro";
  return "Otro sector de Temuco";
}

function formatKm(value: number) {
  return `${value.toLocaleString("es-CL", { maximumFractionDigits: 1 })} km`;
}

function receiptNumber(index: number) {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `CW-${date}-${String(index + 1).padStart(2, "0")}-${suffix}`;
}

type NominatimReverseResult = {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
};

export default function GenerarCompraPage() {
  const router = useRouter();
  const { hydrated, comparison, selection, setSelection, clearComparison } = useComparison();
  const { addGeneratedPurchase } = useGeneratedPurchases();
  const [step, setStep] = React.useState(0);
  const [geoStatus, setGeoStatus] = React.useState<
    "idle" | "requesting" | "success" | "denied" | "unsupported"
  >("idle");
  const [locationSubmitted, setLocationSubmitted] = React.useState(false);
  const [identitySubmitted, setIdentitySubmitted] = React.useState(false);
  const [resolvingPinAddress, setResolvingPinAddress] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<GeneratedPaymentMethod>("credit");
  const [successPurchase, setSuccessPurchase] = React.useState<GeneratedPurchase | null>(null);
  const [location, setLocation] = React.useState<CheckoutLocation>(() => ({
    latitude: TEMUCO_DEFAULT_LOCATION.latitude,
    longitude: TEMUCO_DEFAULT_LOCATION.longitude,
    country: "Chile",
    city: "Temuco",
    address: TEMUCO_DEFAULT_LOCATION.address,
    comunaSector: TEMUCO_DEFAULT_LOCATION.comunaSector,
    reference: "",
    source: "manual",
    updatedAt: new Date().toISOString(),
  }));
  const [identity, setIdentity] = React.useState<BuyerIdentity>(() => ({
    ...emptyBuyer,
    address: TEMUCO_DEFAULT_LOCATION.address,
    comunaSector: TEMUCO_DEFAULT_LOCATION.comunaSector,
  }));
  const reverseRequestId = React.useRef(0);

  const updateLocation = React.useCallback((patch: Partial<CheckoutLocation>) => {
    setLocation((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateAddressFromPin = React.useCallback(
    async (latitude: number, longitude: number) => {
      const requestId = reverseRequestId.current + 1;
      reverseRequestId.current = requestId;
      setResolvingPinAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        );
        const data = (await response.json()) as NominatimReverseResult;
        if (reverseRequestId.current !== requestId) return;
        const address = data.address;
        const street = [address?.road ?? address?.pedestrian, address?.house_number]
          .filter(Boolean)
          .join(" ");
        const area =
          address?.neighbourhood ??
          address?.suburb ??
          address?.city_district ??
          address?.city ??
          address?.town ??
          address?.village ??
          address?.municipality ??
          "";
        updateLocation({
          address: street || data.display_name || "",
          country: address?.country || "Chile",
          city: address?.city ?? address?.town ?? address?.village ?? "Temuco",
          comunaSector: sectorFromReverse(area, data.display_name),
        });
      } catch {
        if (reverseRequestId.current === requestId) {
          toast("No se pudo resolver la dirección del pin. Puedes editarla manualmente.");
        }
      } finally {
        if (reverseRequestId.current === requestId) setResolvingPinAddress(false);
      }
    },
    [updateLocation],
  );

  const requestGeolocation = React.useCallback(
    (showToast: boolean) => {
      if (!navigator.geolocation) {
        setGeoStatus("unsupported");
        if (showToast) toast.error("Tu navegador no tiene geolocalización disponible.");
        return;
      }
      setGeoStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: "geolocation",
          });
          void updateAddressFromPin(position.coords.latitude, position.coords.longitude);
          setGeoStatus("success");
          if (showToast) toast.success("Ubicación detectada. Puedes ajustar el pin.");
        },
        () => {
          setGeoStatus("denied");
          if (showToast) toast.error("No se pudo usar tu ubicación. Mueve el pin manualmente.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    },
    [updateAddressFromPin, updateLocation],
  );

  React.useEffect(() => {
    requestGeolocation(false);
  }, [requestGeolocation]);

  const plan = React.useMemo(
    () => (comparison ? buildPlan(comparison, selection) : null),
    [comparison, selection],
  );

  const deliveryQuotes = React.useMemo(() => {
    if (!plan) return [];
    return plan.stores.map((store) =>
      buildDeliveryQuote(
        store.store,
        location,
        plan.groups.some((group) => group.store.store.id === store.store.id),
      ),
    );
  }, [location, plan]);

  const quoteByStoreId = React.useMemo(
    () => new Map(deliveryQuotes.map((quote) => [quote.storeId, quote])),
    [deliveryQuotes],
  );
  const deliveryTotal = deliveryQuotes
    .filter((quote) => quote.hasProducts)
    .reduce((sum, quote) => sum + quote.price, 0);
  const totalWithDelivery = (plan?.total ?? 0) + deliveryTotal;
  const selectedQuotes = deliveryQuotes
    .filter((quote) => quote.hasProducts)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const errors = buyerErrors(identity);
  const rutError = identitySubmitted || identity.rut.trim() ? errors.rut : undefined;
  const phoneError = identitySubmitted || identity.phone.trim() ? errors.phone : undefined;
  const emailError = identitySubmitted || identity.email.trim() ? errors.email : undefined;
  const apartmentError =
    identitySubmitted || identity.dwellingType === "apartment" ? errors.apartmentNumber : undefined;
  const locationInvalid =
    !location.address.trim() || !location.comunaSector.trim() || Number.isNaN(location.latitude);

  const setPin = (latitude: number, longitude: number) => {
    updateLocation({ latitude, longitude, source: "manual" });
    void updateAddressFromPin(latitude, longitude);
  };

  const applyLocationToBuyer = () => {
    setIdentity((current) => ({
      ...current,
      address: location.address,
      comunaSector: location.comunaSector,
      reference: "",
    }));
  };

  const goNext = () => {
    if (step === 0) {
      setLocationSubmitted(true);
      if (locationInvalid) {
        toast.error("Completa la dirección y comuna o sector.");
        return;
      }
      applyLocationToBuyer();
    }
    if (step === 1) {
      setIdentitySubmitted(true);
      if (Object.keys(errors).length > 0) {
        toast.error("Revisa los datos de identificación.");
        return;
      }
    }
    if (step === 2 && (!plan || plan.covered === 0)) {
      toast.error("Selecciona al menos un producto para generar la compra.");
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const createGeneratedPurchase = () => {
    if (!comparison || !plan || plan.covered === 0) return;
    const now = new Date().toISOString();
    const stores = plan.groups.map((group) => {
      const quote = quoteByStoreId.get(group.store.store.id);
      const products = group.lines.map(({ item, lineTotal }) => {
        const line = lineFor(group.store, item);
        return {
          productName: line?.matchedProductName || line?.name || item.nombre,
          quantity: item.quantity,
          unitPrice: line?.price ?? Math.round(lineTotal / item.quantity),
          lineTotal,
          ean: line?.ean ?? item.ean,
          category: item.categoria ?? null,
        };
      });
      const deliveryPrice = quote?.price ?? 0;
      return {
        storeId: group.store.store.id,
        storeLabel: group.store.store.label,
        branchName: quote?.branchName ?? group.store.store.label,
        branchAddress: quote?.branchAddress ?? "Sucursal Temuco",
        branchLatitude: quote?.branchLatitude ?? location.latitude,
        branchLongitude: quote?.branchLongitude ?? location.longitude,
        distanceKm: quote?.distanceKm ?? 0,
        products,
        subtotal: group.subtotal,
        deliveryPrice,
        total: group.subtotal + deliveryPrice,
      };
    });
    const receipts = stores.map((store, index) => ({
      id: uid(),
      receiptNumber: receiptNumber(index),
      issuedAt: now,
      storeLabel: store.storeLabel,
      branchName: store.branchName,
      paymentMethod,
      products: store.products,
      subtotal: store.subtotal,
      deliveryPrice: store.deliveryPrice,
      total: store.total,
    }));
    const purchase: GeneratedPurchase = {
      id: uid(),
      createdAt: now,
      snapshotDate: comparison.snapshot ?? SNAPSHOT_FECHA,
      status: "generated",
      buyer: identity,
      location,
      paymentMethod,
      stores,
      subtotalProducts: plan.total,
      deliveryTotal,
      total: totalWithDelivery,
      receipts,
    };
    addGeneratedPurchase(purchase);
    setSuccessPurchase(purchase);
  };

  const goToPurchases = () => {
    clearComparison();
    router.push("/compras");
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      createGeneratedPurchase();
      setPaying(false);
    }, 650);
  };

  if (!hydrated) return null;

  if (!comparison || !plan) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Generar compra" />
        <EmptyState
          icon={CreditCard}
          title="No hay una comparación para pagar"
          description="Agrega productos al carrito y usa Generar compra para completar el checkout."
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

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Generar compra"
        description="Completa tus datos, revisa el despacho por supermercado y finaliza el pago."
      />

      <Card className="rounded-2xl p-4">
        <CheckoutStepper steps={STEPS} currentStep={step} />
      </Card>

      {step === 0 && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden rounded-2xl p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-foreground">Ubicación de despacho</h3>
              </div>
              <Button variant="outline" onClick={() => requestGeolocation(true)} disabled={geoStatus === "requesting"}>
                <LocateFixed /> {geoStatus === "requesting" ? "Detectando..." : "Usar mi ubicación"}
              </Button>
            </div>
            <LocationMap latitude={location.latitude} longitude={location.longitude} onMove={setPin} />
          </Card>

          <Card className="rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <h3 className="text-lg font-extrabold text-foreground">Dirección</h3>
            </div>
            {geoStatus === "denied" && (
              <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                Permiso rechazado. Puedes ingresar la dirección y mover el pin manualmente.
              </p>
            )}
            <div className="mt-4 space-y-3">
              <Field label="País">
                <Input
                  value={location.country}
                  onChange={(event) => updateLocation({ country: event.target.value, source: "manual" })}
                  placeholder="Chile"
                />
              </Field>
              <Field label="Ciudad">
                <Input
                  value={location.city}
                  onChange={(event) => updateLocation({ city: event.target.value, source: "manual" })}
                  placeholder="Temuco"
                />
              </Field>
              <Field label="Dirección" error={locationSubmitted && !location.address.trim() ? "Requerida." : undefined}>
                <Input
                  value={location.address}
                  onChange={(event) => updateLocation({ address: event.target.value, source: "manual" })}
                  placeholder={resolvingPinAddress ? "Resolviendo dirección del pin..." : "Ej: Av. Alemania 0671"}
                />
              </Field>
              <Field
                label="Comuna o sector"
                error={locationSubmitted && !location.comunaSector.trim() ? "Requerido." : undefined}
              >
                <Select
                  value={location.comunaSector}
                  onValueChange={(value) => updateLocation({ comunaSector: value, source: "manual" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMUNA_SECTOR_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Card>
        </section>
      )}

      {step === 1 && (
        <Card className="rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" />
            <h3 className="text-xl font-extrabold text-foreground">Datos personales</h3>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nombres" error={identitySubmitted ? errors.firstNames : undefined}>
              <Input
                value={identity.firstNames}
                onChange={(event) => setIdentity({ ...identity, firstNames: event.target.value })}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Apellidos" error={identitySubmitted ? errors.lastNames : undefined}>
              <Input
                value={identity.lastNames}
                onChange={(event) => setIdentity({ ...identity, lastNames: event.target.value })}
                autoComplete="family-name"
              />
            </Field>
            <Field label="RUT" error={rutError}>
              <Input
                value={identity.rut}
                onChange={(event) => setIdentity({ ...identity, rut: event.target.value })}
                placeholder="12.345.678-5"
              />
            </Field>
            <Field label="Celular chileno" error={phoneError}>
              <Input
                value={identity.phone}
                onChange={(event) => setIdentity({ ...identity, phone: event.target.value })}
                placeholder="+56 9 1234 5678"
                autoComplete="tel"
              />
            </Field>
            <Field label="Email" error={emailError}>
              <Input
                value={identity.email}
                onChange={(event) => setIdentity({ ...identity, email: event.target.value })}
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="Tipo de vivienda">
              <Select
                value={identity.dwellingType}
                onValueChange={(value) =>
                  setIdentity({
                    ...identity,
                    dwellingType: value as BuyerIdentity["dwellingType"],
                    apartmentNumber: value === "house" ? "" : identity.apartmentNumber,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {identity.dwellingType === "apartment" && (
              <Field label="Número de departamento" error={apartmentError}>
                <Input
                  value={identity.apartmentNumber ?? ""}
                  onChange={(event) => setIdentity({ ...identity, apartmentNumber: event.target.value })}
                  placeholder="Ej: 1204"
                />
              </Field>
            )}
          </div>
        </Card>
      )}

      {step === 2 && (
        <section className="space-y-5">
          <Card className="overflow-hidden rounded-2xl">
            <div className="border-b border-border p-4">
              <h3 className="text-xl font-extrabold text-foreground">Comparación con envío</h3>
              <p className="text-sm text-muted-foreground">
                Toca un precio para cambiar el supermercado. El envío se cobra solo a cadenas con productos seleccionados.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-[34%] p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Productos
                    </th>
                    {plan.stores.map((store) => (
                      <th key={store.store.id} className="p-4 align-bottom">
                        <span className="flex flex-col items-center gap-1.5">
                          <StoreLogo name={store.store.label} size={38} className="rounded-full shadow-sm ring-1 ring-border" />
                          <span className="text-center text-xs font-semibold leading-tight text-foreground">
                            {store.store.label}
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plan.lines.map(({ item, assigned }) => {
                    const cells = plan.stores.map((store) => lineFor(store, item));
                    const best = Math.min(...cells.map((cell) => (cell?.price != null ? cell.price : Infinity)));
                    return (
                      <tr key={itemKey(item)} className="border-b border-border/60">
                        <td className="p-3">
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
                              <span className="block text-sm font-medium leading-snug text-foreground">{item.nombre}</span>
                              <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                            </span>
                          </span>
                        </td>
                        {cells.map((cell, index) => {
                          const store = plan.stores[index];
                          if (cell?.price == null) {
                            return (
                              <td key={store.store.id} className="p-2 text-center">
                                <span className="mx-auto block max-w-[120px] rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground/50">
                                  No disponible
                                </span>
                              </td>
                            );
                          }
                          const isAssigned = assigned?.store.id === store.store.id;
                          return (
                            <td key={store.store.id} className="p-2 text-center">
                              <button
                                type="button"
                                aria-pressed={isAssigned}
                                onClick={() =>
                                  setSelection((current) => ({
                                    ...current,
                                    [itemKey(item)]: isAssigned ? null : store.store.id,
                                  }))
                                }
                                className={cn(
                                  "mx-auto flex w-full max-w-[130px] flex-col items-center rounded-xl border px-2 py-2.5 transition-all",
                                  isAssigned
                                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                                )}
                              >
                                {cell.price === best && (
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Menor precio
                                  </span>
                                )}
                                <span
                                  className={cn(
                                    "cw-price font-semibold",
                                    cell.price === best ? "text-savings" : "text-foreground",
                                  )}
                                >
                                  {money(cell.lineTotal)}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="border-b border-border bg-muted/45">
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                        <Truck className="size-4 text-primary" /> Precio ENVIO
                      </span>
                    </td>
                    {plan.stores.map((store) => {
                      const quote = quoteByStoreId.get(store.store.id);
                      return (
                        <td key={store.store.id} className="p-3 text-center">
                          <span
                            className={cn(
                              "cw-price block font-extrabold",
                              quote?.hasProducts ? "text-savings" : "text-muted-foreground",
                            )}
                          >
                            {money(quote?.price ?? 0)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {quote ? `Distancia · ${formatKm(quote.distanceKm)}` : ""}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="rounded-2xl bg-primary px-5 py-4 text-center text-primary-foreground shadow-sm">
            <p className="text-xs font-medium text-primary-foreground/80">Total combinado con envío</p>
            <p className="cw-price text-3xl font-bold tracking-tight">{money(totalWithDelivery)}</p>
            <p className="text-xs text-primary-foreground/80">
              Productos {money(plan.total)} · Envíos {money(deliveryTotal)}
            </p>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <Card className="rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Store className="size-5 text-primary" />
              <h3 className="text-xl font-extrabold text-foreground">Supermercados y sucursales</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Seleccionamos la sucursal más cercana disponible para cada supermercado.
            </p>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            {selectedQuotes.map((quote) => {
              const group = plan.groups.find((item) => item.store.store.id === quote.storeId);
              if (!group) return null;
              return (
                <Card key={quote.storeId} className="overflow-hidden rounded-2xl">
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <StoreLogo name={quote.storeLabel} size={42} className="rounded-full ring-1 ring-border" />
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-foreground">{quote.storeLabel}</p>
                      <p className="text-sm text-muted-foreground">{quote.branchName}</p>
                      <p className="text-xs text-muted-foreground">{quote.branchAddress}</p>
                    </div>
                    <Badge variant="outline">{formatKm(quote.distanceKm)}</Badge>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {group.lines.map(({ item, lineTotal }) => (
                      <li key={itemKey(item)} className="flex items-center gap-3 px-4 py-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                          <ProductImage
                            ean={item.ean}
                            alt={item.nombre}
                            category={item.categoria}
                            className="size-9 object-contain"
                          />
                        </span>
                        <span className="min-w-0 flex-1 text-sm leading-tight text-foreground">
                          {item.nombre} <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="cw-price text-sm font-semibold">{money(lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1 border-t border-border bg-muted/45 p-4 text-sm">
                    <Line label="Subtotal" value={money(group.subtotal)} />
                    <Line label="Envío" value={money(quote.price)} />
                    <Line label="Total supermercado" value={money(group.subtotal + quote.price)} strong />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="grid gap-5">
          <Card className="order-2 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <WalletCards className="size-5 text-primary" />
              <h3 className="text-xl font-extrabold text-foreground">Método de pago</h3>
            </div>

            <div className="mt-5 space-y-4">
              <PaymentChoice
                checked={paymentMethod === "credit"}
                label="Pagos con tarjetas de crédito o débito"
                onClick={() => setPaymentMethod("credit")}
              >
                <CardBrandStrip />
              </PaymentChoice>

              <PaymentChoice
                checked={paymentMethod === "transfer"}
                label="Transferencia bancaria"
                onClick={() => setPaymentMethod("transfer")}
              />

              <div className="border-y border-border py-4 text-sm leading-relaxed text-muted-foreground">
                Sus datos personales se utilizarán para respaldar su experiencia en este sitio,
                administrar el acceso a su cuenta y otros fines descritos en la política de privacidad.
              </div>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-primary"
                  aria-label="Aceptar términos y condiciones"
                />
                <span>He leído y estoy de acuerdo con los términos y condiciones de la web.</span>
              </label>
            </div>

            <div className="mt-6 rounded-xl border border-border p-4">
              <Line label="Productos" value={money(plan.total)} />
              <Line label="Envíos" value={money(deliveryTotal)} />
              <Line label="Total final" value={money(totalWithDelivery)} strong />
            </div>
            <Button className="mt-6 w-full sm:w-auto" size="lg" onClick={pay} disabled={paying}>
              <CreditCard /> {paying ? "Procesando..." : "Continuar con tu compra"}
            </Button>
          </Card>

          <Card className="order-1 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5 text-primary" />
              <h3 className="text-lg font-extrabold text-foreground">Detalles de compra</h3>
            </div>
            <div className="mt-4 space-y-3">
              {plan.groups.map((group) => {
                const quote = quoteByStoreId.get(group.store.store.id);
                return (
                  <div key={group.store.store.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <StoreLogo name={group.store.store.label} size={28} />
                      <span className="font-bold text-foreground">{group.store.store.label}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                        Productos
                      </p>
                      <ul className="space-y-1.5">
                        {group.lines.map(({ item, lineTotal }) => (
                          <li key={itemKey(item)} className="flex items-start justify-between gap-3 text-sm">
                            <span className="min-w-0 flex-1 leading-snug text-foreground">
                              {item.nombre}{" "}
                              <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                            </span>
                            <span className="cw-price shrink-0 font-semibold text-foreground">
                              {money(lineTotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Line label="Envío" value={money(quote?.price ?? 0)} />
                    <Line label="Total supermercado" value={money(group.subtotal + (quote?.price ?? 0))} strong />
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-5">
        <Button variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}>
          Volver
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext}>
            Continuar <ArrowRight />
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm font-semibold text-savings">
            <PackageCheck className="size-4" /> Listo para generar al pagar
          </div>
        )}
      </div>

      <PurchaseSuccessDialog purchase={successPurchase} onGoToPurchases={goToPurchases} />
    </div>
  );
}

function PurchaseSuccessDialog({
  purchase,
  onGoToPurchases,
}: {
  purchase: GeneratedPurchase | null;
  onGoToPurchases: () => void;
}) {
  return (
    <Dialog open={purchase != null} onOpenChange={(open) => !open && onGoToPurchases()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        {purchase && (
          <>
            <DialogHeader className="items-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-savings/15 text-savings">
                <CheckCircle2 className="size-8" />
              </span>
              <DialogTitle>Su compra se ha generado con éxito</DialogTitle>
              <DialogDescription>
                Revisa los detalles antes de continuar a tus compras realizadas.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl bg-primary px-4 py-3 text-center text-primary-foreground">
              <p className="text-xs font-medium text-primary-foreground/80">Total final</p>
              <p className="cw-price text-2xl font-bold tracking-tight">{money(purchase.total)}</p>
              <p className="text-xs text-primary-foreground/80">
                {PAYMENT_METHOD_LABELS[purchase.paymentMethod]}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-extrabold text-foreground">Comprador</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    {purchase.buyer.firstNames} {purchase.buyer.lastNames}
                  </p>
                  <p>{purchase.buyer.phone}</p>
                  <p>{purchase.buyer.email}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-extrabold text-foreground">Dirección de pedido</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{purchase.location.address}</p>
                  <p>
                    {purchase.location.city || "Temuco"}, {purchase.location.country || "Chile"}
                  </p>
                  <p>{purchase.location.comunaSector}</p>
                  <p>
                    {purchase.buyer.dwellingType === "apartment"
                      ? `Apartamento ${purchase.buyer.apartmentNumber ?? ""}`.trim()
                      : "Casa"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-foreground">Supermercados seleccionados</h3>
              {purchase.stores.map((store) => (
                <div key={store.storeId} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2">
                    <StoreLogo name={store.storeLabel} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-foreground">{store.storeLabel}</p>
                      <p className="text-xs text-muted-foreground">{store.branchName}</p>
                    </div>
                    <p className="cw-price font-extrabold text-primary">{money(store.total)}</p>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {store.products.map((item) => (
                      <li key={item.productName} className="flex items-start justify-between gap-3 text-sm">
                        <span className="min-w-0 flex-1 leading-snug text-foreground">
                          {item.productName}{" "}
                          <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="cw-price shrink-0 font-semibold text-foreground">
                          {money(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                    <Line label="Envío" value={money(store.deliveryPrice)} />
                    <Line label="Total supermercado" value={money(store.total)} strong />
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" size="lg" onClick={onGoToPurchases}>
              Ver compras realizadas
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", strong && "pt-1 text-base font-extrabold")}>
      <span className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={cn("cw-price", strong ? "text-primary" : "font-semibold text-foreground")}>{value}</span>
    </div>
  );
}

function CheckoutStepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="grid min-w-[620px] grid-cols-5">
        {steps.map((label, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={label} className="relative flex flex-col items-center px-2 text-center">
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute left-1/2 top-4 h-0.5 w-full",
                    index < currentStep ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-8 place-items-center rounded-full border-2 bg-card text-sm font-extrabold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary shadow-sm ring-4 ring-primary/10",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "mt-2 text-xs font-extrabold",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PaymentChoice({
  checked,
  label,
  onClick,
  children,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className="block w-full text-left" onClick={onClick}>
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span
          className={cn(
            "grid size-4 place-items-center rounded-full border",
            checked ? "border-primary" : "border-muted-foreground/50",
          )}
          aria-hidden="true"
        >
          {checked && <span className="size-2 rounded-full bg-primary" />}
        </span>
        {label}
      </span>
      {children && (
        <span
          className={cn(
            "mt-3 block rounded-md border bg-white p-4 transition-colors",
            checked ? "border-primary/40" : "border-border",
          )}
        >
          {children}
        </span>
      )}
    </button>
  );
}

function CardBrandStrip() {
  return (
    <span className="flex flex-wrap items-center gap-4">
      <span className="text-2xl font-extrabold italic tracking-wide text-blue-700">VISA</span>
      <span className="relative flex h-8 w-14 items-center justify-center">
        <span className="absolute left-2 size-7 rounded-full bg-red-500 opacity-90" />
        <span className="absolute right-2 size-7 rounded-full bg-amber-400 opacity-90" />
      </span>
      <span className="rounded bg-blue-600 px-2 py-1 text-xs font-extrabold uppercase text-white">
        American Express
      </span>
      <span className="text-xs font-extrabold uppercase text-slate-700">Diners Club</span>
    </span>
  );
}
