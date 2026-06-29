# Análisis técnico: Supermercado El Trébol

## Plataforma
**Shopify** — confirmado por la estructura de URLs `/collections/` y `/products.json` característica de Shopify. Es un supermercado 100% regional de Temuco y La Araucanía, con más de 40 salas de venta.

## API pública disponible
Shopify expone endpoints JSON sin autenticación bajo el mismo dominio:

| Endpoint | Descripción |
|---|---|
| `/products.json?limit=250` | Lista de productos paginada |
| `/collections.json` | Colecciones/categorías |
| `/collections/{handle}/products.json` | Productos de una categoría |

### Ejemplo de uso
```bash
# Todas las colecciones
curl https://www.supertrebol.cl/collections.json

# Productos de una colección
curl "https://www.supertrebol.cl/collections/despensa/products.json?limit=250&page=2"
```

## Estructura del JSON de producto (Shopify)
```json
{
  "id": 123456789,
  "title": "Arroz Grado 1 Tucapel 1kg",
  "vendor": "Tucapel",
  "product_type": "Despensa",
  "handle": "arroz-grado-1-tucapel-1kg",
  "variants": [
    {
      "id": 987654321,
      "sku": "7802800123456",
      "barcode": "7802800123456",   // ← EAN aquí
      "price": "1490.00",
      "compare_at_price": "1790.00",
      "available": true,
      "inventory_quantity": 42
    }
  ],
  "images": [{ "src": "https://cdn.shopify.com/..." }]
}
```

> **Nota clave:** en Shopify el EAN/código de barras viene en `variants[].barcode`. El precio de oferta está en `variants[].price` y el precio tachado en `variants[].compare_at_price`.

## Paginación
Shopify usa paginación por **cursor** (Link header) o por **página clásica**:
- Máximo **250 productos por request** (`limit=250`)
- Para catálogos grandes, usar el header `Link: <url>; rel="next"` de la respuesta
- El catálogo de Trébol es pequeño (~940 productos en `/ofertas`), probablemente ~2.000–3.000 en total — pocas páginas necesarias

## Protección anti-bot
**Baja.** Shopify estándar sin capas adicionales (no se detectó Cloudflare ni Akamai en supertrebol.cl). Con un User-Agent válido y 1–2 req/s es suficiente.

## Ventaja frente a las tiendas VTEX
| Aspecto | VTEX (Jumbo/Unimarc/Santa Isabel) | Shopify (Trébol) |
|---|---|---|
| Límite por query | 2.500 ítems | Sin límite duro |
| Paginación | `_from` / `_to` (max 50) | `limit=250` + cursor |
| EAN | `items[].ean` | `variants[].barcode` |
| Autenticación | No requerida | No requerida |
| Catálogo total | ~10.000–50.000+ SKUs | ~2.000–5.000 SKUs |

## Categorías relevantes (alimenticias)
Basado en el menú visible de supertrebol.cl:
- `/collections/despensa`
- `/collections/el-trebol-drinks`
- `/collections/marcas-propias`
- `/collections/ofertas`
- `/collections/fds-oferta`

## Resumen
Trébol es el objetivo **más sencillo** del conjunto: Shopify sin protección anti-bot, catálogo pequeño, paginación simple, y EAN directamente en `barcode`. Es un buen candidato para testear el pipeline end-to-end antes de atacar las tiendas VTEX más grandes.
