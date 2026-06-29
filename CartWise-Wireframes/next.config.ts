import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las imágenes de producto viven en /public/images/products/{ean}.jpg y se
  // sirven como estáticos; no se necesita el optimizador remoto.
  images: { unoptimized: true },
};

export default nextConfig;
