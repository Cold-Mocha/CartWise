import type { GeneratedPurchaseStatus, PlanStatus } from "@/types/cartwise";

// Demo MVP: no hay autenticación real. El login valida credenciales fijas y
// marca una bandera en localStorage. La UI lo presenta como un login normal,
// pero no usar para nada sensible.
export const DEMO_CREDENTIALS = {
  usuario: "Test1",
  password: "12345678",
} as const;

export const STORAGE_KEYS = {
  auth: "cartwise_demo_auth",
  basket: "cartwise_web_basket",
  history: "cartwise_web_history",
  confirmed: "cartwise_web_confirmed",
  lists: "cartwise_web_lists",
  pantry: "cartwise_web_pantry",
  budget: "cartwise_web_budget",
  onboarding: "cartwise_web_onboarding_done",
  // Última comparación y selección de dónde comprar: persisten para que
  // /comparar y /plan-recomendado sobrevivan recargas de página.
  comparison: "cartwise_web_comparison",
  selection: "cartwise_web_selection",
  generatedPurchases: "cartwise_web_generated_purchases",
} as const;

// Presupuesto mensual demo del MVP (CLP). Editable en estado local; sirve de
// referencia para "gasto del mes vs presupuesto" en la dashboard.
export const DEFAULT_MONTHLY_BUDGET = 250_000;

// Fecha de respaldo del snapshot. La fuente de verdad es la que devuelve el
// bridge (`snapshot` en /api/health y en la comparación); esta constante solo
// se usa como fallback si la respuesta no la trae.
export const SNAPSHOT_FECHA = "2026-07-05";

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  pending: "Pendiente",
  purchased: "Comprado",
  discarded: "Descartado",
};

export const GENERATED_PURCHASE_STATUS_LABELS: Record<GeneratedPurchaseStatus, string> = {
  generated: "Generada",
  preparing: "En preparación",
  ready_external: "Lista para seguimiento externo",
};

// Supermercados realmente integrados al mart, usados en el filtro de catálogo.
export const COVERED_STORES = ["Jumbo", "Santa Isabel", "Unimarc", "El Trébol"];
