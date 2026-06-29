#!/usr/bin/env python3
"""
Validación final — Fase 0 (El Trébol).

Recarga el SQLite desde el JSONL crudo (para reflejar el catálogo completo) y
imprime un reporte de calidad de datos:
  - totales de productos/variantes
  - cobertura de EAN (código de barras) — la llave de matching
  - EAN duplicados dentro de la tienda
  - sanity de precios (nulos, cero, precio > precio_lista)
  - disponibilidad y stock
  - cobertura de gramaje/cantidad
  - top de categorías

Uso:
  cd /home/delia/Documentos/Scrapper
  python3 -m validaciones.validar_trebol
"""
import os
import sqlite3
import sys

from scripts.scraper_trebol import DEFAULT_OUT_DIR, load_sqlite

OUT = DEFAULT_OUT_DIR
RAW = os.path.join(OUT, "raw", "trebol_products.jsonl")
DB = os.path.join(OUT, "staging", "trebol.sqlite")


def main():
    if not os.path.exists(RAW):
        print(f"No existe {RAW}. ¿Corriste el scraper?", file=sys.stderr)
        sys.exit(1)
    os.makedirs(os.path.dirname(DB), exist_ok=True)

    # 1) Recargar SQLite desde el JSONL para que refleje TODO lo descargado.
    if os.path.exists(DB):
        os.remove(DB)
    print("Recargando SQLite desde el JSONL crudo …")
    n_prod_json, n_var = load_sqlite(DB, RAW)
    print(f"  {n_prod_json} productos (JSON) -> {n_var} variantes (filas).\n")

    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    def scalar(q, *a):
        return cur.execute(q, a).fetchone()[0]

    total = scalar("SELECT COUNT(*) FROM producto")
    con_ean = scalar("SELECT COUNT(*) FROM producto WHERE ean IS NOT NULL")
    sin_ean = total - con_ean
    ean_distintos = scalar("SELECT COUNT(DISTINCT ean) FROM producto WHERE ean IS NOT NULL")

    print("=" * 60)
    print("  REPORTE DE VALIDACIÓN — EL TRÉBOL (Bootic)")
    print("=" * 60)

    print("\n[ Cobertura ]")
    print(f"  Filas (variantes)        : {total}")
    print(f"  Con EAN (código barras)  : {con_ean}  ({pct(con_ean, total)})")
    print(f"  Sin EAN (SKU interno)    : {sin_ean}  ({pct(sin_ean, total)})")
    print(f"  EAN distintos            : {ean_distintos}")

    # EAN duplicados dentro de la tienda (mismo código en 2+ filas)
    dups = cur.execute(
        """SELECT ean, COUNT(*) c FROM producto
           WHERE ean IS NOT NULL GROUP BY ean HAVING c > 1 ORDER BY c DESC"""
    ).fetchall()
    print("\n[ EAN duplicados dentro de la tienda ]")
    print(f"  EAN repetidos            : {len(dups)}")
    for r in dups[:5]:
        nombres = cur.execute(
            "SELECT nombre FROM producto WHERE ean=? LIMIT 2", (r["ean"],)
        ).fetchall()
        ejemplo = " | ".join(n["nombre"][:30] for n in nombres)
        print(f"    {r['ean']}  x{r['c']}  ({ejemplo})")

    print("\n[ Sanity de precios ]")
    print(f"  precio NULL              : {scalar('SELECT COUNT(*) FROM precio WHERE precio IS NULL')}")
    print(f"  precio = 0               : {scalar('SELECT COUNT(*) FROM precio WHERE precio = 0')}")
    print(f"  precio > precio_lista    : {scalar('SELECT COUNT(*) FROM precio WHERE precio_lista IS NOT NULL AND precio > precio_lista')}  (debería ser 0 o muy bajo)")
    en_oferta = scalar("SELECT COUNT(*) FROM precio WHERE precio_lista IS NOT NULL AND precio < precio_lista")
    print(f"  en oferta (precio<lista) : {en_oferta}")
    rng = cur.execute("SELECT MIN(precio), MAX(precio) FROM precio WHERE precio>0").fetchone()
    print(f"  rango de precio (CLP)    : ${rng[0]} – ${rng[1]}")

    print("\n[ Disponibilidad y stock ]")
    print(f"  disponibles              : {scalar('SELECT COUNT(*) FROM precio WHERE disponible=1')}")
    print(f"  con stock > 0            : {scalar('SELECT COUNT(*) FROM precio WHERE stock>0')}")

    print("\n[ Gramaje / cantidad ]")
    print(f"  con gramaje_g > 0        : {scalar('SELECT COUNT(*) FROM producto WHERE gramaje_g IS NOT NULL AND gramaje_g>0')}")
    print(f"  con cantidad             : {scalar('SELECT COUNT(*) FROM producto WHERE cantidad IS NOT NULL')}")

    print("\n[ Top 10 categorías ]")
    for r in cur.execute(
        """SELECT categoria, COUNT(*) c FROM producto
           GROUP BY categoria ORDER BY c DESC LIMIT 10"""):
        print(f"  {r['c']:5}  {r['categoria']}")

    print("\n[ Muestra de 5 productos ]")
    for r in cur.execute(
        """SELECT p.nombre, p.ean, pr.precio, pr.precio_lista, pr.stock
           FROM producto p JOIN precio pr ON pr.producto_id=p.id
           WHERE p.ean IS NOT NULL LIMIT 5"""):
        print(f"  {r['nombre'][:40]:40} ean={r['ean']} ${r['precio']} (lista ${r['precio_lista']}) stock={r['stock']}")

    print("\n" + "=" * 60)
    # Veredicto: se toleran pocos precios faltantes/cero (casos borde de la tienda).
    cobertura = con_ean / total if total else 0
    precios_malos = scalar("SELECT COUNT(*) FROM precio WHERE precio IS NULL OR precio = 0")
    frac_malos = precios_malos / total if total else 1
    if total >= 6000 and cobertura >= 0.90 and frac_malos < 0.01:
        print(f"  ✅ FASE 0 OK — catálogo completo, EAN {cobertura*100:.1f}%, "
              f"precios sanos ({precios_malos} sin precio = {frac_malos*100:.2f}%).")
    else:
        print("  ⚠️  Revisar: cobertura/totales bajos o demasiados precios faltantes.")
    print("=" * 60)
    con.close()


def pct(a, b):
    return f"{100*a/b:.1f}%" if b else "0%"


if __name__ == "__main__":
    main()
