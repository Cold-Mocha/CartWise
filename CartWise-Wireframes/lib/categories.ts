import {
  Carrot,
  Wheat,
  Milk,
  Beef,
  Package,
  CupSoda,
  Snowflake,
  SprayCan,
  ShowerHead,
  PawPrint,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { normalizeText } from "@/lib/text";

/*
  Mapa único de categorías del mart (muy granulares, p. ej. "Leche Líquida",
  "Papas Fritas") → categorías GENERALES y útiles para una compra cotidiana.
  Se usa en tres lugares: grillas de ofertas por categoría, ícono de respaldo
  cuando no hay foto, y el filtro de categoría del catálogo. El alcohol se
  excluye del flujo principal (generalCategory → null).
*/

export type GeneralCategory =
  | "Frutas y verduras"
  | "Carbohidratos"
  | "Lácteos"
  | "Carnes y proteínas"
  | "Abarrotes"
  | "Bebidas"
  | "Congelados"
  | "Limpieza y aseo"
  | "Higiene personal"
  | "Mascotas"
  | "Otros";

// Orden de presentación de las grillas (lo más cotidiano primero).
export const GENERAL_CATEGORY_ORDER: GeneralCategory[] = [
  "Frutas y verduras",
  "Carbohidratos",
  "Lácteos",
  "Carnes y proteínas",
  "Abarrotes",
  "Bebidas",
  "Congelados",
  "Limpieza y aseo",
  "Higiene personal",
  "Mascotas",
  "Otros",
];

export const CATEGORY_ICONS: Record<GeneralCategory, LucideIcon> = {
  "Frutas y verduras": Carrot,
  Carbohidratos: Wheat,
  "Lácteos": Milk,
  "Carnes y proteínas": Beef,
  Abarrotes: Package,
  Bebidas: CupSoda,
  Congelados: Snowflake,
  "Limpieza y aseo": SprayCan,
  "Higiene personal": ShowerHead,
  Mascotas: PawPrint,
  Otros: ShoppingBag,
};

const ALCOHOL = [
  "vino",
  "cerveza",
  "pisco",
  "whisky",
  "licor",
  "espumante",
  "sidra",
  "destila",
  "aperitiv",
  "vodka",
  "tequila",
  "champa",
  "conac",
  "aperol",
  "aguardiente",
  "cachaza",
];

const RULES: Array<{ cat: GeneralCategory; keywords: string[]; words?: string[] }> = [
  { cat: "Congelados", keywords: ["congelad", "helado", "pizza"] },
  { cat: "Mascotas", keywords: ["mascota", "perro", "gato"] },
  {
    cat: "Limpieza y aseo",
    keywords: [
      "detergente",
      "lavaloza",
      "lavavajilla",
      "cloro",
      "limpia",
      "desinfect",
      "aseo",
      "suavizante",
      "esponja",
      "papel higien",
      "toalla de papel",
      "servilleta",
      "basura",
      "insectic",
      "aromatizante",
    ],
  },
  {
    cat: "Higiene personal",
    keywords: [
      "shampoo",
      "champu",
      "jabon",
      "dental",
      "desodorante",
      "higiene",
      "panal",
      "afeit",
      "toallas femen",
      "toalla higien",
      "colonia",
      "algodon",
      "cuidado",
    ],
  },
  {
    cat: "Lácteos",
    keywords: [
      "leche",
      "yogur",
      "yoghurt",
      "queso",
      "mantec",
      "mantequilla",
      "margarina",
      "manjar",
      "lacteo",
      "chanco",
    ],
  },
  {
    cat: "Carnes y proteínas",
    keywords: [
      "carne",
      "pollo",
      "pescado",
      "salchich",
      "longaniza",
      "chorizo",
      "hamburgues",
      "jamon",
      "vienesa",
      "nugget",
      "pulpa",
      "marisco",
      "camaron",
      "huevo",
      "pate",
      "cecina",
      "apanado",
      "medallon",
      "prieta",
      "salame",
      "salami",
      "tocino",
    ],
  },
  {
    cat: "Carbohidratos",
    keywords: [
      "arroz",
      "pasta",
      "fideo",
      "cereal",
      "harina",
      "tortilla",
      "avena",
      "legumbre",
      "poroto",
      "lenteja",
      "garbanzo",
      "quinoa",
      "semola",
      "polenta",
    ],
    words: ["pan", "panes"],
  },
  {
    cat: "Frutas y verduras",
    keywords: ["fruta", "verdura", "hortaliza", "ensalada", "tomate", "palta"],
  },
  {
    cat: "Bebidas",
    keywords: [
      "bebida",
      "jugo",
      "agua",
      "nectar",
      "isotonic",
      "refresco",
      "gaseosa",
      "hierba",
      "cafe",
      "capsula",
      "yerba",
      "infusion",
      "saborizad",
      "energetic",
    ],
    words: ["te"],
  },
  {
    cat: "Abarrotes",
    keywords: [
      "conserva",
      "alino",
      "condimento",
      "salsa",
      "aceite",
      "mermelada",
      "azucar",
      "endulzante",
      "stevia",
      "miel",
      "mayonesa",
      "ketchup",
      "mostaza",
      "vinagre",
      "sopa",
      "crema",
      "snack",
      "galleta",
      "chocolate",
      "gomita",
      "caramelo",
      "mani",
      "frutos secos",
      "papas fritas",
      "barras de cereal",
      "barras de proteina",
      "dulce",
      "golosina",
      "untable",
      "flan",
      "gelatina",
      "pasas",
      "calug",
      "bombon",
      "trufa",
      "queque",
      "barquillo",
      "chicle",
      "malva",
      "merengu",
    ],
    words: ["sal"],
  },
];

/**
 * Devuelve la categoría general de una categoría granular del mart, o `null`
 * si es alcohol (excluido del flujo principal). Las categorías sin coincidencia
 * caen en "Otros".
 */
export function generalCategory(cat?: string | null): GeneralCategory | null {
  if (!cat) return "Otros";
  const c = normalizeText(cat);
  if (ALCOHOL.some((a) => c.includes(a)) || c.split(" ").includes("ron") || c.split(" ").includes("gin")) {
    return null;
  }
  for (const rule of RULES) {
    if (rule.keywords.some((k) => c.includes(k))) return rule.cat;
    if (rule.words?.some((w) => c.split(" ").includes(w))) return rule.cat;
  }
  return "Otros";
}

/** Ícono de respaldo según la categoría general (para productos sin foto). */
export function categoryIcon(cat?: string | null): LucideIcon {
  const general = generalCategory(cat) ?? "Otros";
  return CATEGORY_ICONS[general];
}
