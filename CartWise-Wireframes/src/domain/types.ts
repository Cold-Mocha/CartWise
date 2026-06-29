// 'profile' queda FUERA del MVP actual (ver ProfileView.tsx, marcado @deprecated).
export type View = 'dashboard' | 'plan' | 'prices' | 'lists' | 'comparison' | 'history' | 'pantry';
export type MatchKind = 'product' | 'generic';
export type PlanStatus = 'pending' | 'purchased' | 'discarded';
export type MatchFilter = 'all' | MatchKind;

export type Health = {
  ok: boolean;
  counts: {
    stores: number;
    products: number;
    offers: number;
    exactComparable: number;
    genericComparable: number;
  };
  stores: StoreInfo[];
};

export type StoreInfo = {
  id: number;
  nombre: string;
  label: string;
  sitio_web: string;
};

export type SearchItem = {
  id: number;
  kind: MatchKind;
  ean?: string | null;
  nombre: string;
  marca?: string | null;
  categoria?: string | null;
  n_tiendas?: number;
  precio_min?: number | null;
  precio_max?: number | null;
  diferencia?: number | null;
  precio_unitario_min?: number | null;
  diferencia_unitaria?: number | null;
  precio_min_store_label?: string | null;
  precio_min_store_url?: string | null;
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

export type CompareLine = {
  itemId: number;
  kind: MatchKind;
  name: string;
  brand?: string | null;
  quantity: number;
  price: number | null;
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
  source: 'confirmed_purchase' | 'manual';
  addedAt: string;
  updatedAt: string;
  notes?: string;
};

export type ProfileTab = 'cuenta' | 'ubicacion' | 'notificaciones' | 'seguridad';

export type Account = {
  avatarUrl: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postalCode: string;
  language: string;
  timezone: string;
  currency: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  priceAlerts: boolean;
  twoFactor: boolean;
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
