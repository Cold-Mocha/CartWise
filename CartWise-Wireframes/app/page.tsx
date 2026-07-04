import Link from "next/link";
import { Search, ShoppingBasket, Scale, Sparkles, ArrowRight } from "lucide-react";
import { PromoMarquee } from "@/components/landing/promo-marquee";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingDeals } from "@/components/landing/landing-deals";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    icon: Search,
    title: "Busca productos",
    text: "Encuentra lo que necesitas por nombre o marca en el catálogo de los supermercados cubiertos.",
  },
  {
    icon: ShoppingBasket,
    title: "Arma tu compra",
    text: "Agrega productos a tu compra pendiente y ajusta cantidades como en un carrito real.",
  },
  {
    icon: Scale,
    title: "Compara supermercados",
    text: "Vemos qué tienda cubre más productos y cuesta menos, y te recomendamos dónde comprar.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PromoMarquee />
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="space-y-6">
              <Badge variant="savings" className="px-3 py-1 text-xs">
                <Sparkles className="size-3" /> Compara y ahorra
              </Badge>
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Compara supermercados y{" "}
                <span className="text-primary">compra más inteligente</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Arma tu compra, compara precios entre tiendas y descubre dónde conviene comprar.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <LandingCta size="lg" />
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  Cómo funciona <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Tarjeta hero ilustrativa: propuesta de valor, sin datos inventados */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Comparamos por ti
                </p>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  Un mismo producto, varios supermercados
                </p>
                <div className="mt-5 space-y-3 text-sm">
                  {[
                    { icon: Search, t: "Busca productos por nombre o marca" },
                    { icon: ShoppingBasket, t: "Arma tu compra pendiente" },
                    { icon: Scale, t: "Compara y descubre dónde conviene" },
                  ].map(({ icon: Icon, t }) => (
                    <p key={t} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-semibold text-foreground">{t}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diferencias destacadas */}
        <section id="destacadas" className="border-t border-border mx-auto max-w-7xl space-y-5 px-4 py-14 sm:px-6">
          <SectionHeading
            title="Diferencias destacadas"
            description="Las mayores brechas de precio para un mismo producto. No son ofertas: son diferencias entre tiendas."
          />
          <LandingDeals limit={10} />
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6">
            <SectionHeading eyebrow="En 3 pasos" title="Así funciona Cartwise" />
            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
                  <span className="absolute right-5 top-5 text-5xl font-extrabold text-primary/10">{i + 1}</span>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
              <h3 className="text-2xl font-extrabold text-foreground">Prueba la demo en segundos</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Sin registro ni datos reales. Entra como demo y arma tu primera compra comparada.
              </p>
              <LandingCta size="lg" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
