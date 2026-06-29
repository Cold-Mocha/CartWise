#!/usr/bin/env python3
"""
Filtro de categorías: COMIDA (comestible/bebible, incluido alcohol).

Alcance acordado con el usuario:
  INCLUYE  → todo lo comestible o bebible, incl. vinos, cervezas y destilados.
  EXCLUYE  → no consumibles: limpieza, cuidado personal, mascotas, bebé/pañales,
             hogar, belleza, farmacia, cigarrillos, vestuario, etc.

Un único conjunto de patrones (substrings, sin acentos) sirve para las dos
plataformas:
  - VTEX  : se filtra por el NOMBRE de la categoría raíz (Jumbo/Santa Isabel/Unimarc).
  - Bootic: se filtra por los SLUGS de las colecciones del producto (El Trébol).

Verificado con autotest contra las taxonomías reales (ver `python3 comida.py`).
"""
from __future__ import annotations
import unicodedata

# Patrones de NO-comida (substring, minúsculas, sin acentos).
NON_FOOD_PATTERNS = [
    # limpieza / aseo del hogar
    "limpieza", "aseo", "detergente", "suavizante", "cloro", "lavaloza",
    "desinfectante", "aerosol", "aromatizante", "insecticida",
    "papel", "toalla", "servilleta", "esponja", "guante",
    # cuidado personal / belleza / higiene
    "cuidado", "corporal", "facial", "belleza", "perfum", "maquillaje",
    "cosmetic", "shampoo", "balsamo", "acondicionador", "capilar", "jabon",
    "desodorante", "afeitar", "depila", "solar", "autobronce",
    "bucal", "dental", "dentifrico", "enjuague",
    "femenin", "tampon", "incontinencia",
    # bebé (no comida) y mascotas
    "bebe", "panal", "mascota", "perro", "gato",
    # hogar / bazar / otros no comida
    "hogar", "mueble", "piso", "bazar", "juguet", "libreria", "escolar",
    "deporte", "electro", "tecnolog", "automovil", "ferreteria", "jardin",
    "vestuario", "carbon", "parriller", "fosforo", "encendedor",
    "pila", "bateria", "ampolleta",
    # otros
    "cigarr", "tabaco", "farmacia", "suplement", "vitamina", "medic",
    "primeros auxilios", "bano",
]

# Patrones NEUTROS (colecciones de Bootic que no clasifican: ofertas, etc.).
NEUTRAL_PATTERNS = ["oferta", "junta", "destacad", "fds", "novedad",
                    "mas-vendido", "temporada", "promo", "liquidacion"]


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower()


def _matches(text: str, patterns) -> bool:
    t = _norm(text)
    return any(p in t for p in patterns)


def is_non_food(label: str) -> bool:
    return _matches(label, NON_FOOD_PATTERNS)


def is_food_category(name: str) -> bool:
    """VTEX: una categoría (raíz) es comida si NO matchea patrones de no-comida."""
    return not is_non_food(name)


def is_food_trebol(collection_slugs, product_type: str = "") -> bool:
    """Bootic/Trébol: el producto es comida si
      (1) su product_type NO es de no-comida (señal más específica del ítem), y
      (2) pertenece a >=1 colección de comida (no-comida ni neutra).
    `product_type` es opcional (sin él solo aplica la regla de colecciones)."""
    if product_type and is_non_food(product_type):
        return False
    for s in collection_slugs:
        if not s:
            continue
        if _matches(s, NEUTRAL_PATTERNS):
            continue
        if is_non_food(s):
            continue
        return True   # hay al menos una colección de comida
    return False


# --------------------------------------------------------------------------- #
# Autotest contra las taxonomías reales (jun 2026)
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    # Jumbo: 18 raíces VTEX
    jumbo_food = [
        "Lácteos, Huevos y Congelados", "Frutas y Verduras", "Despensa",
        "Quesos y Fiambres", "Panadería y Pastelería", "Licores, Bebidas y Aguas",
        "Carnes y Pescados", "Chocolates, Galletas y Snacks", "Experiencias Jumbo",
        "Catering",
    ]
    jumbo_nonfood = [
        "Cuidado Personal y Bebé", "Limpieza", "Hogar, Juguetería y Librería",
        "Mi bebé", "Mascotas", "Cigarrillos", "Vestuario", "Farmacia",
    ]
    # Trébol: colecciones del sitemap
    trebol_food = [
        "aceites-y-condimentos", "aguas", "bebidas", "bebidas-jugos", "botilleria",
        "carne-de-vacuno", "cervezas", "chocolates-y-candy", "destilados",
        "frutas-y-verduras", "leches-y-cremas", "mantequilla-margarinas-y-huevos",
        "pan-y-pasteleria", "salchichas-y-embutidos", "sours", "te-y-hierbas",
        "vinos-y-espumantes", "yoghurt-y-postres",
    ]
    trebol_nonfood = [
        "accesorios-bebe", "accesorios-de-mascotas", "aerosoles",
        "alimentos-para-mascotas", "bano-y-cocina", "belleza", "carbon",
        "cuidado-bucal", "cuidado-mujer", "desinfectantes",
        "detergentes-y-suavizantes", "limpieza-y-aseo", "otros-hogar", "panales",
        "papeles", "parrilleros", "piso-muebles-y-accesorios", "shampoo-y-balsamos",
    ]
    fails = 0
    for n in jumbo_food:
        if not is_food_category(n): print("FALLO (debería ser comida):", n); fails += 1
    for n in jumbo_nonfood:
        if is_food_category(n): print("FALLO (debería ser NO-comida):", n); fails += 1
    for s in trebol_food:
        if not is_food_trebol([s]): print("FALLO trébol (comida):", s); fails += 1
    for s in trebol_nonfood:
        if is_food_trebol([s]): print("FALLO trébol (NO-comida):", s); fails += 1
    # casos con colecciones mixtas
    assert is_food_trebol(["ofertas", "vinos-y-espumantes"]), "vino en oferta = comida"
    assert not is_food_trebol(["ofertas", "shampoo-y-balsamos"]), "shampoo en oferta = no"
    assert not is_food_trebol(["ofertas"]), "solo oferta = sin señal de comida"
    # product_type manda: shampoo en colección de comida igual se excluye
    assert not is_food_trebol(["despensa", "ofertas"], product_type="Shampoo"), \
        "product_type Shampoo = no-comida"
    assert is_food_trebol(["despensa"], product_type="Galletas Dulces"), "galleta = comida"
    assert not is_food_trebol(["ofertas"], product_type="Pañales Babysec"), "pañal = no"
    print(f"\nAutotest: {'OK ✅' if fails == 0 else f'{fails} FALLOS ❌'} "
          f"({len(jumbo_food)+len(jumbo_nonfood)} cats Jumbo, "
          f"{len(trebol_food)+len(trebol_nonfood)} cols Trébol)")
