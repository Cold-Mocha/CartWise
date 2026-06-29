# Cartwise — Plan integral de flujos, interfaces y funcionalidades web

## 0. Propósito del documento

Este documento consolida las decisiones de producto, flujos principales e interfaces necesarias para evolucionar el PMV web de **Cartwise**. Está escrito para que un agente de desarrollo pueda leerlo antes de intervenir el código y tenga una interpretación clara de qué debe construir, qué debe conservar y qué no debe prometer.

El objetivo no es reescribir todo el proyecto. El objetivo es ordenar la experiencia web actual, reforzar la landing pública, rediseñar la dashboard como centro operativo mensual y añadir nuevas funcionalidades coherentes con el concepto de Cartwise.

---

## 1. Contexto actual del proyecto

Cartwise es una web app académica/no comercial orientada a comparar precios de supermercados chilenos. El estado actual del proyecto se entiende así:

- El repositorio tiene dos grandes áreas:
  - `Scrapper/`: pipeline Python para captura, normalización y consolidación de datos de supermercados.
  - `CartWise-Wireframes/`: aplicación web React/Vite con API Express y puente Python para consultar SQLite.

- La base de datos principal de comparación está en:
  - `Scrapper/datos/comparadores/comparador.sqlite`

- La app web consume datos del comparador mediante endpoints Express.

- El flujo real actual no es OCR de boletas. El flujo actual es:

```text
Buscar producto → agregar a compra/lista → comparar supermercados → recomendar tienda → guardar plan/historial
```

- Supermercados cubiertos actualmente:
  - Jumbo
  - Santa Isabel
  - Unimarc
  - El Trébol

- Tottus y Líder no deben presentarse como supermercados cubiertos si todavía no están integrados.

- El proyecto debe comunicar siempre que los precios son referenciales según el último snapshot disponible.

- La comparación debe diferenciar:
  - Coincidencia exacta por EAN/código de barras.
  - Coincidencia genérica comparable.
  - Candidatos difusos no curados, que no deben usarse automáticamente para recomendar.

---

## 2. Cambio de lenguaje de producto

No usar el término **“canasta activa”**.

Ese concepto no convence porque sugiere que el usuario siempre mantiene una canasta permanente en uso. En Cartwise es más claro hablar de compras, listas, planes y almacén.

### 2.1 Términos recomendados

| Concepto | Uso correcto |
|---|---|
| Compra pendiente | Productos que el usuario está preparando para comparar o comprar ahora. |
| Compra en preparación | Alternativa textual para compra pendiente. |
| Lista pendiente | Alternativa más simple, si se quiere lenguaje menos comercial. |
| Listas guardadas | Compras frecuentes reutilizables, por ejemplo “Compra mensual” o “Desayuno semanal”. |
| Plan recomendado | Resultado de comparar una compra pendiente entre supermercados. |
| Plan pendiente | Plan ya generado, pero aún no confirmado como compra realizada. |
| Compra confirmada | Compra que el usuario marcó como realizada. |
| Historial de compras | Registro de compras confirmadas y planes pasados. |
| Almacén del hogar | Productos que el usuario declara tener disponibles en casa. |

### 2.2 Términos a evitar

| Término a evitar | Motivo |
|---|---|
| Canasta activa | Poco claro, suena permanente. |
| Mi canasta | Puede confundirse con canasta habitual o lista guardada. |
| Canasta actual | No describe bien el estado del flujo. |
| Oferta destacada para todo | No toda diferencia de precio es una oferta. |

---

## 3. Diferencia conceptual: ofertas vs diferencias destacadas

Esta separación debe respetarse en interfaz, datos y textos.

### 3.1 Diferencias destacadas

Una diferencia destacada es una brecha relevante de precio entre supermercados para un producto o producto comparable.

Ejemplo:

```text
Aceite vegetal 1L
Unimarc: $2.390
Jumbo: $3.190
Diferencia: $800
```

No necesariamente hay promoción. Puede ser simplemente una diferencia normal de precios entre tiendas.

### 3.2 Ofertas temporales

Una oferta es una promoción temporal o precio marcado como oferta por la tienda o detectado como tal en los datos.

Ejemplo:

```text
Leche 1L
Santa Isabel
Antes: $1.290
Ahora: $990
Oferta detectada en el último snapshot
```

### 3.3 Regla importante

No llamar “oferta” a una diferencia de precio si la base de datos no tiene marca de oferta o señal promocional. En ese caso debe mostrarse como **diferencia destacada**.

---

## 4. Flujos principales de la app web

## 4.1 Flujo público antes del login

Objetivo: mostrar valor antes de que el usuario entre a la app.

```text
Landing pública
→ Hero principal
→ Logos de supermercados cubiertos
→ Carrusel de oportunidades destacadas
→ Cómo funciona
→ CTA para entrar como demo o iniciar sesión
```

### Pantallas/secciones involucradas

- Landing pública.
- Sección de supermercados cubiertos.
- Carrusel de oportunidades.
- Login o entrada demo.

### Criterio de éxito

El usuario debe entender en menos de 10 segundos:

1. Qué hace Cartwise.
2. Qué supermercados cubre.
3. Qué tipo de ahorro puede encontrar.
4. Que puede probar la app como demo.

---

## 4.2 Flujo de búsqueda y creación de compra pendiente

```text
Dashboard o landing interna
→ Buscar producto
→ Ver resultados
→ Agregar producto a compra pendiente
→ Editar cantidad
→ Continuar agregando productos
→ Comparar supermercados
```

### Reglas

- La compra pendiente solo existe cuando el usuario está preparando una compra.
- Si no hay productos, mostrar estado vacío con acciones útiles.
- Los productos agregados deben permitir editar cantidad y eliminar.
- Cada producto debe mostrar si es exacto por EAN o genérico comparable cuando corresponda.

---

## 4.3 Flujo de comparación

```text
Compra pendiente
→ Comparar supermercados
→ Calcular total por tienda
→ Mostrar cobertura por tienda
→ Mostrar faltantes
→ Recomendar tienda
→ Generar plan recomendado
```

### Reglas de comparación

- Priorizar coincidencias exactas por EAN.
- Usar coincidencias genéricas solo cuando estén explícitamente definidas como comparables.
- No usar candidatos difusos automáticamente.
- Si un producto no tiene precio en una tienda, mostrarlo como faltante.
- No ocultar faltantes.
- No recomendar una tienda solo porque tiene menor total si le faltan muchos productos.
- La recomendación debe considerar primero cobertura y luego precio.

---

## 4.4 Flujo de plan recomendado

```text
Resultado de comparación
→ Plan recomendado
→ Ver tienda recomendada
→ Ver ahorro estimado
→ Ver productos incluidos y faltantes
→ Guardar plan
→ Confirmar compra más tarde
```

### Plan recomendado debe mostrar

- Tienda recomendada.
- Total estimado.
- Ahorro estimado.
- Productos cubiertos.
- Productos faltantes.
- Tipo de match usado.
- Fecha del snapshot.
- Botón “Guardar plan”.
- Botón “Confirmar compra”.

---

## 4.5 Flujo de compra confirmada

```text
Plan recomendado o historial
→ Confirmar compra
→ Registrar total real pagado
→ Seleccionar productos efectivamente comprados
→ Guardar como compra confirmada
→ Opcional: enviar productos al almacén del hogar
```

### Compra confirmada debe guardar

- Fecha.
- Supermercado.
- Productos comprados.
- Cantidades.
- Total estimado.
- Total real pagado, si se registra.
- Ahorro estimado.
- Ahorro confirmado, si se puede calcular.
- Origen del plan.

---

## 4.6 Flujo de listas guardadas

```text
Crear compra pendiente
→ Guardar como lista frecuente
→ Nombrar lista
→ Repetir lista en el futuro
→ Comparar nuevamente con precios actualizados
```

### Función esperada

El usuario debe poder guardar una compra/lista para repetirla rápidamente.

Ejemplos:

- Compra mensual.
- Desayuno semanal.
- Once familiar.
- Colación niños.

### Acciones sobre listas guardadas

- Crear lista desde compra pendiente.
- Crear lista desde compra confirmada.
- Repetir lista.
- Editar lista.
- Eliminar lista.
- Comparar lista ahora.

### Regla importante

Una lista guardada no almacena una recomendación fija. Al repetirla, debe compararse nuevamente con los precios disponibles del snapshot actual.

---

## 4.7 Flujo de almacén del hogar

El almacén del hogar representa productos que el usuario declara tener disponibles en casa.

### Formas de alimentar el almacén

1. Desde una compra confirmada.
2. Agregando productos manualmente.

```text
Confirmar compra
→ Preguntar si se desea agregar productos al almacén
→ Usuario confirma productos y cantidades
→ Guardar en almacén
```

```text
Almacén del hogar
→ Agregar producto manualmente
→ Buscar producto o escribir nombre
→ Definir cantidad
→ Guardar
```

### Acciones del almacén

- Ver productos disponibles.
- Agregar producto manual.
- Editar cantidad.
- Marcar como consumido.
- Eliminar producto.
- Crear compra pendiente desde productos faltantes.
- Evitar recomprar productos que aún están en almacén.

### Campos sugeridos

```ts
type PantryItem = {
  id: string;
  productId?: string;
  productName: string;
  category?: string;
  quantity: number;
  unit?: string;
  source: 'confirmed_purchase' | 'manual';
  addedAt: string;
  updatedAt: string;
  estimatedRunoutDate?: string;
  notes?: string;
};
```

### Uso en experiencia

El almacén no debe sentirse como inventario industrial. Debe sentirse como una ayuda doméstica simple.

Textos sugeridos:

```text
Productos que tienes en casa
```

```text
Evita comprar de nuevo algo que ya tienes.
```

---

## 5. Dashboard principal rediseñada

## 5.1 Estado actual interpretado

Actualmente la dashboard funciona como entrada interna con saludo, resumen visual, acceso a búsqueda/comparación y algunas diferencias destacadas. También existe manejo de sesión, compra/lista e historial mediante almacenamiento local.

El problema es que la dashboard todavía no representa completamente el valor mensual de Cartwise. Debe transformarse en un centro de control del gasto alimentario y de planificación de compras.

---

## 5.2 Objetivo de la nueva dashboard

La dashboard debe responder estas preguntas:

1. ¿Cuánto llevo gastado este mes en comida?
2. ¿Estoy dentro de mi presupuesto?
3. ¿Qué compras registré?
4. ¿Tengo una compra pendiente o un plan pendiente?
5. ¿Qué diferencias de precio relevantes existen?
6. ¿Qué ofertas temporales existen?
7. ¿Qué listas puedo repetir rápido?
8. ¿Qué productos tengo en mi almacén?
9. ¿Qué tan actualizados/confiables son los datos?

---

## 5.3 Bloques principales de la dashboard

```text
Dashboard Cartwise
├── Resumen mensual
├── Gráfico de gasto mensual
├── Distribución por categoría
├── Compra pendiente / plan pendiente
├── Historial reciente de compras
├── Diferencias destacadas
├── Ofertas temporales
├── Listas guardadas
├── Almacén del hogar
├── Alertas inteligentes
└── Estado de datos
```

---

## 5.4 Resumen mensual

Debe estar arriba de la dashboard.

### Cards recomendadas

| Card | Descripción |
|---|---|
| Gasto registrado del mes | Total gastado en comida según compras confirmadas. |
| Presupuesto restante | Diferencia entre presupuesto mensual y gasto registrado. |
| Ahorro estimado | Ahorro calculado por planes recomendados. |
| Ahorro confirmado | Ahorro validado por compras confirmadas. |
| Compras registradas | Cantidad de compras confirmadas este mes. |
| Última actualización | Fecha del último snapshot de precios. |

### Ejemplo textual

```text
Gasto registrado en comida
$186.400 / $300.000
Te quedan $113.600 para este mes
```

---

## 5.5 Gráficos recomendados

Sí conviene agregar gráficos, pero no demasiados.

### Gráfico 1: gasto acumulado del mes

Tipo sugerido:

- Línea acumulada.
- Barras por semana.

Debe mostrar cuánto ha gastado el usuario en comida durante el mes según compras registradas.

Ejemplo:

```text
Semana 1: $54.000
Semana 2: $71.000
Semana 3: $38.000
Semana 4: $23.400
```

Debe incluir referencia al presupuesto mensual si existe.

### Gráfico 2: distribución del gasto por categoría

Tipo sugerido:

- Barras horizontales.
- Dona simple.

Categorías posibles:

- Abarrotes.
- Lácteos.
- Bebidas.
- Panadería.
- Congelados.
- Snacks.
- Otros.

Ejemplo:

```text
Abarrotes: $62.000
Lácteos: $38.000
Bebidas: $27.000
Otros: $59.400
```

### Regla visual

No agregar más de dos gráficos en la dashboard principal. Si se agregan más, crear una vista separada de “Estadísticas”.

---

## 5.6 Historial reciente de compras

La dashboard debe mostrar un resumen de las últimas compras registradas.

### Mostrar máximo

- 3 a 5 compras recientes.

### Campos

- Fecha.
- Supermercado.
- Total real pagado.
- Ahorro estimado o confirmado.
- Estado.

### Acciones

- Ver detalle.
- Repetir compra.
- Crear lista guardada desde esa compra.
- Enviar productos al almacén.

---

## 5.7 Compra pendiente / planes pendientes

### Si hay compra pendiente

```text
Compra pendiente
8 productos agregados
Total estimado desde $34.900
[Continuar] [Comparar supermercados]
```

### Si no hay compra pendiente

```text
No tienes una compra pendiente.
Puedes crear una compra nueva, repetir una lista guardada o usar productos faltantes del almacén.
[Crear compra] [Repetir lista] [Ver almacén]
```

### Si hay plan pendiente

```text
Plan pendiente
Recomendación: Unimarc
Ahorro estimado: $5.200
[Confirmar compra] [Editar plan]
```

---

## 5.8 Diferencias destacadas

Bloque independiente de ofertas.

Debe mostrar productos con alta brecha de precio entre supermercados.

### Campos

- Producto.
- Tienda más barata.
- Precio más bajo.
- Tienda más cara o tienda comparada.
- Precio comparado.
- Diferencia en pesos.
- Diferencia porcentual.
- Tipo de match.

### Ejemplo

```text
Aceite vegetal 1L
Más barato: Unimarc $2.390
Más caro: Jumbo $3.190
Diferencia: $800
Exacto por EAN
```

---

## 5.9 Ofertas temporales

Bloque separado.

Debe mostrar productos marcados como promoción u oferta en los datos.

### Campos

- Producto.
- Supermercado.
- Precio oferta.
- Precio referencia, si existe.
- Ahorro.
- Fecha del snapshot.
- Vigencia si existe.

### Regla

Si no hay fecha de vencimiento, no inventarla. Usar texto:

```text
Oferta detectada en el último snapshot. Disponibilidad sujeta a cambios.
```

---

## 5.10 Listas guardadas

Debe mostrar listas frecuentes reutilizables.

### Ejemplo

```text
Compra mensual
32 productos
Última vez usada: 03 jun
[Repetir]

Desayuno semanal
8 productos
[Repetir]
```

### Acciones

- Repetir.
- Editar.
- Comparar ahora.
- Eliminar.

---

## 5.11 Almacén del hogar

Debe mostrarse como resumen en dashboard.

### Ejemplo

```text
Almacén del hogar
24 productos registrados
5 posiblemente por agotarse
3 agregados manualmente esta semana
[Ver almacén] [Agregar producto]
```

---

## 5.12 Alertas inteligentes

Pueden ser reglas simples, no necesariamente IA.

Ejemplos:

```text
Gastaste 62% de tu presupuesto mensual.
Te quedan $113.600 para el mes.
```

```text
Hay 4 productos de tus listas guardadas con diferencias mayores al 20%.
```

```text
Tu última compra en Jumbo habría sido $5.800 más barata en Unimarc.
```

---

## 5.13 Estado de datos

Debe estar visible pero no ocupar demasiado espacio.

### Mostrar

- Último snapshot.
- Supermercados cubiertos.
- Productos comparables.
- Coincidencias exactas por EAN.
- Coincidencias genéricas.

### Texto de transparencia

```text
Los precios son referenciales según el último snapshot disponible.
```

---

## 6. Landing pública antes del login

## 6.1 Objetivo

La landing debe mostrar valor antes del login. El usuario debe ver supermercados cubiertos y ejemplos reales de oportunidades.

---

## 6.2 Estructura recomendada

```text
Landing pública Cartwise
├── Navbar
├── Hero principal
├── Supermercados cubiertos
├── Carrusel de oportunidades destacadas
├── Cómo funciona en 3 pasos
├── Explicación de diferencias vs ofertas
└── CTA para entrar como demo
```

---

## 6.3 Supermercados cubiertos

Crear componente:

```text
CoveredStoresSection
```

Debe mostrar:

- Jumbo.
- Santa Isabel.
- Unimarc.
- El Trébol.

### Reglas

- No mostrar Tottus ni Líder como cubiertos.
- Si se mencionan, deben estar en una sección “próximamente”.
- No usar hotlinks externos para logos.
- Usar assets locales si existen.
- Si no existen assets, usar tarjetas estilizadas con texto.

### Texto sugerido

```text
Supermercados actualmente comparados
Comparamos productos de comida y bebida en supermercados integrados al último snapshot disponible.
```

---

## 6.4 Carrusel de oportunidades destacadas

Crear componente:

```text
OpportunitiesCarousel
```

Debe aparecer antes del login, idealmente debajo de los logos de supermercados.

### Función

Mostrar oportunidades de ahorro antes de que el usuario entre a la app.

### Debe incluir dos tipos de tarjetas

1. Diferencia destacada.
2. Oferta temporal.

Si no hay datos reales de ofertas temporales, solo mostrar diferencias destacadas y etiquetarlas correctamente como **DIFERENCIA DESTACADA**.

### Campos de cada tarjeta

- Nombre del producto.
- Categoría.
- Supermercado con mejor precio.
- Precio más bajo.
- Supermercado comparado.
- Precio comparado.
- Diferencia en pesos.
- Diferencia porcentual.
- Etiqueta: `OFERTA` o `DIFERENCIA DESTACADA`.
- Tipo de match: `Exacto por EAN` o `Genérico comparable`.
- Fecha del snapshot.

### Ejemplo

```text
DIFERENCIA DESTACADA
Arroz grado 1 1kg
Más barato: Unimarc $1.390
Más caro: Jumbo $1.790
Diferencia: $400
Ahorro relativo: 22%
Coincidencia exacta por EAN
Datos del último snapshot
```

### Comportamiento

- Auto-rotación cada ciertos segundos.
- Flechas manuales.
- Puntos indicadores.
- Pausar al pasar mouse o al enfocar con teclado.
- Diseño responsivo.

### Acción opcional

Cada tarjeta puede tener botón:

```text
Agregar a compra pendiente
```

Si el usuario no inició sesión:

```text
Abrir modal → “Entra como demo para guardar este producto en una compra”
```

---

## 6.5 Cómo funciona en 3 pasos

Sección simple:

```text
1. Busca productos
Encuentra alimentos y bebidas disponibles en supermercados cubiertos.

2. Compara tu compra
Cartwise calcula el total estimado por supermercado.

3. Compra mejor
Recibe una recomendación clara según precio y cobertura.
```

---

## 7. Navegación interna propuesta

La navegación principal debería quedar así:

```text
Inicio
Buscar productos
Compra pendiente
Comparar
Listas guardadas
Historial
Almacén
Perfil
```

### Alternativa más compacta

```text
Inicio
Productos
Compra
Listas
Historial
Almacén
Perfil
```

---

## 8. Modelos de datos sugeridos para frontend/localStorage

Estos modelos son orientativos. Adaptar a los tipos reales del proyecto.

### 8.1 Producto en compra pendiente

```ts
type PendingPurchaseItem = {
  id: string;
  productId?: string;
  productName: string;
  category?: string;
  quantity: number;
  unit?: string;
  selectedOfferId?: string;
  matchType?: 'ean_exact' | 'generic_comparable' | 'unknown';
  addedAt: string;
};
```

### 8.2 Compra pendiente

```ts
type PendingPurchase = {
  id: string;
  name?: string;
  items: PendingPurchaseItem[];
  createdAt: string;
  updatedAt: string;
  status: 'empty' | 'preparing' | 'ready_to_compare' | 'compared';
};
```

### 8.3 Lista guardada

```ts
type SavedList = {
  id: string;
  name: string;
  description?: string;
  items: PendingPurchaseItem[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
};
```

### 8.4 Plan recomendado

```ts
type RecommendedPlan = {
  id: string;
  sourcePurchaseId: string;
  recommendedStore: string;
  estimatedTotal: number;
  estimatedSavings?: number;
  coverage: {
    totalItems: number;
    coveredItems: number;
    missingItems: number;
  };
  items: Array<{
    productName: string;
    quantity: number;
    storePrice?: number;
    matchType?: 'ean_exact' | 'generic_comparable' | 'unknown';
    missing?: boolean;
  }>;
  snapshotDate?: string;
  createdAt: string;
  status: 'pending_confirmation' | 'confirmed' | 'discarded';
};
```

### 8.5 Compra confirmada

```ts
type ConfirmedPurchase = {
  id: string;
  planId?: string;
  store: string;
  purchaseDate: string;
  estimatedTotal?: number;
  realTotal: number;
  estimatedSavings?: number;
  confirmedSavings?: number;
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unit?: string;
    paidPrice?: number;
    category?: string;
  }>;
  addedToPantry: boolean;
  createdAt: string;
};
```

### 8.6 Almacén del hogar

```ts
type PantryItem = {
  id: string;
  productId?: string;
  productName: string;
  category?: string;
  quantity: number;
  unit?: string;
  source: 'confirmed_purchase' | 'manual';
  addedAt: string;
  updatedAt: string;
  estimatedRunoutDate?: string;
  notes?: string;
};
```

### 8.7 Presupuesto mensual

```ts
type MonthlyBudget = {
  id: string;
  month: string;
  foodBudget: number;
  createdAt: string;
  updatedAt: string;
};
```

---

## 9. Endpoints o servicios sugeridos

No crear backend complejo si el PMV aún usa localStorage. Pero sí ordenar servicios en frontend.

### 9.1 Endpoints existentes que se deberían reutilizar

- `/api/health`
- `/api/deals/top`
- `/api/products/search`
- `/api/generic/search`
- `/api/products/:id/offers`
- `/api/basket/compare`

### 9.2 Posibles endpoints futuros

```text
GET /api/offers/top
```

Para ofertas temporales reales, solo si existen datos promocionales.

```text
GET /api/stats/summary
```

Para métricas globales de snapshot.

### 9.3 Servicios frontend sugeridos

- `pendingPurchaseService`
- `savedListsService`
- `purchaseHistoryService`
- `pantryService`
- `budgetService`
- `dashboardMetricsService`

Si no hay backend de persistencia, estos servicios pueden trabajar sobre localStorage.

---

## 10. Componentes sugeridos

### 10.1 Landing

- `LandingPage`
- `HeroSection`
- `CoveredStoresSection`
- `OpportunitiesCarousel`
- `HowItWorksSection`
- `PublicDataDisclaimer`

### 10.2 Dashboard

- `DashboardPage`
- `MonthlySummaryCards`
- `MonthlySpendingChart`
- `CategorySpendingChart`
- `PendingPurchaseCard`
- `PendingPlanCard`
- `RecentPurchasesList`
- `HighlightedDifferencesPanel`
- `TemporaryOffersPanel`
- `SavedListsPreview`
- `PantryPreview`
- `DataStatusCard`
- `SmartAlertsPanel`

### 10.3 Compras y comparación

- `ProductSearchPage`
- `ProductResultCard`
- `PendingPurchasePage`
- `PendingPurchaseItemRow`
- `BasketComparisonPage`
- `StoreComparisonTable`
- `RecommendedPlanCard`
- `CoverageWarning`

### 10.4 Listas guardadas

- `SavedListsPage`
- `SavedListCard`
- `SaveListModal`
- `RepeatListButton`

### 10.5 Historial

- `PurchaseHistoryPage`
- `PurchaseHistoryItem`
- `PurchaseDetailModal`
- `ConfirmPurchaseModal`

### 10.6 Almacén

- `PantryPage`
- `PantryItemCard`
- `AddPantryItemModal`
- `ConsumePantryItemButton`
- `CreatePurchaseFromPantryButton`

---

## 11. Reglas de UX y comunicación

### 11.1 Transparencia de datos

Usar siempre frases como:

```text
Precios referenciales según último snapshot disponible.
```

```text
La disponibilidad puede cambiar en tienda.
```

```text
La recomendación considera cobertura de productos y precio total estimado.
```

### 11.2 Confianza de comparación

Mostrar etiquetas:

| Etiqueta | Uso |
|---|---|
| Exacto por EAN | Mismo producto identificado por código de barras. |
| Genérico comparable | Producto equivalente por unidad/formato. |
| Sin precio | No hay dato disponible para esa tienda. |
| Comparación parcial | No todos los productos están cubiertos. |

### 11.3 Estados vacíos

Evitar pantallas vacías sin guía.

Ejemplo:

```text
No tienes una compra pendiente.
Crea una compra nueva, repite una lista guardada o revisa productos del almacén.
```

### 11.4 No prometer de más

No usar frases como:

```text
Ahorro garantizado
```

```text
Precio en tiempo real
```

```text
Mejor precio absoluto
```

Usar:

```text
Ahorro estimado
```

```text
Precio referencial
```

```text
Mejor opción según datos disponibles
```

---

## 12. Priorización de implementación

## 12.1 Prioridad alta

1. Cambiar lenguaje de “canasta activa” a “compra pendiente”.
2. Mejorar landing pública con supermercados cubiertos.
3. Agregar carrusel de oportunidades destacadas.
4. Rediseñar dashboard con resumen mensual.
5. Separar diferencias destacadas de ofertas temporales.
6. Agregar historial reciente de compras.
7. Agregar listas guardadas reutilizables.
8. Agregar almacén del hogar básico.
9. Mostrar estado de datos/snapshot.
10. Mantener etiquetas de confianza: EAN exacto / genérico comparable.

## 12.2 Prioridad media

1. Gráfico de gasto mensual.
2. Gráfico de gasto por categoría.
3. Alertas inteligentes simples.
4. Confirmación de compra y envío al almacén.
5. Crear lista guardada desde compra confirmada.
6. Repetir compra desde historial.

## 12.3 Prioridad baja / futuro

1. OCR de boletas.
2. Autenticación real.
3. Pagos y suscripción.
4. Multiusuario familiar.
5. Optimización multi-tienda avanzada.
6. Alertas por correo o push.
7. Predicción de precios.
8. Integración de mapas/rutas.
9. App móvil nativa.

---

## 13. Criterios de aceptación

El agente debe considerar terminado el ajuste cuando se cumplan estos puntos:

### Landing

- Se muestran supermercados cubiertos actuales.
- No se muestra Tottus/Líder como cubiertos.
- Existe carrusel de oportunidades.
- Las tarjetas distinguen oferta temporal vs diferencia destacada.
- No se inventan ofertas si no existen datos promocionales.
- Hay texto de transparencia sobre snapshot.

### Dashboard

- Muestra gasto registrado del mes en comida.
- Muestra presupuesto/restante si hay presupuesto configurado.
- Muestra historial reciente de compras.
- Muestra diferencias destacadas.
- Muestra ofertas temporales separadas.
- Muestra listas guardadas.
- Muestra resumen del almacén.
- Muestra compra pendiente o estado vacío útil.
- Muestra estado de datos.
- Incluye máximo dos gráficos principales.

### Compra pendiente

- Reemplaza “canasta activa”.
- Permite agregar, editar cantidad y eliminar productos.
- Permite comparar supermercados.

### Listas guardadas

- Permite guardar una compra como lista.
- Permite repetir lista.
- Permite comparar lista con precios actuales.

### Historial

- Permite ver compras registradas.
- Permite repetir una compra.
- Permite crear lista desde una compra.

### Almacén

- Permite agregar productos manualmente.
- Permite recibir productos desde una compra confirmada.
- Permite editar cantidad o marcar consumo.

### Transparencia

- Las comparaciones muestran snapshot.
- Las recomendaciones no prometen ahorro garantizado.
- Se informa cuando hay productos faltantes.
- Se diferencia exacto por EAN de genérico comparable.

---

## 14. Prompt operativo para el agente

Copiar este bloque al agente antes de ejecutar cambios:

```text
Vas a trabajar sobre el proyecto Cartwise. Antes de modificar código, lee este documento completo y revisa la estructura existente.

Objetivo: evolucionar la web app actual hacia una experiencia más clara de planificación y comparación de compras, sin reescribir toda la arquitectura.

Cambios principales:
1. Reemplazar el concepto “canasta activa” por “compra pendiente” o “compra en preparación”.
2. Mejorar la landing pública antes del login con supermercados cubiertos: Jumbo, Santa Isabel, Unimarc y El Trébol.
3. Agregar un carrusel de oportunidades destacadas en la landing.
4. Separar visual y conceptualmente “diferencias destacadas” de “ofertas temporales”. No llamar oferta a una diferencia de precio si no hay dato promocional.
5. Rediseñar la dashboard como centro mensual del usuario: gasto registrado del mes en comida, presupuesto, historial reciente, diferencias destacadas, ofertas, listas guardadas, almacén del hogar, compra pendiente, planes pendientes y estado de datos.
6. Agregar listas guardadas para repetir compras rápidamente.
7. Agregar almacén del hogar para guardar productos confirmados como comprados o agregados manualmente.
8. Mantener transparencia: precios referenciales según snapshot, disponibilidad sujeta a cambios, ahorro estimado no garantizado.
9. Respetar la lógica de matching: exacto por EAN, genérico comparable y no usar candidatos difusos automáticamente.

No implementar todavía:
- OCR de boletas.
- Login real.
- Pagos.
- Scraping nuevo.
- App móvil nativa.
- Predicción de precios.
- Mapas/rutas.

Primero inspecciona los componentes existentes, identifica dónde vive la landing, dashboard, navegación, búsqueda, comparación, historial y perfil. Luego implementa en pasos pequeños, manteniendo la app funcional después de cada cambio.

Prioridad de ejecución:
1. Renombrar lenguaje de canasta activa a compra pendiente.
2. Agregar CoveredStoresSection.
3. Agregar OpportunitiesCarousel.
4. Rediseñar DashboardPage con bloques mensuales.
5. Implementar listas guardadas usando localStorage si no hay backend.
6. Implementar almacén del hogar usando localStorage si no hay backend.
7. Agregar gráficos simples solo si no rompen la simplicidad.
8. Revisar build y corregir errores.

Al finalizar, entregar resumen de archivos modificados, decisiones tomadas, limitaciones pendientes y cómo probar la app.
```

---

## 15. Resultado esperado

Después de aplicar este plan, Cartwise debería percibirse como una herramienta web de planificación alimentaria y comparación inteligente, no solo como un buscador de productos.

La experiencia deseada es:

```text
El usuario entra a la landing,
ve supermercados cubiertos,
ve oportunidades reales o destacadas,
entra como demo,
consulta cuánto lleva gastado este mes,
revisa compras recientes,
crea una compra pendiente,
compara supermercados,
guarda un plan,
confirma una compra,
actualiza su almacén,
y puede repetir listas frecuentes rápidamente.
```

Ese flujo comunica mejor el valor de Cartwise y deja espacio para futuras etapas como OCR, autenticación real, suscripción y app móvil.
