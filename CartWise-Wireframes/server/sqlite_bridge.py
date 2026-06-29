#!/usr/bin/env python3
from __future__ import annotations

import json
import sqlite3
import sys
import unicodedata
from pathlib import Path


STORE_NAMES = {
    "el_trebol": "El Trébol",
    "jumbo": "Jumbo",
    "santa_isabel": "Santa Isabel",
    "unimarc": "Unimarc",
}


def normalize_text(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = value.lower()
    return " ".join(value.split())


def rows(cursor):
    return [dict(row) for row in cursor.fetchall()]


def store_label(key: str | None) -> str:
    return STORE_NAMES.get(key or "", (key or "").replace("_", " ").title())


def decorate_store(row: dict) -> dict:
    row["label"] = store_label(row.get("nombre"))
    return row


def decorate_price_store(row: dict) -> dict:
    store_key = row.get("precio_min_store_key")
    row["precio_min_store_label"] = store_label(store_key) if store_key else None
    return row


def positive_int(value, default=0):
    try:
        return max(0, int(value))
    except Exception:
        return default


def get_stores(con: sqlite3.Connection) -> list[dict]:
    return [
        decorate_store(dict(row))
        for row in con.execute(
            "SELECT id, nombre, plataforma, sitio_web FROM supermercado ORDER BY id"
        )
    ]


def health(con: sqlite3.Connection, _payload: dict) -> dict:
    counts = {}
    for key, sql in {
        "stores": "SELECT COUNT(*) FROM supermercado",
        "products": "SELECT COUNT(*) FROM producto_marca",
        "offers": "SELECT COUNT(*) FROM oferta",
        "exactComparable": "SELECT COUNT(*) FROM v_comparacion WHERE n_tiendas >= 2",
        "genericComparable": "SELECT COUNT(*) FROM v_comparacion_generica WHERE n_tiendas >= 2",
    }.items():
        counts[key] = con.execute(sql).fetchone()[0]
    return {"ok": True, "counts": counts, "stores": get_stores(con)}


def token_clauses(prefix: str, q: str, params: list) -> str:
    tokens = [t for t in normalize_text(q).split() if t]
    if not tokens:
        return "1=1"
    clauses = []
    for token in tokens[:5]:
        like = f"%{token}%"
        if prefix == "pm":
            clauses.append(
                "(pm.nombre_norm LIKE ? OR pm.marca_norm LIKE ? OR pm.ean LIKE ? OR lower(pm.nombre) LIKE ?)"
            )
            params.extend([like, like, like, like])
        else:
            clauses.append("(pg.nombre_generico LIKE ? OR pg.categoria_norm LIKE ?)")
            params.extend([like, like])
    return " AND ".join(clauses)


def search_products(con: sqlite3.Connection, payload: dict) -> dict:
    q = str(payload.get("q") or "").strip()
    limit = min(50, positive_int(payload.get("limit"), 12))
    params: list = []
    where = token_clauses("pm", q, params)
    params.append(limit)
    exact = rows(
        con.execute(
            f"""
            SELECT
                pm.id,
                'product' AS kind,
                pm.ean,
                pm.nombre,
                pm.marca,
                pm.categoria,
                pm.generico_id,
                pg.nombre_generico AS generico_nombre,
                pg.categoria_norm AS generico_categoria,
                pg.unidad_base AS generico_unidad_base,
                pg.contenido_total_base AS generico_contenido_total_base,
                COALESCE(vc.n_tiendas, 0) AS n_tiendas,
                vc.precio_min,
                vc.precio_max,
                vc.diferencia,
                min_offer.precio_min_store_key,
                min_offer.precio_min_store_url,
                min_offer.precio_min_disponible,
                'Exacto por EAN' AS match_label
            FROM producto_marca pm
            LEFT JOIN producto_generico pg ON pg.id = pm.generico_id
            LEFT JOIN v_comparacion vc ON vc.id = pm.id
            LEFT JOIN (
                SELECT
                    o.producto_marca_id,
                    s.nombre AS precio_min_store_key,
                    s.sitio_web AS precio_min_store_url,
                    o.disponible AS precio_min_disponible
                FROM oferta o
                JOIN supermercado s ON s.id = o.supermercado_id
                WHERE o.precio > 0
                  AND NOT EXISTS (
                    SELECT 1
                    FROM oferta o2
                    WHERE o2.producto_marca_id = o.producto_marca_id
                      AND o2.precio > 0
                      AND (
                        o2.precio < o.precio
                        OR (o2.precio = o.precio AND o2.supermercado_id < o.supermercado_id)
                      )
                  )
            ) min_offer ON min_offer.producto_marca_id = pm.id
            WHERE {where}
            ORDER BY
                CASE WHEN vc.n_tiendas >= 2 THEN 0 ELSE 1 END,
                CASE WHEN vc.diferencia IS NULL THEN 1 ELSE 0 END,
                vc.diferencia DESC,
                pm.nombre ASC
            LIMIT ?
            """,
            params,
        )
    )
    for item in exact:
        decorate_price_store(item)
    return {"items": exact}


def search_generic(con: sqlite3.Connection, payload: dict) -> dict:
    q = str(payload.get("q") or "").strip()
    limit = min(30, positive_int(payload.get("limit"), 8))
    params: list = []
    where = token_clauses("pg", q, params)
    params.append(limit)
    generic = rows(
        con.execute(
            f"""
            SELECT
                pg.id,
                'generic' AS kind,
                pg.nombre_generico AS nombre,
                NULL AS marca,
                pg.categoria_norm AS categoria,
                pg.unidad_base,
                pg.contenido_total_base,
                pg.pack_unidades,
                COALESCE(vcg.n_tiendas, 0) AS n_tiendas,
                vcg.precio_min,
                vcg.precio_max,
                vcg.diferencia,
                vcg.precio_unitario_min,
                vcg.precio_unitario_max,
                vcg.diferencia_unitaria,
                min_store.precio_min_store_key,
                min_store.precio_min_store_url,
                min_store.precio_min_disponible,
                'Comparable por unidad' AS match_label
            FROM producto_generico pg
            LEFT JOIN v_comparacion_generica vcg ON vcg.generico_id = pg.id
            LEFT JOIN (
                SELECT *
                FROM (
                    SELECT
                        per_store.*,
                        ROW_NUMBER() OVER (
                            PARTITION BY per_store.generico_id
                            ORDER BY per_store.precio_min_tienda ASC, per_store.supermercado_id ASC
                        ) AS rn
                    FROM (
                        SELECT
                            pgm.generico_id,
                            o.supermercado_id,
                            s.nombre AS precio_min_store_key,
                            s.sitio_web AS precio_min_store_url,
                            MAX(o.disponible) AS precio_min_disponible,
                            MIN(o.precio) AS precio_min_tienda
                        FROM producto_generico_miembro pgm
                        JOIN oferta o ON o.producto_marca_id = pgm.producto_marca_id
                        JOIN supermercado s ON s.id = o.supermercado_id
                        WHERE pgm.confirmado = 1 AND o.precio > 0
                        GROUP BY pgm.generico_id, o.supermercado_id
                    ) per_store
                )
                WHERE rn = 1
            ) min_store ON min_store.generico_id = pg.id
            WHERE {where}
            ORDER BY
                CASE WHEN vcg.n_tiendas >= 2 THEN 0 ELSE 1 END,
                CASE WHEN vcg.diferencia_unitaria IS NULL THEN 1 ELSE 0 END,
                vcg.diferencia_unitaria DESC,
                pg.nombre_generico ASC
            LIMIT ?
            """,
            params,
        )
    )
    for item in generic:
        decorate_price_store(item)
    return {"items": generic}


def top_deals(con: sqlite3.Connection, payload: dict) -> dict:
    limit = min(30, positive_int(payload.get("limit"), 8))
    exact = rows(
        con.execute(
            """
            SELECT
                id,
                'product' AS kind,
                ean,
                nombre,
                marca,
                categoria,
                n_tiendas,
                precio_min,
                precio_max,
                diferencia,
                min_offer.precio_min_store_key,
                min_offer.precio_min_store_url,
                min_offer.precio_min_disponible,
                'Exacto por EAN' AS match_label
            FROM v_comparacion vc
            LEFT JOIN (
                SELECT
                    o.producto_marca_id,
                    s.nombre AS precio_min_store_key,
                    s.sitio_web AS precio_min_store_url,
                    o.disponible AS precio_min_disponible
                FROM oferta o
                JOIN supermercado s ON s.id = o.supermercado_id
                WHERE o.precio > 0
                  AND NOT EXISTS (
                    SELECT 1
                    FROM oferta o2
                    WHERE o2.producto_marca_id = o.producto_marca_id
                      AND o2.precio > 0
                      AND (
                        o2.precio < o.precio
                        OR (o2.precio = o.precio AND o2.supermercado_id < o.supermercado_id)
                      )
                  )
            ) min_offer ON min_offer.producto_marca_id = vc.id
            WHERE n_tiendas >= 2 AND diferencia IS NOT NULL
            ORDER BY diferencia DESC
            LIMIT ?
            """,
            (limit,),
        )
    )
    for item in exact:
        decorate_price_store(item)
    return {"items": exact}


def deals_by_category(con: sqlite3.Connection, payload: dict) -> dict:
    # Carruseles tipo supermercado: por cada categoría con más diferencias
    # destacadas reales (>=20%, plan §4.4 y §5.2), devuelve sus mejores items.
    # Solo lectura sobre la misma vista de comparación; no inventa datos.
    per_category = min(20, positive_int(payload.get("perCategory"), 10))
    max_categories = min(12, positive_int(payload.get("categories"), 6))
    candidates = rows(
        con.execute(
            """
            SELECT
                id,
                'product' AS kind,
                ean,
                nombre,
                marca,
                categoria,
                n_tiendas,
                precio_min,
                precio_max,
                diferencia,
                min_offer.precio_min_store_key,
                min_offer.precio_min_store_url,
                min_offer.precio_min_disponible,
                'Exacto por EAN' AS match_label
            FROM v_comparacion vc
            LEFT JOIN (
                SELECT
                    o.producto_marca_id,
                    s.nombre AS precio_min_store_key,
                    s.sitio_web AS precio_min_store_url,
                    o.disponible AS precio_min_disponible
                FROM oferta o
                JOIN supermercado s ON s.id = o.supermercado_id
                WHERE o.precio > 0
                  AND NOT EXISTS (
                    SELECT 1
                    FROM oferta o2
                    WHERE o2.producto_marca_id = o.producto_marca_id
                      AND o2.precio > 0
                      AND (
                        o2.precio < o.precio
                        OR (o2.precio = o.precio AND o2.supermercado_id < o.supermercado_id)
                      )
                  )
            ) min_offer ON min_offer.producto_marca_id = vc.id
            WHERE n_tiendas >= 2
              AND diferencia IS NOT NULL
              AND precio_max > 0
              AND diferencia >= precio_max * 0.2
              AND categoria IS NOT NULL
              AND categoria <> ''
            ORDER BY diferencia DESC
            LIMIT 800
            """
        )
    )
    groups: dict[str, list[dict]] = {}
    order: list[str] = []
    for item in candidates:
        cat = item["categoria"]
        if cat not in groups:
            groups[cat] = []
            order.append(cat)
        if len(groups[cat]) < per_category:
            decorate_price_store(item)
            groups[cat].append(item)
    # Prioriza categorías con más items destacados.
    order.sort(key=lambda c: len(groups[c]), reverse=True)
    result = [
        {"categoria": cat, "items": groups[cat]}
        for cat in order[:max_categories]
        if len(groups[cat]) >= 3
    ]
    return {"groups": result}


def product_offers(con: sqlite3.Connection, payload: dict) -> dict:
    product_id = positive_int(payload.get("id"))
    product = con.execute(
        """
        SELECT id, ean, nombre, marca, categoria, generico_id
        FROM producto_marca
        WHERE id = ?
        """,
        (product_id,),
    ).fetchone()
    offers = rows(
        con.execute(
            """
            SELECT
                s.id AS store_id,
                s.nombre AS store_key,
                s.sitio_web,
                o.sku_tienda,
                o.url,
                o.precio,
                o.precio_lista,
                o.disponible,
                o.stock,
                o.capturado_en
            FROM oferta o
            JOIN supermercado s ON s.id = o.supermercado_id
            WHERE o.producto_marca_id = ?
            ORDER BY s.id
            """,
            (product_id,),
        )
    )
    for offer in offers:
        offer["store_label"] = store_label(offer.get("store_key"))
    return {"product": dict(product) if product else None, "offers": offers}


def generic_best_offers(con: sqlite3.Connection, generic_id: int) -> list[dict]:
    raw = rows(
        con.execute(
            """
            SELECT
                s.id AS store_id,
                s.nombre AS store_key,
                s.sitio_web,
                pm.id AS product_id,
                pm.nombre AS product_name,
                pm.marca,
                pm.ean,
                o.sku_tienda,
                o.url,
                o.precio,
                o.precio_lista,
                o.disponible,
                o.stock,
                o.capturado_en
            FROM producto_generico_miembro pgm
            JOIN producto_marca pm ON pm.id = pgm.producto_marca_id
            JOIN oferta o ON o.producto_marca_id = pm.id
            JOIN supermercado s ON s.id = o.supermercado_id
            WHERE pgm.generico_id = ? AND pgm.confirmado = 1 AND o.precio > 0
            ORDER BY s.id, o.precio ASC
            """,
            (generic_id,),
        )
    )
    best: dict[int, dict] = {}
    for offer in raw:
        sid = offer["store_id"]
        if sid not in best or (offer["precio"] or 0) < (best[sid]["precio"] or 0):
            offer["store_label"] = store_label(offer.get("store_key"))
            best[sid] = offer
    return list(best.values())


def item_descriptor(con: sqlite3.Connection, kind: str, item_id: int) -> dict | None:
    if kind == "generic":
        row = con.execute(
            """
            SELECT
                id,
                'generic' AS kind,
                nombre_generico AS nombre,
                NULL AS marca,
                categoria_norm AS categoria,
                unidad_base,
                contenido_total_base,
                'Comparable por unidad' AS match_label
            FROM producto_generico
            WHERE id = ?
            """,
            (item_id,),
        ).fetchone()
    else:
        row = con.execute(
            """
            SELECT
                id,
                'product' AS kind,
                nombre,
                marca,
                categoria,
                ean,
                'Exacto por EAN' AS match_label
            FROM producto_marca
            WHERE id = ?
            """,
            (item_id,),
        ).fetchone()
    return dict(row) if row else None


def offers_for_item(con: sqlite3.Connection, kind: str, item_id: int) -> list[dict]:
    if kind == "generic":
        return generic_best_offers(con, item_id)
    return product_offers(con, {"id": item_id})["offers"]


def compare_basket(con: sqlite3.Connection, payload: dict) -> dict:
    stores = get_stores(con)
    requested = payload.get("items") or []
    parsed_items = []
    for raw in requested:
        try:
            kind = "generic" if raw.get("kind") == "generic" else "product"
            item_id = positive_int(raw.get("id"))
            quantity = max(1, positive_int(raw.get("quantity"), 1))
        except Exception:
            continue
        descriptor = item_descriptor(con, kind, item_id)
        if not descriptor:
            continue
        parsed_items.append({
            "kind": kind,
            "id": item_id,
            "quantity": quantity,
            "descriptor": descriptor,
            "offers": offers_for_item(con, kind, item_id),
        })

    store_results = []
    for store in stores:
        total = 0
        priced = 0
        missing = 0
        lines = []
        for item in parsed_items:
            offer = next((o for o in item["offers"] if o["store_id"] == store["id"]), None)
            unit_base = item["descriptor"].get("unidad_base")
            item_base = item["descriptor"].get("contenido_total_base")
            if offer and offer.get("precio") and offer["precio"] > 0:
                line_total = offer["precio"] * item["quantity"]
                total += line_total
                priced += 1
                # Precio por unidad base: solo tiene sentido en genéricos con
                # contenido base conocido; justifica el "comparable por unidad".
                unit_price = (
                    offer["precio"] / item_base
                    if item["kind"] == "generic" and item_base
                    else None
                )
                # EAN para la miniatura: en exactos viene del descriptor; en genéricos,
                # el EAN del producto realmente emparejado en esta tienda viene en la oferta.
                line_ean = (
                    offer.get("ean")
                    if item["kind"] == "generic"
                    else item["descriptor"].get("ean")
                )
                lines.append({
                    "itemId": item["id"],
                    "kind": item["kind"],
                    "name": item["descriptor"]["nombre"],
                    "brand": item["descriptor"].get("marca"),
                    "quantity": item["quantity"],
                    "price": offer["precio"],
                    "lineTotal": line_total,
                    "unitPrice": unit_price,
                    "unitBase": unit_base,
                    "available": bool(offer.get("disponible")),
                    "url": offer.get("url"),
                    "ean": line_ean,
                    "matchedProductName": offer.get("product_name"),
                    "matchLabel": item["descriptor"]["match_label"],
                })
            else:
                missing += 1
                lines.append({
                    "itemId": item["id"],
                    "kind": item["kind"],
                    "name": item["descriptor"]["nombre"],
                    "brand": item["descriptor"].get("marca"),
                    "quantity": item["quantity"],
                    "price": None,
                    "lineTotal": None,
                    "unitPrice": None,
                    "unitBase": unit_base,
                    "available": False,
                    "url": None,
                    "ean": None if item["kind"] == "generic" else item["descriptor"].get("ean"),
                    "matchedProductName": None,
                    "matchLabel": item["descriptor"]["match_label"],
                })
        store_results.append({
            "store": store,
            "total": total,
            "pricedItems": priced,
            "missingItems": missing,
            "coverage": priced / len(parsed_items) if parsed_items else 0,
            "lines": lines,
        })

    comparable = [s for s in store_results if s["pricedItems"] > 0]
    recommended = None
    savings = 0
    if comparable:
        recommended = sorted(comparable, key=lambda s: (s["missingItems"], s["total"]))[0]
        # Ahorro like-for-like: solo entre tiendas con la MISMA cobertura que la
        # recomendada (mismos missingItems). Así el recomendado es, por la regla de
        # orden, el más barato del grupo y el ahorro corresponde a esa elección, sin
        # mezclar tiendas con coberturas distintas (que falsearían la comparación).
        peers = [s for s in comparable if s["missingItems"] == recommended["missingItems"]]
        if len(peers) >= 2:
            max_peer_total = max(s["total"] for s in peers)
            savings = max(0, max_peer_total - recommended["total"])
    return {
        "items": [
            {
                "id": item["id"],
                "kind": item["kind"],
                "quantity": item["quantity"],
                **item["descriptor"],
            }
            for item in parsed_items
        ],
        "stores": store_results,
        "recommendedStore": recommended,
        "estimatedSavings": savings,
    }


OPERATIONS = {
    "health": health,
    "topDeals": top_deals,
    "dealsByCategory": deals_by_category,
    "searchProducts": search_products,
    "searchGeneric": search_generic,
    "productOffers": product_offers,
    "compareBasket": compare_basket,
}


def main() -> int:
    db_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
    if not db_path or not db_path.exists():
        print(json.dumps({"error": "db_not_found", "path": str(db_path)}))
        return 2

    request = json.loads(sys.stdin.read() or "{}")
    operation = request.get("operation")
    payload = request.get("payload") or {}
    if operation not in OPERATIONS:
        print(json.dumps({"error": "unknown_operation", "operation": operation}))
        return 2

    con = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    try:
        result = OPERATIONS[operation](con, payload)
        print(json.dumps(result, ensure_ascii=False))
    finally:
        con.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
