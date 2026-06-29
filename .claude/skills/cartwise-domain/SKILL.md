---
name: cartwise-domain
description: Use when working on Cartwise domain logic, supermarket coverage, product comparison, pending purchases, saved lists, purchase history, pantry, or user-facing terminology.
---

# Cartwise Domain

Cartwise is an academic/non-commercial MVP for comparing food prices between Chilean supermarkets using previously captured and normalized catalog snapshots.

Active supermarkets:
- Jumbo
- Santa Isabel
- Unimarc
- El Trébol

Coming soon only:
- Tottus
- Líder

Core MVP flow:
Landing → Login demo → Dashboard → Product search → Compra pendiente → Comparison → Recommended plan → Confirm/save purchase → History / Pantry.

Required terminology:
- Use “compra pendiente”, never “canasta activa”.
- Use “listas guardadas”.
- Use “historial de compras”.
- Use “despensa” or “almacén del hogar”.
- Use “diferencias destacadas” for price gaps.
- Use “ofertas temporales” only when there is real offer data.
- Use “precios referenciales según último snapshot disponible”.

Do not promise real-time prices.
Do not call price differences “offers” unless there is an actual offer signal.
