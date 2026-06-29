export function money(value?: number | null) {
  if (value === null || value === undefined) return 'Sin precio';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
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
  return new Date().toLocaleDateString('es-CL', {month: 'long', year: 'numeric'});
}
