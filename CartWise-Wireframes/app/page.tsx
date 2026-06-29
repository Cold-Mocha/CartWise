import Link from "next/link";
import { Search, ShoppingBasket, Scale, Sparkles, ArrowRight } from "lucide-react";
import { PromoMarquee } from "@/components/landing/promo-marquee";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingCta } from "@/components/landing/landing-cta";
import { DealsCarousel } from "@/components/landing/deals-carousel";
import { StoreCoverage } from "@/components/store/store-coverage";
import { StoreLogo } from "@/components/brand/store-logo";
import { SectionHeading } from "@/components/common/section-heading";
import { TransparencyNote } from "@/components/common/transparency-note";
import { Badge } from "@/components/ui/badge";
import { COVERED_STORES } from "@/lib/constants";

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
                <Sparkles className="size-3" /> {COVERED_STORES.length} supermercados cubiertos
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
              <TransparencyNote />
            </div>

            {/* Tarjeta hero ilustrativa: cobertura real, sin precios inventados */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Comparamos por ti
                </p>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  Un mismo producto, varios supermercados
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {COVERED_STORES.map((store) => (
                    <div
                      key={store}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5"
                    >
                      <StoreLogo name={store} size={34} />
                      <span className="text-sm font-bold text-foreground">{store}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-2.5 text-sm">
                  {[
                    "Vemos qué tienda cubre más de tu compra",
                    "Detectamos diferencias de precio entre supermercados",
                    "Te recomendamos dónde conviene comprar",
                  ].map((line) => (
                    <p key={line} className="flex items-start gap-2 text-muted-foreground">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{line}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supermercados cubiertos */}
        <section id="cubiertos" className="border-y border-border bg-card/60">
          <div className="mx-auto max-w-7xl space-y-5 px-4 py-12 sm:px-6">
            <SectionHeading
              eyebrow="Supermercados cubiertos"
              title="Precios reales de tiendas chilenas"
              description="Tottus y Líder aparecen como próximamente: aún no están integrados al snapshot."
            />
            <StoreCoverage />
          </div>
        </section>

        {/* Diferencias destacadas */}
        <section id="destacadas" className="mx-auto max-w-7xl space-y-5 px-4 py-14 sm:px-6">
          <SectionHeading
            eyebrow="Oportunidades de hoy"
            title="Diferencias destacadas entre supermercados"
            description="Las mayores brechas de precio para un mismo producto según el último snapshot. No son ofertas: son diferencias entre tiendas."
          />
          <DealsCarousel limit={12} />
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
