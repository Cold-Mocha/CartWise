// Normaliza texto (minúsculas, sin acentos, espacios colapsados) para comparar
// nombres de producto entre la compra y la despensa.
export function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
