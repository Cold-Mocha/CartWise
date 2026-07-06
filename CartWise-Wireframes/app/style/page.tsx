import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Percent, Star } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { StoreLogo } from "@/components/brand/store-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingProductCard } from "@/components/landing/landing-product-card";
import type { SearchItem } from "@/types/cartwise";

/*
  Guía de estilo interna de Cartwise (/style). Documenta el sistema visual del
  landing y la app para mantener consistencia: colores, tipografía, logo,
  radios, sombras, botones y la anatomía de la tarjeta de producto. No se
  enlaza desde la navegación pública; es una referencia de desarrollo.
*/

export const metadata: Metadata = {
  title: "Guía de estilo — Cartwise",
};

const COLORS = [
  { name: "primary", cls: "bg-primary", value: "hsl(142 70% 33%)", uso: "Verde de marca: acciones, precios menores, acentos y enlaces." },
  { name: "primary-foreground", cls: "bg-primary-foreground border", value: "hsl(0 0% 100%)", uso: "Texto sobre verde de marca." },
  { name: "background", cls: "bg-background border", value: "hsl(140 30% 99%)", uso: "Fondo general de páginas (blanco verdoso luminoso)." },
  { name: "foreground", cls: "bg-foreground", value: "hsl(155 30% 12%)", uso: "Texto principal." },
  { name: "card", cls: "bg-card border", value: "hsl(0 0% 100%)", uso: "Fondo de tarjetas y paneles." },
  { name: "secondary", cls: "bg-secondary", value: "hsl(140 35% 94%)", uso: "Fondos de sección alternos (con /40)." },
  { name: "muted", cls: "bg-muted", value: "hsl(140 22% 95%)", uso: "Fondos neutros, placeholders." },
  { name: "muted-foreground", cls: "bg-muted-foreground", value: "hsl(150 12% 40%)", uso: "Texto secundario y descripciones." },
  { name: "border", cls: "bg-border", value: "hsl(145 18% 88%)", uso: "Bordes de tarjetas, inputs y separadores." },
  { name: "savings", cls: "bg-savings", value: "hsl(142 72% 29%)", uso: "Ahorros confirmados, badges de ahorro y la cifra grande de OFERTA." },
  { name: "offer", cls: "bg-offer", value: "hsl(36 96% 48%)", uso: "Ámbar: SOLO ofertas temporales reales." },
  { name: "primary/60 (verde opaco)", cls: "bg-primary/60", value: "primary al 60%", uso: "Precio de lista tachado DENTRO de una oferta temporal (tarjetas y detalle de precios), para que la OFERTA destaque." },
  { name: "destructive / red-600", cls: "bg-red-600", value: "hsl(0 72% 48%)", uso: "Mayor precio tachado, badge % de oferta, botón de cerrar sesión, errores y faltantes." },
  { name: "emerald-300", cls: "bg-emerald-300", value: "tailwind emerald-300", uso: "Acento verde claro sobre fondos oscuros (hero, footer)." },
  { name: "amber-400", cls: "bg-amber-400", value: "tailwind amber-400", uso: "Estrellas de testimonios." },
  { name: "footer oscuro", cls: "bg-[#0c1f16]", value: "#0c1f16", uso: "Fondo del footer público." },
];

const RADII = [
  { cls: "rounded-md", label: "rounded-md", uso: "Botones e inputs" },
  { cls: "rounded-lg", label: "rounded-lg", uso: "Imágenes de producto, cajas menores" },
  { cls: "rounded-xl", label: "rounded-xl", uso: "Tarjetas de producto, reseñas y sellos" },
  { cls: "rounded-2xl", label: "rounded-2xl", uso: "Fotos, paneles y tarjetas hero" },
  { cls: "rounded-3xl", label: "rounded-3xl", uso: "Tarjeta del login" },
  { cls: "rounded-full", label: "rounded-full", uso: "Chips, badges circulares, dots, sociales" },
];

const SHADOWS = [
  { cls: "shadow-sm", label: "shadow-sm", uso: "Tarjetas en reposo" },
  { cls: "shadow-md", label: "shadow-md", uso: "Flechas de carrusel, fotos del collage" },
  { cls: "shadow-lg", label: "shadow-lg", uso: "Hover de tarjetas" },
  { cls: "shadow-xl", label: "shadow-xl", uso: "Login, paneles hero" },
];

// Datos de muestra para la tarjeta de producto (misma forma que el bridge).
const MOCK_OFERTA: SearchItem = {
  id: 1,
  kind: "product",
  ean: "7802575534033",
  nombre: "Nombre del producto",
  categoria: "Lácteos",
  precio_min: 1990,
  precio_max: 2790,
  precio_lista: 2490,
  diferencia: 800,
  n_tiendas: 3,
  oferta_real: 1,
  match_label: "Exacto por EAN",
};

const MOCK_NORMAL: SearchItem = {
  ...MOCK_OFERTA,
  id: 2,
  ean: "7801930025711",
  oferta_real: 0,
};

function GuideHeading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
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

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="inline-flex items-center gap-3">
          <Logo />
          <Badge variant="muted">Guía de estilo</Badge>
        </span>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 pb-24 pt-6 sm:px-6">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Referencia interna del sistema visual de Cartwise, basada en la página principal.
          Úsala para mantener consistencia al crear nuevas pantallas o componentes.
        </p>

        {/* Colores */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Fundamentos">Colores</GuideHeading>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Sistema &quot;supermercado online en blanco y verde&quot;: base luminosa, verde de marca
            para acción y ahorro, ámbar solo para ofertas reales y rojo solo para el mayor precio,
            faltantes y errores.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLORS.map((color) => (
              <div key={color.name} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className={`mt-0.5 size-10 shrink-0 rounded-lg border border-border ${color.cls}`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{color.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{color.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{color.uso}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tipografía */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Fundamentos">Tipografía</GuideHeading>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Familia única: <strong>Manrope</strong> (variable <code className="rounded bg-muted px-1">--font-sans</code>).
            Los títulos usan peso 800 con tracking -0.02em (definido globalmente para h1–h4).
          </p>
          <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hero — text-4xl/6xl extrabold</p>
              <p className="text-4xl font-extrabold tracking-tight text-foreground">
                Tu compra del mes, <span className="text-primary">al mejor precio.</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Título de sección — eyebrow con guión + dos tonos</p>
              <GuideHeading eyebrow="Ejemplo">
                Título de sección <span className="text-primary">con acento</span>
              </GuideHeading>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cuerpo — text-sm/lg text-muted-foreground</p>
              <p className="max-w-xl text-sm text-muted-foreground">
                Texto descriptivo en gris verdoso. Frases cortas, verbos claros: agregar, comparar,
                guardar, confirmar compra.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Precios — .cw-price (números tabulares)</p>
              <p className="flex items-end gap-4">
                <span className="cw-price text-xl font-extrabold text-primary">$1.990</span>
                <span className="cw-price text-sm font-semibold text-red-600 line-through">$2.790</span>
              </p>
              <p className="mt-2 flex items-end gap-4">
                <span className="cw-price text-2xl font-extrabold text-savings">$1.590</span>
                <span className="cw-price text-sm font-semibold text-primary/60 line-through">$1.990</span>
                <span className="cw-price text-sm font-semibold text-red-600 line-through">$2.790</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fila 1: tarjeta normal (menor precio + mayor precio en rojo). Fila 2: oferta temporal
                (OFERTA en savings + precio de lista tachado en verde opaco primary/60 + mayor precio
                tachado en rojo).
              </p>
            </div>
          </div>
        </section>

        {/* Logo */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Marca">Logo</GuideHeading>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <Logo />
              <p className="text-xs text-muted-foreground">Principal sobre fondo claro</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <Logo withWordmark={false} size={44} />
              <p className="text-xs text-muted-foreground">Isotipo solo (espacios reducidos)</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-[#0c1f16] p-6">
              <span className="inline-flex items-center gap-2.5">
                <Logo withWordmark={false} size={34} />
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  Cart<span className="text-emerald-300">wise</span>
                </span>
              </span>
              <p className="text-xs text-white/60">Sobre fondo oscuro: wordmark blanco + acento emerald-300</p>
            </div>
          </div>
          <p className="max-w-2xl text-xs text-muted-foreground">
            El isotipo (hoja + carro sobre disco verde) no se deforma ni cambia de color. El
            wordmark va en <code className="rounded bg-muted px-1">text-2xl</code> y siempre lleva
            &quot;wise&quot; en verde (primary en claro, emerald-300 en oscuro). En el header de la
            app el isotipo escala a 46px (40px en móvil, sin wordmark).
          </p>
        </section>

        {/* Radios y sombras */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Fundamentos">Esquinas y sombras</GuideHeading>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Radios moderados (base <code className="rounded bg-muted px-1">--radius: 0.55rem</code>);
            nada sobre-redondeado salvo chips y badges circulares.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {RADII.map((radius) => (
              <div key={radius.label} className="flex flex-col items-center gap-2 text-center">
                <div className={`h-16 w-full border-2 border-primary/50 bg-primary/10 ${radius.cls}`} />
                <p className="font-mono text-[11px] font-bold text-foreground">{radius.label}</p>
                <p className="text-[11px] text-muted-foreground">{radius.uso}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SHADOWS.map((shadow) => (
              <div key={shadow.label} className={`flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-5 text-center ${shadow.cls}`}>
                <p className="font-mono text-[11px] font-bold text-foreground">{shadow.label}</p>
                <p className="text-[11px] text-muted-foreground">{shadow.uso}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Botones y badges */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Componentes">Botones y badges</GuideHeading>
          <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Acción principal</Button>
              <Button variant="savings">Ahorro</Button>
              <Button variant="outline">Secundaria</Button>
              <Button variant="ghost">Terciaria</Button>
              <Button variant="destructive">Destructiva</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Grande (hero, login)</Button>
              <Button>Normal</Button>
              <Button size="sm">Pequeño (tarjetas)</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Badge>default</Badge>
              <Badge variant="savings">savings</Badge>
              <Badge variant="offer">offer</Badge>
              <Badge variant="missing">missing</Badge>
              <Badge variant="outline">outline</Badge>
              <Badge variant="muted">muted</Badge>
            </div>
          </div>
        </section>

        {/* Tarjeta de producto */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Componentes">Tarjeta de producto</GuideHeading>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,480px)_1fr]">
            <div className="grid grid-cols-2 gap-4">
              <LandingProductCard item={MOCK_OFERTA} />
              <LandingProductCard item={MOCK_NORMAL} />
            </div>
            <ul className="space-y-2 self-center text-sm text-muted-foreground">
              <li>• Imagen centrada sobre blanco, esquinas <code className="rounded bg-muted px-1">rounded-lg</code>.</li>
              <li>• Nombre en 2 líneas máximo, centrado.</li>
              <li>• Bloque de precios compartido (<code className="rounded bg-muted px-1">ProductPriceBlock</code>) en landing y app, con <code className="rounded bg-muted px-1">.cw-price</code> y rótulos en mayúsculas sobre cada cifra. Se centra verticalmente en el espacio libre entre el nombre y los botones (envoltorio <code className="rounded bg-muted px-1">flex-1 items-center</code>), y las cifras se centran entre sí.</li>
              <li>• Tarjeta normal: &quot;Menor precio&quot; en verde primary; &quot;Mayor precio&quot; (o &quot;Precio lista&quot;) tachado en rojo, más pequeño.</li>
              <li>• Oferta temporal: la cifra grande es la OFERTA en verde savings; el precio de lista va tachado en verde opaco (<code className="rounded bg-muted px-1">text-primary/60</code>) — rotulado &quot;Precio normal&quot; en las ofertas por supermercado y &quot;Menor precio&quot; al comparar cadenas — y &quot;Mayor precio&quot; sigue tachado en rojo.</li>
              <li>• Badge circular rojo con <Percent className="inline size-3.5" /> en la esquina superior derecha SOLO si la tienda más barata tiene oferta temporal real (señal <code className="rounded bg-muted px-1">oferta_real</code>).</li>
              <li>• Botón verde de ancho completo al pie (&quot;Mostrar precios&quot; en landing; &quot;Agregar a la compra&quot; en la app).</li>
              <li>• Hover: se eleva levemente (<code className="rounded bg-muted px-1">-translate-y-0.5</code>) y pasa a <code className="rounded bg-muted px-1">shadow-lg</code>.</li>
            </ul>
          </div>
        </section>

        {/* Otros patrones */}
        <section className="space-y-6">
          <GuideHeading eyebrow="Componentes">Otros patrones</GuideHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border bg-[#0c1f16] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Chip de supermercado (hero, sobre foto oscura)</p>
              <span className="inline-flex items-center gap-3 rounded-full border border-white/40 py-3 pl-4 pr-7 text-base font-bold text-white">
                <StoreLogo name="Jumbo" size={44} className="rounded-full" />
                Jumbo
              </span>
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estrellas de testimonios</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < 4 ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-border"} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Cita en cursiva → nombre en negrita → estrellas amber-400. En carrusel con flechas
                laterales y dots (dot activo en primary).
              </p>
            </div>
          </div>
          <ul className="max-w-3xl space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Header de la app (estilo Lider):</strong> barra de 80px (<code className="rounded bg-muted px-1">h-20</code>) sin menú hamburguesa: isotipo a 46px que lleva al Inicio, buscador global redondeado con autosugerencias (botón circular verde con lupa), navegación mínima con ícono (&quot;Compras&quot;; etiqueta desde <code className="rounded bg-muted px-1">lg</code>; a Productos se llega por el buscador y al Inicio por el logo), botón &quot;Carrito&quot; con contador que abre el carrito lateral (panel derecho con líneas, cantidades y el botón &quot;Comparar supermercados&quot;) y cierre de sesión como cuadrado rojo <code className="rounded bg-muted px-1">destructive</code> de 44px.</li>
            <li>• <strong className="text-foreground">Buscador:</strong> vive en el header y es único en la app: sugerencias con imagen, marca y precio; Enter lleva a <code className="rounded bg-muted px-1">/productos?q=…</code> (la grilla de resultados, 4 por fila en escritorio). /productos no tiene input propio.</li>
            <li>• <strong className="text-foreground">Detalle de producto:</strong> vista tipo ficha e-commerce — imagen protagonista sobre blanco con SOLO el nombre debajo (sin marca ni categoría). En &quot;Precios por supermercado&quot; la fila de la tienda más barata se resalta en verde (<code className="rounded bg-muted px-1">bg-primary/10</code> + ring primary/40), sin badge; logos a 36px; si la tienda tiene oferta real se muestran ambos precios: arriba la cifra de OFERTA y debajo el precio original tachado en verde opaco.</li>
            <li>• <strong className="text-foreground">Fotos con texto encima:</strong> siempre con velo oscuro en degradado (85/70/85% de negro en el hero; 90/55/30 en el login) y texto blanco.</li>
            <li>• <strong className="text-foreground">Secciones:</strong> se alternan fondo blanco y <code className="rounded bg-muted px-1">bg-secondary/40</code>, separadas con <code className="rounded bg-muted px-1">border-t border-border</code>; ancho <code className="rounded bg-muted px-1">max-w-7xl</code>.</li>
            <li>• <strong className="text-foreground">Terminología:</strong> &quot;compra pendiente&quot; (en la interfaz, el botón del header, el panel lateral y la vista se rotulan &quot;Carrito&quot;), &quot;diferencias destacadas&quot;, &quot;listas guardadas&quot;, &quot;despensa&quot;. &quot;Oferta temporal&quot; solo con señal real de oferta.</li>
            <li>• <strong className="text-foreground">Verde vs rojo:</strong> verde para acción, ahorro y menor precio; verde opaco (primary/60) para el precio de lista tachado dentro de una oferta; rojo para el mayor precio tachado, badge de oferta, cierre de sesión, faltantes y errores.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
