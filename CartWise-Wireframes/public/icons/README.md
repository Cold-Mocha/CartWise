# Iconos e imágenes de Cartwise

Deja aquí tus iconos e imágenes (`.svg`, `.png`, `.webp`, `.jpg`).

Vite sirve todo lo que esté en `public/` tal cual, en la raíz del sitio. Es decir,
un archivo en `public/icons/canasta.svg` queda disponible en la URL **`/icons/canasta.svg`**.

## Cómo usarlos en el código

En `src/web/WebApp.tsx` puedes referenciarlos por su ruta absoluta:

```tsx
// Imagen / icono propio
<img src="/icons/canasta.svg" alt="Canasta" width={24} height={24} />

// Como fondo en CSS (src/index.css)
.cw-algo {
  background-image: url('/icons/fondo.webp');
}
```

> No hace falta `import`: al estar en `public/`, la ruta `/icons/...` funciona directo.

## Recomendaciones

- **SVG** para iconos (escala sin perder nitidez y pesa poco).
- Nombres en minúsculas sin espacios: `precio-bajo.svg`, `tienda.png`.
- Para iconos de interfaz, la app ya usa **lucide-react** (open source, licencia ISC);
  si un icono existe ahí, conviene usar ese en vez de un archivo nuevo.

## Fuentes de iconos/imágenes libres (revisa siempre la licencia)

- Lucide — https://lucide.dev (ISC, ya integrado)
- Tabler Icons — https://tabler.io/icons (MIT)
- Heroicons — https://heroicons.com (MIT)
- unDraw (ilustraciones) — https://undraw.co (libre, sin atribución)
- Iconos de supermercados/marcas: usa solo logos oficiales con permiso de cada marca.
