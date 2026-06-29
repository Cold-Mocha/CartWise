import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppStateProvider } from "@/components/state/app-state";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cartwise — Compara supermercados y compra más inteligente",
  description:
    "Arma tu compra, compara precios entre supermercados chilenos y descubre dónde conviene comprar. Precios referenciales según el último snapshot disponible.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={manrope.variable}>
      <body>
        <AppStateProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AppStateProvider>
      </body>
    </html>
  );
}
