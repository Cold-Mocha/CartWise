import { AppShell } from "@/components/layout/app-shell";

// Layout de las pantallas autenticadas del MVP. AppShell aplica el guard de
// sesión demo, el header con navegación y el footer de transparencia.
export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
