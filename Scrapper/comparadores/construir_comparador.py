#!/usr/bin/env python3
"""
Capa de CRUCES (mart) — construye comparador.sqlite desde las BD por nodo.

Arquitectura en capas:
  datos/raw/*.jsonl  →  datos/staging/*.sqlite  →  datos/comparadores/comparador.sqlite
       (raw)             (staging, 1 por tienda)          (mart unificado)

La BD unificada se reconstruye SIEMPRE desde las de nodo (idempotente). Implementa:
  - Capa 1: producto identificado por EAN (`producto_marca`) + precios (`oferta`).
  - Capa 2: productos genericos, contenido normalizado y candidatos difusos.

Decisiones (ver discusión de diseño):
  - EAN como llave de matching (normalizado: solo dígitos; UPC-A 12→13 con cero a la izq.).
  - Productos sin EAN entran como filas propias (ean NULL) → no cruzan (irán a Capa 2 difusa).
  - Precio en CLP entero (INT).
  - Dedup intra-tienda: 1 oferta por (producto, tienda); se prefiere disponible y menor precio.

Uso:  python3 -m comparadores.construir_comparador
"""
from __future__ import annotations
import argparse
import os
import re
import sqlite3

from comparadores.capa2 import build_capa2
from scripts.comida import normalize_scope

DATA_DIR = "datos"
STAGING_DIR = os.path.join(DATA_DIR, "staging")
COMPARADORES_DIR = os.path.join(DATA_DIR, "comparadores")

NODOS = {
    "el_trebol":    {"db": os.path.join(STAGING_DIR, "trebol.sqlite"),       "plataforma": "bootic", "sitio": "supertrebol.cl"},
    "jumbo":        {"db": os.path.join(STAGING_DIR, "jumbo.sqlite"),        "plataforma": "vtex",   "sitio": "jumbo.cl"},
    "santa_isabel": {"db": os.path.join(STAGING_DIR, "santaisabel.sqlite"),  "plataforma": "vtex",   "sitio": "santaisabel.cl"},
    "unimarc":      {"db": os.path.join(STAGING_DIR, "unimarc.sqlite"),      "plataforma": "vtex",   "sitio": "unimarc.cl"},
}
OUT_DB = os.path.join(COMPARADORES_DIR, "comparador.sqlite")

SCHEMA = """
CREATE TABLE supermercado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    plataforma TEXT,
    sitio_web TEXT
);
CREATE TABLE metadata (
    clave TEXT PRIMARY KEY,
    valor TEXT
);
-- Capa 1: producto único identificado por EAN
CREATE TABLE producto_marca (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ean TEXT UNIQUE,                 -- NULL = producto sin código de barras
    nombre TEXT,
    marca TEXT,
    categoria TEXT,
    imagen_url TEXT,
    gramaje_g INTEGER,
    cantidad TEXT,
    unidad TEXT,
    nombre_norm TEXT,
    marca_norm TEXT,
    categoria_norm TEXT,
    contenido_valor REAL,
    contenido_unidad TEXT,
    contenido_base REAL,
    unidad_base TEXT,
    pack_unidades INTEGER,
    contenido_total_base REAL,
    generico_id INTEGER REFERENCES producto_generico(id)
);
CREATE TABLE oferta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_marca_id INTEGER NOT NULL REFERENCES producto_marca(id),
    supermercado_id INTEGER NOT NULL REFERENCES supermercado(id),
    sku_tienda TEXT,
    url TEXT,
    precio INTEGER,
    precio_lista INTEGER,
    oferta_real INTEGER DEFAULT 0,
    disponible INTEGER,
    stock INTEGER,
    capturado_en TEXT,
    UNIQUE(producto_marca_id, supermercado_id)
);
-- Capa 2: productos genericos, miembros confirmados y candidatos a revisar
CREATE TABLE producto_generico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_norm TEXT,
    nombre_generico TEXT,
    unidad_base TEXT,
    contenido_total_base REAL,
    pack_unidades INTEGER,
    atributos_json TEXT,
    UNIQUE(categoria_norm, nombre_generico, unidad_base, contenido_total_base)
);
CREATE TABLE producto_generico_miembro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generico_id INTEGER NOT NULL REFERENCES producto_generico(id),
    producto_marca_id INTEGER NOT NULL REFERENCES producto_marca(id),
    score_similitud REAL,
    regla TEXT,
    evidencia_json TEXT,
    confirmado INTEGER DEFAULT 1,
    UNIQUE(generico_id, producto_marca_id)
);
CREATE TABLE producto_generico_candidato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generico_origen_id INTEGER NOT NULL REFERENCES producto_generico(id),
    generico_destino_id INTEGER NOT NULL REFERENCES producto_generico(id),
    score_similitud REAL,
    regla TEXT,
    evidencia_json TEXT,
    UNIQUE(generico_origen_id, generico_destino_id)
);
CREATE TABLE categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT UNIQUE, descripcion TEXT);
CREATE TABLE equivalencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT, generico_id INTEGER, supermercado_id INTEGER,
    marca_solicitada_id INTEGER, marca_sugerida_id INTEGER,
    score_similitud REAL, razon_sustitucion TEXT, activa INTEGER DEFAULT 1);

CREATE INDEX idx_pm_ean ON producto_marca(ean);
CREATE INDEX idx_pm_generico ON producto_marca(generico_id);
CREATE INDEX idx_pm_norm ON producto_marca(categoria_norm, unidad_base, contenido_total_base);
CREATE INDEX idx_oferta_pm ON oferta(producto_marca_id);
CREATE INDEX idx_oferta_super ON oferta(supermercado_id, disponible);
CREATE INDEX idx_pgm_generico ON producto_generico_miembro(generico_id);
CREATE INDEX idx_pgm_pm ON producto_generico_miembro(producto_marca_id);

-- Vista de comparación: 1 fila por producto con precios por tienda y dispersión
CREATE VIEW v_comparacion AS
SELECT
    pm.id, pm.ean, pm.nombre, pm.marca, pm.categoria,
    COUNT(DISTINCT o.supermercado_id)                         AS n_tiendas,
    MIN(CASE WHEN o.precio>0 THEN o.precio END)               AS precio_min,
    MAX(CASE WHEN o.precio>0 THEN o.precio END)               AS precio_max,
    MAX(CASE WHEN o.precio>0 THEN o.precio END)
        - MIN(CASE WHEN o.precio>0 THEN o.precio END)         AS diferencia
FROM producto_marca pm
JOIN oferta o ON o.producto_marca_id = pm.id
GROUP BY pm.id;

-- Comparacion por producto generico. Para g/ml normaliza a kg/L; para unidad,
-- normaliza a precio por unidad.
CREATE VIEW v_comparacion_generica AS
WITH base AS (
    SELECT
        pg.id AS generico_id,
        pg.categoria_norm,
        pg.nombre_generico,
        pg.unidad_base,
        pg.contenido_total_base,
        pg.pack_unidades,
        o.supermercado_id,
        o.precio,
        CASE
            WHEN pg.unidad_base IN ('g','ml') AND pg.contenido_total_base > 0
                THEN o.precio / (pg.contenido_total_base / 1000.0)
            WHEN pg.unidad_base = 'un' AND pg.contenido_total_base > 0
                THEN o.precio / pg.contenido_total_base
            ELSE NULL
        END AS precio_unitario
    FROM producto_generico pg
    JOIN producto_generico_miembro pgm ON pgm.generico_id = pg.id
    JOIN oferta o ON o.producto_marca_id = pgm.producto_marca_id
    WHERE pgm.confirmado = 1 AND o.precio > 0
),
best_store AS (
    SELECT
        generico_id, categoria_norm, nombre_generico, unidad_base,
        contenido_total_base, pack_unidades, supermercado_id,
        MIN(precio) AS precio_min_tienda,
        MIN(precio_unitario) AS precio_unitario_min_tienda
    FROM base
    GROUP BY generico_id, supermercado_id
)
SELECT
    generico_id,
    categoria_norm,
    nombre_generico,
    unidad_base,
    contenido_total_base,
    pack_unidades,
    COUNT(DISTINCT supermercado_id) AS n_tiendas,
    MIN(precio_min_tienda) AS precio_min,
    MAX(precio_min_tienda) AS precio_max,
    MAX(precio_min_tienda) - MIN(precio_min_tienda) AS diferencia,
    MIN(precio_unitario_min_tienda) AS precio_unitario_min,
    MAX(precio_unitario_min_tienda) AS precio_unitario_max,
    MAX(precio_unitario_min_tienda) - MIN(precio_unitario_min_tienda) AS diferencia_unitaria
FROM best_store
GROUP BY generico_id;
"""


def norm_ean(e):
    if not e:
        return None
    d = re.sub(r"\D", "", e)
    if not d:
        return None
    if len(d) == 12:          # UPC-A -> EAN-13
        d = "0" + d
    return d


def read_nodo(db_path):
    """Lee productos + precio del último snapshot de una BD por nodo."""
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    snap = con.execute("SELECT MAX(id) FROM snapshot").fetchone()[0]
    price_cols = {
        row[1]
        for row in con.execute("PRAGMA table_info(precio)").fetchall()
    }
    oferta_expr = (
        "pr.oferta_real"
        if "oferta_real" in price_cols
        else "CASE WHEN pr.precio > 0 AND pr.precio_lista IS NOT NULL "
             "AND pr.precio_lista > pr.precio THEN 1 ELSE 0 END"
    )
    rows = con.execute(f"""
        SELECT p.sku_tienda, p.ean, p.nombre, p.marca, p.categoria, p.url,
               p.imagen_url,
               p.gramaje_g, p.cantidad, p.unidad,
               pr.precio, pr.precio_lista, {oferta_expr} AS oferta_real,
               pr.disponible, pr.stock, pr.capturado_en
        FROM producto p JOIN precio pr ON pr.producto_id = p.id
        WHERE p.snapshot_id = ?""", (snap,)).fetchall()
    con.close()
    return rows


def better_offer(new, old):
    """Para dedup intra-tienda: preferir disponible, luego menor precio>0."""
    if new["disponible"] != old["disponible"]:
        return new["disponible"] > old["disponible"]
    np, op = new["precio"] or 0, old["precio"] or 0
    if np > 0 and op > 0:
        return np < op
    return np > op            # el que tenga precio


def canonical_text(values, prefer_longest=False):
    values = [v for v in values if v]
    if not values:
        return None
    if prefer_longest:
        return sorted(values, key=lambda v: (-len(v), v.lower()))[0]
    counts = {v: values.count(v) for v in set(values)}
    return sorted(counts, key=lambda v: (-counts[v], -len(v), v.lower()))[0]


def build(scope: str = "food"):
    scope = normalize_scope(scope)
    os.makedirs(COMPARADORES_DIR, exist_ok=True)
    if os.path.exists(OUT_DB):
        os.remove(OUT_DB)
    con = sqlite3.connect(OUT_DB)
    con.executescript(SCHEMA)
    cur = con.cursor()
    cur.execute("INSERT INTO metadata(clave, valor) VALUES (?,?)", ("scope", scope))

    super_id = {}
    for nombre, meta in NODOS.items():
        cur.execute("INSERT INTO supermercado(nombre, plataforma, sitio_web) VALUES (?,?,?)",
                    (nombre, meta["plataforma"], meta["sitio"]))
        super_id[nombre] = cur.lastrowid

    # Acumular en memoria: producto_marca por llave, oferta por (llave, tienda)
    marcas = {}                 # key -> dict canónico
    ofertas = {}                # (key, tienda) -> row
    no_ean_seq = 0

    for nombre, meta in NODOS.items():
        for r in read_nodo(meta["db"]):
            ean = norm_ean(r["ean"])
            if ean:
                key = ("ean", ean)
            else:
                no_ean_seq += 1
                key = ("noean", nombre, r["sku_tienda"] or no_ean_seq)

            m = marcas.setdefault(key, {"ean": ean, "nombres": [], "marcas": [],
                                        "imagenes": [],
                                        "categoria": None, "gramaje_g": None,
                                        "cantidad": None, "unidad": None})
            if r["nombre"]:
                m["nombres"].append(r["nombre"])
            if r["marca"]:
                m["marcas"].append(r["marca"])
            if r["imagen_url"]:
                m["imagenes"].append(r["imagen_url"])
            for f in ("categoria", "gramaje_g", "cantidad", "unidad"):
                if m[f] is None and r[f] is not None:
                    m[f] = r[f]

            ok = (key, nombre)
            if ok not in ofertas or better_offer(r, ofertas[ok]):
                ofertas[ok] = r

    # Escribir producto_marca (nombre canónico = más largo; marca = más frecuente)
    pm_id = {}
    for key, m in marcas.items():
        nombre = canonical_text(m["nombres"], prefer_longest=True)
        marca = canonical_text(m["marcas"])
        imagen_url = canonical_text(m["imagenes"])
        cur.execute("""INSERT INTO producto_marca
            (ean, nombre, marca, categoria, imagen_url, gramaje_g, cantidad, unidad)
            VALUES (?,?,?,?,?,?,?,?)""",
            (m["ean"], nombre, marca, m["categoria"], imagen_url, m["gramaje_g"],
             m["cantidad"], m["unidad"]))
        pm_id[key] = cur.lastrowid

    # Escribir ofertas
    for (key, tienda), r in ofertas.items():
        cur.execute("""INSERT INTO oferta
            (producto_marca_id, supermercado_id, sku_tienda, url, precio,
             precio_lista, oferta_real, disponible, stock, capturado_en)
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (pm_id[key], super_id[tienda], r["sku_tienda"], r["url"], r["precio"],
             r["precio_lista"], r["oferta_real"], r["disponible"], r["stock"],
             r["capturado_en"]))

    con.commit()
    capa2_stats = build_capa2(con, scope=scope)
    _resumen(con, scope)
    _resumen_capa2(con, capa2_stats)
    con.close()


def _resumen(con, scope):
    cur = con.cursor()
    def s(q): return cur.execute(q).fetchone()[0]
    print("=" * 56)
    print(f"  COMPARADOR construido (scope={scope}, Capa 1: matching por EAN)")
    print("=" * 56)
    print(f"  productos únicos (producto_marca): {s('SELECT COUNT(*) FROM producto_marca')}")
    print(f"    con EAN                        : {s('SELECT COUNT(*) FROM producto_marca WHERE ean IS NOT NULL')}")
    print(f"    sin EAN (van a Capa 2 difusa)  : {s('SELECT COUNT(*) FROM producto_marca WHERE ean IS NULL')}")
    print(f"  ofertas (producto×tienda)        : {s('SELECT COUNT(*) FROM oferta')}")
    print("\n  Productos presentes en N tiendas:")
    for n, c in cur.execute("""SELECT n_tiendas, COUNT(*) FROM v_comparacion
                               GROUP BY n_tiendas ORDER BY n_tiendas DESC"""):
        print(f"    en {n} tienda(s): {c}")
    print("\n  Top 5 mayores diferencias de precio (mismo producto, en ≥3 tiendas):")
    for r in cur.execute("""SELECT nombre, precio_min, precio_max, diferencia, n_tiendas
                            FROM v_comparacion WHERE n_tiendas>=3
                            ORDER BY diferencia DESC LIMIT 5"""):
        print(f"    {r[0][:42]:42} ${r[1]}–${r[2]}  (Δ${r[3]}, {r[4]} tiendas)")


def _resumen_capa2(con, stats):
    cur = con.cursor()
    def s(q): return cur.execute(q).fetchone()[0]
    print("\n" + "=" * 56)
    print("  CAPA 2 construida (genericos + precio unitario)")
    print("=" * 56)
    print(f"  productos analizados             : {stats['analizados']}")
    print(f"  categorias bloqueadas            : {stats['bloqueados']}")
    print(f"  productos genericos              : {stats['genericos']}")
    print(f"  miembros confirmados             : {stats['miembros']}")
    print(f"  candidatos difusos a revisar     : {stats['candidatos']}")
    print(f"  genericos en >=2 tiendas         : {s('SELECT COUNT(*) FROM v_comparacion_generica WHERE n_tiendas>=2')}")
    print("\n  Top 5 diferencias unitarias (generico, en >=3 tiendas):")
    for r in cur.execute("""SELECT nombre_generico, unidad_base, contenido_total_base,
                                   precio_unitario_min, precio_unitario_max,
                                   diferencia_unitaria, n_tiendas
                            FROM v_comparacion_generica
                            WHERE n_tiendas>=3 AND diferencia_unitaria IS NOT NULL
                            ORDER BY diferencia_unitaria DESC LIMIT 5"""):
        print(f"    {r[0][:34]:34} {r[2]:g}{r[1]:2} "
              f"${r[3]:.0f}–${r[4]:.0f}  (Δ${r[5]:.0f}, {r[6]} tiendas)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Construye comparador.sqlite")
    ap.add_argument("--scope", choices=("food", "grocery", "all"), default="food")
    args = ap.parse_args()
    build(scope=args.scope)
