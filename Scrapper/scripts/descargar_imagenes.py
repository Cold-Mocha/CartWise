#!/usr/bin/env python3
"""Descarga las imágenes de los productos del comparador.

Las URLs de imagen no están en la base de datos, pero sí en los datos crudos del
scraper (`datos/raw/*_products.jsonl`):

  - VTEX (Jumbo, Santa Isabel, Unimarc): items[].ean + items[].images[0].imageUrl
  - Trébol: EAN en el nombre del archivo + images[0].src.medium (fallback small/image)

Las imágenes se guardan por EAN en `CartWise-Wireframes/public/images/products/<ean>.jpg`
para que el front las sirva como `/images/products/<ean>.jpg`.

Uso típico:
    python3 scripts/descargar_imagenes.py --limit 50      # prueba
    python3 scripts/descargar_imagenes.py                  # solo EANs de la DB
    python3 scripts/descargar_imagenes.py --all            # todos los del raw

Solo usa la librería estándar (sin dependencias).
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from glob import glob

# Rutas relativas a la carpeta Scrapper/ (este script vive en Scrapper/scripts/).
SCRAPPER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(SCRAPPER_DIR, "datos", "raw")
DB_PATH = os.path.join(SCRAPPER_DIR, "datos", "comparadores", "comparador.sqlite")
LOG_DIR = os.path.join(SCRAPPER_DIR, "datos", "logs")
DEFAULT_OUT = os.path.normpath(
    os.path.join(SCRAPPER_DIR, "..", "CartWise-Wireframes", "public", "images", "products")
)

USER_AGENT = "CartWise-ImageFetcher/1.0 (+local demo)"
TIMEOUT = 20
RETRIES = 3


def db_eans() -> set[str]:
    con = sqlite3.connect(DB_PATH)
    try:
        rows = con.execute(
            "SELECT ean FROM producto_marca WHERE ean IS NOT NULL AND ean <> ''"
        ).fetchall()
    finally:
        con.close()
    return {str(r[0]).strip() for r in rows}


def ean_from_trebol_filename(name: str) -> str:
    # "844005-7802900002671.jpg" -> "7802900002671"
    base = os.path.splitext(name or "")[0]
    return base.split("-")[-1].strip()


def collect_pairs() -> dict[str, str]:
    """Construye {ean: imageUrl} (tamaño medio) desde los JSONL crudos."""
    pairs: dict[str, str] = {}
    for path in sorted(glob(os.path.join(RAW_DIR, "*_products.jsonl"))):
        is_trebol = "trebol" in os.path.basename(path).lower()
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if is_trebol:
                    imgs = obj.get("images") or []
                    first = imgs[0] if imgs else {}
                    src = first.get("src") or {}
                    url = src.get("medium") or src.get("small") or obj.get("image")
                    ean = ean_from_trebol_filename(first.get("file_name", ""))
                    if ean and url:
                        pairs.setdefault(ean, url)
                else:  # VTEX
                    for item in obj.get("items") or []:
                        ean = (item.get("ean") or "").strip()
                        imgs = item.get("images") or []
                        url = imgs[0].get("imageUrl") if imgs else None
                        if ean and url:
                            pairs.setdefault(ean, url)
    return pairs


def download_one(ean: str, url: str, out_dir: str, overwrite: bool) -> str:
    """Devuelve 'ok' | 'skip' | 'fail'."""
    dest = os.path.join(out_dir, f"{ean}.jpg")
    if not overwrite and os.path.exists(dest) and os.path.getsize(dest) > 0:
        return "skip"
    # Codificar caracteres no-ASCII (p. ej. "°", espacios) preservando los
    # delimitadores de URL, o urllib falla con un UnicodeEncodeError silencioso.
    safe_url = urllib.parse.quote(url, safe=":/?&=%#@+,;~()")
    req = urllib.request.Request(safe_url, headers={"User-Agent": USER_AGENT})
    for attempt in range(1, RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = resp.read()
            if not data:
                raise ValueError("respuesta vacía")
            tmp = dest + ".part"
            with open(tmp, "wb") as fh:
                fh.write(data)
            os.replace(tmp, dest)
            return "ok"
        except (urllib.error.URLError, urllib.error.HTTPError, ValueError, TimeoutError, OSError):
            if attempt < RETRIES:
                time.sleep(0.5 * attempt)  # backoff lineal
            else:
                return "fail"
    return "fail"


def main() -> int:
    parser = argparse.ArgumentParser(description="Descarga imágenes de productos por EAN.")
    parser.add_argument("--limit", type=int, default=0, help="Descargar solo N imágenes (prueba).")
    parser.add_argument("--all", action="store_true", help="No filtrar por EANs de la DB.")
    parser.add_argument("--out", default=DEFAULT_OUT, help="Carpeta de salida.")
    parser.add_argument("--workers", type=int, default=16, help="Descargas en paralelo.")
    parser.add_argument("--overwrite", action="store_true", help="Re-descargar aunque exista.")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)
    os.makedirs(LOG_DIR, exist_ok=True)

    print("Leyendo URLs de imagen desde los datos crudos...")
    pairs = collect_pairs()
    print(f"  EAN con imagen en el raw: {len(pairs)}")

    if not args.all:
        valid = db_eans()
        pairs = {e: u for e, u in pairs.items() if e in valid}
        print(f"  EAN que están en la DB:   {len(pairs)}")

    items = sorted(pairs.items())
    if args.limit > 0:
        items = items[: args.limit]
    total = len(items)
    print(f"A descargar: {total}  ->  {args.out}\n")

    counts = {"ok": 0, "skip": 0, "fail": 0}
    failures: list[str] = []
    done = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {
            pool.submit(download_one, ean, url, args.out, args.overwrite): ean
            for ean, url in items
        }
        for fut in as_completed(futures):
            ean = futures[fut]
            result = fut.result()
            counts[result] += 1
            if result == "fail":
                failures.append(f"{ean}\t{pairs[ean]}")
            done += 1
            if done % 200 == 0 or done == total:
                print(
                    f"  {done}/{total}  ok={counts['ok']} skip={counts['skip']} fail={counts['fail']}",
                    flush=True,
                )

    if failures:
        log_path = os.path.join(LOG_DIR, "imagenes_fallidas.txt")
        with open(log_path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(failures) + "\n")
        print(f"\nFallidas: {len(failures)} (ver {log_path})")

    print(
        f"\nListo. Descargadas={counts['ok']}  Saltadas={counts['skip']}  "
        f"Fallidas={counts['fail']}  Total procesadas={total}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
