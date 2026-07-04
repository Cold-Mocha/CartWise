#!/usr/bin/env python3
"""
Capa 2 del comparador: productos genericos y sustituciones.

Esta capa es heuristica y reconstruible. No reemplaza el cruce exacto por EAN:
agrega campos normalizados a producto_marca, crea grupos comparables por nombre
generico + contenido, y guarda candidatos difusos para revision.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from difflib import SequenceMatcher
import json
import re
import sqlite3
import unicodedata

from scripts.comida import is_scope_product, normalize_scope


UNIT_PATTERN = (
    r"kilogramos|kilogramo|kilos|kilo|kgs|kg|"
    r"gramos|gramo|grs|gr|g|"
    r"litros|litro|lts|lt|l|"
    r"mililitros|mililitro|ml|cc|"
    r"unidades|unidad|unid|uni|un|u"
)

PACK_X_RE = re.compile(
    rf"\b(?P<pack>\d{{1,3}})\s*x\s*"
    rf"(?P<value>\d+(?:[\.,]\d+)?)\s*(?P<unit>{UNIT_PATTERN})\b"
)
NUMBER_UNIT_RE = re.compile(
    rf"\b(?P<value>\d+(?:[\.,]\d+)?)\s*(?P<unit>{UNIT_PATTERN})\b"
)
PACK_COUNT_RE = re.compile(
    r"\b(?:pack|caja|display)?\s*(?P<pack>\d{1,3})\s*"
    r"(?:unidades|unidad|unid|uni|un|u|latas|lata|botellas|botella|bot)\b"
)

STOPWORDS = {
    "a", "al", "de", "del", "la", "las", "el", "los", "y", "o", "con",
    "sin", "para", "por", "en", "tipo", "sabor", "sab", "marca",
    "pack", "caja", "display", "unidad", "unidades", "unid", "uni", "un",
    "oferta", "promo", "formato",
}

GENERIC_TOO_WEAK = {
    "botella", "bot", "lata", "paquete", "familiar", "unidad", "unidades",
    "caja", "pack", "malla", "bolsa", "pote", "bandeja",
}

TOKEN_SYNONYMS = {
    "yoghurt": "yogurt",
    "yogur": "yogurt",
    "liquida": "liquido",
    "descremada": "descremado",
    "semidescremada": "semidescremado",
    "entera": "entero",
    "vegetales": "vegetal",
    "grano": "gr",
    "bot": "botella",
}

BLOCKED_CATEGORY_PATTERNS = {
    "inflable", "intex", "piscina", "juguete", "bazar", "hogar", "parrillero",
    "carbon", "limpieza", "aseo", "belleza", "cuidado", "mascota", "panal",
}


@dataclass
class ParsedContent:
    valor: float
    unidad: str
    contenido_base: float
    unidad_base: str
    pack_unidades: int
    contenido_total_base: float
    fuente: str


@dataclass
class ProductAnalysis:
    product_id: int
    nombre_norm: str
    marca_norm: str
    categoria_norm: str
    nombre_generico: str | None
    contenido: ParsedContent | None
    bloqueado: bool
    razon_bloqueo: str | None = None


def normalize_text(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = value.lower().replace("&", " y ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def _text_for_parse(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = value.lower().replace("×", "x")
    value = re.sub(r"\d+(?:[\.,]\d+)?\s*°\s*[a-z]*", " ", value)
    value = re.sub(r"(?<=\d),(?=\d)", ".", value)
    value = re.sub(r"[^a-z0-9\.\s]+", " ", value)
    return " ".join(value.split())


def _to_float(value: str | int | float | None) -> float | None:
    if value is None:
        return None
    text = str(value).strip().replace(",", ".")
    if not text or text.upper() == "#REF!":
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _to_unit_float(value: str | int | float | None, unit: str | None) -> float | None:
    text = str(value).strip() if value is not None else ""
    norm_unit = normalize_unit(unit)
    if norm_unit in {"g", "ml", "un"} and re.match(r"^\d{1,3}\.\d{3}$", text):
        return _to_float(text.replace(".", ""))
    return _to_float(value)


def normalize_unit(unit: str | None) -> str | None:
    unit = normalize_text(unit)
    if not unit:
        return None
    if unit in {"kg", "kgs", "kilo", "kilos", "kilogramo", "kilogramos"}:
        return "kg"
    if unit in {"g", "gr", "grs", "gramo", "gramos"}:
        return "g"
    if unit in {"l", "lt", "lts", "litro", "litros"}:
        return "l"
    if unit in {"ml", "cc", "mililitro", "mililitros"}:
        return "ml"
    if unit in {"u", "un", "uni", "unid", "unidad", "unidades"}:
        return "un"
    return None


def _base_quantity(value: float, unit: str) -> tuple[float, str]:
    if unit == "kg":
        return value * 1000.0, "g"
    if unit == "g":
        return value, "g"
    if unit == "l":
        return value * 1000.0, "ml"
    if unit == "ml":
        return value, "ml"
    return value, "un"


def _content_from_match(value: float, unit: str, pack: int, source: str) -> ParsedContent | None:
    norm_unit = normalize_unit(unit)
    if not norm_unit or value <= 0:
        return None
    base, base_unit = _base_quantity(value, norm_unit)
    pack = max(int(pack or 1), 1)
    total = base * pack if base_unit in {"g", "ml"} else base
    if base_unit == "un":
        pack = int(round(value)) if value >= 1 else pack
        total = value
    return ParsedContent(
        valor=value,
        unidad=norm_unit,
        contenido_base=base,
        unidad_base=base_unit,
        pack_unidades=pack,
        contenido_total_base=total,
        fuente=source,
    )


def parse_content(nombre: str | None, cantidad: str | None, unidad: str | None,
                  gramaje_g: int | float | None) -> ParsedContent | None:
    text = _text_for_parse(nombre)

    pack_x = PACK_X_RE.search(text)
    if pack_x:
        parsed = _content_from_match(
            _to_unit_float(pack_x.group("value"), pack_x.group("unit")) or 0,
            pack_x.group("unit"),
            int(pack_x.group("pack")),
            "nombre_pack_x",
        )
        if parsed:
            return parsed

    pack = 1
    pack_count = PACK_COUNT_RE.search(text)
    if pack_count:
        pack = int(pack_count.group("pack"))

    physical_matches = []
    unit_matches = []
    for match in NUMBER_UNIT_RE.finditer(text):
        unit = normalize_unit(match.group("unit"))
        value = _to_unit_float(match.group("value"), match.group("unit"))
        if value is None or not unit:
            continue
        if unit in {"kg", "g", "l", "ml"}:
            physical_matches.append((value, match.group("unit")))
        elif unit == "un":
            unit_matches.append((value, match.group("unit")))

    if physical_matches:
        value, unit_text = physical_matches[-1]
        parsed = _content_from_match(value, unit_text, pack, "nombre")
        if parsed:
            return parsed

    if unit_matches:
        value, unit_text = unit_matches[0]
        parsed = _content_from_match(value, unit_text, 1, "nombre_unidades")
        if parsed:
            return parsed

    if re.search(r"\b(kilo|kilos|kg)\b", text):
        parsed = _content_from_match(1.0, "kg", 1, "nombre_kilo")
        if parsed:
            return parsed
    if re.search(r"\b(unidad|unidades)\b", text):
        parsed = _content_from_match(1.0, "un", 1, "nombre_unidad")
        if parsed:
            return parsed

    q = _to_float(cantidad)
    q_unit = normalize_unit(unidad)
    if q and q_unit:
        parsed = _content_from_match(q, q_unit, 1, "cantidad_unidad")
        if parsed:
            return parsed

    g = _to_float(gramaje_g)
    if g and g > 0:
        return _content_from_match(g, "g", 1, "gramaje_g")

    return None


def category_bucket(categoria: str | None) -> str:
    cat = normalize_text(categoria)
    if not cat:
        return ""
    rules = [
        ("cerveza", "cerveza"),
        ("vino", "vino"),
        ("espumante", "vino"),
        ("sidra", "vino"),
        ("pisco", "pisco"),
        ("whisky", "destilado"),
        ("ron", "destilado"),
        ("vodka", "destilado"),
        ("leche", "leche"),
        ("yog", "yogurt"),
        ("aceite", "aceite"),
        ("arroz", "arroz"),
        ("pasta", "pasta"),
        ("fideo", "pasta"),
        ("galleta", "galleta"),
        ("chocolate", "chocolate"),
        ("queso", "queso"),
        ("huevo", "huevo"),
        ("verdura", "fruta_verdura"),
        ("fruta", "fruta_verdura"),
        ("carne", "carne"),
        ("vacuno", "carne"),
        ("pollo", "carne"),
        ("cerdo", "carne"),
        ("pescado", "pescado"),
        ("marisco", "pescado"),
        ("condimento", "condimento"),
        ("alino", "condimento"),
        ("salsa", "condimento"),
        ("bebida", "bebida"),
        ("agua", "bebida"),
        ("jugo", "bebida"),
    ]
    for needle, bucket in rules:
        if needle in cat:
            return bucket
    return cat


def is_blocked_category(categoria: str | None, nombre: str | None = None,
                        scope: str = "food") -> bool:
    scope = normalize_scope(scope)
    if scope == "all":
        return False
    cat = normalize_text(categoria)
    name = normalize_text(nombre)
    if cat or name:
        if not is_scope_product(name, cat, scope):
            return True
    # Si el filtro fino acepto el producto por una senal clara de comida
    # (por ejemplo carnes en categoria "Parrilleros"), solo aplicar bloqueos
    # adicionales de Capa 2 para categorias explicitamente problematicas.
    return (
        scope == "food"
        and bool(cat)
        and any(p in cat for p in BLOCKED_CATEGORY_PATTERNS - {"parrillero", "carbon"})
    )


def generic_name(nombre: str | None, marca: str | None) -> str | None:
    text = _text_for_parse(nombre)
    text = PACK_X_RE.sub(" ", text)
    text = NUMBER_UNIT_RE.sub(" ", text)
    text = PACK_COUNT_RE.sub(" ", text)
    text = re.sub(r"\b\d+\s*personas?\b", " ", text)
    text = normalize_text(text)

    brand_tokens = set(normalize_text(marca).split())
    tokens = []
    for token in text.split():
        if token in brand_tokens or token in STOPWORDS or token.isdigit():
            continue
        token = TOKEN_SYNONYMS.get(token, token)
        if token not in STOPWORDS:
            tokens.append(token)

    deduped = []
    for token in tokens:
        if not deduped or deduped[-1] != token:
            deduped.append(token)

    if not deduped:
        return None
    if len(deduped) == 1 and deduped[0] in GENERIC_TOO_WEAK:
        return None
    return " ".join(deduped)


def analyze_product(row: sqlite3.Row, scope: str = "food") -> ProductAnalysis:
    nombre = row["nombre"]
    marca = row["marca"]
    categoria = row["categoria"]
    blocked = is_blocked_category(categoria, nombre, scope)
    parsed = parse_content(nombre, row["cantidad"], row["unidad"], row["gramaje_g"])
    gen_name = generic_name(nombre, marca)
    return ProductAnalysis(
        product_id=row["id"],
        nombre_norm=normalize_text(nombre),
        marca_norm=normalize_text(marca),
        categoria_norm=category_bucket(categoria),
        nombre_generico=gen_name,
        contenido=parsed,
        bloqueado=blocked,
        razon_bloqueo=f"fuera_scope_{scope}" if blocked else None,
    )


def _round_total(value: float | None) -> float | None:
    if value is None:
        return None
    rounded = round(float(value), 3)
    return int(rounded) if rounded.is_integer() else rounded


def build_capa2(con: sqlite3.Connection, scope: str = "food") -> dict[str, int]:
    scope = normalize_scope(scope)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    rows = cur.execute("""
        SELECT id, nombre, marca, categoria, gramaje_g, cantidad, unidad
        FROM producto_marca
    """).fetchall()

    analyses: list[ProductAnalysis] = []
    groups: dict[tuple[str, str, str, float], list[ProductAnalysis]] = {}

    for row in rows:
        analysis = analyze_product(row, scope)
        analyses.append(analysis)
        content = analysis.contenido
        cur.execute("""
            UPDATE producto_marca
            SET nombre_norm=?, marca_norm=?, categoria_norm=?,
                contenido_valor=?, contenido_unidad=?, contenido_base=?,
                unidad_base=?, pack_unidades=?, contenido_total_base=?
            WHERE id=?
        """, (
            analysis.nombre_norm,
            analysis.marca_norm,
            analysis.categoria_norm,
            content.valor if content else None,
            content.unidad if content else None,
            content.contenido_base if content else None,
            content.unidad_base if content else None,
            content.pack_unidades if content else None,
            content.contenido_total_base if content else None,
            analysis.product_id,
        ))

        if (
            analysis.bloqueado
            or not analysis.nombre_generico
            or not content
            or not analysis.categoria_norm
        ):
            continue
        key = (
            analysis.categoria_norm,
            analysis.nombre_generico,
            content.unidad_base,
            _round_total(content.contenido_total_base),
        )
        groups.setdefault(key, []).append(analysis)

    generics = []
    for (cat, gen_name, unit, total), members in sorted(groups.items()):
        pack_units = max((m.contenido.pack_unidades for m in members if m.contenido), default=1)
        attrs = {"regla": "nombre_generico_contenido", "n_miembros": len(members)}
        cur.execute("""
            INSERT INTO producto_generico
                (categoria_norm, nombre_generico, unidad_base, contenido_total_base,
                 pack_unidades, atributos_json)
            VALUES (?,?,?,?,?,?)
        """, (cat, gen_name, unit, total, pack_units, json.dumps(attrs, ensure_ascii=False)))
        generico_id = cur.lastrowid
        generics.append((generico_id, cat, gen_name, unit, total))

        brands = {m.marca_norm for m in members if m.marca_norm}
        score = 0.98 if len(brands) <= 1 else 0.93
        rule = "misma_marca_nombre_contenido" if len(brands) <= 1 else "generico_contenido_categoria"
        for member in members:
            evidence = {
                "nombre_generico": member.nombre_generico,
                "marca_norm": member.marca_norm,
                "contenido": asdict(member.contenido) if member.contenido else None,
            }
            cur.execute("""
                INSERT INTO producto_generico_miembro
                    (generico_id, producto_marca_id, score_similitud, regla,
                     evidencia_json, confirmado)
                VALUES (?,?,?,?,?,1)
            """, (
                generico_id,
                member.product_id,
                score,
                rule,
                json.dumps(evidence, ensure_ascii=False),
            ))
            cur.execute(
                "UPDATE producto_marca SET generico_id=? WHERE id=?",
                (generico_id, member.product_id),
            )

    _build_candidates(cur, generics)
    con.commit()
    return {
        "analizados": len(analyses),
        "genericos": len(generics),
        "miembros": cur.execute("SELECT COUNT(*) FROM producto_generico_miembro").fetchone()[0],
        "candidatos": cur.execute("SELECT COUNT(*) FROM producto_generico_candidato").fetchone()[0],
        "bloqueados": sum(1 for a in analyses if a.bloqueado),
    }


def _build_candidates(cur: sqlite3.Cursor, generics: list[tuple[int, str, str, str, float]]) -> None:
    buckets: dict[tuple[str, str, float, str], list[tuple[int, str]]] = {}
    for generico_id, cat, name, unit, total in generics:
        first = name.split()[0] if name else ""
        buckets.setdefault((cat, unit, total, first), []).append((generico_id, name))

    for (_cat, _unit, _total, _first), items in buckets.items():
        if len(items) < 2 or len(items) > 200:
            continue
        for idx, (left_id, left_name) in enumerate(items):
            for right_id, right_name in items[idx + 1:]:
                score = SequenceMatcher(None, left_name, right_name).ratio()
                if 0.82 <= score < 1.0:
                    evidence = {"origen": left_name, "destino": right_name}
                    cur.execute("""
                        INSERT OR IGNORE INTO producto_generico_candidato
                            (generico_origen_id, generico_destino_id, score_similitud,
                             regla, evidencia_json)
                        VALUES (?,?,?,?,?)
                    """, (
                        min(left_id, right_id),
                        max(left_id, right_id),
                        score,
                        "nombre_similar_mismo_contenido",
                        json.dumps(evidence, ensure_ascii=False),
                    ))


def _selftest() -> None:
    cases = [
        ("Leche Colun Entera 1 L", None, None, None, 1000, "ml", 1),
        ("Cerveza Lager 24 x 330 cc", None, None, None, 7920, "ml", 24),
        ("Pack 24 un. Cerveza 5.0° Lata 354 cc", None, None, None, 8496, "ml", 24),
        ("Arroz Grado 1 1 kg", None, None, None, 1000, "g", 1),
        ("Huevos Blancos Grandes 12 un.", None, None, None, 12, "un", 12),
        ("Aji Seco Kilo", None, None, None, 1000, "g", 1),
        ("Aceite Aruba Vegetal 1 L", "#REF!", "ml", 0, 1000, "ml", 1),
        ("Leche en polvo Nido entera tarro 1.350 g", None, None, None, 1350, "g", 1),
    ]
    for name, cantidad, unidad, gramaje, expected_total, expected_unit, expected_pack in cases:
        parsed = parse_content(name, cantidad, unidad, gramaje)
        assert parsed, name
        assert round(parsed.contenido_total_base, 3) == expected_total, (name, parsed)
        assert parsed.unidad_base == expected_unit, (name, parsed)
        assert parsed.pack_unidades == expected_pack, (name, parsed)
    assert generic_name("Leche Colun Entera 1 L", "Colun") == "leche entero"
    assert is_blocked_category("Inflables Intex")
    assert is_blocked_category("0 a 3 meses", "Body Manga Corta Animales + Calza Talla 0-3")
    assert not is_blocked_category("Parrilleros", "Huachalomo vacuno al vacío 1.5 Kg")
    assert is_blocked_category("Detergente Líquido", "Detergente Líquido Concentrado", "food")
    assert not is_blocked_category("Detergente Líquido", "Detergente Líquido Concentrado", "grocery")
    print("Capa 2 selftest: OK")


if __name__ == "__main__":
    _selftest()
