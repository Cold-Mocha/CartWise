# CartWise

Comparador de precios de supermercados chilenos. CartWise toma un *snapshot* del
catálogo de comida de las principales cadenas, lo normaliza a un esquema común,
**compara el precio del mismo producto entre tiendas usando el EAN (código de barras)**
y ofrece una web app donde el usuario arma una compra y descubre dónde comprar más barato.

> **Propósito:** investigación / uso personal y demostración académica (no comercial).
> **Alcance de datos = SOLO COMIDA:** comestible o bebible (incluido alcohol). Se excluye
> limpieza, cuidado personal, mascotas, bebé/pañales, hogar, belleza, farmacia, cigarrillos
> y vestuario.

Este documento es la **fuente única de contexto** del proyecto (estado, propósito,
arquitectura, funcionamiento y wireframes). Consolida los antiguos docs de estado y plan.
Se conserva como material fuente sin consolidar: `Scrapper/docs/investigaciones/`
(investigación original de las 6 cadenas y análisis de El Trébol).

---

## 0. Alcance del MVP actual

> Esta sección define **qué es el MVP hoy**. Tiene prioridad sobre cualquier otra
> parte de este documento o del código. Las Partes A (Scrapper) y B (web) describen la
> arquitectura completa; varias capacidades ahí documentadas están **fuera del MVP**.

### Descripción breve

Cartwise es un **MVP académico / no comercial** para comparar precios de alimentos entre
supermercados chilenos usando **datos de catálogo previamente capturados y normalizados**
(no es un sistema de precios en tiempo real).

### Funcionalidades del MVP (activas)

1. **Landing pública** — explica Cartwise, muestra supermercados cubiertos y un carrusel de
   oportunidades destacadas (diferencias de precio entre tiendas).
2. **Login demo** — entrada simple al prototipo, sin autenticación real.
3. **Dashboard mensual** — gasto del mes, ahorro estimado y confirmado, historial reciente,
   diferencias destacadas, compra pendiente, despensa y estado del snapshot.
4. **Búsqueda de productos** — catálogo con precio, tienda, categoría y tipo de coincidencia
   (exacta por EAN o comparable genérico).
5. **Compra pendiente** — agregar/quitar productos y cambiar cantidades.
6. **Comparación entre supermercados** — total por tienda, faltantes y cobertura.
7. **Plan recomendado** — recomienda priorizando cobertura y luego precio.
8. **Historial de compras** — compras confirmadas y planes guardados; repetir compra.
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
- No cubre todas las categorías (solo comida y bebida).
- No recomienda usando IA.
- No tiene predicción de precios.
- No tiene rutas ni mapas.

### Flujo principal del MVP

```text
Landing → Login demo → Dashboard → Buscar productos → Compra pendiente
  → Comparación → Plan recomendado → Confirmar/guardar compra → Historial / Despensa
```

### Sobre los datos

Los precios son **referenciales** y dependen del **último snapshot disponible**; la
disponibilidad y los valores pueden cambiar en tienda. No hay scraping desde la UI ni
precios en vivo.

### Ejecución (web app)

```bash
cd CartWise-Wireframes
npm install
npm run dev:full   # front (3000) + API (3001) juntos
npm run build      # build del frontend
npm run lint       # tsc --noEmit
```

### Notas para futuras IAs / desarrolladores

Los archivos marcados con `@deprecated` (p. ej. `src/features/profile/*`,
`src/components/screens/*`, `src/components/DesignCanvas.tsx`,
`src/components/WireframeComponents.tsx`) están **fuera del MVP**: se conservan como
referencia y **no deben reactivarse** sin actualizar primero este alcance del MVP y el
resto del README. La terminología vigente es: *compra pendiente*, *listas guardadas*,
*historial de compras*, *despensa / almacén del hogar*, *diferencias destacadas* y
*ofertas temporales* (solo con señal real de oferta en los datos).

---

## 1. Estructura del repositorio

```text
CartWise/
├── Scrapper/              # Pipeline de datos (Python): scraping + comparador por EAN
│   ├── scripts/           # Scrapers (Trébol/Bootic, VTEX) + filtro de comida
│   ├── comparadores/      # Construcción del mart unificado (Capa 1 EAN + Capa 2 genérico)
│   ├── validaciones/      # Reportes de calidad de datos
│   ├── datos/             # raw (JSONL) → staging (SQLite/tienda) → comparadores (mart) + snapshots
│   └── docs/investigaciones/   # Investigación original (material fuente, no se borra)
│
└── CartWise-Wireframes/   # Web app (React 19 + Vite + Express + bridge Python)
    ├── src/web/                 # Shell web + composición principal
    ├── src/domain/              # Tipos y constantes de dominio
    ├── src/services/            # API Cartwise + persistencia local
    ├── src/hooks/               # Flujos de estado por proceso
    ├── src/features/            # Pantallas/componentes por dominio funcional
    ├── src/components/ui/       # UI reutilizable compartida
    ├── src/components/screens/  # Prototipo móvil — SOLO referencia de diseño, no se enruta
    ├── src/lib/                 # Helpers puros
    ├── src/index.css            # Estilos globales
    ├── server/index.ts          # API Express (puerto 3001)
    └── server/sqlite_bridge.py  # Helper Python que lee comparador.sqlite
```

La web consume el mart que produce el Scrapper:
`Scrapper/datos/comparadores/comparador.sqlite`.

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

> **FASE 2 (Tottus) es la siguiente.** Fases 0 y 1 completadas. Total capturado:
> **4 de 6 tiendas, ~50.832 productos de comida.**

| Fase | Tienda(s) | Estado |
|------|-----------|--------|
| **0** | El Trébol (Bootic) | ✅ **COMPLETADA** — 6.681 prod comida (97.5% EAN) |
| **1** | Jumbo / Santa Isabel / Unimarc (VTEX) | ✅ **COMPLETADA** — 24.355 / 12.818 / 6.978 prod (≈99% EAN) |
| **2** | Tottus (commercetools/Next.js) | ⚪ **SIGUIENTE** — intentar `__NEXT_DATA__` o Playwright |
| **3** | Líder (Walmart/Akamai) | ⚪ No iniciada — servicio gestionado o Playwright stealth |
| **★** | Matching cross-tienda | ✅ Capa 1 (EAN) + Capa 2 (genérico) construidas |

**Detalle de lo hecho:**
- Snapshot fechado del raw en `datos/snapshots/2026-06-24/` (JSONL + BD por nodo, 681 MB).
- Pipeline validado end-to-end en El Trébol antes de escalar a VTEX.
- Comparador: **30.301 productos únicos** (29.797 con EAN), **50.768 ofertas**,
  **1.906 productos en las 4 tiendas**, 13.156 en ≥2. Capa 2: 26.368 genéricos,
  29.908 miembros, 11.581 genéricos en ≥2 tiendas, **5.269 candidatos difusos**.

## 4. Arquitectura del pipeline (3 niveles de datos)

```text
datos/raw/*.jsonl            # JSON crudo descargado (conserva TODO, sin filtrar)
  → datos/staging/*.sqlite   # 1 BD normalizada por tienda (filtro COMIDA aplicado)
  → datos/comparadores/comparador.sqlite   # mart unificado, reconstruible
```

- El filtro de comida vive en `scripts/comida.py` (autotest: `python3 -m scripts.comida`).
  Se aplica al normalizar; el JSONL crudo conserva todo. Flag `--all` lo desactiva.
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
python3 -m scripts.scraper_trebol --rate 3 --workers 5
python3 -m validaciones.validar_trebol           # reporte de calidad

# VTEX (resumible; en segundo plano para que no se corte)
nohup python3 -m scripts.scraper_vtex --store jumbo --rate 3 > datos/logs/scrape_jumbo.log 2>&1 &
#   cambiar --store por santaisabel / unimarc

# Solo recargar SQLite desde lo ya descargado (sin volver a bajar):
python3 -m scripts.scraper_vtex --store jumbo --load-only

# Reconstruir el mart (idempotente):
python3 -m comparadores.construir_comparador
```

Inspección rápida:
```bash
sqlite3 datos/staging/trebol.sqlite "SELECT COUNT(*), COUNT(ean) FROM producto;"
sqlite3 datos/comparadores/comparador.sqlite \
  "SELECT nombre_generico, n_tiendas, ROUND(precio_unitario_min), ROUND(precio_unitario_max) \
   FROM v_comparacion_generica WHERE n_tiendas=4 ORDER BY diferencia_unitaria DESC LIMIT 10;"
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
Frontend React/Vite (puerto 3000)
  → proxy /api → API Express (puerto 3001)
  → server/sqlite_bridge.py (sqlite3 stdlib, modo solo lectura)
  → Scrapper/datos/comparadores/comparador.sqlite
```

- **Una sola experiencia** se renderiza en `/`: la web app de escritorio/responsive
  (`src/web/WebApp.tsx`). El prototipo móvil (`DesignCanvas` + `components/screens/*`) se
  conserva **solo como referencia de diseño**: no se enruta ni se grafica (ver §11).
- Login **demo local**: `test@gmail.com` / `pass123`. Sesión, compra pendiente, historial,
  listas y despensa en `localStorage` (no hay backend de persistencia).
- Tiendas disponibles = las 4 del mart: El Trébol, Jumbo, Santa Isabel, Unimarc.

### Arquitectura interna del frontend

El frontend fue ordenado para que `src/web/WebApp.tsx` actúe como composición general
de la app y no como contenedor de toda la lógica. `WebApp.tsx` inicializa hooks, carga
estado base, maneja la vista actual y renderiza la pantalla correspondiente dentro de
`WebShell`.

```text
src/web/
  WebApp.tsx          # Composición: auth, hooks principales, routing de vistas
  WebShell.tsx        # Layout web, navegación desktop/móvil y región de toast

src/domain/
  types.ts            # View, SearchItem, BasketItem, BasketComparison, SavedPlan, Account...
  constants.ts        # Credenciales demo, claves localStorage, snapshot, comunas, tabs, etc.

src/lib/
  api.ts              # Wrapper fetch genérico
  basket.ts           # Helpers puros de canasta/firma/comparable genérico
  format.ts           # money, plural, fechas de mes
  storage.ts          # JSON helpers para localStorage
  validation.ts       # Validación de cuenta/perfil

src/services/
  cartwiseApi.ts          # Endpoints /api/* centralizados
  localStorageService.ts  # Lectura/escritura local centralizada

src/hooks/
  useDemoAuth.ts
  useToast.ts
  useBasket.ts
  useComparison.ts
  useHistory.ts
  useAccount.ts
  useSavedLists.ts
  usePantry.ts
  useDashboardMetrics.ts

src/features/
  dashboard/      # Dashboard, presupuesto y gráficos
  products/       # Búsqueda, filtros, tarjetas e imagen de producto
  basket/         # Armado de plan/canasta
  comparison/     # Resultado por supermercado
  history/        # Historial, detalle y confirmación de compra
  lists/          # Listas guardadas
  pantry/         # Almacén/despensa
  profile/        # Perfil demo — @deprecated, FUERA del MVP (no se enruta)
  public/         # Landing pública y login

src/components/ui/
  Hero, MetricCard, PanelHeader, EmptyState, Modal, Toast, Badge, Button
```

Reglas actuales de organización:
- Los componentes y pantallas no conocen detalles de endpoints; llaman a `services/cartwiseApi.ts`.
- El acceso a `localStorage` está encapsulado en `services/localStorageService.ts`.
- Los helpers que no renderizan interfaz viven en `src/lib/`.
- Las reglas de comparación de negocio siguen en el backend/mart y en el endpoint existente
  `POST /api/basket/compare`; el frontend no inventa matches nuevos.
- `src/components/screens/*` se conserva como referencia visual histórica y no se elimina.

**Scripts:**
```bash
cd /home/delia/Documentos/CartWise/CartWise-Wireframes
npm install
npm run dev:full   # front (3000) + API (3001) juntos
npm run build      # build del frontend
npm run start      # API Express; sirve dist/ si existe
npm run lint       # tsc --noEmit
```

> **Nota:** este `README.md` raíz es la referencia válida del proyecto. Si aparece
> documentación interna generada por herramientas en `CartWise-Wireframes/`, debe tratarse
> como secundaria frente a este documento.

## 9. API (endpoints)

| Endpoint | Uso |
|---|---|
| `GET /api/health` | Verifica el mart y devuelve conteos / tiendas. |
| `GET /api/deals/top?limit=8` | Productos con mayor diferencia por EAN. |
| `GET /api/products/search?q=` | Búsqueda exacta por producto / EAN / marca (Capa 1). |
| `GET /api/generic/search?q=` | Búsqueda de comparables genéricos (Capa 2). |
| `GET /api/products/:id/offers` | Ofertas por tienda de un producto exacto. |
| `POST /api/basket/compare` | Compara una canasta contra las tiendas disponibles. |

**Reglas de comparación:** Capa 1 (EAN) como match principal, Capa 2 (genérico) como
fallback. Productos sin precio en una tienda → "Sin precio", no bloquean el cálculo. La
tienda recomendada prioriza **menor cantidad de productos sin precio** y luego **menor
total**. El ahorro se calcula *like-for-like* (solo entre tiendas con la misma cobertura
que la recomendada).

## 10. Pantallas y flujo

Pantallas del MVP: Login demo · Dashboard (métricas reales del mart) · Buscar productos ·
Compra pendiente · Resultado de comparación por supermercado · Historial local ·
Listas guardadas · Almacén/despensa.

> El Perfil queda **fuera del MVP** (`src/features/profile/*`, `@deprecated`): no aparece
> en el menú ni se enruta.

Navegación: sidebar fija en desktop, bottom nav en móvil/tablet.

```text
login → dashboard → buscar producto → agregar a compra pendiente
  → comparar supermercados → plan recomendado → guardar/confirmar → historial / despensa
```

## 11. Estado UX (revisión estática de código)

El backlog UX priorizado (`PLAN_UX_UNIFICADO` §13, refundido de los diagnósticos
`UX_REVIEW` + `UX_FLUJOS` + un track de accesibilidad) está **completo: 38/38 ítems**
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

**Prototipo móvil (`src/App.tsx` + `components/screens/*`):** flujo navegable con datos
mock (landing → registro → onboarding → home → plan → boleta → comparación →
verificación → historial → perfil). **Desechado como implementación**, se conserva solo
como referencia conceptual de negocio. No se enruta ni se renderiza en `/`.

---

## 12. Roadmap / pendientes (ambos lados)

**Scrapper:**
1. **Curar los 5.269 candidatos difusos** de Capa 2 antes de usarlos como sustituciones fuertes.
2. **Fase 2 — Tottus** (commercetools/Next.js): `__NEXT_DATA__` o Playwright.
3. **Fase 3 — Líder** (Walmart/Akamai): servicio gestionado o Playwright stealth.
4. Confirmar dependencia de precios VTEX respecto a *sales channel* / región.

**Web:**
1. Verificación de accesibilidad real (lector de pantalla, teclado, reflow) — ver §11.
2. Seguir reduciendo componentes grandes de feature, especialmente `ProfileView.tsx`,
   si se requiere más granularidad.
3. Fases futuras (post-MVP): auth real, persistencia en backend, curación de candidatos
   en UI, sumar Tottus/Líder cuando el scraper los tenga, detalle por producto con histórico.

## 13. Marco legal y ético (Chile)

Scraping de **datos públicos no personales** (productos/precios), **lícito** sin vulnerar
medidas de seguridad ni extraer datos personales. Se respeta `robots.txt`, UA honesto,
1–2 req/s con backoff, una sola pasada (snapshot), horario de bajo tráfico. **No** se
evade CAPTCHA/auth/restricciones IP (acceso no autorizado puede ser delito → razón para no
atacar agresivamente Líder/Tottus). Ley 19.628 reformada por Ley 21.719 (protección de
datos personales): plena vigencia el **1-dic-2026**.
