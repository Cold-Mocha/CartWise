# CartWise

Comparador de precios de supermercados chilenos. CartWise toma un *snapshot* del
catálogo de supermercado de las principales cadenas, lo normaliza a un esquema común,
**compara el precio del mismo producto entre tiendas usando el EAN (código de barras)**
y ofrece una web app donde el usuario arma una compra y descubre dónde comprar más barato.

> **Propósito:** investigación / uso personal y demostración académica (no comercial).
> **Alcance de datos actual = `grocery`:** comida/bebida + limpieza, cuidado personal,
> bebé/pañales, mascotas y hogar consumible. Se excluye vestuario, juguetes/librería,
> electro/hogar durable, farmacia/medicamentos y cigarrillos. El pipeline también soporta
> `food` (solo comida/bebida) y `all` (sin filtro).

Este documento es la **fuente única de contexto** del proyecto (estado, propósito,
arquitectura y funcionamiento). Consolida los antiguos docs de estado y plan.
Se conserva como material fuente sin consolidar: `Scrapper/docs/investigaciones/`
(investigación original de las 6 cadenas y análisis de El Trébol).

---

## 0. Alcance del MVP actual

> Esta sección define **qué es el MVP hoy**. Tiene prioridad sobre cualquier otra
> parte de este documento o del código. Las Partes A (Scrapper) y B (web) describen la
> arquitectura completa; varias capacidades ahí documentadas están **fuera del MVP**.

### Descripción breve

Cartwise es un **MVP académico / no comercial** para comparar precios de productos de
supermercado entre cadenas chilenas usando **datos de catálogo previamente capturados y normalizados**
(no es un sistema de precios en tiempo real).

### Funcionalidades del MVP (activas)

1. **Landing pública** — hero centrado sobre foto con chips (logo + nombre) de las 4
   cadenas cubiertas (solo las integradas; sin "próximamente"), cinta promocional al pie
   del hero, productos con mayor diferencia de precio entre tiendas (solo productos
   presentes en 3+ supermercados; el criterio no se menciona en la UI), sección "cómo
   funciona", historia y testimonios. No hay sección aparte de supermercados: las cadenas
   viven en los chips del hero.
   El badge rojo de descuento aparece solo si la tienda más barata tiene una oferta temporal
   real (`oferta_real` del snapshot). Historia y testimonios son contenido ilustrativo de
   vitrina (no provienen de usuarios reales).
2. **Login demo** — formulario que simula un login normal con credenciales fijas
   (usuario `Test1`, contraseña `12345678`). No hay autenticación real; la UI no
   lo anuncia, pero este README sí: es solo una sesión local de demostración.
3. **Dashboard mensual** — gasto del mes, ahorro estimado y confirmado, historial reciente,
   diferencias destacadas, compra pendiente, despensa y estado del snapshot.
4. **Búsqueda de productos** — catálogo con precio, tienda, categoría y tipo de coincidencia
   (exacta por EAN o comparable genérico).
5. **Compra pendiente** — agregar/quitar productos y cambiar cantidades.
6. **Selección de dónde comprar (comparación)** — matriz de precios con los supermercados
   en columnas: cada producto parte asignado a la opción más barata ("Menor precio") y el
   usuario puede reasignarlo a otra tienda o quitarlo; abajo, total combinado y detalle
   por tienda. "Confirmar plan" crea la compra pendiente directamente.
7. **Resumen de selección (paso final)** — resumen y distribución por tienda de lo
   seleccionado, con botón para compartir el plan (Web Share / portapapeles); cada
   producto indica en qué otras tiendas está disponible por si falta en la tienda elegida.
8. **Compras (pendientes + historial)** — una sola pantalla con dos secciones: arriba las
   compras pendientes por confirmar (repetir, comparar, ver detalle, eliminar) y abajo el
   historial de compras confirmadas. Al confirmar una compra se pregunta cuánto se pagó y
   qué productos se encontraron; solo lo encontrado se registra y la compra pasa al
   historial (tarjetas con fecha, cantidad, miniaturas y total real).
9. **Listas guardadas simples** — guardar una compra para repetirla rápido.
10. **Despensa simulada (almacén del hogar)** — ver, agregar, quitar y ajustar cantidades;
    enviar a despensa los productos de una compra confirmada.

### Supermercados cubiertos

**Activos (integrados al snapshot):** Jumbo · Santa Isabel · Unimarc · El Trébol.

**Próximamente / fuera del MVP:** Tottus · Líder (aún no están en el mart).

### Qué NO hace el MVP

- No tiene OCR funcional de boletas.
- No tiene login ni autenticación real.
- No tiene pagos ni suscripción.
- No muestra precios en tiempo real (son referenciales según el último snapshot).
- No cubre todos los supermercados (solo 4).
- No cubre todas las categorías posibles; el mart activo usa scope `grocery` y excluye
  farmacia/medicamentos, cigarrillos, vestuario, juguetes/librería y hogar durable.
- No recomienda usando IA.
- No tiene predicción de precios.
- No tiene rutas ni mapas.

### Flujo principal del MVP

```text
Landing → Login demo → Dashboard → Buscar productos → Compra pendiente
  → Selección de dónde comprar → Confirmar plan (crea la compra pendiente)
  → Resumen final / compartir → Compras: confirmar compra (qué encontraste
    y cuánto pagaste) → Historial / Despensa
```

### Sobre los datos

Los precios son **referenciales** y dependen del **último snapshot disponible**; la
disponibilidad y los valores pueden cambiar en tienda. No hay scraping desde la UI ni
precios en vivo.

### Requisitos y ejecución rápida (web app)

Requisitos locales:
- Node.js 20.19+ o 22.12+ (el lock actual incluye dependencias con esa restricción).
- Python 3.12+ con `sqlite3` de la librería estándar.
- Mart SQLite disponible en `Scrapper/datos/comparadores/comparador.sqlite`.

El frontend está construido con **Next.js (App Router) + TypeScript + React + Tailwind
CSS + shadcn/ui**. Las route handlers de Next (`app/api/*`) invocan el bridge Python que
lee el mart SQLite, así que no se necesita un servidor Express aparte.

```bash
cd CartWise-Wireframes
npm install
npm run dev     # app Next.js en http://localhost:3000 (incluye la API)
npm run build   # build de producción de Next.js
npm run start   # sirve el build de producción
npm run lint    # ESLint (eslint-config-next)
```

La API usa por defecto `../Scrapper/datos/comparadores/comparador.sqlite`. Para apuntar a
otro mart, define `CARTWISE_DB_PATH` (ver `.env.example`):

```bash
CARTWISE_DB_PATH=/ruta/al/comparador.sqlite npm run dev
```

No se requiere `.env` para el MVP actual. Las variables heredadas de AI Studio
(`GEMINI_API_KEY`, `APP_URL`) ya no participan en el flujo.

### Notas para futuras IAs / desarrolladores

El frontend fue **reconstruido desde cero** en Next.js (junio 2026); el frontend anterior
(Vite + Express + `src/`) fue eliminado. La terminología vigente es: *compra pendiente*
(nunca "canasta activa"), *listas guardadas*, *historial de compras*, *despensa / almacén
del hogar*, *diferencias destacadas* (brecha de precio entre tiendas) y *ofertas
temporales* (solo con señal real de oferta en los datos). Nunca se prometen *precios en
tiempo real*: son referenciales según el último snapshot.

---

## 1. Estructura del repositorio

```text
CartWise/
├── Scrapper/              # Pipeline de datos (Python): scraping + comparador por EAN
│   ├── scripts/           # Scrapers (Trébol/Bootic, VTEX) + scopes food/grocery/all
│   ├── comparadores/      # Construcción del mart unificado (Capa 1 EAN + Capa 2 genérico)
│   ├── validaciones/      # Reportes de calidad de datos
│   ├── datos/             # raw (JSONL) → staging (SQLite/tienda) → comparadores (mart) + snapshots
│   └── docs/investigaciones/   # Investigación original (material fuente, no se borra)
│
└── CartWise-Wireframes/   # Web app (Next.js 16 App Router + TS + Tailwind + shadcn/ui)
    ├── app/                     # Rutas (App Router) + globals.css + layout
    │   ├── page.tsx                 # Landing pública
    │   ├── login/                   # Login demo
    │   ├── (app)/                   # Pantallas autenticadas (guard de sesión demo)
    │   │   ├── dashboard/  productos/  compra-pendiente/
    │   │   ├── comparar/  plan-recomendado/
    │   │   └── compras/  despensa/
    │   └── api/                     # Route handlers → bridge Python (health, deals,
    │                                #   products/search, generic/search, offers, compare)
    ├── components/              # UI por dominio
    │   ├── ui/                      # Primitivos shadcn/ui personalizados
    │   ├── state/                   # Providers por feature (sesión, compra pendiente,
    │   │                            #   comparación, listas, historial, despensa, presupuesto)
    │   ├── product/  comparison/  dashboard/  history/  pantry/  purchase/
    │   └── layout/  landing/  brand/  store/  common/
    ├── hooks/                   # use-persistent-state + flujos multi-feature
    │                            #   (use-plan-workflows, use-list-workflows)
    ├── lib/                     # api.ts, format.ts, storage.ts, constants.ts,
    │   │                        #   basket.ts, text.ts, utils.ts, id.ts
    │   └── server/bridge.ts         # Runner del bridge Python (solo servidor)
    ├── types/cartwise.ts        # Contratos de datos (espejan al bridge)
    └── server/sqlite_bridge.py  # Helper Python que lee comparador.sqlite (conservado)
```

La web consume el mart que produce el Scrapper:
`Scrapper/datos/comparadores/comparador.sqlite`.

Artefactos regenerables / locales:
- `CartWise-Wireframes/.next/` se genera con `npm run build`.
- `CartWise-Wireframes/node_modules/` se genera con `npm install`.
- `CartWise-Wireframes/public/images/products/` contiene miniaturas descargadas por
  `Scrapper/scripts/descargar_imagenes.py`; se ignora en Git por volumen.

---

# PARTE A — Scrapper (pipeline de datos)

## 2. Objetivos y tiendas

| # | Tienda | Dominio | Plataforma | API JSON pública | Dificultad |
|---|--------|---------|-----------|------------------|-----------|
| 1 | **El Trébol** | supertrebol.cl | **Bootic** (bolder.run) — *no Shopify* | ✅ `/products/{slug}.json` + `sitemap.xml` | 🟢 Trivial |
| 2 | **Jumbo** | jumbo.cl | **VTEX** (Cencosud) | ✅ Catalog Search | 🟢 Fácil |
| 3 | **Santa Isabel** | santaisabel.cl | **VTEX** (Cencosud) | ✅ Catalog Search | 🟢 Fácil |
| 4 | **Unimarc** | unimarc.cl | **VTEX** (SMU) | ✅ Catalog Search | 🟡 Media (Akamai) |
| 5 | **Tottus** | tottus.cl | **commercetools** + Next.js (Falabella) | ❌ | 🟠 Difícil |
| 6 | **Líder** | lider.cl | **Walmart propia** | ❌ | 🔴 Muy difícil |

Las 4 primeras exponen el catálogo en JSON público sin auth y concentran el valor.
Tottus y Líder se dejan para el final (mayor riesgo / anti-bot).

## 3. Estado por fases

> **FASE 2 (Tottus) es la siguiente.** Fases 0 y 1 completadas. Scope activo:
> **`grocery` con 70.681 filas staging**. El raw vigente conserva 73.440 productos
> descargados antes del filtro de scope (capturas anteriores archivadas en
> `datos/snapshots/`).

| Fase | Tienda(s) | Estado |
|------|-----------|--------|
| **0** | El Trébol (Bootic) | ✅ **COMPLETADA** — 8.680 prod grocery (98.0% EAN) |
| **1** | Jumbo / Santa Isabel / Unimarc (VTEX) | ✅ **COMPLETADA** — 34.931 / 17.869 / 9.201 prod grocery (≈99% EAN) |
| **2** | Tottus (commercetools/Next.js) | ⚪ **SIGUIENTE** — intentar `__NEXT_DATA__` o Playwright |
| **3** | Líder (Walmart/Akamai) | ⚪ No iniciada — servicio gestionado o Playwright stealth |
| **★** | Matching cross-tienda | ✅ Capa 1 (EAN) + Capa 2 (genérico) construidas |

**Detalle de lo hecho:**
- Snapshots fechados del raw en `datos/snapshots/2026-06-24/` y `datos/snapshots/2026-06-29/`
  (JSONL + BD por nodo). Captura vigente: **2026-07-04** (4 tiendas re-scrapeadas completas;
  `capturado_en` en UTC marca 2026-07-05).
- Staging y mart con scope configurable `food | grocery | all`.
  El mart activo usa `grocery`: incluye limpieza, cuidado personal, bebé/pañales y mascotas;
  excluye farmacia/medicamentos, cigarrillos, vestuario, juguetes/librería y hogar durable.
- Pipeline validado end-to-end en El Trébol antes de escalar a VTEX.
- Comparador grocery: **42.672 productos únicos** (42.161 con EAN), **70.560 ofertas**,
  **2.441 productos en las 4 tiendas**, 18.019 en ≥2. Capa 2: 38.582 genéricos,
  42.592 miembros, 16.234 genéricos en ≥2 tiendas, **8.610 candidatos difusos**.

## 4. Arquitectura del pipeline (3 niveles de datos)

```text
datos/raw/*.jsonl            # JSON crudo descargado (conserva TODO, sin filtrar)
  → datos/staging/*.sqlite   # 1 BD normalizada por tienda (scope aplicado)
  → datos/comparadores/comparador.sqlite   # mart unificado, reconstruible
```

- El filtro de alcance vive en `scripts/comida.py` (autotest: `python3 -m scripts.comida`).
  Se aplica al normalizar; el JSONL crudo conserva todo. Scopes:
  - `food`: comida/bebida, incluido alcohol.
  - `grocery`: `food` + limpieza, cuidado personal, bebé/pañales, mascotas y hogar consumible.
  - `all`: sin filtro.
- Los scrapers son **resumibles** (checkpoint de categorías/productos) y la carga es
  **idempotente** (rehace la BD desde el JSONL).
- Stack: Python 3.12 + httpx async + asyncio + rate limiting + backoff. SQLite local
  (el diseño original contemplaba PostgreSQL; se usa SQLite por simplicidad).

### Acceso a datos por plataforma

**Bootic (El Trébol):** descubrimiento por `sitemap.xml` (~8.900 URLs) +
`/products/{slug}.json` por producto. EAN en `variants[].sku` (~96–100%); usar `price`
(venta vigente), no `sale_price` (viene vacío sin oferta). robots solo prohíbe `/admin`.

**VTEX (Jumbo/Santa Isabel/Unimarc):** ⚠️ la API NO responde en el dominio público
(`www.*.cl` tienen capa de render). Sí responde en el host de cuenta VTEX:
`{cuenta}.vtexcommercestable.com.br` (`jumbocl`, `santaisabel`, `unimarc`). Se usa la
**Legacy Catalog Search API** (`/api/catalog_system/pub/products/search`), recorriendo el
**árbol de categorías** para sortear el tope duro de **2.500 ítems** por búsqueda
(paginación `_from`/`_to`, máx. 50 por página). El filtro de categoría exige la **ruta
completa de ids** (`fq=C:/1/1152/`), no el id suelto. Jerarquía:
`product → items[] (SKUs) → sellers[] → commertialOffer` (typo "commertial" literal).
EAN en `items[].ean`.

> Pendiente técnico: confirmar si los precios VTEX dependen del *sales channel* (`sc=`) /
> región (código postal).

### Mapeo al esquema común (clave de matching = EAN)

| Campo común | VTEX | Bootic (Trébol) |
|---|---|---|
| `ean` | `items[].ean` | `variants[].sku` (si matchea `^\d{8,14}$`) |
| `nombre` | `productName` | `variants[].name` / `name` |
| `marca` | `brand` | `vendor.name` |
| `precio` (vigente) | `sellers[].commertialOffer.Price` | `variants[].price` |
| `precio_lista` | `commertialOffer.ListPrice` | `variants[].regular_price` |
| `disponible` | `commertialOffer.AvailableQuantity > 0` | `variants[].available` |

Precios en **CLP enteros** (sin decimales).

## 5. El comparador (mart) — Capa 1, Capa 2 y candidatos

`comparadores/construir_comparador.py` une las BD por tienda y crea el mart. Principio
central: **el frontend no inventa comparaciones; consume el mart y respeta el nivel de
confianza de cada match.**

| Tipo de match | Fuente | Etiqueta UI | Confianza |
|---|---|---|---|
| **Exacto** | `v_comparacion` + `ean` | "Mismo producto por EAN" | Alta |
| **Genérico** | `v_comparacion_generica` | "Comparable por unidad" | Media-alta |
| **Candidato** | `producto_generico_candidato` | "Sugerencia pendiente" | No automática |

- **Capa 1 (EAN):** une productos por código de barras; una fila por producto único en
  `producto_marca`, con su `oferta` (precio/tienda, prefiere disponible y menor precio).
- **Capa 2 (genérico, `comparadores/capa2.py`):** normaliza texto/marca/categoría, parsea
  contenido (`g`, `kg`, `ml`, `cc`, `L`, `un`, packs como `24 x 330 cc → 7920 ml`) y
  calcula **precio unitario** ($/kg, $/L o $/un según `unidad_base`). Agrupa en
  `producto_generico`. Para packs: `precio` = pack completo; `precio_unitario` = por
  litro/kg; `precio / pack_unidades` = por unidad del pack.
- **Candidatos difusos:** equivalencias posibles **no confirmadas**. No usar en rankings,
  canastas ni recomendaciones hasta que exista una capa de curación.

Tablas/vistas clave: `supermercado`, `producto_marca`, `oferta`, `producto_generico`,
`producto_generico_miembro`, `producto_generico_candidato`, vistas `v_comparacion` y
`v_comparacion_generica`. (`categoria` y `equivalencia` reservadas para curación futura.)

## 6. Cómo ejecutar el pipeline

> Los scrapers los corre la persona usuaria (para ver el progreso en vivo), no el asistente.

```bash
cd /home/delia/Documentos/CartWise/Scrapper

# El Trébol (resumible; ~8.900 prod, 45-60 min)
python3 -m scripts.scraper_trebol --scope grocery --rate 3 --workers 5
python3 -m validaciones.validar_trebol --scope grocery   # reporte de calidad

# VTEX (resumible; en segundo plano para que no se corte)
nohup python3 -m scripts.scraper_vtex --store jumbo --scope grocery --rate 3 > datos/logs/scrape_jumbo.log 2>&1 &
#   cambiar --store por santaisabel / unimarc

# Solo recargar SQLite desde lo ya descargado (sin volver a bajar):
python3 -m scripts.scraper_trebol --load-only --scope grocery
python3 -m scripts.scraper_vtex --store jumbo --load-only --scope grocery
python3 -m scripts.scraper_vtex --store santaisabel --load-only --scope grocery
python3 -m scripts.scraper_vtex --store unimarc --load-only --scope grocery

# Autotests de filtro y Capa 2:
python3 -m scripts.comida
python3 -m comparadores.capa2

# Reconstruir el mart (idempotente):
python3 -m comparadores.construir_comparador --scope grocery
```

### Estado validado del pipeline (2026-07-04)

Última reconstrucción local: re-scrape completo de las 4 tiendas (2026-07-04) →
staging `grocery` → `comparador.sqlite` con `metadata.scope = grocery`. Métricas
completas en `Scrapper/datos/comparadores/metricas_grocery.json`. Nota: El Trébol
devolvió exactamente el mismo catálogo que el 2026-06-24 (0 cambios de precio);
las cadenas VTEX sí cambiaron (Jumbo 5,3%, Santa Isabel 2,7%, Unimarc 13,2% de
precios distintos vs. la captura anterior).

| Tienda | Filas staging | Con EAN | Disponibles | Ofertas en mart |
|---|---:|---:|---:|---:|
| El Trébol | 8.680 | 8.510 | 3.877 | 8.680 |
| Jumbo | 34.931 | 34.795 | 19.473 | 34.842 |
| Santa Isabel | 17.869 | 17.752 | 17.858 | 17.837 |
| Unimarc | 9.201 | 9.113 | 8.492 | 9.201 |

Resumen del mart:
- `producto_marca`: 42.672 productos únicos; 42.161 con EAN y 511 sin EAN.
- `oferta`: 70.560 filas producto×tienda.
- Comparables exactos por EAN en ≥2 tiendas: 18.019; en las 4 tiendas: 2.441.
- Capa 2: 38.582 genéricos, 42.592 miembros, 16.234 genéricos en ≥2 tiendas y
  8.610 candidatos difusos.
- Productos con marca: 42.658; con imagen: 42.669; con link: 42.672.
- Productos con precio lista: 42.670; productos con oferta real: 7.780.
- Ofertas con precio lista: 70.558; ofertas marcadas como oferta real: 10.395.
- `PRAGMA integrity_check`: `ok`.

Conteo por tipo (`producto_marca`):

| Tipo | Productos |
|---|---:|
| food_bebida | 30.778 |
| cuidado_personal | 7.129 |
| limpieza_hogar | 2.958 |
| bebé | 979 |
| mascotas | 757 |
| hogar_consumible | 60 |

Top categorías por tienda con scope `grocery`:

| Tienda | Categorías principales |
|---|---|
| El Trébol | Vinos Tintos 294 · Galletas Dulces 253 · Chocolates 170 · Yogurt 155 · Shampoo 153 |
| Jumbo | Vinos Tintos 1.114 · Shampoo 659 · Cervezas Tradicionales 414 · Cepillos de Pelo y Accesorios 410 · Cervezas Artesanales 367 |
| Santa Isabel | Vinos Tintos 855 · Shampoo 348 · Cervezas Tradicionales 245 · Vinos Blancos 207 · Coloración y Tintura de Pelo 199 |
| Unimarc | Vinos Tintos 253 · Shampoo 166 · Chocolates 96 · Condimentos 88 · Galletas Dulces 86 |

Inspección rápida si tienes instalado `sqlite3`:
```bash
sqlite3 datos/staging/trebol.sqlite "SELECT COUNT(*), COUNT(ean) FROM producto;"
sqlite3 datos/comparadores/comparador.sqlite \
  "SELECT nombre_generico, n_tiendas, ROUND(precio_unitario_min), ROUND(precio_unitario_max) \
   FROM v_comparacion_generica WHERE n_tiendas=4 ORDER BY diferencia_unitaria DESC LIMIT 10;"
```

Fallback sin CLI de SQLite:

```bash
python3 - <<'PY'
import sqlite3

con = sqlite3.connect("datos/comparadores/comparador.sqlite")
for nombre, total in con.execute("SELECT nombre, COUNT(*) FROM supermercado GROUP BY nombre"):
    print(nombre, total)
con.close()
PY
```

---

# PARTE B — Web app (CartWise-Wireframes)

## 7. Tesis de producto

Cartwise no vende una verdad absoluta; comunica una **decisión de compra asistida por
datos de snapshot**. Su valor central es la **confianza / explicabilidad** de la
recomendación y la distinción nítida entre **producto exacto por EAN** y **comparable
genérico por unidad**.

**Principios de diseño:**
1. Ningún total oculta lo que no incluye (productos sin precio, agotados, genéricos visibles).
2. Toda recomendación es explicable (cobertura + total + qué se comparó).
3. Exacto ≠ comparable, y no solo por color (texto + semántica).
4. El dato tiene fecha (se comunica el snapshot).
5. Accesible por defecto (WCAG 2.1 AA) como parte del MVP, no pulido posterior.

## 8. Arquitectura de la web

```text
Next.js (App Router, puerto 3000)
  → route handlers app/api/*  →  lib/server/bridge.ts (spawn python3)
  → server/sqlite_bridge.py (sqlite3 stdlib, modo solo lectura)
  → Scrapper/datos/comparadores/comparador.sqlite
```

- Stack: **Next.js 16 + TypeScript + React 19 + Tailwind CSS v4 + shadcn/ui**.
- La **API vive dentro de Next**: las route handlers de `app/api/*` invocan el mismo bridge
  Python de siempre. No hay servidor Express; la lógica de comparación sigue intacta en el
  bridge (`compare_basket`), el frontend no la reimplementa.
- Login **demo**: no hay autenticación real, aunque la UI lo presenta como un login normal
  ("Iniciar sesión"). El formulario de `/login` valida credenciales fijas (`DEMO_CREDENTIALS`
  en `lib/constants.ts`, usuario `Test1` / contraseña `12345678`, usuario case-insensitive)
  y marca una bandera en `localStorage`. Sesión, compra pendiente, historial, listas y
  despensa viven en `localStorage` (no hay backend de usuarios).
- Tiendas disponibles = las 4 del mart: El Trébol, Jumbo, Santa Isabel, Unimarc.

### Arquitectura interna del frontend

- **Rutas** en `app/`: landing (`/`), login (`/login`), guía de estilo interna (`/style`,
  referencia de diseño para desarrollo; no se enlaza desde la navegación) y grupo autenticado
  `(app)/` con las pantallas MVP. El grupo usa `AppShell`, que aplica el guard de sesión demo, el header con
  navegación y el footer de transparencia.
- **Estado** dividido en providers por feature en `components/state/` (sesión demo, compra
  pendiente, comparación, listas guardadas, compras pendientes/historial, despensa y presupuesto),
  compuestos en `app-providers.tsx`. Cada provider hidrata su porción de `localStorage` tras
  montar (patrón SSR-safe vía `hooks/use-persistent-state.ts`, sin mismatch). Los providers no
  se conocen entre sí: los flujos que cruzan features (crear/confirmar un plan, comparar o
  repetir una lista) viven en `hooks/use-plan-workflows.ts` y `hooks/use-list-workflows.ts`.
- **Datos**: los componentes no hacen `fetch` directo; pasan por `lib/api.ts`. Los tipos en
  `types/cartwise.ts` espejan la salida del bridge.
- **UI**: primitivos shadcn/ui personalizados en `components/ui/` (button, card, badge,
  input, dialog, sheet, tabs, select, dropdown-menu, progress, separator, skeleton, table,
  carousel basado en Embla, toaster Sonner) con un sistema visual blanco/verde definido en
  `app/globals.css` (tokens Tailwind v4 + `@theme`).

**Scripts:**
```bash
cd /home/delia/Documentos/CartWise/CartWise-Wireframes
npm install
npm run dev     # app Next.js (front + API) en http://localhost:3000
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # ESLint (eslint-config-next)
```

Variables útiles para desarrollo (ver `.env.example`):
- `CARTWISE_DB_PATH`: ruta a otro `comparador.sqlite` (default
  `../Scrapper/datos/comparadores/comparador.sqlite`).
- `CARTWISE_PYTHON`: binario de Python para el bridge (default `python3`).

> **Nota:** este `README.md` raíz es la referencia válida del proyecto. Si aparece
> documentación interna generada por herramientas en `CartWise-Wireframes/`, debe tratarse
> como secundaria frente a este documento.

## 9. API (endpoints)

| Endpoint | Uso |
|---|---|
| `GET /api/health` | Verifica el mart y devuelve conteos / tiendas. |
| `GET /api/deals/top?limit=8` | Productos con mayor diferencia por EAN. |
| `GET /api/deals/strong?limit=400` | Diferencias destacadas (≥20%); incluye `n_tiendas` y `oferta_real`/`precio_lista` de la tienda más barata. |
| `GET /api/products/search?q=` | Búsqueda exacta por producto / EAN / marca (Capa 1). |
| `GET /api/generic/search?q=` | Búsqueda de comparables genéricos (Capa 2). |
| `GET /api/products/:id/offers` | Ofertas por tienda de un producto exacto. |
| `POST /api/basket/compare` | Compara la compra pendiente contra las tiendas disponibles. |

**Reglas de comparación:** Capa 1 (EAN) como match principal, Capa 2 (genérico) como
fallback. Productos sin precio en una tienda → "Sin precio", no bloquean el cálculo. En la
matriz de selección cada producto parte asignado a la **tienda más barata disponible**; el
usuario puede reasignarlo o quitarlo, y el plan resultante agrupa por tienda con subtotales
y total combinado (la asignación vive en `lib/comparison-plan.ts` y se comparte entre
/comparar y /plan-recomendado vía `ComparisonProvider`).

## 10. Pantallas y flujo

Pantallas del MVP (10): **Landing pública** · **Login demo** · **Dashboard mensual** ·
**Catálogo / búsqueda de productos** · **Compra pendiente** · **Selección de dónde comprar
(comparación)** · **Resumen de selección (paso final)** · **Compras (pendientes +
historial)** · **Listas guardadas** · **Despensa / almacén del hogar**.

> No hay perfil, login real, pagos, OCR ni precios en tiempo real (ver §0). El menú solo
> contiene pantallas MVP; *comparar* (selección) y *plan-recomendado* (resumen final) son
> pasos del flujo de compra.

Navegación: todo vive en el header, sin menú lateral (íconos siempre visibles, etiquetas
desde `lg`); la compra pendiente tiene su propio botón con contador.

```text
landing → login demo (credenciales fijas) → dashboard → buscar producto → agregar a compra pendiente
  → seleccionar dónde comprar cada producto → confirmar plan (queda pendiente de confirmar)
  → resumen final / compartir → Compras: confirmar (qué encontraste, cuánto pagaste)
  → historial / despensa actualizados
```

## 11. Estado UX (histórico del frontend anterior)

> **Nota:** esta sección documenta el backlog UX del frontend **anterior** (Vite/React),
> que fue **eliminado** al reconstruir la web desde cero en Next.js + shadcn/ui. Se conserva
> como referencia de principios; los nombres de archivo/colores ya no corresponden al código
> actual.

El backlog UX priorizado (`PLAN_UX_UNIFICADO` §13, refundido de los diagnósticos
`UX_REVIEW` + `UX_FLUJOS` + un track de accesibilidad) estuvo **completo: 38/38 ítems**
(Sprint 0 P0: 10/10 · Sprint 1 P1: 20/20 · Sprint 2 P2: 8/8).

> "Hecho" = la regla o componente existe y está cableado en el código. Es una revisión
> **estática**, no una verificación en runtime.

**Lo que queda (no es código):**
- Verificar **reflow 200% / 320px** en el grid de tiendas y la tabla de historial.
- Reauditar contrastes con ratios medidos tras los cambios de color (`#0A5F5E`, `#C44410`).
- **Prueba real con lector de pantalla + teclado end-to-end** de los flujos A/B/C
  (las regiones `aria-live`, gestión de foco y `spinbutton` existen pero no se validaron con AT).

**No-objetivos del MVP (fuera de alcance por diseño, no son deuda):** OCR de boletas;
autenticación real; >4 tiendas / base nacional / multi-zona; persistencia de
canastas/planes en backend; vistas de detalle por producto con historial de precios.

---

## 12. Roadmap / pendientes (ambos lados)

**Scrapper:**
1. **Curar los 8.607 candidatos difusos** de Capa 2 antes de usarlos como sustituciones fuertes.
2. **Fase 2 — Tottus** (commercetools/Next.js): `__NEXT_DATA__` o Playwright.
3. **Fase 3 — Líder** (Walmart/Akamai): servicio gestionado o Playwright stealth.
4. Confirmar dependencia de precios VTEX respecto a *sales channel* / región.

**Web:**
1. Verificación de accesibilidad real (lector de pantalla, teclado, reflow 200%/320px) en
   el frontend reconstruido en Next.js. Las bases (foco visible, roles, `aria-label`,
   estados vacíos) están, pero no se validó con tecnología asistiva.
2. Animaciones de entrada/salida de Dialog/Sheet (sin `tw-animate-css`) y pruebas E2E del
   flujo demo en navegador real.
3. Fases futuras (post-MVP): auth real, persistencia en backend, curación de candidatos
   en UI, sumar Tottus/Líder cuando el scraper los tenga, detalle por producto con histórico.

## 13. Marco legal y ético (Chile)

Scraping de **datos públicos no personales** (productos/precios), **lícito** sin vulnerar
medidas de seguridad ni extraer datos personales. Se respeta `robots.txt`, UA honesto,
1–2 req/s con backoff, una sola pasada (snapshot), horario de bajo tráfico. **No** se
evade CAPTCHA/auth/restricciones IP (acceso no autorizado puede ser delito → razón para no
atacar agresivamente Líder/Tottus). Ley 19.628 reformada por Ley 21.719 (protección de
datos personales): plena vigencia el **1-dic-2026**.
