/*
  Enlaces oficiales de las cadenas cubiertas. Las URLs de producto del Scrapper
  para las tiendas VTEX vienen del backend (vtexcommercestable.com.br); aquí se
  reescriben al dominio real de cada tienda manteniendo la ruta del producto.
*/

const VTEX_ACCOUNT_DOMAINS: Record<string, string> = {
  jumbocl: "https://www.jumbo.cl",
  santaisabel: "https://www.santaisabel.cl",
  unimarc: "https://www.unimarc.cl",
};

export const STORE_HOMEPAGES: Record<string, string> = {
  Jumbo: "https://www.jumbo.cl",
  "Santa Isabel": "https://www.santaisabel.cl",
  Unimarc: "https://www.unimarc.cl",
  "El Trébol": "https://www.supertrebol.cl",
};

// URL real de la tienda para un producto: reescribe VTEX → dominio oficial.
// Sin URL de producto (o cuenta VTEX desconocida) cae a la portada de la tienda.
export function officialProductUrl(
  url: string | null | undefined,
  storeLabel?: string | null,
): string | null {
  const homepage = storeLabel ? STORE_HOMEPAGES[storeLabel] ?? null : null;
  if (!url) return homepage;
  const match = url.match(/^https?:\/\/([a-z0-9-]+)\.vtexcommercestable\.com\.br(\/.*)?$/i);
  if (!match) return url; // ya es un dominio real (p. ej. supertrebol.cl)
  const domain = VTEX_ACCOUNT_DOMAINS[match[1].toLowerCase()];
  return domain ? `${domain}${match[2] ?? ""}` : homepage;
}
