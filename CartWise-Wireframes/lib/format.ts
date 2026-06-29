// Formato de moneda y fechas en español de Chile. Único lugar donde se decide
// cómo se ven los precios; "Sin precio" cubre faltantes de forma explícita.

export function money(value?: number | null) {
  if (value === null || value === undefined) return "Sin precio";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function monthKey(iso?: string) {
  return (iso ?? new Date().toISOString()).slice(0, 7);
}

export function currentMonthLabel() {
  return new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

export function shortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}
