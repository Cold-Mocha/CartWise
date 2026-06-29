#!/usr/bin/env python3
"""
Scraper — Fase 1: tiendas VTEX (empezando por Jumbo).

Hallazgo verificado (jun 2026): la API VTEX NO está en el dominio público
(www.jumbo.cl devuelve la app HTML). Sí responde en el HOST DE CUENTA VTEX:
    Jumbo        -> jumbocl.vtexcommercestable.com.br
    Santa Isabel -> santaisabel.vtexcommercestable.com.br
    Unimarc      -> unimarc.vtexcommercestable.com.br

Estrategia (ver docs/CONTEXTO.md §4.2):
  árbol de categorías (/category/tree/N)
  -> por cada categoría: paginar /products/search?fq=C:/{id}/ con _from/_to (de a 50)
  -> tope duro de 2.500 ítems por consulta: si una categoría lo alcanza y tiene
     subcategorías, se baja a ellas (recursión); si no, se guarda lo obtenido y se avisa.
  -> JSON crudo a JSONL (dedup por productId) -> normalizador (1 fila por SKU) -> SQLite

Reutiliza infraestructura de scripts/scraper_trebol.py (rate limiter, reintentos, esquema).

Uso:
  python3 -m scripts.scraper_vtex --store jumbo --limit-cats 3
  python3 -m scripts.scraper_vtex --store jumbo
  python3 -m scripts.scraper_vtex --store jumbo --load-only
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import time
from datetime import datetime, timezone

from scripts.scraper_trebol import (
    RateLimiter, make_session, fetch_json, SCHEMA, EAN_RE, DEFAULT_RATE,
    DEFAULT_OUT_DIR,
)
from scripts.comida import is_food_category

# Host de cuenta VTEX por tienda (verificado en vivo).
STORES = {
    "jumbo":       {"host": "jumbocl.vtexcommercestable.com.br",     "plataforma": "vtex"},
    "santaisabel": {"host": "santaisabel.vtexcommercestable.com.br", "plataforma": "vtex"},
    "unimarc":     {"host": "unimarc.vtexcommercestable.com.br",     "plataforma": "vtex"},
}

PAGE = 50          # diferencia máxima _from/_to permitida por VTEX
HARD_CAP = 2500    # tope duro de ítems por consulta


# --------------------------------------------------------------------------- #
# Descubrimiento: árbol de categorías
# --------------------------------------------------------------------------- #
def get_category_tree(session, base, limiter, depth=50):
    url = f"{base}/api/catalog_system/pub/category/tree/{depth}"
    return fetch_json(session, url, limiter)


# --------------------------------------------------------------------------- #
# Paginación de una categoría (hasta el tope de 2.500)
# --------------------------------------------------------------------------- #
def paginate_category(session, base, limiter, cat_path):
    """Pagina una categoría. `cat_path` es la RUTA de ids (p.ej. '1/1152'), no el id
    suelto: VTEX exige la ruta completa (fq=C:/1/1152/), si no devuelve 0.
    Devuelve (productos, hit_cap). hit_cap=True si tocó el tope de 2.500."""
    out, frm = [], 0
    while frm < HARD_CAP:
        to = frm + PAGE - 1
        url = (f"{base}/api/catalog_system/pub/products/search"
               f"?fq=C:/{cat_path}/&_from={frm}&_to={to}")
        page = fetch_json(session, url, limiter)
        if not page:
            return out, False
        out.extend(page)
        if len(page) < PAGE:
            return out, False
        frm += PAGE
    return out, True


# --------------------------------------------------------------------------- #
# Recorrido recursivo del árbol (sorteando el tope)
# --------------------------------------------------------------------------- #
def walk(session, base, limiter, cat, seen_pids, write, done_cats, ancestors=(), depth=0):
    cid = cat["id"]
    if cid in done_cats:
        return
    name = cat.get("name", "")
    indent = "  " * depth
    path_ids = ancestors + (cid,)                 # ruta completa de ids
    cat_path = "/".join(str(i) for i in path_ids)
    try:
        productos, hit_cap = paginate_category(session, base, limiter, cat_path)
    except Exception as e:
        print(f"{indent}! cat {cat_path} ({name}): {e}", file=sys.stderr)
        return

    children = cat.get("children") or []
    if hit_cap and children:
        # demasiados productos en esta categoría: bajar a subcategorías
        print(f"{indent}↳ {name} (id={cid}) >2500 → {len(children)} subcategorías",
              flush=True)
        for ch in children:
            walk(session, base, limiter, ch, seen_pids, write, done_cats,
                 path_ids, depth + 1)
    else:
        nuevos = 0
        for p in productos:
            pid = str(p.get("productId") or "")
            if not pid or pid in seen_pids:
                continue
            seen_pids.add(pid)
            write(p)
            nuevos += 1
        flag = "  ⚠TRUNCADA(>2500 sin subcat)" if hit_cap else ""
        print(f"{indent}· {name} (id={cid}): {len(productos)} prod, {nuevos} nuevos{flag}",
              flush=True)
    done_cats.add(cid)


# --------------------------------------------------------------------------- #
# Normalización VTEX -> esquema común (1 fila por SKU/item)
# --------------------------------------------------------------------------- #
def normalize(product: dict) -> list[dict]:
    rows = []
    pid = str(product.get("productId") or "")
    brand = product.get("brand")
    cats = product.get("categories") or []
    categoria = cats[0].strip("/").split("/")[-1] if cats else None
    url = product.get("link")

    for it in product.get("items", []):
        ean = (it.get("ean") or "").strip() or None
        imgs = it.get("images") or []
        img = imgs[0].get("imageUrl") if imgs else None
        # elegir el seller con oferta (normalmente sellers[0])
        offer = {}
        for s in it.get("sellers", []):
            offer = s.get("commertialOffer", {}) or {}
            if offer.get("Price"):
                break
        avail = offer.get("AvailableQuantity")
        rows.append({
            "sku_tienda": str(it.get("itemId") or ""),
            "product_id_tienda": pid,
            "ean": ean if (ean and EAN_RE.match(ean)) else None,
            "sku_raw": ean,                                  # ean crudo (puede ser EAN-8)
            "nombre": it.get("nameComplete") or product.get("productName"),
            "marca": brand,
            "categoria": categoria,
            "url": url,
            "imagen_url": img,
            "descripcion": product.get("description") or None,
            "gramaje_g": None,                               # VTEX: en specs, no mapeado aún
            "cantidad": it.get("unitMultiplier"),
            "unidad": it.get("measurementUnit"),
            "precio": _clp(offer.get("Price")),
            "precio_lista": _clp(offer.get("ListPrice")),
            "disponible": bool(avail and avail > 0),
            "stock": avail,
        })
    return rows


def _clp(v):
    """VTEX entrega precios en CLP enteros (a veces como float 1590.0)."""
    return int(round(v)) if isinstance(v, (int, float)) else None


# --------------------------------------------------------------------------- #
# Carga a SQLite (reutiliza esquema común de CONTEXTO)
# --------------------------------------------------------------------------- #
def load_sqlite(db_path, raw_path, store):
    if not os.path.exists(raw_path) or os.path.getsize(raw_path) == 0:
        print(f"      (sin productos en {raw_path}; nada que cargar)")
        return 0, 0
    # Reconstrucción idempotente: el JSONL crudo es la fuente de verdad, así que
    # se rehace la base desde cero (evita snapshots/filas duplicados al re-cargar).
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    con.executescript(SCHEMA)
    cur = con.cursor()
    cur.execute("INSERT OR IGNORE INTO supermercado(nombre, plataforma) VALUES (?,?)",
                (store, STORES[store]["plataforma"]))
    superm_id = cur.execute("SELECT id FROM supermercado WHERE nombre=?", (store,)).fetchone()[0]
    now = datetime.now(timezone.utc).isoformat()
    cur.execute("INSERT INTO snapshot(fecha_captura) VALUES (?)", (now,))
    snap_id = cur.lastrowid

    n_prod = n_sku = 0
    with open(raw_path, encoding="utf-8") as f:
        for line in f:
            try:
                product = json.loads(line)
            except Exception:
                continue
            n_prod += 1
            for r in normalize(product):
                cur.execute(
                    """INSERT INTO producto
                       (snapshot_id, supermercado_id, sku_tienda, product_id_tienda,
                        ean, sku_raw, nombre, marca, categoria, url, imagen_url,
                        descripcion, gramaje_g, cantidad, unidad)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (snap_id, superm_id, r["sku_tienda"], r["product_id_tienda"],
                     r["ean"], r["sku_raw"], r["nombre"], r["marca"], r["categoria"],
                     r["url"], r["imagen_url"], r["descripcion"], r["gramaje_g"],
                     str(r["cantidad"]) if r["cantidad"] is not None else None, r["unidad"]))
                cur.execute(
                    """INSERT INTO precio
                       (producto_id, precio, precio_lista, disponible, stock, capturado_en)
                       VALUES (?,?,?,?,?,?)""",
                    (cur.lastrowid, r["precio"], r["precio_lista"],
                     1 if r["disponible"] else 0, r["stock"], now))
                n_sku += 1
    con.commit()
    con.close()
    return n_prod, n_sku


# --------------------------------------------------------------------------- #
# Resume helpers
# --------------------------------------------------------------------------- #
def load_seen(raw_path):
    seen = set()
    if os.path.exists(raw_path):
        with open(raw_path, encoding="utf-8") as f:
            for line in f:
                try:
                    seen.add(str(json.loads(line)["productId"]))
                except Exception:
                    continue
    return seen


def load_done_cats(ckpt_path):
    if os.path.exists(ckpt_path):
        return set(open(ckpt_path).read().split())
    return set()


# --------------------------------------------------------------------------- #
# Orquestación
# --------------------------------------------------------------------------- #
def scrape(args):
    store = args.store
    base = f"https://{STORES[store]['host']}"
    os.makedirs(os.path.join(args.out_dir, "raw"), exist_ok=True)
    os.makedirs(os.path.join(args.out_dir, "staging"), exist_ok=True)
    raw_path = os.path.join(args.out_dir, "raw", f"{store}_products.jsonl")
    ckpt_path = os.path.join(args.out_dir, "raw", f"{store}_done_cats.txt")
    db_path = os.path.join(args.out_dir, "staging", f"{store}.sqlite")

    session = make_session()
    limiter = RateLimiter(args.rate)

    if not args.load_only:
        print(f"[1/3] Árbol de categorías de {store} ({base}) …", flush=True)
        tree = get_category_tree(session, base, limiter)
        roots = tree
        if not args.all:
            comida = [r for r in tree if is_food_category(r["name"])]
            excluidas = [r["name"] for r in tree if not is_food_category(r["name"])]
            print(f"      filtro COMIDA: {len(comida)}/{len(tree)} raíces. "
                  f"Excluidas: {', '.join(excluidas)}")
            roots = comida
        roots = roots[: args.limit_cats] if args.limit_cats else roots
        print(f"      procesando {len(roots)} categorías raíz.")

        seen = load_seen(raw_path)
        done_cats = load_done_cats(ckpt_path)
        if seen or done_cats:
            print(f"      resume: {len(seen)} productos, {len(done_cats)} categorías ya hechas.")

        ckpt = open(ckpt_path, "a")

        def write_product(p):
            with open(raw_path, "a", encoding="utf-8") as out:
                out.write(json.dumps(p, ensure_ascii=False) + "\n")

        # envolver done_cats para persistir el checkpoint al cerrar cada categoría
        class TrackedSet(set):
            def add(self, x):
                super().add(x); ckpt.write(str(x) + "\n"); ckpt.flush()
        tracked = TrackedSet(done_cats)

        print(f"[2/3] Descargando (rate={args.rate} req/s) …", flush=True)
        t0 = time.time()
        for root in roots:
            walk(session, base, limiter, root, seen, write_product, tracked)
        ckpt.close()
        print(f"      {len(seen)} productos únicos en {time.time()-t0:.0f}s.")

    print(f"[3/3] Cargando a SQLite {db_path} …", flush=True)
    n_prod, n_sku = load_sqlite(db_path, raw_path, store)
    print(f"      {n_prod} productos -> {n_sku} SKUs (filas).")
    _summary(db_path)


def _summary(db_path):
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    total = cur.execute("SELECT COUNT(*) FROM producto").fetchone()[0]
    con_ean = cur.execute("SELECT COUNT(*) FROM producto WHERE ean IS NOT NULL").fetchone()[0]
    disp = cur.execute("SELECT COUNT(*) FROM precio WHERE disponible=1").fetchone()[0]
    print("\n=== Resumen ===")
    print(f"  filas (SKU)    : {total}")
    print(f"  con EAN        : {con_ean} ({100*con_ean/max(total,1):.1f}%)")
    print(f"  disponibles    : {disp}")
    con.close()


def main():
    ap = argparse.ArgumentParser(description="Scraper VTEX (Jumbo / Santa Isabel / Unimarc)")
    ap.add_argument("--store", default="jumbo", choices=list(STORES))
    ap.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    ap.add_argument("--rate", type=float, default=DEFAULT_RATE)
    ap.add_argument("--limit-cats", type=int, default=0,
                    help="máx categorías raíz a procesar (0=todas; útil para pruebas)")
    ap.add_argument("--all", action="store_true",
                    help="no filtrar por comida; bajar TODO el catálogo")
    ap.add_argument("--load-only", action="store_true")
    args = ap.parse_args()
    scrape(args)


if __name__ == "__main__":
    main()
