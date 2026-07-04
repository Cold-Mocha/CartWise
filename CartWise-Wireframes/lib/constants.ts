import type { PlanStatus } from "@/types/cartwise";

// Demo MVP: no hay autenticación real. El "login" solo marca una bandera en
// localStorage. No usar para nada sensible.
export const STORAGE_KEYS = {
  auth: "cartwise_demo_auth",
  basket: "cartwise_web_basket",
  history: "cartwise_web_history",
  confirmed: "cartwise_web_confirmed",
  lists: "cartwise_web_lists",
  pantry: "cartwise_web_pantry",
  budget: "cartwise_web_budget",
  onboarding: "cartwise_web_onboarding_done",
} as const;

// Presupuesto mensual demo del MVP (CLP). Editable en estado local; sirve de
// referencia para "gasto del mes vs presupuesto" en la dashboard.
export const DEFAULT_MONTHLY_BUDGET = 250_000;

// Fecha del snapshot que respalda los precios. Se usa internamente para
// etiquetar planes guardados (no se muestra como aviso al usuario).
export const SNAPSHOT_FECHA = "2026-06-24";

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  pending: "Pendiente",
  purchased: "Comprado",
  discarded: "Descartado",
};

// Supermercados realmente integrados al mart, usados en el filtro de catálogo.
export const COVERED_STORES = ["Jumbo", "Santa Isabel", "Unimarc", "El Trébol"];
