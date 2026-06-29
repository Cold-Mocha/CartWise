import next from "eslint-config-next";

// eslint-config-next v16 exporta directamente un flat config (core-web-vitals +
// TypeScript). Lo extendemos con ignores y un par de ajustes para Cartwise.
const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "server/**"],
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // Patrón SSR-safe deliberado: hidratamos estado desde localStorage y
      // reseteamos resultados de búsqueda dentro de effects. No hay callback de
      // sistema externo en estos casos, así que la regla da falsos positivos.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
