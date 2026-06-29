#!/usr/bin/env python3
"""
Scraper — Fase 0: Super El Trébol (supertrebol.cl)

Plataforma REAL: Bootic (bolder.run), NO Shopify (corrección verificada en vivo
sobre trebol_analisis.md). Expone JSON por producto en /products/{slug}.json y un
sitemap.xml con todas las URLs de producto.

Flujo (ver docs/CONTEXTO.md):
  sitemap.xml -> URLs de producto -> fetch {url}.json (rate-limited + backoff)
  -> staging JSONL crudo -> normalizador (1 fila por variante) -> SQLite

Stack ajustado a lo disponible en el entorno (sin pip): stdlib + requests.
- Rate limit: token-bucket compartido (default 2 req/s).
- Reintentos: backoff exponencial con jitter; respeta Retry-After en 429.
- Resumible: salta URLs ya presentes en el JSONL crudo.

Salidas:
  datos/raw/trebol_products.jsonl       JSON crudo, 1 producto por línea (canónico)
  datos/staging/trebol.sqlite           esquema relacional normalizado

Uso:
  python3 -m scripts.scraper_trebol --limit 50   # prueba de pipeline (muestra)
  python3 -m scripts.scraper_trebol              # pasada completa (~8900 productos)
  python3 -m scripts.scraper_trebol --load-only  # re-cargar SQLite desde el JSONL
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import requests

from scripts.comida import is_food_trebol

# Si True, al normalizar se descartan los productos que no son comida
# (comestible/bebible). El JSONL crudo conserva TODO; el filtro se aplica al cargar.
SOLO_COMIDA = True

BASE = "https://www.supertrebol.cl"
SITEMAP = f"{BASE}/sitemap.xml"
SUPERMERCADO = "el_trebol"
PLATAFORMA = "bootic"
USER_AGENT = "Mozilla/5.0 (compatible; precio-research/0.1; +mailto:d.diaz17@ufromail.cl)"

EAN_RE = re.compile(r"^\d{8,14}$")
PRODUCT_URL_RE = re.compile(r"https://www\.supertrebol\.cl/products/[^<\s]+")

DEFAULT_RATE = 2.0          # req/s por dominio (autorregulación ética)
DEFAULT_WORKERS = 4         # overlap de latencia; el límite real lo pone el bucket
MAX_RETRIES = 6
DEFAULT_OUT_DIR = "datos"


# --------------------------------------------------------------------------- #
# Rate limiter: token-bucket simple y thread-safe
# --------------------------------------------------------------------------- #
class RateLimiter:
    def __init__(self, rate_per_sec: float):
        self.min_interval = 1.0 / rate_per_sec if rate_per_sec > 0 else 0.0
        self._lock = threading.Lock()
        self._next = time.monotonic()

    def wait(self) -> None:
        if self.min_interval <= 0:
            return
        with self._lock:
            now = time.monotonic()
            sleep_for = self._next - now
            if sleep_for < 0:
                sleep_for = 0.0
                self._next = now
            self._next += self.min_interval
        if sleep_for > 0:
            time.sleep(sleep_for)


# --------------------------------------------------------------------------- #
# HTTP con reintentos y backoff
# --------------------------------------------------------------------------- #
def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
    return s


def fetch_json(session, url, limiter, retries=MAX_RETRIES):
    last_err = None
    for attempt in range(retries):
        limiter.wait()
        try:
            r = session.get(url, timeout=30)
            if r.status_code == 429:
                retry_after = r.headers.get("Retry-After")
                delay = int(retry_after) if (retry_after or "").isdigit() else 0
                time.sleep(max(delay, _backoff(attempt)))
                continue
            if r.status_code >= 500:
                time.sleep(_backoff(attempt))
                continue
            r.raise_for_status()
            return r.json()
        except (requests.RequestException, ValueError) as e:
            last_err = e
            time.sleep(_backoff(attempt))
    raise RuntimeError(f"fetch falló tras {retries} intentos: {url} ({last_err})")


def _backoff(attempt: int) -> float:
    import random
    return min(60.0, (2 ** attempt)) * (0.5 + random.random())


# --------------------------------------------------------------------------- #
# Descubrimiento vía sitemap
# --------------------------------------------------------------------------- #
def discover_product_urls(session, limiter):
    limiter.wait()
    r = session.get(SITEMAP, timeout=60)
    r.raise_for_status()
    urls = sorted(set(PRODUCT_URL_RE.findall(r.text)))
    return urls


# --------------------------------------------------------------------------- #
# Staging JSONL (crudo) + resume
# --------------------------------------------------------------------------- #
def load_done_urls(raw_path: str) -> set:
    done = set()
    if not os.path.exists(raw_path):
        return done
    with open(raw_path, encoding="utf-8") as f:
        for line in f:
            try:
                done.add(json.loads(line)["url"])
            except Exception:
                continue
    return done


# --------------------------------------------------------------------------- #
# Normalización (1 fila por variante)
# --------------------------------------------------------------------------- #
def normalize(product: dict) -> list[dict]:
    """Mapea el JSON Bootic al esquema común. Una fila por variante (SKU).
    Si SOLO_COMIDA, descarta productos que no son comida (según sus colecciones)."""
    if SOLO_COMIDA:
        slugs = [c.get("slug") for c in product.get("collections", [])]
        ptype = (product.get("product_type") or {}).get("name", "")
        if not is_food_trebol(slugs, ptype):
            return []
    rows = []
    attrs = {a.get("slug"): a.get("value") for a in product.get("attributes", [])}
    cantidad = attrs.get("cantidad")
    unidad = attrs.get("unidad-de-medida")
    product_type = (product.get("product_type") or {}).get("name")
    vendor = (product.get("vendor") or {}).get("name")
    img = product.get("image")
    if not img:
        imgs = product.get("images") or []
        if imgs:
            img = (imgs[0].get("src") or {}).get("original")

    variants = product.get("variants") or [{}]
    for v in variants:
        sku_raw = str(v.get("sku") or "").strip()
        ean = sku_raw if EAN_RE.match(sku_raw) else None
        rows.append({
            "sku_tienda": str(v.get("id") or ""),       # id de variante Bootic
            "product_id_tienda": str(product.get("id") or ""),
            "ean": ean,
            "sku_raw": sku_raw or None,                 # preserva SKU interno (marca propia)
            "nombre": v.get("name") or product.get("name"),
            "marca": vendor,
            "categoria": product_type,
            "url": product.get("url"),
            "imagen_url": img,
            "descripcion": product.get("description") or None,
            "gramaje_g": v.get("weight_in_grams"),
            "cantidad": cantidad,
            "unidad": unidad,
            # precio: `price` es el precio de venta vigente (siempre presente);
            # `sale_price` viene null cuando no hay oferta -> no usarlo como principal.
            "precio": v.get("price"),                            # precio de venta vigente
            "precio_lista": v.get("regular_price"),              # precio lista/tachado
            "disponible": bool(v.get("available", product.get("available"))),
            "stock": v.get("online_stock"),
        })
    return rows


# --------------------------------------------------------------------------- #
# SQLite (esquema platform-agnostic de CONTEXTO.md, extendido)
# --------------------------------------------------------------------------- #
SCHEMA = """
CREATE TABLE IF NOT EXISTS supermercado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    plataforma TEXT
);
CREATE TABLE IF NOT EXISTS snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_captura TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id INTEGER REFERENCES snapshot(id),
    supermercado_id INTEGER REFERENCES supermercado(id),
    sku_tienda TEXT,
    product_id_tienda TEXT,
    ean TEXT,
    sku_raw TEXT,
    nombre TEXT,
    marca TEXT,
    categoria TEXT,
    url TEXT,
    imagen_url TEXT,
    descripcion TEXT,
    gramaje_g INTEGER,
    cantidad TEXT,
    unidad TEXT
);
CREATE TABLE IF NOT EXISTS precio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER REFERENCES producto(id),
    precio INTEGER,
    precio_lista INTEGER,
    disponible INTEGER,
    stock INTEGER,
    capturado_en TEXT
);
CREATE INDEX IF NOT EXISTS idx_producto_ean ON producto(ean);
"""


def load_sqlite(db_path: str, raw_path: str):
    """(Re)construye el SQLite normalizado desde el JSONL crudo.
    Idempotente: rehace la base desde cero (el JSONL es la fuente de verdad)."""
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    con.executescript(SCHEMA)
    cur = con.cursor()
    cur.execute(
        "INSERT OR IGNORE INTO supermercado(nombre, plataforma) VALUES (?,?)",
        (SUPERMERCADO, PLATAFORMA),
    )
    cur.execute("SELECT id FROM supermercado WHERE nombre=?", (SUPERMERCADO,))
    superm_id = cur.fetchone()[0]
    now = datetime.now(timezone.utc).isoformat()
    cur.execute("INSERT INTO snapshot(fecha_captura) VALUES (?)", (now,))
    snap_id = cur.lastrowid

    n_prod = n_var = 0
    with open(raw_path, encoding="utf-8") as f:
        for line in f:
            try:
                product = json.loads(line)
            except Exception:
                continue
            n_prod += 1
            for row in normalize(product):
                cur.execute(
                    """INSERT INTO producto
                       (snapshot_id, supermercado_id, sku_tienda, product_id_tienda,
                        ean, sku_raw, nombre, marca, categoria, url, imagen_url,
                        descripcion, gramaje_g, cantidad, unidad)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (snap_id, superm_id, row["sku_tienda"], row["product_id_tienda"],
                     row["ean"], row["sku_raw"], row["nombre"], row["marca"],
                     row["categoria"], row["url"], row["imagen_url"], row["descripcion"],
                     row["gramaje_g"], str(row["cantidad"]) if row["cantidad"] is not None else None,
                     row["unidad"]),
                )
                prod_pk = cur.lastrowid
                cur.execute(
                    """INSERT INTO precio
                       (producto_id, precio, precio_lista, disponible, stock, capturado_en)
                       VALUES (?,?,?,?,?,?)""",
                    (prod_pk, row["precio"], row["precio_lista"],
                     1 if row["disponible"] else 0, row["stock"], now),
                )
                n_var += 1
    con.commit()
    con.close()
    return n_prod, n_var


# --------------------------------------------------------------------------- #
# Orquestación
# --------------------------------------------------------------------------- #
def scrape(args):
    os.makedirs(os.path.join(args.out_dir, "raw"), exist_ok=True)
    os.makedirs(os.path.join(args.out_dir, "staging"), exist_ok=True)
    raw_path = os.path.join(args.out_dir, "raw", "trebol_products.jsonl")
    db_path = os.path.join(args.out_dir, "staging", "trebol.sqlite")

    session = make_session()
    limiter = RateLimiter(args.rate)

    if not args.load_only:
        print(f"[1/3] Descubriendo productos en {SITEMAP} …", flush=True)
        urls = discover_product_urls(session, limiter)
        print(f"      {len(urls)} URLs de producto en sitemap.")

        done = load_done_urls(raw_path)
        if done:
            print(f"      {len(done)} ya en staging (resume).")
        pending = [u for u in urls if u not in done]
        if args.limit:
            pending = pending[: args.limit]
        print(f"[2/3] Descargando {len(pending)} productos "
              f"(rate={args.rate} req/s, workers={args.workers}) …", flush=True)

        write_lock = threading.Lock()
        ok = err = 0
        t0 = time.time()
        with open(raw_path, "a", encoding="utf-8") as out, \
                ThreadPoolExecutor(max_workers=args.workers) as pool:
            futs = {pool.submit(fetch_json, session, u + ".json", limiter): u
                    for u in pending}
            for i, fut in enumerate(as_completed(futs), 1):
                url = futs[fut]
                try:
                    product = fut.result()
                    product.setdefault("url", url)
                    with write_lock:
                        out.write(json.dumps(product, ensure_ascii=False) + "\n")
                        out.flush()
                    ok += 1
                except Exception as e:
                    err += 1
                    print(f"      ! {url}: {e}", file=sys.stderr)
                if i % 100 == 0 or i == len(pending):
                    rate = i / max(time.time() - t0, 1e-9)
                    print(f"      {i}/{len(pending)}  ok={ok} err={err}  "
                          f"({rate:.1f}/s)", flush=True)

    print(f"[3/3] Cargando a SQLite {db_path} …", flush=True)
    n_prod, n_var = load_sqlite(db_path, raw_path)
    print(f"      {n_prod} productos -> {n_var} variantes (filas) en SQLite.")
    _summary(db_path)


def _summary(db_path: str):
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    total = cur.execute("SELECT COUNT(*) FROM producto").fetchone()[0]
    con_ean = cur.execute("SELECT COUNT(*) FROM producto WHERE ean IS NOT NULL").fetchone()[0]
    disp = cur.execute("SELECT COUNT(*) FROM precio WHERE disponible=1").fetchone()[0]
    print("\n=== Resumen ===")
    print(f"  filas producto : {total}")
    print(f"  con EAN        : {con_ean} ({100*con_ean/max(total,1):.1f}%)")
    print(f"  disponibles    : {disp}")
    con.close()


def main():
    ap = argparse.ArgumentParser(description="Scraper Super El Trébol (Bootic)")
    ap.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    ap.add_argument("--rate", type=float, default=DEFAULT_RATE, help="req/s por dominio")
    ap.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    ap.add_argument("--limit", type=int, default=0, help="máx productos (0=todos)")
    ap.add_argument("--load-only", action="store_true",
                    help="no scrapear; recargar SQLite desde el JSONL existente")
    ap.add_argument("--all", action="store_true",
                    help="no filtrar por comida; cargar TODO el catálogo")
    args = ap.parse_args()
    global SOLO_COMIDA
    if args.all:
        SOLO_COMIDA = False
    scrape(args)


if __name__ == "__main__":
    main()
