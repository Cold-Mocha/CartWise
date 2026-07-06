import { LayoutDashboard, ShoppingBag, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Navegación de pantallas MVP. El header solo muestra "Compras" (pendientes +
// historial): a Productos se llega por el buscador global y el Inicio vive en
// el logo. "Comparar" y "Resumen" son pasos del flujo de compra, no entradas
// de menú; la compra pendiente (carrito) tiene su propio botón con contador.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/compras", label: "Compras", icon: ShoppingBag },
];
