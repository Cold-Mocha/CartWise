# Cartwise — Ajustes de frontend MVP estilo supermercado

## Objetivo

Aplicar una segunda pasada de ajustes al nuevo frontend de Cartwise.  
No reconstruir todo desde cero nuevamente. Mantener el frontend Next.js actual, pero corregir interfaz, flujo y comportamiento según estas instrucciones.

El objetivo es que Cartwise se parezca más a una web moderna de supermercado online, especialmente en:

- Búsqueda / catálogo de productos.
- Dashboard / inicio.
- Despensa / almacén del hogar.
- Comparación de supermercados.
- Feedback visual de compra pendiente.
- Flujo de onboarding inicial.

Mantener el alcance MVP. No agregar funcionalidades grandes fuera de lo descrito.

---

## Stack actual

El proyecto actualmente usa:

- Next.js App Router.
- TypeScript.
- React.
- Tailwind CSS.
- shadcn/ui o primitives propios.
- Estado demo con `localStorage`.
- API vía route handlers de Next conectados al bridge Python.

---

## Skills sugeridas

Usar estas skills si están disponibles:

- `cartwise-domain`
- `mvp-scope-guard`
- `frontend-design`
- `ux-copy-spanish`
- `qa-build-check`
- `readme-updater`

---

# 1. Landing / sección principal pública

En la página principal pública, eliminar completamente la tabla o bloque llamado:

> “Tu compra, comparada”

Por ahora no reemplazarlo por otra tabla. Solo eliminarlo para dejar espacio a una sección futura.

Mantener:

- Hero.
- Supermercados cubiertos.
- Carruseles.
- Mensaje de valor.
- Botones de entrada demo.

No dejar espacios vacíos ni layout roto.

---

# 2. Dashboard / Inicio

En la dashboard eliminar estos elementos:

- Texto: `Snapshot 2026-06-24 · 4 supermercados cubiertos`.
- Métrica/card `Ahorro confirmado`.
- Barra o bloque `Estado de los datos`.

La dashboard debe quedar más limpia y centrada en el usuario, no en el sistema.

Mantener o mejorar:

- Gasto acumulado del mes.
- Historial reciente de compras.
- Compra pendiente, si existe.
- Diferencias destacadas.
- Ofertas temporales si existen datos reales.
- Resumen de listas guardadas.
- Resumen de despensa.

## Agregar gasto vs presupuesto mensual

Agregar una visualización clara de:

> “Gasto registrado del mes vs presupuesto mensual”

Debe ser una línea, barra o progress visual que indique:

- Presupuesto mensual.
- Gasto acumulado actual.
- Monto restante.
- Porcentaje usado.

Ejemplo:

```txt
Llevas $86.500 de $250.000 este mes
Te quedan $163.500
```

Si no hay presupuesto configurado, usar un presupuesto demo razonable y editable en estado local o constantes del MVP.

## Corregir problema actual

Después de confirmar una compra, en Inicio/Dashboard el gasto acumulado del mes no se ve bien.

Revisar:

- Cálculo.
- Formato.
- Actualización de estado.
- Hidratación desde `localStorage`.
- Redirección después de confirmar compra.

---

# 3. Footer global

Eliminar del footer, en todas las pestañas, el texto:

> `Jumbo · Santa Isabel · Unimarc · El Trébol`

No mostrar esa lista fija en el footer global.

Si se necesita mostrar cobertura de supermercados, hacerlo solo en secciones específicas como landing o catálogo, no en el footer persistente.

---

# 4. Búsqueda de productos / Catálogo

Reestructurar la pantalla de búsqueda para parecerse más a una página de supermercado online.

Inspiración general:

- Página de resultados de supermercado.
- Cards de productos.
- Filtros laterales o superiores.
- Slider de precio.
- Filtros por marca.
- Filtros por supermercado.
- Filtros por categoría.
- Filtros por sellos / etiquetas.
- Carruseles de productos cuando no hay búsqueda activa.

No copiar literalmente ninguna web. Solo usar patrones generales.

## 4.1 Buscador principal

Mantener un buscador grande y visible.

Debe buscar por:

- Nombre.
- Marca.
- Código si aplica.

## 4.2 Filtros estilo supermercado

Agregar o mejorar filtros:

- Rango de precio con slider.
- Marca.
- Supermercado.
- Categoría.
- Sellos o etiquetas.
- Solo productos destacados.
- Solo productos con precio en más de una tienda.

## 4.3 Eliminar filtros técnicos

Eliminar de la UI principal:

- `Exacto por EAN`.
- `Comparable`.
- `Diferencia destacada` como filtro técnico actual.

No exponer conceptos técnicos como EAN al usuario general en filtros principales.

## 4.4 Nueva regla de “destacado”

Cambiar la lógica visual de “destacado”.

Un producto debe considerarse destacado cuando el precio más bajo sea al menos 20% menor que el precio más alto del mismo producto o producto comparable.

Regla:

```txt
precio_min <= precio_max * 0.8
```

Equivalente:

```txt
diferencia_porcentual >= 20%
```

No marcar como destacado solo porque existe una diferencia pequeña.

## 4.5 Cards de producto

Cada card debe mostrar:

- Imagen del producto si existe.
- Nombre.
- Marca si existe.
- Categoría.
- Precio más bajo.
- Supermercado con precio más bajo.
- Ahorro/diferencia si es destacado.
- Botón `Agregar`.
- Sellos/etiquetas relevantes si existen.
- Indicador visual si es destacado.

## 4.6 Hover sobre producto

Cuando el usuario pase el cursor sobre un producto, mostrar un tooltip, popover o panel compacto con los precios disponibles en distintos supermercados.

Debe mostrar:

- Supermercado.
- Precio.
- Si es el menor precio.
- Si no hay precio, no inventarlo.

Ejemplo:

```txt
Jumbo: $1.390
Unimarc: $1.190 · Mejor precio
Santa Isabel: sin dato
```

## 4.7 Detalle de producto

En los detalles de producto, incluir la foto del producto si existe.

El detalle debe mostrar:

- Foto.
- Nombre.
- Marca.
- Categoría.
- Precios por supermercado.
- Mejor precio.
- Botón para agregar a compra pendiente.
- Botón para agregar a despensa, si corresponde.

---

# 5. Catálogo sin búsqueda activa

Cuando el usuario entre a `Productos` y todavía no haya escrito nada en el buscador, no mostrar una pantalla vacía simple.

Mostrar una experiencia tipo supermercado con carruseles.

Orden recomendado:

## 5.1 Carrusel personalizado

Título sugerido:

> “Ofertas o diferencias destacadas en productos que ya compraste”

Debe basarse primero en:

- Historial de compras.
- Compras confirmadas.
- Productos comprados previamente.

Si no hay historial, mostrar mensaje y usar productos destacados generales.

## 5.2 Carruseles por categorías

Crear carruseles como:

- Mejores diferencias en aceites.
- Mejores diferencias en lácteos.
- Mejores diferencias en arroz, fideos y harinas.
- Mejores diferencias en bebidas.
- Mejores diferencias en abarrotes.
- Otras categorías disponibles según los datos reales.

Cada carrusel debe usar productos reales del backend cuando sea posible.

No inventar productos.

Cada card del carrusel debe permitir:

- Ver precios.
- Agregar a compra pendiente.
- Agregar a despensa si aplica.

Los carruseles deben tener movimiento o navegación horizontal para sentirse como web de supermercado.

---

# 6. Despensa / Almacén del hogar

Cambiar el flujo de agregar productos a despensa.

Actualmente no debe ser solo un formulario manual básico. La despensa debe integrarse con el buscador de productos.

## 6.1 Encabezado

En la pantalla Despensa, mantener el encabezado:

```txt
Almacén del hogar
Despensa
Lleva el control de lo que ya tienes en casa.
```

Mantener botón:

```txt
Agregar producto
```

## 6.2 Nuevo flujo para agregar productos

Al hacer clic en `Agregar producto`, abrir una pantalla, modal amplio o vista secundaria con buscador de productos.

El usuario debe poder:

1. Buscar productos del catálogo real.
2. Seleccionar varios productos.
3. Ver los productos seleccionados marcados en verde.
4. Ver al costado un panel/resumen llamado `Seleccionados`.
5. Presionar un botón `Agregar a la despensa`.
6. Volver a la vista de despensa después de agregarlos.

## 6.3 Vista de productos en despensa

La despensa debe mostrar productos sin precio como dato principal.

Mostrar:

- Nombre del producto.
- Categoría.
- Cantidad.
- Unidad si existe.
- Origen: manual o compra confirmada.
- Fecha de actualización.

No mostrar el precio como parte principal de la lista.

## 6.4 Hover en producto de despensa

Cuando el usuario pase el mouse sobre un producto en despensa, mostrar un botón o acción:

```txt
Agregar a compra pendiente
```

También mostrar en hover:

- Precio más barato disponible.
- Supermercado donde está más barato.

Ejemplo:

```txt
Mejor precio: $1.190 en Unimarc
Agregar a compra pendiente
```

Si no hay precio disponible, mostrar:

```txt
Sin precio disponible en el último snapshot
```

## 6.5 Buscador interno de despensa

La despensa debe tener buscador bajo el título.

Ubicación:

Debajo de:

```txt
Almacén del hogar
Despensa
Lleva el control de lo que ya tienes en casa.
```

Agregar input:

```txt
Buscar en mi despensa…
```

Debe filtrar los productos ya registrados en despensa.

---

# 7. Compra pendiente y feedback visual

Cuando se agreguen productos a la compra pendiente, debe haber feedback visual claro.

Problema actual:

Se agregan cosas, pero visualmente no se nota suficiente.

Cambio solicitado:

Cuando exista una compra pendiente con productos:

- El rectángulo/card de compra pendiente debe cambiar a verde.
- Debe decir claramente `Compra pendiente`.
- Debe mostrar cantidad de productos/unidades.
- Debe tener una animación breve o microinteracción para notar que algo quedó pendiente.

Ejemplos de animación:

- Pulso suave.
- Borde verde animado.
- Pequeño movimiento al agregar.
- Toast claro.
- Badge que aumenta.

No hacer animaciones excesivas.

---

# 8. Onboarding / recorrido inicial

Agregar un proceso de inicio/onboarding después del primer ingreso demo.

Objetivo:

Explicar al usuario cómo usar Cartwise y sus funcionalidades principales.

Este flujo puede llamarse:

- Onboarding.
- Primer recorrido.
- Guía inicial.
- Tour de inicio.

Debe aparecer después de entrar a la cuenta demo por primera vez.

Debe explicar:

- Qué es Cartwise.
- Cómo buscar productos.
- Cómo agregar productos a una compra pendiente.
- Cómo comparar supermercados.
- Cómo entender diferencias por precio.
- Cómo comprar por unidades/cantidades.
- Cómo guardar listas.
- Cómo confirmar compras.
- Cómo usar la despensa.

Ideal:

Implementar como tour por pasos sobre la app o como modal por etapas.

Debe permitir:

- Siguiente.
- Atrás.
- Saltar.
- Finalizar.

Debe guardarse en `localStorage` para no mostrarse siempre.

Ejemplo de pasos:

1. “Busca productos como en un supermercado online.”
2. “Agrega productos a tu compra pendiente.”
3. “Ajusta cantidades antes de comparar.”
4. “Cartwise compara por tienda y prioriza cobertura.”
5. “Guarda listas para repetir compras.”
6. “Usa la despensa para no comprar lo que ya tienes.”

---

# 9. Comparación de supermercados

En la pestaña de comparación de supermercados, eliminar debajo del detalle el texto:

```txt
Precios referenciales según el último snapshot disponible (2026-06-24).
```

No eliminar todas las notas de transparencia del sistema si son necesarias, pero este texto específico bajo el detalle debe salir.

## 9.1 Logos de supermercados

En las comparaciones, cambiar los íconos genéricos de supermercado por logos/íconos de los supermercados.

Supermercados:

- Jumbo.
- Santa Isabel.
- Unimarc.
- El Trébol.

Instrucción para logos:

- Descargar o incorporar íconos/logos como assets locales dentro de `public/brands/` o ruta equivalente.
- No usar hotlinks externos.
- Nombrar archivos de forma clara:
  - `jumbo.svg` o `jumbo.png`
  - `santa-isabel.svg` o `santa-isabel.png`
  - `unimarc.svg` o `unimarc.png`
  - `el-trebol.svg` o `el-trebol.png`

Si no se pueden descargar logos por licencia o acceso, usar placeholders locales bien diseñados con iniciales y colores, pero dejar el código preparado para reemplazar por logos reales.

Usar estos logos en:

- Comparaciones.
- Cards de supermercado.
- Catálogo si muestra tienda.
- Landing si corresponde.
- Hover de precios por supermercado.

---

# 10. Confirmación de compra

Cuando el usuario confirme una compra, ingrese el precio real y avance al siguiente paso, debe volver automáticamente a Inicio/Dashboard.

Flujo esperado:

```txt
Confirmar compra → ingresar precio real → siguiente/confirmar → guardar compra → actualizar gasto mensual → volver a Inicio
```

Después de volver a Inicio, debe verse actualizado:

- Gasto acumulado del mes.
- Historial reciente.
- Compra confirmada.
- Despensa si el usuario agregó productos.

---

# 11. Correcciones visuales y coherencia

Mantener estética:

- Blanco y verde.
- Moderna.
- Inspirada en supermercado online.
- Cards comerciales.
- Carruseles vivos.
- Tipografía clara y expresiva.

Evitar:

- Estilo de dashboard SaaS genérico.
- UI demasiado técnica.
- Exponer conceptos como EAN en la UI principal.
- Saturar la dashboard.
- Mezclar ofertas con diferencias destacadas.

Terminología:

- Usar `compra pendiente`.
- No usar `canasta activa`.
- Usar `diferencias destacadas` solo para brechas de precio >= 20%.
- Usar `ofertas temporales` solo si existe señal real de oferta.
- No prometer precios en tiempo real.

---

# 12. Criterios de aceptación

El cambio se considera correcto si:

1. Se elimina `Tu compra, comparada` de landing.
2. Dashboard ya no muestra snapshot en encabezado.
3. Dashboard ya no muestra `Ahorro confirmado`.
4. Dashboard ya no muestra `Estado de los datos`.
5. Dashboard muestra gasto mensual vs presupuesto mensual.
6. Al confirmar compra, Dashboard actualiza gasto mensual correctamente.
7. Footer ya no muestra `Jumbo · Santa Isabel · Unimarc · El Trébol`.
8. Catálogo parece más una página de supermercado online.
9. Catálogo tiene filtros por precio, marca, supermercado, categoría y etiquetas.
10. Catálogo no muestra `Exacto por EAN` como filtro principal.
11. Diferencia destacada se calcula solo si la diferencia es >= 20%.
12. Hover de producto muestra precios por supermercado.
13. Si no hay búsqueda activa, Productos muestra carruseles por historial/categoría.
14. Despensa agrega productos desde buscador de productos.
15. Despensa permite seleccionar varios productos antes de agregarlos.
16. Productos seleccionados aparecen en verde.
17. Despensa tiene buscador interno.
18. Despensa no muestra precio como dato principal.
19. Hover en despensa muestra mejor precio y botón para agregar a compra pendiente.
20. Compra pendiente cambia visualmente a verde cuando tiene productos.
21. Compra pendiente muestra animación o feedback al agregar productos.
22. Existe onboarding o tour inicial.
23. Comparación usa logos/íconos de supermercados.
24. Detalle de producto incluye foto.
25. Al confirmar compra, vuelve a Inicio.
26. Lint y build pasan.

---

# 13. Preguntas o bloqueos

Si alguna de estas instrucciones no se puede implementar por falta de datos o porque el código actual no tiene soporte, no inventes comportamiento falso.

Detente y pregunta específicamente:

- Qué dato falta.
- Qué archivo o endpoint no lo permite.
- Qué alternativa MVP recomiendas.

No agregues datos falsos de ofertas.
No inventes marcas, sellos, categorías o logos si no están disponibles o no pueden inferirse correctamente.

---

# 14. Aclaraciones por defecto

Si no se especifica otra cosa, usar estas decisiones por defecto:

## Sellos

Interpretar “sellos” como etiquetas de interfaz, no como sellos nutricionales chilenos.

Ejemplos:

- Mejor precio.
- Destacado.
- Comprado antes.
- En despensa.
- Disponible en varias tiendas.
- Oferta temporal, solo si existe señal real.

No inventar sellos nutricionales como “alto en azúcar”, “alto en sodio”, etc., si no existen en los datos.

## Logos

Si no se pueden descargar logos con fuente/licencia clara, usar placeholders locales diseñados con iniciales y colores.

Ejemplos:

- J para Jumbo.
- SI para Santa Isabel.
- U para Unimarc.
- ET para El Trébol.

El código debe quedar preparado para reemplazar esos placeholders por logos reales en `public/brands/`.

## Presupuesto mensual

Usar un presupuesto demo inicial de:

```txt
$250.000 CLP
```

Debe quedar definido como constante o estado local editable en el futuro.

---

# 15. Entrega final esperada

Al terminar, entregar resumen con:

- Archivos modificados.
- Componentes nuevos.
- Componentes eliminados.
- Cambios de navegación.
- Cambios de dashboard.
- Cambios de catálogo.
- Cambios de despensa.
- Cambios de comparación.
- Resultado de `npm run lint`.
- Resultado de `npm run build`.
- Pendientes o bloqueos reales si existen.
