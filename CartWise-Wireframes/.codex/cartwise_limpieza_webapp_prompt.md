# Tarea para Codex: Limpieza y ordenamiento de Cartwise

Contexto:
Este repositorio corresponde a Cartwise, una aplicación/prototipo para optimizar el gasto de supermercado usando boletas/listas de compra, comparación entre supermercados, recomendación de compra y verificación de ahorro.

Objetivo de esta tarea:
Realizar una limpieza progresiva del frontend web para que el código quede mejor organizado. La prioridad es sacar procesos similares de una misma página/componente gigante y separarlos por responsabilidad.

Alcance permitido:
- Trabajar principalmente dentro de `CartWise-Wireframes`.
- Priorizar `src/web/WebApp.tsx` si concentra demasiada lógica.
- Separar tipos, constantes, helpers, servicios, hooks, pantallas y componentes reutilizables.
- Mantener el comportamiento visible actual.
- Mantener los endpoints de API existentes.
- Mantener la lógica de comparación existente.
- Mantener la UI lo más parecida posible.

No hacer:
- No rediseñar visualmente la app.
- No reescribir todo desde cero.
- No cambiar el Scrapper.
- No cambiar la base SQLite.
- No modificar reglas de comparación de negocio.
- No agregar dependencias nuevas salvo que sea estrictamente necesario.
- No eliminar archivos de referencia visual si existen, como `src/components/screens/`.
- No implementar funcionalidades nuevas que no sean parte de la limpieza.

Proceso obligatorio:
Antes de modificar:
1. Inspecciona la estructura del proyecto.
2. Identifica qué archivos concentran demasiada lógica.
3. Entrega un diagnóstico breve.
4. Propón el orden de refactorización.
5. Luego aplica los cambios de forma incremental.

Plan de refactorización sugerido:

Fase 1: Tipos, constantes y helpers puros
Crear o revisar:
- `src/domain/types.ts`
- `src/domain/constants.ts`
- `src/lib/format.ts`
- `src/lib/validation.ts`
- `src/lib/storage.ts`
- `src/lib/api.ts`

Mover fuera de `WebApp.tsx`:
- Tipos como `View`, `SearchItem`, `BasketItem`, `BasketComparison`, `SavedPlan`, `Account`, `PantryItem`, `SavedList`, etc.
- Constantes como claves de localStorage, tabs, estados, comunas, monedas, datos demo y credenciales demo si existen.
- Helpers como `money`, `plural`, validaciones, firmas de planes/listas, carga JSON, etc.

Regla:
Si una función no renderiza interfaz, no debe vivir dentro de `WebApp.tsx`.

Fase 2: Servicios de datos y API
Crear o revisar:
- `src/services/cartwiseApi.ts`
- `src/services/localStorageService.ts`

Mover ahí:
- Llamadas `fetch`.
- Funciones de lectura/escritura en localStorage.
- Funciones como:
  - `getHealth`
  - `getTopDeals`
  - `searchExactProducts`
  - `searchGenericProducts`
  - `compareBasket`

Regla:
Los componentes no deben conocer detalles de endpoints. Solo deben llamar servicios.

Fase 3: Hooks por proceso
Crear o revisar:
- `src/hooks/useToast.ts`
- `src/hooks/useDemoAuth.ts`
- `src/hooks/useBasket.ts`
- `src/hooks/useComparison.ts`
- `src/hooks/useHistory.ts`
- `src/hooks/useAccount.ts`
- `src/hooks/useSavedLists.ts`
- `src/hooks/usePantry.ts`
- `src/hooks/useDashboardMetrics.ts`

Responsabilidades esperadas:
- `useBasket`: agregar producto, eliminar producto, cambiar cantidad, vaciar canasta, normalizar item comparable.
- `useComparison`: ejecutar comparación, guardar resultado, manejar loading/error.
- `useHistory`: guardar plan, repetir plan, marcar compra, verificar ahorro, eliminar historial.
- `useDashboardMetrics`: calcular gasto mensual, ahorro confirmado, ahorro estimado, presupuesto restante, alertas.
- `useToast`: mostrar y limpiar mensajes.
- `useDemoAuth`: login/logout demo y estado de sesión.
- `useSavedLists`: crear, eliminar, cargar y reutilizar listas.
- `usePantry`: manejar almacén/despensa.

Fase 4: Separar pantallas por dominio
Crear estructura sugerida:

```text
src/features/dashboard/
  Dashboard.tsx
  BudgetCard.tsx
  MonthlySpendingChart.tsx
  CategorySpendingChart.tsx

src/features/products/
  ProductSearch.tsx
  SearchResultCard.tsx
  ProductImage.tsx
  ProductFilters.tsx

src/features/basket/
  PlanBuilder.tsx
  BasketPanel.tsx
  BasketItemRow.tsx

src/features/comparison/
  ComparisonView.tsx
  StoreComparisonCard.tsx
  ComparisonLineTable.tsx

src/features/history/
  HistoryView.tsx
  HistoryRow.tsx
  PlanDetail.tsx

src/features/lists/
  ListsView.tsx
  SavedListCard.tsx
  SaveListModal.tsx

src/features/pantry/
  PantryView.tsx
  PantryItemRow.tsx
  AddPantryModal.tsx

src/features/profile/
  ProfileView.tsx
  ProfileTabs.tsx
  ProfileForm.tsx

src/features/public/
  PublicLanding.tsx
  CoveredStoresSection.tsx
  OpportunitiesCarousel.tsx
  HowItWorksSection.tsx
```

Regla:
Cada pantalla debe importar hooks, servicios y componentes UI. No debe duplicar lógica de negocio.

Fase 5: Componentes UI reutilizables
Crear o revisar:

```text
src/components/ui/
  Hero.tsx
  MetricCard.tsx
  PanelHeader.tsx
  EmptyState.tsx
  Modal.tsx
  Toast.tsx
  Badge.tsx
  Button.tsx
```

Mover ahí componentes visuales genéricos que se usen en varias pantallas.

Fase 6: Reducir `WebApp.tsx`
Al final, `src/web/WebApp.tsx` debe quedar como composición general de la app.

Objetivo aproximado:
- Inicializar hooks principales.
- Manejar vista actual.
- Renderizar layout/shell.
- Mostrar pantalla según vista.
- No contener lógica extensa de negocio.
- No contener componentes grandes definidos dentro del mismo archivo.

Criterios de aceptación:
1. La app sigue compilando.
2. La app mantiene el comportamiento visible anterior.
3. `WebApp.tsx` queda mucho más pequeño y legible.
4. Los tipos principales están en archivos de dominio.
5. Los helpers puros están fuera de componentes.
6. Las llamadas a API están centralizadas.
7. localStorage está centralizado.
8. Las pantallas principales están separadas por carpeta.
9. Los componentes UI reutilizables están separados.
10. No se rompe el servidor ni el Scrapper.
11. No se agregan funcionalidades nuevas innecesarias.
12. Ejecutar verificaciones al final.

Verificaciones esperadas:
Ejecutar, según existan los scripts en `package.json`:

```bash
npm install
npm run lint
npm run build
npm run typecheck
```

Si algún script no existe, no lo inventes. Indica claramente cuál no existe y ejecuta los que sí estén disponibles.

Forma de trabajo:
- Haz cambios incrementales.
- Después de cada fase importante, revisa errores de importación.
- Si el refactor completo es muy grande, prioriza primero:
  1. helpers/types/constants,
  2. servicios,
  3. componentes UI,
  4. ProductSearch,
  5. PlanBuilder/Basket,
  6. Dashboard,
  7. History,
  8. reducir WebApp.tsx.

Entrega final:
Al terminar, resume:
- Qué archivos creaste.
- Qué componentes moviste.
- Qué lógica se separó.
- Qué verificaciones ejecutaste.
- Qué quedó pendiente.
