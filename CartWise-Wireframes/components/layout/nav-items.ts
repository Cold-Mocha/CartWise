import { LayoutDashboard, ShoppingBasket, ClipboardList, History, Home, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Navegación de pantallas MVP. "Comparar" y "Resumen" son pasos del flujo de
// compra, no entradas de menú. La compra pendiente vive en su propio botón con
// contador. Diferenciamos: compra pendiente (preparando) → compras planificadas
// (plan guardado) → historial (compras confirmadas).
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Home },
  { href: "/planificadas", label: "Compras planificadas", icon: ClipboardList },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/despensa", label: "Despensa", icon: ShoppingBasket },
];
