// Identificador local para entidades creadas en el cliente (planes, listas,
// despensa). No es un UUID: basta para claves únicas dentro del navegador.
export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
