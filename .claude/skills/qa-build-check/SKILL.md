---
name: qa-build-check
description: Use before considering Cartwise ready. Checks build, lint, navigation, MVP scope, UI terminology, and demo flow.
---

# QA Build Check for Cartwise

Verify:
1. npm run lint passes.
2. npm run build passes.
3. npm run dev:full starts the app and API.
4. Navigation only exposes MVP screens.
5. No UI text says “canasta activa”.
6. Landing shows active stores correctly.
7. Tottus and Líder are not shown as active stores.
8. Offers and highlighted differences are not mixed.
9. Products can be added to compra pendiente.
10. Compra pendiente can be compared.
11. Comparison shows recommendation, coverage, missing products, and estimated saving.
12. Confirming a purchase saves history.
13. Confirmed purchase can send products to pantry.
14. Pantry can add, remove, increase, and decrease products.
15. README matches current MVP behavior.

If any check fails, fix it or report it clearly.
