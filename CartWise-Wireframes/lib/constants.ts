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
} as const;

export const SUGERENCIAS = ["leche", "arroz", "aceite", "fideos", "cerveza", "café", "atún"];

export const CATEGORIAS_DESTACADAS = [
  "Lácteos",
  "Despensa",
  "Bebidas",
  "Snacks",
  "Limpieza",
  "Carnes",
  "Frutas y verduras",
];

// Snapshot que respalda los precios mostrados. Toda pantalla con precios debe
// recordar al usuario que son referenciales (plan §15).
export const SNAPSHOT_FECHA = "2026-06-24";
export const TRANSPARENCIA = `Precios referenciales según el último snapshot disponible (${SNAPSHOT_FECHA}).`;

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  pending: "Pendiente",
  purchased: "Comprado",
  discarded: "Descartado",
};

// Supermercados realmente integrados al mart. NO incluir Tottus ni Líder como
// cubiertos (plan §10): aún no están en la base.
export const COVERED_STORES = ["Jumbo", "Santa Isabel", "Unimarc", "El Trébol"];
export const COMING_SOON_STORES = ["Tottus", "Líder"];
