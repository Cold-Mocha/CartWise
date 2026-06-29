# Investigación técnica: web scraping (snapshot) de supermercados chilenos

## TL;DR
- **La estrategia óptima y más ética es consumir las APIs JSON públicas de VTEX** (`/api/catalog_system/pub/products/search` con paginación `_from`/`_to`), porque Jumbo, Santa Isabel (ambos Cencosud) y Unimarc (SMU) corren sobre VTEX y exponen el catálogo sin autenticación. Tottus (commercetools/Next.js) y Líder (plataforma propia de Walmart, protegida por Akamai) NO tienen API VTEX pública y requieren scraping de HTML/JSON embebido.
- **Para un snapshot único, el stack recomendado es Python + httpx asíncrono + asyncio + aiolimiter + tenacity, escribiendo a Parquet o JSON Lines y luego cargando a PostgreSQL** con un modelo normalizado (productos, SKUs, precios, supermercado, timestamp). Evita navegadores headless (Playwright) salvo para Tottus/Líder.
- **El cuello de botella legal/ético no es la legalidad del scraping de datos públicos (lícito en Chile si no se vulneran medidas de seguridad ni datos personales), sino respetar rate limits, robots.txt y no causar denegación de servicio.** El límite duro de VTEX es estricto: la Catalog Search API documenta que "la paginación admite hasta 50 productos y funciona correctamente hasta que el parámetro `_from` alcanza el número 2500", devolviendo el error literal "Parameter _from can't be greater than 2500" — lo que obliga a paginar por categoría/subcategoría.

## Key Findings

1. **Plataformas por cadena (junio 2026):**
   - Jumbo (jumbo.cl) → VTEX. Cencosud es cliente histórico de VTEX.
   - Santa Isabel (santaisabel.cl) → VTEX (Cencosud).
   - Unimarc (unimarc.cl) → VTEX (SMU). Confirmado por el manifest público `unimarc-store` (vendor `unimarc`).
   - Tottus (tottus.cl) → commercetools headless + Contentful + React/Next.js (Falabella). NO VTEX. Confirmado por los implementadores NULogic ("replatform from ATG to a modern, headless commerce architecture... commercetools, Contentful... React/Next.js frontend on Google Cloud") y Aerolab ("We ended up choosing CommerceTools, an API-first ecommerce platform... Typescript, React, Next.JS").
   - Líder (lider.cl) → plataforma propia de Walmart, protegida por Akamai Bot Manager.

2. **Las tres tiendas VTEX exponen dos APIs JSON públicas sin autenticación:** la Legacy Search API (`/api/catalog_system/pub/products/search`) y la Intelligent Search API (`/api/io/_v/api/intelligent-search/...`). El segmento `/pub/` significa público; la Intelligent Search API documenta explícitamente que "no requiere autenticación ni permisos".

3. **Límites de VTEX:** `_from`/`_to` con diferencia máxima de 50 ítems por página y tope de 2.500 ítems por consulta (VTEX: "There's also a limit of 2500 items for any given search"). Hay que recorrer el árbol de categorías para extraer todo el catálogo. A nivel técnico, el rate limit de la Catalog API de VTEX es de 45.000 req/min por cuenta y 15.000 req/min por endpoint — muy por encima de lo que un scraping ético debería usar, lo que refuerza que 1-2 req/s es una autorregulación prudente y respetuosa, no una restricción de la plataforma.

4. **Anti-bot:** Líder (Akamai Bot Manager) y posiblemente Unimarc (SMU es cliente Akamai con "App & API Protector") pueden challenge/bloquear incluso los endpoints. Jumbo y Santa Isabel (Cencosud) son más permisivos.

## Details

### 1. Análisis por supermercado

#### VTEX (Jumbo, Santa Isabel, Unimarc)
VTEX es una plataforma SaaS de comercio (backend Node.js sobre Google Cloud) muy común en retail latinoamericano. Expone APIs de catálogo públicas bajo el segmento `/pub/` (público, sin token).

**A) Legacy Search API** (la más estable y documentada para scraping):
```
GET https://www.jumbo.cl/api/catalog_system/pub/products/search?fq=C:/{categoryId}/&_from=0&_to=49
```
- Paginación: `_from` y `_to`, diferencia máxima 50 (devuelve 50 productos por página). VTEX: "you will have to use the parameters `_from` and `_to` in the URL... The parameters `_from` and `_to` must not have a difference bigger than 50."
- Tope: 2.500 ítems por búsqueda; `_to` > 2500 devuelve "Parameter _from can't be greater than 2500".
- Filtros `fq=`: por categoría (`fq=C:/1/2/`), por EAN (`fq=alternateIds_Ean:7891234567890`), por productId, por skuId.
- Árbol de categorías: `GET /api/catalog_system/pub/category/tree/{nivel}`.

**B) Intelligent Search API** (búsqueda nueva basada en VTEX IO):
```
GET https://www.jumbo.cl/api/io/_v/api/intelligent-search/v1/product_search?query=leche&from=0&to=49
```
- Usa `from`/`to` (sin guion bajo). No requiere autenticación ni permisos. El path live referenciado por la comunidad VTEX es `/api/io/_v/api/intelligent-search/product_search`.

**Estructura del JSON de producto (Legacy Search API):**
- Nivel producto: `productId`, `productName`, `brand`, `brandId`, `categories[]`, `categoryId`, `link`, `linkText`, `description`, `items[]`.
- `items[]` (cada uno es un SKU): `itemId`, `name`, `nameComplete`, `ean`, `referenceId[]`, `images[]` (`imageUrl`), `sellers[]`.
- `sellers[]`: `sellerId`, `sellerName`, `commertialOffer` (nótese el typo deliberado de VTEX: "commertial" con "t" — gotcha clásico de scraping).
- `commertialOffer`: `Price` (precio de venta/oferta), `ListPrice` (precio lista/tachado), `PriceWithoutDiscount`, `AvailableQuantity` (stock/disponibilidad), `Installments[]` (cuotas: `NumberOfInstallments`, `Value`, `InterestRate`, `PaymentSystemName`), `PriceValidUntil`, `Tax`, `spotPrice`.

La jerarquía es **product → items[] (SKUs) → sellers[] → commertialOffer**. Las especificaciones (incluidas nutricionales si la tienda las carga) vienen como propiedades dinámicas del producto (`Specification Groups`/`allSpecifications`).

#### Tottus (commercetools + Next.js)
No expone API VTEX. El catálogo se renderiza con React SSR; los datos suelen venir embebidos en `__NEXT_DATA__` o vía endpoints XHR internos no documentados. No hay API pública de catálogo JSON sin autenticación confirmada; los scrapers comerciales (Oxylabs, Apify) lo tratan como scraping de página (patrones de URL `https://www.falabella.com/falabella-cl/product/{id}/{slug}`). Probablemente requiera Playwright o parsing del JSON de hidratación.

#### Líder (Walmart Chile)
Plataforma propia de Walmart (mismo árbol tecnológico que walmart.com), protegida por Akamai Bot Manager (cookies `_abck`, `bm_sz`, `ak_bmsc`, `bm_sv`; header `akamai-bm-telemetry`). Bloqueos típicos 403/429 ya en la primera petición; el `_abck` se valida server-side por request (copiar la cookie de un navegador real no funciona — la telemetría debe regenerarse por ejecución de navegador real). La API de developer.walmart.com/cl-marketplace es para sellers y requiere autenticación con firma (`WM_SEC.AUTH_SIGNATURE`, `WM_CONSUMER.ID`, `x-api-key`), no sirve para leer el catálogo. Es el objetivo más difícil; requiere navegador stealth o servicio gestionado.

### 2. Rate limiting ético y manejo de bloqueos

**Buenas prácticas (prioridad):**
- Respetar `robots.txt` de cada dominio.
- User-Agent honesto e identificable (incluir contacto si es investigación).
- Concurrencia baja: 1-2 peticiones/segundo por dominio es prudente; proyectos de scraping de supermercados (p.ej. `martjanz/vizcacha`) recomiendan explícitamente "un request por segundo es una buena medida; más que eso es vicio".
- Scraping en horario de bajo tráfico (madrugada local).
- Cachear resultados; al ser un snapshot, una sola pasada.

**Throttling + backoff (código):**
```python
import asyncio, httpx, random
from aiolimiter import AsyncLimiter
from tenacity import (retry, stop_after_attempt, wait_random_exponential,
                      retry_if_exception_type)

limiter = AsyncLimiter(max_rate=2, time_period=1)  # 2 req/s por dominio

@retry(wait=wait_random_exponential(min=1, max=60),
       stop=stop_after_attempt(6),
       retry=retry_if_exception_type(httpx.HTTPStatusError))
async def fetch(client: httpx.AsyncClient, url: str):
    async with limiter:
        r = await client.get(url, timeout=30)
        if r.status_code == 429:
            # respetar Retry-After si existe
            retry_after = int(r.headers.get("Retry-After", 0))
            await asyncio.sleep(max(retry_after, random.uniform(1, 3)))
        r.raise_for_status()
        return r.json()
```
- 429 (Too Many Requests): respetar `Retry-After`; usar `max(retry_after, backoff_calculado)`.
- 403: posible bloqueo anti-bot (revisar headers, User-Agent, cookies).
- Backoff exponencial con jitter para evitar "thundering herd" (retry storm).

**Paginación eficiente VTEX (recorrer todo el catálogo):**
```python
async def scrape_categoria(client, base, cat_path):
    productos, frm = [], 0
    while frm < 2500:                       # tope duro de VTEX
        url = (f"{base}/api/catalog_system/pub/products/search"
               f"?fq=C:{cat_path}&_from={frm}&_to={frm+49}")
        page = await fetch(client, url)
        if not page:
            break
        productos.extend(page)
        if len(page) < 50:
            break
        frm += 50
    return productos
# Si una categoría devuelve 2500 ítems exactos, baja a subcategorías.
```

**Técnicas agresivas (con trade-offs, NO recomendadas para este caso):** rotación de IPs, proxies residenciales vs datacenter, rotación de User-Agents, headers realistas, manejo de cookies/sesiones, resolución de CAPTCHAs, evasión de Cloudflare/Akamai/PerimeterX(HUMAN)/DataDome. Los anti-bot modernos combinan reputación de IP, fingerprinting TLS (JA3/JA4), fingerprinting de navegador (Canvas, WebGL) y ML conductual; pasar una capa no basta. Estas técnicas tienen riesgo legal (eludir medidas de seguridad puede constituir acceso no autorizado en Chile) y ético. Solo serían relevantes para Líder/Tottus, y aun así conviene un servicio gestionado.

### 3. Consideraciones legales (Chile)
- En Chile el scraping de datos públicos es lícito si no se vulneran medidas de seguridad ni se extraen datos personales protegidos. El marco aplicable es la **Ley 19.628 sobre protección de la vida privada, reformada por la Ley 21.719** ("Regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales"), publicada en el Diario Oficial el **13 de diciembre de 2024 y con plena vigencia el 1 de diciembre de 2026**; crea la Agencia de Protección de Datos Personales (APDP) con multas de hasta 20.000 UTM (o 4% de los ingresos anuales en reincidencia) y notificación de brechas en 72 horas.
- Eludir CAPTCHAs, autenticación o restricciones IP puede considerarse acceso no autorizado (delito informático).
- Romper términos de servicio no es delito penal pero puede generar demandas civiles o bloqueos.
- Datos de productos/precios no son datos personales: bajo riesgo bajo la Ley 21.719. El uso personal/investigación es más defendible que el comercial.
- Imperativo ético: no causar denegación de servicio (DoS). Un snapshot bien throttled es de bajo impacto.

### 4. Arquitectura recomendada (snapshot)

**Stack:** Python 3.12 + httpx (async) + asyncio + aiolimiter (rate limit) + tenacity (reintentos) + pydantic (validación/normalización) + polars/pandas (transformación) + Parquet/JSONL (staging) + PostgreSQL + SQLAlchemy (almacenamiento final).

- httpx/aiohttp asíncrono para las 3 tiendas VTEX (JSON, sin navegador). Eficiente y liviano.
- Scrapy es alternativa válida si se quiere framework con middlewares, AutoThrottle y pipelines integrados.
- Playwright solo para Tottus y Líder (renderizado JS / anti-bot).

**Componentes del pipeline:**
1. **Fetcher/Downloader** asíncrono con rate limiter y backoff.
2. **Discoverer**: recorre árbol de categorías VTEX para generar las URLs paginadas (sorteando el límite de 2.500).
3. **Parser/Normalizador**: mapea el JSON heterogéneo de cada cadena a un esquema común (pydantic).
4. **Staging**: escribe JSONL/Parquet crudo por cadena (resiliencia ante fallos).
5. **Pipeline de carga**: inserta en PostgreSQL.
6. **Logging + reintentos + checkpoint** para reanudar.

**Esquema de almacenamiento — recomendación:**
Para un snapshot, escribir primero a **Parquet/JSONL** (barato, comprimido, columnar) y luego cargar a **PostgreSQL** para consultas relacionales y matching por EAN. MongoDB sería útil solo si se quiere guardar el JSON crudo heterogéneo sin normalizar; para comparación de precios estructurada, PostgreSQL es superior (modelo relacional, joins, integridad). Parquet brilla en compresión y lectura analítica; PostgreSQL en consultas transaccionales y matching.

```sql
CREATE TABLE supermercado (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,          -- 'jumbo', 'santa_isabel', 'unimarc', 'tottus', 'lider'
    plataforma TEXT                -- 'vtex', 'commercetools', 'walmart'
);

CREATE TABLE snapshot (
    id SERIAL PRIMARY KEY,
    fecha_captura TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE producto (
    id BIGSERIAL PRIMARY KEY,
    snapshot_id INT REFERENCES snapshot(id),
    supermercado_id INT REFERENCES supermercado(id),
    sku_tienda TEXT,               -- itemId VTEX
    product_id_tienda TEXT,        -- productId VTEX
    ean TEXT,                      -- clave de matching entre cadenas
    nombre TEXT,
    marca TEXT,
    categoria TEXT,
    url TEXT,
    imagen_url TEXT,
    descripcion TEXT
);

CREATE TABLE precio (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT REFERENCES producto(id),
    precio INT,                    -- CLP sin decimales (Price)
    precio_lista INT,              -- ListPrice
    disponible BOOLEAN,
    stock INT,                     -- AvailableQuantity
    capturado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_producto_ean ON producto(ean);
```
*Nota: los precios en CLP no usan decimales; VTEX/Líder los muestran como enteros (p.ej. $7500.50 se publica como $7500), así que `INT` es correcto.*

**Normalización y matching por EAN:** el EAN/código de barras es la clave universal para comparar el mismo producto entre cadenas. En VTEX viene en `items[].ean`. Como Tottus/Líder no exponen EAN fácilmente, el matching cae a fuzzy matching por nombre+marca+gramaje (menos confiable).

**Flujo de datos (textual):**
`Árbol de categorías → generación de URLs paginadas → fetcher async (rate-limited + backoff) → JSON crudo → staging JSONL/Parquet → normalizador (pydantic → esquema común) → carga PostgreSQL → matching por EAN → tabla unificada de comparación de precios.`

### 5. Herramientas y librerías
- **HTTP/async:** httpx, aiohttp, asyncio.
- **Rate limit/reintentos:** aiolimiter, tenacity, backoff.
- **Parsing:** BeautifulSoup (HTML), json nativo.
- **Renderizado JS:** Playwright (Tottus/Líder).
- **Framework:** Scrapy (con AutoThrottle).
- **Datos:** pandas, polars, pyarrow (Parquet).
- **BD:** SQLAlchemy, psycopg, pymongo (si Mongo).
- **Repos de referencia GitHub:** `maogaz/scrap-chilean-supermarkets` (Scrapy; Líder ✅, Jumbo 🛠, Tottus/Unimarc/Santa Isabel ⛔ según su README), `1bryanvalenzuela/Comparador-Supermercados-Chile` (Jumbo/Santa Isabel/Líder/Unimarc + Power BI), `martjanz/vizcacha` (Scrapy, límites de concurrencia), `OpenDataCordoba/precios_claros` (modelo robusto de scraping de supermercados con control de concurrencia y Scrapy Cloud), `felipe-ssilva/vtex-utils` (endpoints VTEX `catalog_system/pub/products/search`, incl. filtro por EAN `alternateIds_Ean`).
- **Servicios gestionados (alternativa para Líder/Tottus):**
  - **ScraperAPI** — entrada económica: plan Hobby **$49/mes** (o $44/mes anual) con 100.000 créditos API, 20 hilos concurrentes, regiones US/EU; plan gratuito de 1.000 créditos. Bueno para targets moderadamente protegidos.
  - **Zyte / Scrapy Cloud** — nativo Scrapy, AI extraction; desde ~$0,13/1.000 requests HTTP (el rendering encarece).
  - **Bright Data** — mayor red de proxies residenciales (150M+ IPs) y mejor anti-bot, con scrapers pre-construidos para 120+ plataformas; planes de crecimiento desde **$499/mes**, orientado a equipos enterprise.
  - **Apify** — actores pre-construidos (incl. scrapers de supermercados chilenos como Jumbo); desde $29/mes.
  - Pros: manejan proxies/anti-bot. Contras: costo, dependencia, y para un snapshot puntual de tiendas VTEX abiertas son innecesarios.

## Recommendations
1. **Empieza por las 3 tiendas VTEX** (Jumbo, Santa Isabel, Unimarc) usando la Legacy Search API con httpx async, 1-2 req/s, backoff y recorrido por categorías. Es el 80% del valor con el 20% del esfuerzo.
2. **Recorre el árbol de categorías** (`/api/catalog_system/pub/category/tree/3`) para sortear el límite de 2.500 ítems: si una categoría devuelve exactamente 2.500, baja a subcategorías hasta que cada una quede por debajo del tope.
3. **Guarda crudo en JSONL/Parquet** antes de normalizar (resiliencia ante fallos a mitad de corrida). Luego carga a PostgreSQL para el matching por EAN.
4. **Tottus**: intenta primero capturar el JSON de `__NEXT_DATA__` / endpoints XHR internos; si falla, Playwright.
5. **Líder**: déjalo para el final; evalúa un servicio gestionado (ScraperAPI para empezar, Bright Data si el bloqueo Akamai es severo) o Playwright stealth. No inviertas en evasión agresiva si el propósito es investigación.
6. **Umbrales que cambian la estrategia:** si recibes 429/403 sostenidos en tiendas VTEX → baja a 0,5 req/s y añade jitter; si persiste → revisa robots.txt y reduce alcance/horario. Si Unimarc empieza a challenge por Akamai → trátalo como Líder (navegador stealth o servicio gestionado).

## Caveats
- No se pudo verificar en vivo (fetch) los endpoints exactos de jumbo.cl/unimarc.cl; los formatos y nombres de campo están confirmados contra documentación oficial VTEX y la comunidad VTEX, pero conviene un `curl` real para confirmar el prefijo `/api/io/_v/...` y los parámetros de sales channel (`sc=`) o región que cada tienda requiera.
- El segmento `v1` de Intelligent Search es específico de versión/tienda; la Legacy Search API (`catalog_system/pub/products/search`) es más universal y estable para scraping.
- La disponibilidad de stock y precios en VTEX puede depender del sales channel / región (código postal); algunos endpoints requieren simular región para obtener precios correctos.
- El panorama anti-bot evoluciona rápido; lo descrito para Akamai/Líder y SMU/Unimarc es a junio 2026 y puede endurecerse.
- Tottus/Líder pueden cambiar de plataforma; verifica antes de programar. La Ley 21.719 entra en plena vigencia el 1 de diciembre de 2026, por lo que el régimen sancionatorio de la APDP será plenamente exigible a partir de esa fecha — un argumento adicional para limitarse a datos no personales (precios/productos) y respetar las medidas de seguridad.