import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lightbulb, PiggyBank, Search, ShoppingBasket, Scale } from "lucide-react";
import { PromoMarquee } from "@/components/landing/promo-marquee";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingDeals } from "@/components/landing/landing-deals";
import { LandingReviews } from "@/components/landing/landing-reviews";
import { StoreLogo } from "@/components/brand/store-logo";
import { COVERED_STORES } from "@/lib/constants";

/*
  Landing pública. Estructura guiada por una vitrina de e-commerce clásica:
  hero centrado sobre foto con chips de las cadenas cubiertas → cinta promocional
  al pie del hero → supermercados → productos con mayor diferencia → cómo
  funciona → nuestra historia → testimonios → CTA final. Los testimonios y la
  historia son contenido ilustrativo de la vitrina.
*/

// Encabezado de sección estilo vitrina: eyebrow con guión y título en dos tonos.
function LandingHeading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
        <span aria-hidden className="h-0.5 w-8 rounded bg-primary/60" />
        {eyebrow}
      </span>
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{children}</h2>
    </div>
  );
}

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
      <PublicHeader />

      <main className="flex-1">
        {/* Hero centrado sobre foto, con chips de las cadenas cubiertas */}
        <section className="relative overflow-hidden">
          <Image
            src="/images/hero-supermercado.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/85" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:py-32">
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu compra del mes,{" "}
              <span className="text-emerald-300">al mejor precio.</span>
            </h1>
            <p className="max-w-2xl text-lg text-white/85">
              Cartwise pone lado a lado los precios de tus supermercados: arma tu carro, mira las
              diferencias y decide dónde comprar antes de salir de casa.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {COVERED_STORES.map((store) => (
                <Link
                  key={store}
                  href="#destacadas"
                  className="inline-flex items-center gap-3 rounded-full border border-white/40 py-3 pl-4 pr-7 text-base font-bold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  <StoreLogo name={store} size={44} className="rounded-full" />
                  {store}
                </Link>
              ))}
            </div>
            <LandingCta size="lg" className="mt-2" />
          </div>
        </section>

        {/* Cinta promocional al pie del hero (como la referencia) */}
        <PromoMarquee />

        {/* Productos con mayor diferencia */}
        <section id="destacadas" className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-14 sm:px-6">
            <LandingHeading eyebrow="Diferencias destacadas">
              Los productos donde <span className="text-primary">más puedes ahorrar</span>
            </LandingHeading>
            <LandingDeals limit={8} />
            <div className="flex justify-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                Ver más oportunidades <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="border-t border-border">
          <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6">
            <LandingHeading eyebrow="En 3 pasos">
              Así funciona <span className="text-primary">Cartwise</span>
            </LandingHeading>
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
          </div>
        </section>

        {/* Nuestra historia (referencia: collage de fotos + texto + tarjetas de sello) */}
        <section id="nosotros" className="border-t border-border bg-secondary/40">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-56 overflow-hidden rounded-2xl border border-border shadow-md sm:h-64">
                  <Image
                    src="/images/historia-1.jpg"
                    alt="Carro en un pasillo de supermercado"
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative h-36 overflow-hidden rounded-2xl border border-border shadow-md sm:h-40">
                  <Image
                    src="/images/historia-2.jpg"
                    alt="Góndola de verduras"
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="mt-10 space-y-4">
                <div className="relative h-36 overflow-hidden rounded-2xl border border-border shadow-md sm:h-40">
                  <Image
                    src="/images/historia-3.jpg"
                    alt="Verduras frescas"
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative h-56 overflow-hidden rounded-2xl border border-border shadow-md sm:h-64">
                  <Image
                    src="/images/historia-4.jpg"
                    alt="Puesto de frutas y verduras"
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <LandingHeading eyebrow="Nuestra historia">
                Nacimos para ayudarte a <span className="text-primary">decidir mejor</span>
              </LandingHeading>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Cartwise nació en Temuco de una pregunta que todos nos hemos hecho en la fila del
                supermercado: ¿por qué el mismo producto puede costar tan distinto a unas pocas
                cuadras de distancia? Lo que partió como una planilla familiar para la compra del
                mes se convirtió en nuestra misión: entregarte una herramienta para tomar
                decisiones mejor informadas sobre tus compras.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Reunimos los catálogos de las principales cadenas y los ponemos lado a lado, con
                datos claros y comparables, para que elijas dónde comprar con la misma información
                que tendrías recorriendo tienda por tienda, pero sin moverte de tu casa. Menos
                vueltas, menos dudas y una compra del mes que rinde más.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { icon: Scale, label: "Comparación transparente" },
                  { icon: Lightbulb, label: "Decisiones informadas" },
                  { icon: PiggyBank, label: "Ahorro medible" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm"
                  >
                    <Icon className="size-6 text-primary" />
                    <p className="text-xs font-bold text-foreground sm:text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t border-border">
          <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6">
            <LandingHeading eyebrow="Testimonios">
              Lo que dicen <span className="text-primary">nuestros clientes</span>
            </LandingHeading>
            <LandingReviews />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
