"use client";

import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAppState } from "@/components/state/app-state";

// Botón "Entrar como demo". No autentica de verdad: marca la sesión demo y entra
// al dashboard (plan §13.2).
export function LandingCta({
  children = "Entrar como demo",
  withArrow = true,
  ...props
}: ButtonProps & { withArrow?: boolean }) {
  const { loginDemo } = useAppState();
  return (
    <Button onClick={loginDemo} {...props}>
      {children}
      {withArrow && <ArrowRight />}
    </Button>
  );
}
