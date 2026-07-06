import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

// CTA de acceso: lleva al login, que valida las credenciales fijas de la demo
// antes de abrir el dashboard (plan §13.2). La UI lo presenta como login normal.
export function LandingCta({
  children = "Iniciar sesión",
  withArrow = true,
  ...props
}: ButtonProps & { withArrow?: boolean }) {
  return (
    <Button asChild {...props}>
      <Link href="/login">
        {children}
        {withArrow && <ArrowRight />}
      </Link>
    </Button>
  );
}
