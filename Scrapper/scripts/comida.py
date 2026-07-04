#!/usr/bin/env python3
"""
Filtro de alcance del catálogo.

Scopes soportados:
  food    → comestible/bebible, incluido alcohol.
  grocery → supermercado de consumo habitual: food + limpieza, cuidado personal,
            bebé/pañales, mascotas y hogar consumible. Excluye vestuario, juguetes,
            librería, electro/hogar durable, farmacia y cigarrillos.
  all     → sin filtro de alcance.

Los filtros son heurísticos por substring normalizado porque cada tienda usa una
taxonomía distinta. El JSONL crudo conserva todo lo descargado; el scope se aplica
al cargar staging.

Verificado con autotest contra las taxonomías reales (ver `python3 comida.py`).
"""
from __future__ import annotations
import unicodedata

VALID_SCOPES = {"food", "grocery", "all"}

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

# Senales duras de no-comida a nivel producto o categoria fina. Se mantienen
# separadas de NON_FOOD_PATTERNS porque hay palabras amplias, como "deporte" o
# "parrillero", que pueden aparecer en bebidas o carnes comestibles.
HARD_NON_FOOD_NAME_PATTERNS = [
    "detergente", "suavizante", "cloro", "lavaloza", "desinfectante",
    "aerosol", "aromatizante", "insecticida", "limpiador", "quitamanchas",
    "apresto", "ambiental", "ambientales", "trapeador", "escobillon",
    "papel higienico", "toalla papel", "toallas de papel", "toallita",
    "servilleta", "esponja", "guante", "pano", "panos",
    "shampoo", "balsamo", "acondicionador", "jabon", "desodorante",
    "dentifrico", "enjuague bucal", "desmaquill", "maquillaje",
    "crema de mano", "cremas de mano", "mano y cara",
    "panal", "panales", "pañal", "pañales", "body", "bodys", "enterito",
    "calza", "babero", "vestido", "manga corta", "short corto",
    "mascota", "perro", "gato", "juguete", "vestuario",
    "carbon", "fosforo", "encendedor", "pila", "bateria", "ampolleta",
    "cigarr", "tabaco", "farmacia", "suplemento", "suplementos",
    "medicamento", "medicamentos",
]

HARD_NON_FOOD_CATEGORY_PATTERNS = HARD_NON_FOOD_NAME_PATTERNS + [
    "0 a 3 meses", "3 a 6 meses", "6 a 9 meses", "9 a 12 meses",
    "12 a 18 meses", "18 a 24 meses", "colados y picados",
]

FOOD_SIGNAL_PATTERNS = [
    "aceite", "agua", "aguas", "aji", "alino", "aliño", "arroz",
    "azucar", "bebida", "bebidas", "cafe", "carne", "vacuno", "pollo",
    "cerdo", "pavo", "cordero", "chuleta", "huachalomo", "sobrecostilla",
    "abastero", "ganso", "bife", "asado", "costillar", "hamburguesa",
    "longaniza", "chorizo", "embutido", "jamon", "fiambre", "queso",
    "leche", "yog", "huevo", "helado", "fruta", "verdura", "legumbre",
    "choclo", "arveja", "papa", "pasta", "fideo", "tallarines",
    "harina", "pan", "pasteler", "galleta", "chocolate", "snack",
    "cereal", "condimento", "salsa", "sal", "endulzante", "mermelada",
    "conserva", "congelado", "ensalada", "plato preparado", "jugo",
    "nectar", "te", "hierba", "mate", "vino", "cerveza", "licor",
    "pisco", "whisky", "ron", "vodka", "espumante", "sidra", "cooler",
    "coctel", "cóctel", "isotonica", "isotonico", "isotónica", "isotónico",
    "suero",
]

# Exclusiones de grocery. El scope grocery permite no-comida consumible
# (limpieza, higiene, mascotas, pañales), pero evita durables, vestuario y
# categorías reguladas/sensibles que no pertenecen al MVP de supermercado.
NON_GROCERY_CATEGORY_PATTERNS = [
    "cigarr", "tabaco", "farmacia", "medic", "primeros auxilios",
    "vestuario", "ropa", "juguet", "libreria", "escolar", "mueble",
    "electro", "tecnolog", "automovil", "ferreteria", "jardin",
    "store locator", "hogar jugueteria libreria", "hogar, jugueteria y libreria",
    "automotriz", "calefaccion", "ventilacion", "celebraciones",
    "cristaleria", "decoracion", "dormitorio", "hermeticos", "termos",
    "loza", "tazones", "ollas", "sartenes", "coccion", "organizacion",
    "herramientas", "adhesivos", "iluminacion", "enchufes", "juegos",
    "deportes", "pilas", "piscina", "textil", "utensilios",
    "velas", "fosforos",
]

NON_GROCERY_PRODUCT_PATTERNS = NON_GROCERY_CATEGORY_PATTERNS + [
    "body", "bodys", "enterito", "calza", "babero", "vestido", "manga corta",
    "short corto", "talla 0", "talla 3", "talla 6", "talla 9", "talla 12",
    "talla 18", "zapat", "polera", "pantalon", "calcetin", "calcetines",
    "peluche", "muñeca", "muneca", "auto juguete", "cafetera", "hervidor",
    "licuadora", "batidora", "sandwichera", "aspiradora", "ventilador",
    "silla", "mesa", "organizador", "repisa", "taza", "mug coffe", "mug coffee",
]

NON_GROCERY_ROOT_NAMES = {
    "hogar",
    "hogar jugueteria y libreria",
    "hogar, jugueteria y libreria",
}

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


def normalize_scope(scope: str | None) -> str:
    scope = (scope or "food").strip().lower()
    if scope not in VALID_SCOPES:
        raise ValueError(f"scope inválido: {scope!r}; usa food, grocery o all")
    return scope


def is_non_food(label: str) -> bool:
    return _matches(label, NON_FOOD_PATTERNS)


def is_food_category(name: str) -> bool:
    """VTEX: una categoría (raíz) es comida si NO matchea patrones de no-comida."""
    return not is_non_food(name)


def has_food_signal(label: str) -> bool:
    return _matches(label, FOOD_SIGNAL_PATTERNS)


def is_grocery_category(name: str) -> bool:
    """VTEX: categoría raíz apta para grocery."""
    name_norm = _norm(name).replace(",", "")
    return name_norm not in NON_GROCERY_ROOT_NAMES and not _matches(
        name, NON_GROCERY_CATEGORY_PATTERNS
    )


def is_grocery_product(name: str = "", category: str = "") -> bool:
    name_norm = _norm(name)
    cat_norm = _norm(category)
    combined = f"{name_norm} {cat_norm}".strip()
    if not combined:
        return True
    if _matches(cat_norm, NON_GROCERY_CATEGORY_PATTERNS):
        return False
    if _matches(combined, NON_GROCERY_PRODUCT_PATTERNS):
        return False
    return True


def is_scope_category(name: str, scope: str = "food") -> bool:
    scope = normalize_scope(scope)
    if scope == "all":
        return True
    if scope == "grocery":
        return is_grocery_category(name)
    return is_food_category(name)


def is_food_product(name: str = "", category: str = "") -> bool:
    """Filtro fino para productos ya descubiertos.

    Permite rescatar bebidas/carnes que contienen palabras amplias como
    "deportiva" o "parrilleros", pero excluye categorias y nombres claramente
    fuera del alcance del MVP.
    """
    name_norm = _norm(name)
    cat_norm = _norm(category)
    combined = f"{name_norm} {cat_norm}".strip()
    if not combined:
        return True

    if _matches(name_norm, HARD_NON_FOOD_NAME_PATTERNS):
        return False
    if _matches(cat_norm, HARD_NON_FOOD_CATEGORY_PATTERNS):
        return False

    if is_non_food(cat_norm) or is_non_food(name_norm):
        return has_food_signal(combined)
    return True


def is_scope_product(name: str = "", category: str = "", scope: str = "food") -> bool:
    scope = normalize_scope(scope)
    if scope == "all":
        return True
    if scope == "grocery":
        return is_grocery_product(name, category)
    return is_food_product(name, category)


def is_food_trebol(collection_slugs, product_type: str = "", name: str = "") -> bool:
    """Bootic/Trébol: el producto es comida si
      (1) su product_type NO es de no-comida (señal más específica del ítem), y
      (2) pertenece a >=1 colección de comida (no-comida ni neutra).
    `product_type` es opcional (sin él solo aplica la regla de colecciones)."""
    if not is_food_product(name, product_type):
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


def is_scope_trebol(collection_slugs, product_type: str = "", name: str = "",
                    scope: str = "food") -> bool:
    scope = normalize_scope(scope)
    if scope == "all":
        return True
    if scope == "food":
        return is_food_trebol(collection_slugs, product_type, name)

    if not is_grocery_product(name, product_type):
        return False
    has_signal = False
    for s in collection_slugs:
        if not s:
            continue
        if _matches(s, NEUTRAL_PATTERNS):
            continue
        if _matches(s, NON_GROCERY_CATEGORY_PATTERNS):
            continue
        has_signal = True
        break
    return has_signal or bool(product_type)


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
        if not is_scope_category(n, "food"): print("FALLO (debería ser comida):", n); fails += 1
    for n in jumbo_nonfood:
        if is_scope_category(n, "food"): print("FALLO (debería ser NO-comida):", n); fails += 1
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
    assert not is_food_product("Body Manga Corta Animales + Calza Talla 0-3", "0 a 3 meses")
    assert not is_food_product("Detergente Líquido Concentrado", "Detergente Líquido")
    assert not is_food_product("Suplemento Ensure Advance Vainilla 850 g", "Leche en Polvo")
    assert is_food_product("Bebida Deportiva Isotónica 1 L", "Bebidas Isotónicas")
    assert is_food_product("Huachalomo vacuno al vacío 1.5 Kg", "Parrilleros")
    assert not is_food_product("Carbón Parrillero 2.5 kg", "Parrilleros")
    assert is_scope_category("Limpieza", "grocery")
    assert is_scope_category("Cuidado Personal y Bebé", "grocery")
    assert is_scope_category("Mascotas", "grocery")
    assert not is_scope_category("Cigarrillos", "grocery")
    assert not is_scope_category("Vestuario", "grocery")
    assert is_scope_product("Detergente Líquido Concentrado", "Detergente Líquido", "grocery")
    assert is_scope_product("Shampoo Ballerina Coco 750 ml", "Shampoo", "grocery")
    assert is_scope_product("Alim Dog Chow Carne/Pollo Adult/Med 8 Kg", "Perro", "grocery")
    assert not is_scope_product("Body Manga Corta Animales + Calza Talla 0-3", "0 a 3 meses", "grocery")
    assert not is_scope_product("Cafetera Ursus Trotter", "Electrodomésticos", "grocery")
    assert not is_scope_product("Sartén antiadherente Dkora 20 cm",
                                "Ollas, sartenes y accesorios cocción", "grocery")
    assert not is_scope_category("Hogar", "grocery")
    assert is_scope_trebol(["limpieza-y-aseo"], product_type="Detergente Líquido",
                           name="Detergente Líquido Concentrado", scope="grocery")
    assert is_scope_trebol(["mascotas"], product_type="Perro",
                           name="Alim Dog Chow Carne/Pollo Adult/Med 8 Kg", scope="grocery")
    print(f"\nAutotest: {'OK ✅' if fails == 0 else f'{fails} FALLOS ❌'} "
          f"({len(jumbo_food)+len(jumbo_nonfood)} cats Jumbo, "
          f"{len(trebol_food)+len(trebol_nonfood)} cols Trébol)")
