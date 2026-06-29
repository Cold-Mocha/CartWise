import { LayoutDashboard, ShoppingBasket, Bookmark, History, Home, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Navegación SOLO de pantallas MVP (plan §22). "Comparar" y "Plan recomendado"
// son pasos del flujo de compra, no entradas de menú. La compra pendiente vive
// en su propio botón con contador.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Home },
  { href: "/listas", label: "Listas guardadas", icon: Bookmark },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/despensa", label: "Despensa", icon: ShoppingBasket },
];
