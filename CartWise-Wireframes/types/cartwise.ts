// Contratos de datos de Cartwise. Espejan exactamente la salida del bridge
// SQLite (server/sqlite_bridge.py) y de las route handlers de Next. NO incluir
// tipos del frontend anterior fuera del MVP (perfil/cuenta quedaron fuera).

export type MatchKind = "product" | "generic";
export type MatchFilter = "all" | MatchKind;
export type PlanStatus = "pending" | "purchased" | "discarded";

export type StoreInfo = {
  id: number;
  nombre: string;
  label: string;
  plataforma?: string;
  sitio_web: string;
};

export type Health = {
  ok: boolean;
  scope?: "food" | "grocery" | "all" | string | null;
  counts: {
    stores: number;
    products: number;
    offers: number;
    exactComparable: number;
    genericComparable: number;
  };
  stores: StoreInfo[];
};

export type SearchItem = {
  id: number;
  kind: MatchKind;
  ean?: string | null;
  nombre: string;
  marca?: string | null;
  categoria?: string | null;
  imagen_url?: string | null;
  n_tiendas?: number;
  precio_min?: number | null;
  precio_max?: number | null;
  diferencia?: number | null;
  // Solo en ofertas por tienda (operación storeDeals): precio de lista y bandera
  // de promoción real dentro de una misma cadena. No se usa en las diferencias
  // entre supermercados.
  precio_lista?: number | null;
  oferta_real?: boolean | number | null;
  precio_unitario_min?: number | null;
  diferencia_unitaria?: number | null;
  precio_min_store_label?: string | null;
  precio_min_store_url?: string | null;
  precio_min_url?: string | null;
  precio_min_disponible?: boolean | number | null;
  generico_id?: number | null;
  generico_nombre?: string | null;
  generico_categoria?: string | null;
  generico_unidad_base?: string | null;
  generico_contenido_total_base?: number | null;
  unidad_base?: string | null;
  contenido_total_base?: number | null;
  pack_unidades?: number | null;
  match_label: string;
};

export type BasketItem = SearchItem & {
  quantity: number;
};

// Mejores ofertas reales de una cadena en el snapshot (operación storeDeals).
export type StoreDeals = {
  store_key: string;
  store_label: string;
  items: SearchItem[];
};

// Oferta por tienda para un producto exacto (operación productOffers del bridge).
export type StoreOffer = {
  store_id: number;
  store_key: string;
  store_label: string;
  sitio_web?: string | null;
  url?: string | null;
  precio?: number | null;
  precio_lista?: number | null;
  oferta_real?: boolean | number | null;
  disponible?: boolean | number | null;
  stock?: number | null;
  capturado_en?: string | null;
};

export type ProductOffers = {
  product: {
    id: number;
    ean?: string | null;
    nombre: string;
    marca?: string | null;
    categoria?: string | null;
    imagen_url?: string | null;
    generico_id?: number | null;
  } | null;
  offers: StoreOffer[];
};

export type CompareLine = {
  itemId: number;
  kind: MatchKind;
  name: string;
  brand?: string | null;
  quantity: number;
  price: number | null;
  listPrice?: number | null;
  realOffer?: boolean | null;
  lineTotal: number | null;
  unitPrice?: number | null;
  unitBase?: string | null;
  available: boolean;
  url?: string | null;
  ean?: string | null;
  matchedProductName?: string | null;
  matchLabel: string;
};

export type StoreComparison = {
  store: StoreInfo;
  total: number;
  pricedItems: number;
  missingItems: number;
  coverage: number;
  lines: CompareLine[];
};

export type BasketComparison = {
  items: BasketItem[];
  stores: StoreComparison[];
  recommendedStore: StoreComparison | null;
  estimatedSavings: number;
};

export type SavedPlan = {
  id: string;
  date: string;
  createdAt?: string;
  snapshotDate?: string;
  total: number;
  store: string;
  items: number;
  savings: number;
  status?: PlanStatus;
  lines?: BasketItem[];
  recommendedLines?: CompareLine[];
};

export type ConfirmedPurchaseItem = {
  productName: string;
  quantity: number;
  category?: string | null;
  paidPrice?: number | null;
};

export type ConfirmedPurchase = {
  id: string;
  planId?: string;
  store: string;
  purchaseDate: string;
  estimatedTotal?: number | null;
  realTotal: number;
  estimatedSavings?: number | null;
  confirmedSavings?: number | null;
  items: ConfirmedPurchaseItem[];
  createdAt: string;
};

export type SavedList = {
  id: string;
  name: string;
  items: BasketItem[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
};

export type PantryItem = {
  id: string;
  productId?: number | null;
  productName: string;
  category?: string | null;
  quantity: number;
  unit?: string | null;
  source: "confirmed_purchase" | "manual";
  addedAt: string;
  updatedAt: string;
  notes?: string;
  // Snapshot del mejor precio al momento de agregar (plan §6.4). Puede faltar en
  // items manuales antiguos o de compras confirmadas.
  ean?: string | null;
  bestPrice?: number | null;
  bestPriceStore?: string | null;
};

export type PantryItemDraft = {
  productName: string;
  category?: string | null;
  quantity: number;
  unit?: string | null;
  notes?: string;
};

export type ConfirmPurchaseData = {
  realTotal: number;
  purchaseDate: string;
  items: ConfirmedPurchaseItem[];
  addToPantry: boolean;
};
