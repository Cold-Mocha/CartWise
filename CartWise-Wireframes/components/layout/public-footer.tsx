import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";

/*
  Footer del landing público (referencia: footer oscuro de e-commerce con marca,
  columnas de navegación y contacto). Solo para la vitrina; las pantallas de la
  app siguen usando SiteFooter minimal. Redes y correo son ilustrativos. Cierra
  con la nota de transparencia de precios del snapshot.
*/

const SOCIAL = [
  { icon: Facebook, label: "Facebook" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Instagram, label: "Instagram" },
];

const EXPLORA = [
  { label: "Inicio", href: "/" },
  { label: "Oportunidades", href: "/#destacadas" },
  { label: "Cómo funciona", href: "/#como-funciona" },
];

const EMPRESA = [
  { label: "Nuestra historia", href: "/#nosotros" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Iniciar sesión", href: "/login" },
];

export function PublicFooter() {
  return (
    <footer className="bg-[#0c1f16] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.6fr_0.6fr_0.9fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2.5">
            <Logo withWordmark={false} size={34} />
            <span className="text-xl font-extrabold tracking-tight">
              Cart<span className="text-emerald-300">wise</span>
            </span>
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Te ayudamos a tomar decisiones mejor informadas sobre tus compras: los precios de tus
            supermercados, lado a lado.
          </p>
          <div className="flex gap-2.5">
            {SOCIAL.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Explora" className="space-y-3">
          <p className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">Explora</p>
          <ul className="space-y-2 text-sm text-white/70">
            {EXPLORA.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Empresa" className="space-y-3">
          <p className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">Empresa</p>
          <ul className="space-y-2 text-sm text-white/70">
            {EMPRESA.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <p className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">Contacto</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" /> contacto@cartwise.cl
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" /> Temuco, Chile
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:px-6">
          <p>© 2026 Cartwise · Compara y ahorra</p>
          <p>Precios referenciales según el último snapshot disponible.</p>
        </div>
      </div>
    </footer>
  );
}
