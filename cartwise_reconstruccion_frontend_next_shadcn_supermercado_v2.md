# Cartwise — Plan de reconstrucción completa del frontend desde cero

## 1. Objetivo

Reconstruir completamente el frontend de Cartwise desde cero.

Esta tarea **no es una refactorización**, **no es un rediseño parcial** y **no es una mejora visual sobre la interfaz actual**.

La interfaz actual debe eliminarse o desconectarse completamente. El nuevo frontend debe construirse desde cero usando:

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui

El resultado debe ser una nueva experiencia visual y funcional, moderna, comercial y orientada a supermercado online, manteniendo solo el alcance MVP definido.

---

## 2. Skills que debe usar el agente

Antes de modificar archivos, el agente debe activar o aplicar estas skills si están disponibles:

- `cartwise-domain`
- `mvp-scope-guard`
- `frontend-design`
- `react-refactor`
- `ux-copy-spanish`
- `qa-build-check`
- `readme-updater`

Estas skills deben guiar:

- alcance MVP,
- terminología,
- decisiones visuales,
- estructura frontend,
- validación técnica,
- actualización de documentación.

---

## 3. Regla principal: borrar la UI actual

El agente debe usar el frontend actual solo como referencia para entender:

- funcionalidades existentes,
- endpoints usados,
- tipos de datos,
- contratos con la API,
- lógica necesaria para comparación.

Después de eso, debe reconstruir la interfaz desde cero.

### No conservar como base

No usar como base:

- layout visual actual,
- dashboard actual,
- landing actual,
- navegación actual,
- estilos actuales,
- componentes visuales antiguos,
- pantallas antiguas,
- `WebApp.tsx` como base de la nueva experiencia,
- estructura visual de `src/features` si pertenece a la UI anterior,
- diseño Vite actual si se migra completamente a Next.js.

### Sí conservar

No eliminar ni romper:

- `Scrapper/`,
- base SQLite,
- datos generados,
- API Express si sigue siendo necesaria,
- `server/index.ts` si la API depende de él,
- `sqlite_bridge.py`,
- lógica de comparación de precios,
- contratos de datos necesarios,
- scripts relevantes para levantar backend/API.

El cambio destructivo aplica al **frontend**, no al pipeline de datos.

---

## 4. Stack obligatorio

El nuevo frontend debe usar:

- Next.js con App Router,
- TypeScript,
- React,
- Tailwind CSS,
- shadcn/ui.

Usar shadcn/ui como base, pero **no dejar los componentes con apariencia por defecto**.

Componentes shadcn/ui sugeridos:

- Button,
- Card,
- Badge,
- Input,
- Dialog,
- Sheet,
- Table,
- Tabs,
- Dropdown Menu,
- Select,
- Progress,
- Separator,
- Skeleton,
- Toast / Sonner si aplica.

---

## 5. Dirección visual obligatoria

La nueva interfaz no debe verse como una plantilla genérica generada por IA ni como un dashboard SaaS común.

### Evitar

Evitar:

- estética genérica tipo Claude/IA,
- exceso de esquinas redondeadas,
- cards demasiado uniformes,
- gradientes suaves sin propósito,
- tipografía sans genérica sin personalidad,
- layout de dashboard corporativo,
- interfaz que parezca maqueta académica,
- todo blanco con cards aisladas sin jerarquía visual,
- componentes shadcn/ui sin personalización.

### Estilo deseado

La interfaz debe sentirse como una web moderna de supermercado y ahorro doméstico.

Usar:

- base blanca, limpia y luminosa,
- verde como color principal de marca,
- verdes intensos para ahorro, acción y confirmación,
- amarillo/naranjo solo para ofertas temporales o avisos comerciales,
- rojo solo para faltantes, errores o advertencias,
- tipografía clara, moderna y expresiva,
- títulos con presencia visual,
- jerarquía fuerte entre título, precio, ahorro y acción,
- cards de producto con apariencia comercial,
- botones visibles y directos,
- layout con sensación de tienda online,
- foco en catálogo, productos, precios, ahorro y comparación.

### Proporción estética esperada

Cartwise debe verse como:

- 70% supermercado online moderno,
- 20% app de ahorro doméstico,
- 10% dashboard de datos.

No debe verse como:

- 70% dashboard SaaS,
- 20% plantilla de IA,
- 10% ecommerce genérico.

---

## 6. Inspiración de supermercados online

Inspirarse en patrones generales de supermercados online, sin copiar literalmente diseños, textos, logos ni layouts protegidos.

Patrones esperados:

- buscador principal visible,
- categorías destacadas,
- carruseles de productos,
- carruseles de ofertas,
- secciones horizontales en movimiento,
- cards de producto compactas,
- precio destacado,
- etiquetas de oferta,
- compra pendiente tipo carrito,
- resumen de compra visible,
- banners promocionales,
- bloques como:
  - “Más baratos hoy”,
  - “Diferencias destacadas”,
  - “Ofertas temporales”,
  - “Recomendados para tu compra”.

---

## 7. Carruseles

Los carruseles son parte importante de la nueva identidad visual.

Deben sentirse vivos, comerciales y cercanos a una web de supermercado.

### Reglas

Los carruseles deben:

- tener movimiento horizontal continuo o autoplay,
- pausar al hover si es razonable,
- ser responsivos,
- no bloquear la lectura,
- no causar mareo,
- no reemplazar información crítica,
- tener navegación manual si aplica.

### Carruseles sugeridos

Implementar carruseles para:

- supermercados cubiertos,
- oportunidades destacadas,
- diferencias fuertes de precio,
- ofertas temporales si existen datos reales,
- categorías populares,
- productos frecuentes o destacados.

La landing debe mostrar movimiento, productos, tiendas, precios y ahorro desde el inicio.

---

## 8. Alcance MVP obligatorio

El nuevo frontend debe mantener activas solo estas funcionalidades:

1. Landing pública.
2. Login demo.
3. Dashboard mensual.
4. Catálogo / búsqueda de productos.
5. Compra pendiente.
6. Comparación de supermercados.
7. Plan recomendado.
8. Historial de compras.
9. Listas guardadas simples.
10. Despensa / almacén del hogar.

No agregar funcionalidades fuera de este MVP.

---

## 9. Funcionalidades fuera del MVP

No implementar:

- OCR de boletas,
- login real,
- registro real de usuarios,
- pagos,
- suscripciones reales,
- mapas,
- rutas,
- compra multi-tienda avanzada con ruta,
- predicción de precios,
- recomendaciones con IA,
- alertas automáticas avanzadas,
- modo familiar,
- comunidad,
- listas colaborativas,
- venta de datos,
- scraping desde la UI,
- precios en tiempo real.

Si existe código antiguo relacionado con estas funcionalidades, no migrarlo al nuevo frontend.

---

## 10. Supermercados

### Activos

Los supermercados activos son:

- Jumbo,
- Santa Isabel,
- Unimarc,
- El Trébol.

### No activos

Los siguientes supermercados no están activos:

- Tottus,
- Líder.

Tottus y Líder solo pueden aparecer como “próximamente”.  
No deben aparecer como supermercados cubiertos ni usarse en comparaciones activas.

---

## 11. Terminología obligatoria

Usar siempre:

- “Compra pendiente”,
- “Listas guardadas”,
- “Historial de compras”,
- “Despensa”,
- “Almacén del hogar”,
- “Diferencias destacadas”,
- “Ofertas temporales”,
- “Precios referenciales según último snapshot disponible”,
- “Supermercados cubiertos”.

No usar:

- “Canasta activa”,
- “Precios en tiempo real”,
- “IA” si no hay IA real,
- “Oferta” para una simple diferencia de precio,
- “Todos los supermercados” si solo hay algunos cubiertos.

---

## 12. Estructura sugerida

Crear una estructura limpia. Ejemplo:

```txt
CartWise-Wireframes/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/
│   ├── dashboard/
│   ├── productos/
│   ├── compra-pendiente/
│   ├── comparar/
│   ├── historial/
│   ├── listas/
│   └── despensa/
├── components/
│   ├── layout/
│   ├── product/
│   ├── dashboard/
│   ├── purchase/
│   ├── comparison/
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── format.ts
│   ├── storage.ts
│   ├── validation.ts
│   └── constants.ts
├── types/
│   └── cartwise.ts
```

La estructura puede ajustarse, pero debe mantenerse modular y clara.

---

## 13. Pantallas obligatorias

### 13.1 Landing pública

Debe ser completamente nueva.

Debe incluir:

- header moderno,
- logo Cartwise,
- botón “Entrar como demo”,
- hero principal,
- mensaje central: “Compara supermercados y compra más inteligente”,
- subtexto: “Arma tu compra, compara precios entre tiendas y descubre dónde conviene comprar”,
- supermercados cubiertos,
- Tottus y Líder solo como próximamente si aparecen,
- carrusel de oportunidades destacadas,
- sección “Cómo funciona” en 3 pasos:
  1. Busca productos.
  2. Arma tu compra.
  3. Compara supermercados.
- nota de transparencia: “Precios referenciales según último snapshot disponible”.

El carrusel debe distinguir:

- Diferencia destacada: brecha importante de precio entre supermercados.
- Oferta temporal: promoción real detectada en la base.

No inventar ofertas.

---

### 13.2 Login demo

Debe ser simple.

Debe incluir:

- botón “Entrar como demo”,
- texto aclarando que es un MVP,
- no aparentar autenticación real,
- no crear registro real.

---

### 13.3 Dashboard mensual

Debe ser el centro de control del usuario.

Debe mostrar:

- gasto registrado del mes en comida,
- ahorro estimado,
- ahorro confirmado,
- historial reciente,
- compra pendiente si existe,
- diferencias destacadas,
- ofertas temporales si existen,
- resumen de listas guardadas,
- resumen de despensa,
- estado de datos: snapshot y supermercados cubiertos.

Máximo dos gráficos:

- gasto acumulado del mes,
- gasto por categoría.

No saturar el dashboard.

---

### 13.4 Catálogo / búsqueda de productos

Debe parecer un supermercado online.

Debe incluir:

- buscador,
- filtros por categoría,
- filtros por supermercado,
- filtro por oferta/diferencia destacada si aplica,
- cards de producto,
- precio más bajo,
- tienda con mejor precio,
- tipo de coincidencia:
  - exacto por EAN,
  - genérico comparable.
- botón “Agregar”.

Si no existen imágenes reales, usar placeholders limpios.

---

### 13.5 Compra pendiente

Debe funcionar como carrito de supermercado orientado a comparación.

Debe permitir:

- ver productos agregados,
- cambiar cantidades,
- eliminar productos,
- guardar como lista,
- comparar supermercados,
- mostrar advertencia si un producto ya existe en la despensa,
- mostrar productos sin precio si corresponde.

No usar “canasta activa”.

---

### 13.6 Comparación de supermercados

Debe mostrar:

- cards por supermercado,
- total estimado,
- productos cubiertos,
- productos faltantes,
- diferencia de precio,
- tienda recomendada,
- explicación breve de cálculo,
- ahorro estimado.

Regla clave:

La recomendación debe priorizar cobertura y luego precio.  
No recomendar una tienda solo porque es más barata si tiene muchos productos faltantes.

---

### 13.7 Plan recomendado

Debe mostrar:

- tienda recomendada,
- total estimado,
- ahorro estimado,
- productos incluidos,
- productos faltantes,
- botón “Guardar plan”,
- botón “Confirmar compra”,
- botón “Guardar como lista”.

Al confirmar compra:

- guardar en historial,
- preguntar si se quieren agregar los productos a la despensa.

---

### 13.8 Historial de compras

Debe mostrar:

- compras confirmadas,
- planes guardados,
- fecha,
- tienda,
- total,
- ahorro estimado,
- ahorro confirmado si existe,
- acción “Repetir compra”,
- acción “Guardar como lista”,
- acción “Ver detalle”.

---

### 13.9 Listas guardadas

Debe permitir:

- ver listas reutilizables,
- crear lista desde compra pendiente o historial,
- repetir lista,
- comparar lista,
- renombrar lista,
- eliminar lista.

Mantenerlo simple.

---

### 13.10 Despensa / Almacén del hogar

Debe ser parte esencial del MVP.

Debe permitir:

- ver productos disponibles en casa,
- agregar producto manualmente,
- quitar producto,
- aumentar cantidad,
- disminuir cantidad,
- marcar producto como consumido,
- recibir productos desde una compra confirmada.

No implementar:

- fechas de vencimiento,
- alertas automáticas,
- escaneo de código de barras,
- consumo automático,
- predicciones.

---

## 14. Estados vacíos obligatorios

Cada pantalla debe tener estados vacíos claros.

Ejemplos:

- Sin compra pendiente: “Crea una compra o repite una lista guardada”.
- Sin historial: “Cuando confirmes una compra aparecerá aquí”.
- Sin despensa: “Agrega productos que ya tienes en casa”.
- Sin resultados: “Prueba con otro nombre o revisa los filtros”.

---

## 15. Reglas de transparencia

Siempre que se muestren precios:

- indicar que son referenciales,
- indicar que dependen del último snapshot,
- no prometer precios en tiempo real,
- no ocultar productos faltantes,
- no llamar oferta a una diferencia común,
- no mostrar Tottus/Líder como activos.

---

## 16. Flujo demo obligatorio

La nueva app debe permitir este flujo sin errores:

1. Entrar a landing.
2. Ver supermercados cubiertos.
3. Ver carrusel de oportunidades.
4. Entrar como demo.
5. Llegar al dashboard.
6. Buscar un producto.
7. Agregar producto a compra pendiente.
8. Agregar dos o tres productos más.
9. Ir a compra pendiente.
10. Comparar supermercados.
11. Ver tienda recomendada.
12. Guardar o confirmar compra.
13. Enviar productos a despensa.
14. Ver historial actualizado.
15. Ver despensa actualizada.

---

## 17. Manejo de datos

Usar los endpoints y datos existentes cuando sea posible.

No inventar backend nuevo si la API actual ya entrega lo necesario.

Si hace falta adaptar una capa de cliente, crearla en:

```txt
lib/api.ts
```

No mezclar llamadas API directamente dentro de componentes visuales.

---

## 18. Persistencia

Para MVP se permite usar `localStorage` para:

- sesión demo,
- compra pendiente,
- historial,
- listas guardadas,
- despensa.

No implementar base de datos de usuarios.

---

## 19. Eliminación del frontend anterior

Antes de finalizar:

- eliminar imports rotos,
- eliminar rutas antiguas,
- eliminar componentes antiguos que ya no se usan,
- eliminar estilos antiguos no usados,
- eliminar pantallas antiguas,
- no dejar dos frontends conviviendo,
- no dejar una UI vieja oculta,
- no dejar navegación antigua.

Si por seguridad se conserva algún archivo antiguo, debe quedar marcado como deprecated con un comentario al inicio:

```ts
/**
 * @deprecated Frontend anterior de Cartwise.
 *
 * Este archivo pertenece a la interfaz previa y no forma parte
 * de la reconstrucción Next.js + TypeScript + Tailwind + shadcn/ui.
 *
 * No debe importarse ni usarse en el nuevo frontend.
 */
```

La preferencia es eliminar lo antiguo cuando sea seguro.

---

## 20. README

Actualizar `README.md` para reflejar:

- nuevo frontend con Next.js,
- uso de TypeScript,
- uso de Tailwind CSS,
- uso de shadcn/ui,
- flujo MVP real,
- funcionalidades activas,
- funcionalidades fuera del MVP,
- supermercados cubiertos,
- nota de precios referenciales,
- comandos actualizados.

---

## 21. Comandos esperados

Instalar dependencias necesarias.

Agregar shadcn/ui.

Ejecutar:

```bash
npm install
npm run lint
npm run build
```

Si se define un nuevo comando de desarrollo, documentarlo en README.

---

## 22. Criterios de aceptación

El trabajo se considera correcto solo si:

- el frontend anterior fue eliminado o completamente desconectado,
- la app nueva usa Next.js + TypeScript + React + Tailwind CSS + shadcn/ui,
- la app compila,
- la navegación solo contiene pantallas MVP,
- no aparece “canasta activa”,
- landing nueva existe,
- dashboard nuevo existe,
- catálogo nuevo existe,
- compra pendiente nueva existe,
- comparación nueva existe,
- historial nuevo existe,
- listas guardadas nuevas existen,
- despensa nueva existe,
- el flujo demo obligatorio funciona,
- README está actualizado,
- no se modificó ni rompió el scraper,
- no se rompió la API necesaria para comparar precios,
- el estilo visual no parece una plantilla genérica de IA,
- la interfaz se siente como supermercado online moderno.

---

## 23. Entrega final esperada

Al terminar, entregar un resumen con:

- archivos eliminados,
- archivos nuevos,
- archivos modificados,
- nueva estructura frontend,
- funcionalidades activas,
- funcionalidades descartadas,
- comandos ejecutados,
- resultado de build/lint,
- problemas pendientes.
