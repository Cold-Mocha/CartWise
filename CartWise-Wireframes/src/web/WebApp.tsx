import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Settings,
  ShoppingBasket,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react';

type View = 'dashboard' | 'plan' | 'prices' | 'lists' | 'comparison' | 'history' | 'pantry' | 'profile';
type MatchKind = 'product' | 'generic';
type PlanStatus = 'pending' | 'purchased' | 'discarded';
type MatchFilter = 'all' | MatchKind;

type Health = {
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

type StoreInfo = {
  id: number;
  nombre: string;
  label: string;
  sitio_web: string;
};

type SearchItem = {
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

type BasketItem = SearchItem & {
  quantity: number;
};

type CompareLine = {
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

type StoreComparison = {
  store: StoreInfo;
  total: number;
  pricedItems: number;
  missingItems: number;
  coverage: number;
  lines: CompareLine[];
};

type BasketComparison = {
  items: BasketItem[];
  stores: StoreComparison[];
  recommendedStore: StoreComparison | null;
  estimatedSavings: number;
};

type SavedPlan = {
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

type ConfirmedPurchaseItem = {
  productName: string;
  quantity: number;
  category?: string | null;
  paidPrice?: number | null;
};

type ConfirmedPurchase = {
  id: string;
  planId?: string;
  store: string;
  purchaseDate: string; // ISO
  estimatedTotal?: number | null;
  realTotal: number;
  estimatedSavings?: number | null;
  confirmedSavings?: number | null;
  items: ConfirmedPurchaseItem[];
  createdAt: string;
};

type SavedList = {
  id: string;
  name: string;
  items: BasketItem[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
};

type PantryItem = {
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

type ProfileTab = 'cuenta' | 'ubicacion' | 'notificaciones' | 'seguridad';

type Account = {
  // Datos de cuenta
  avatarUrl: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Ubicación
  country: string;
  region: string;
  city: string;
  address: string;
  postalCode: string;
  language: string;
  timezone: string;
  currency: string;
  // Notificaciones
  notifyEmail: boolean;
  notifyPush: boolean;
  priceAlerts: boolean;
  // Seguridad
  twoFactor: boolean;
};

const AUTH_EMAIL = 'test@gmail.com';
const AUTH_PASS = 'pass123';
const AUTH_KEY = 'cartwise_demo_auth';
const BASKET_KEY = 'cartwise_web_basket';
const HISTORY_KEY = 'cartwise_web_history';
const ACCOUNT_KEY = 'cartwise_web_account';
const BUDGET_KEY = 'cartwise_web_budget';
const CONFIRMED_KEY = 'cartwise_web_confirmed';
const LISTS_KEY = 'cartwise_web_lists';
const PANTRY_KEY = 'cartwise_web_pantry';

const navItems: {id: View; label: string; icon: ReactNode}[] = [
  {id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={18} aria-hidden="true" />},
  {id: 'prices', label: 'Productos', icon: <Search size={18} aria-hidden="true" />},
  {id: 'plan', label: 'Comparar', icon: <ShoppingBasket size={18} aria-hidden="true" />},
  {id: 'lists', label: 'Listas', icon: <ListChecks size={18} aria-hidden="true" />},
  {id: 'history', label: 'Historial', icon: <History size={18} aria-hidden="true" />},
  {id: 'pantry', label: 'Almacén', icon: <Package size={18} aria-hidden="true" />},
  {id: 'profile', label: 'Perfil', icon: <User size={18} aria-hidden="true" />},
];

const SUGERENCIAS = ['leche', 'arroz', 'aceite', 'fideos', 'cerveza'];
const COMUNAS = [
  'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Lo Barnechea', 'Ñuñoa',
  'La Reina', 'Macul', 'Peñalolén', 'La Florida', 'Puente Alto', 'Maipú',
  'Estación Central', 'Quinta Normal', 'Recoleta', 'Independencia', 'Conchalí',
  'Huechuraba', 'Quilicura', 'Renca', 'Cerrillos', 'Pudahuel', 'San Miguel',
  'San Joaquín', 'La Cisterna', 'El Bosque', 'La Granja', 'San Bernardo',
];
const SNAPSHOT_FECHA = '2026-06-24';
const TRANSPARENCY_SNAPSHOT = `Precios referenciales según el último snapshot disponible (${SNAPSHOT_FECHA}).`;
const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  pending: 'Pendiente',
  purchased: 'Comprado',
  discarded: 'Descartado',
};
const PAISES = ['Chile', 'Argentina', 'Perú', 'Bolivia', 'Colombia', 'México', 'España', 'Uruguay'];
const IDIOMAS = ['Español', 'English', 'Português'];
const ZONAS_HORARIAS = [
  'America/Santiago (GMT-4)',
  'America/Argentina/Buenos_Aires (GMT-3)',
  'America/Lima (GMT-5)',
  'America/Mexico_City (GMT-6)',
  'Europe/Madrid (GMT+2)',
];
const MONEDAS = ['CLP — Peso chileno', 'ARS — Peso argentino', 'PEN — Sol', 'USD — Dólar', 'EUR — Euro'];

const DEFAULT_ACCOUNT: Account = {
  avatarUrl: '',
  username: 'usuario_demo',
  firstName: '',
  lastName: '',
  email: AUTH_EMAIL,
  phone: '',
  country: 'Chile',
  region: 'Región Metropolitana',
  city: 'Santiago',
  address: '',
  postalCode: '',
  language: 'Español',
  timezone: 'America/Santiago (GMT-4)',
  currency: 'CLP — Peso chileno',
  notifyEmail: true,
  notifyPush: false,
  priceAlerts: true,
  twoFactor: false,
};

function emailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function phoneValid(value: string) {
  const v = value.trim();
  if (!v) return true; // opcional
  return /^[+0-9()\s-]{8,}$/.test(v);
}

function cityValid(value: string) {
  return COMUNAS.includes(value.trim());
}

function accountInitials(account: Account) {
  const first = account.firstName.trim()[0] || account.username.trim()[0] || account.email.trim()[0] || 'U';
  const second = account.lastName.trim()[0] || '';
  return (first + second).toUpperCase();
}

function accountValid(account: Account) {
  return emailValid(account.email) && phoneValid(account.phone) && cityValid(account.city);
}

function money(value?: number | null) {
  if (value === null || value === undefined) return 'Sin precio';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function isAvailableFlag(value: SearchItem['precio_min_disponible']) {
  return value === true || value === 1;
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {'Content-Type': 'application/json'},
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `API error ${response.status}`);
  }
  return response.json();
}

function monthKey(iso?: string) {
  return (iso ?? new Date().toISOString()).slice(0, 7);
}

function currentMonthLabel() {
  return new Date().toLocaleDateString('es-CL', {month: 'long', year: 'numeric'});
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function planItemsSignature(items: BasketItem[]) {
  return items
    .map((item) => `${item.kind}:${item.id}:${item.quantity}`)
    .sort()
    .join('|');
}

function savedPlanSignature(plan: SavedPlan) {
  return plan.lines?.length ? planItemsSignature(plan.lines) : `${plan.store}:${plan.total}:${plan.items}`;
}

function buildGenericFromProduct(item: BasketItem): BasketItem | null {
  if (item.kind !== 'product' || !item.generico_id) return null;
  return {
    ...item,
    id: item.generico_id,
    kind: 'generic',
    nombre: item.generico_nombre || `Comparable de ${item.nombre}`,
    marca: null,
    categoria: item.generico_categoria || item.categoria,
    ean: null,
    unidad_base: item.generico_unidad_base,
    contenido_total_base: item.generico_contenido_total_base,
    match_label: 'Comparable por unidad',
  };
}

export function WebApp() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [view, setView] = useState<View>('dashboard');
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [topDeals, setTopDeals] = useState<SearchItem[]>([]);
  const [dealsError, setDealsError] = useState(false);
  const [basket, setBasket] = useState<BasketItem[]>(() => loadJson(BASKET_KEY, []));
  const [comparison, setComparison] = useState<BasketComparison | null>(null);
  const [comparing, setComparing] = useState(false);
  const [history, setHistory] = useState<SavedPlan[]>(() => loadJson(HISTORY_KEY, []));
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | null>(null);
  const [account, setAccount] = useState<Account>(() => ({
    ...DEFAULT_ACCOUNT,
    ...loadJson<Partial<Account>>(ACCOUNT_KEY, {}),
  }));
  const [budget, setBudget] = useState<number>(() => loadJson<number>(BUDGET_KEY, 0));
  const [confirmed, setConfirmed] = useState<ConfirmedPurchase[]>(() => loadJson(CONFIRMED_KEY, []));
  const [savedLists, setSavedLists] = useState<SavedList[]>(() => loadJson(LISTS_KEY, []));
  const [pantry, setPantry] = useState<PantryItem[]>(() => loadJson(PANTRY_KEY, []));
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [confirmingPlan, setConfirmingPlan] = useState<SavedPlan | null>(null);
  const [savingList, setSavingList] = useState(false);

  useEffect(() => {
    if (!authed) return;
    api<Health>('/api/health')
      .then((data) => {
        setHealth(data);
        setHealthError(false);
      })
      .catch((error) => {
        setApiError(error.message);
        setHealthError(true);
      });
    api<{items: SearchItem[]}>('/api/deals/top?limit=8')
      .then((data) => {
        setTopDeals(data.items);
        setDealsError(false);
      })
      .catch(() => setDealsError(true));
  }, [authed]);

  useEffect(() => {
    localStorage.setItem(BASKET_KEY, JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem(CONFIRMED_KEY, JSON.stringify(confirmed));
  }, [confirmed]);

  useEffect(() => {
    localStorage.setItem(LISTS_KEY, JSON.stringify(savedLists));
  }, [savedLists]);

  useEffect(() => {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!highlightedPlanId) return;
    const timer = setTimeout(() => setHighlightedPlanId(null), 3800);
    return () => clearTimeout(timer);
  }, [highlightedPlanId]);

  const basketUnits = basket.reduce((sum, item) => sum + item.quantity, 0);

  const addToBasket = (item: SearchItem) => {
    setBasket((current) => {
      const existing = current.find((row) => row.id === item.id && row.kind === item.kind);
      if (existing) {
        return current.map((row) =>
          row.id === item.id && row.kind === item.kind
            ? {...row, quantity: row.quantity + 1}
            : row,
        );
      }
      return [...current, {...item, quantity: 1}];
    });
    // No teletransportar: el usuario sigue donde está; se confirma con un toast.
    setToast(`${item.nombre} · agregado a tu compra`);
  };

  const removeFromBasket = (item: BasketItem) => {
    setBasket((current) => current.filter((row) => !(row.id === item.id && row.kind === item.kind)));
    setToast(`${item.nombre} · quitado de tu compra`);
  };

  const clearBasket = () => {
    setBasket([]);
    setToast('Compra pendiente vaciada');
  };

  const updateQuantity = (item: BasketItem, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(item);
      return;
    }
    setBasket((current) => current.map((row) =>
      row.id === item.id && row.kind === item.kind ? {...row, quantity} : row,
    ));
  };

  const switchToGeneric = (item: BasketItem) => {
    const generic = buildGenericFromProduct(item);
    if (!generic) {
      setToast('Ese producto no tiene comparable asociado');
      return;
    }
    setBasket((current) => {
      const withoutExact = current.filter((row) => !(row.id === item.id && row.kind === item.kind));
      const existingGeneric = withoutExact.find((row) => row.kind === 'generic' && row.id === generic.id);
      if (existingGeneric) {
        return withoutExact.map((row) =>
          row.kind === 'generic' && row.id === generic.id
            ? {...row, quantity: row.quantity + item.quantity}
            : row,
        );
      }
      return [...withoutExact, generic];
    });
    setToast(`${item.nombre} cambiado por comparable`);
  };

  const compareItems = async (items: BasketItem[]) => {
    if (!items.length || comparing) return;
    setApiError(null);
    setComparing(true);
    try {
      const data = await api<BasketComparison>('/api/basket/compare', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(({id, kind, quantity}) => ({id, kind, quantity})),
        }),
      });
      setComparison(data);
      setView('comparison');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'No se pudo comparar la compra.');
    } finally {
      setComparing(false);
    }
  };

  const compareBasket = () => compareItems(basket);

  const savePlan = () => {
    if (!comparison?.recommendedStore) return;
    const rec = comparison.recommendedStore;
    const signature = planItemsSignature(basket);
    const duplicate = history.find(
      (p) => p.store === rec.store.label && p.total === rec.total && savedPlanSignature(p) === signature,
    );
    if (duplicate) {
      setToast('Ese plan ya está en el historial');
      setHighlightedPlanId(duplicate.id);
      setView('history');
      return;
    }
    const now = new Date();
    const saved: SavedPlan = {
      id: String(Date.now()),
      date: now.toLocaleString('es-CL', {dateStyle: 'short', timeStyle: 'short'}),
      createdAt: now.toISOString(),
      snapshotDate: SNAPSHOT_FECHA,
      total: rec.total,
      store: rec.store.label,
      items: rec.pricedItems,
      savings: comparison.estimatedSavings,
      status: 'pending',
      lines: basket.map((item) => ({...item})),
      recommendedLines: rec.lines.map((line) => ({...line})),
    };
    setHistory((current) => [saved, ...current]);
    setHighlightedPlanId(saved.id);
    setToast('Plan guardado en el historial');
    setView('history');
  };

  const repeatPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      setToast('Ese plan no tiene líneas guardadas');
      return;
    }
    setBasket(plan.lines.map((item) => ({...item})));
    setToast('Compra restaurada desde el historial');
    setView('plan');
  };

  const compareSavedPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      setToast('Ese plan no tiene líneas guardadas');
      return;
    }
    const lines = plan.lines.map((item) => ({...item}));
    setBasket(lines);
    compareItems(lines);
  };

  const deletePlan = (planId: string) => {
    setHistory((current) => current.filter((plan) => plan.id !== planId));
    setToast('Plan eliminado');
  };

  const clearHistory = () => {
    setHistory([]);
    setToast('Historial vaciado');
  };

  const updatePlanStatus = (planId: string, status: PlanStatus) => {
    setHistory((current) => current.map((plan) =>
      plan.id === planId ? {...plan, status} : plan,
    ));
    setToast(`Estado actualizado: ${PLAN_STATUS_LABELS[status]}`);
  };

  // ---- Listas guardadas (§4.6) ----
  const saveCurrentAsList = (name: string) => {
    if (!basket.length) {
      setToast('No hay productos para guardar como lista');
      return;
    }
    const now = new Date().toISOString();
    const list: SavedList = {
      id: String(Date.now()),
      name: name.trim() || 'Lista sin nombre',
      items: basket.map((item) => ({...item})),
      createdAt: now,
      updatedAt: now,
    };
    setSavedLists((current) => [list, ...current]);
    setSavingList(false);
    setToast(`Lista "${list.name}" guardada`);
  };

  const repeatList = (list: SavedList) => {
    if (!list.items.length) {
      setToast('Esa lista no tiene productos');
      return;
    }
    setBasket(list.items.map((item) => ({...item})));
    setSavedLists((current) => current.map((l) =>
      l.id === list.id ? {...l, lastUsedAt: new Date().toISOString()} : l,
    ));
    setToast(`Lista "${list.name}" cargada como compra pendiente`);
    setView('plan');
  };

  const compareList = (list: SavedList) => {
    if (!list.items.length) {
      setToast('Esa lista no tiene productos');
      return;
    }
    const lines = list.items.map((item) => ({...item}));
    setBasket(lines);
    setSavedLists((current) => current.map((l) =>
      l.id === list.id ? {...l, lastUsedAt: new Date().toISOString()} : l,
    ));
    compareItems(lines);
  };

  const renameList = (id: string, name: string) => {
    setSavedLists((current) => current.map((l) =>
      l.id === id ? {...l, name: name.trim() || l.name, updatedAt: new Date().toISOString()} : l,
    ));
    setToast('Lista actualizada');
  };

  const deleteList = (id: string) => {
    setSavedLists((current) => current.filter((l) => l.id !== id));
    setToast('Lista eliminada');
  };

  const savePlanAsList = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      setToast('Ese plan no tiene líneas guardadas');
      return;
    }
    const now = new Date().toISOString();
    setSavedLists((current) => [{
      id: String(Date.now()),
      name: `Compra ${plan.store} · ${plan.date}`,
      items: plan.lines!.map((item) => ({...item})),
      createdAt: now,
      updatedAt: now,
    }, ...current]);
    setToast('Lista creada desde el plan');
  };

  // ---- Almacén del hogar (§4.7) ----
  const addItemsToPantry = (items: ConfirmedPurchaseItem[]) => {
    const now = new Date().toISOString();
    setPantry((current) => {
      const next = [...current];
      items.forEach((it) => {
        const idx = next.findIndex((p) => p.productName.toLowerCase() === it.productName.toLowerCase());
        if (idx >= 0) {
          next[idx] = {...next[idx], quantity: next[idx].quantity + it.quantity, updatedAt: now};
        } else {
          next.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            productName: it.productName,
            category: it.category ?? null,
            quantity: it.quantity,
            source: 'confirmed_purchase',
            addedAt: now,
            updatedAt: now,
          });
        }
      });
      return next;
    });
  };

  const addPantryItem = (data: {productName: string; category?: string | null; quantity: number; unit?: string | null; notes?: string}) => {
    const now = new Date().toISOString();
    setPantry((current) => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productName: data.productName.trim(),
      category: data.category ?? null,
      quantity: data.quantity,
      unit: data.unit ?? null,
      source: 'manual',
      addedAt: now,
      updatedAt: now,
      notes: data.notes,
    }, ...current]);
    setToast(`${data.productName.trim()} agregado al almacén`);
  };

  const updatePantryQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setPantry((current) => current.filter((p) => p.id !== id));
      return;
    }
    setPantry((current) => current.map((p) =>
      p.id === id ? {...p, quantity, updatedAt: new Date().toISOString()} : p,
    ));
  };

  const consumePantryItem = (id: string) => {
    setPantry((current) => current.filter((p) => p.id !== id));
    setToast('Producto marcado como consumido');
  };

  // ---- Compra confirmada (§4.5) ----
  const confirmPurchase = (
    plan: SavedPlan,
    data: {realTotal: number; purchaseDate: string; items: ConfirmedPurchaseItem[]; addToPantry: boolean},
  ) => {
    const estimatedTotal = plan.total;
    const estimatedSavings = plan.savings ?? 0;
    // Ahorro confirmado: ahorro estimado del plan ajustado por la diferencia entre
    // lo estimado y lo realmente pagado (pagar menos de lo estimado suma ahorro).
    const confirmedSavings = estimatedSavings + (estimatedTotal - data.realTotal);
    const purchase: ConfirmedPurchase = {
      id: String(Date.now()),
      planId: plan.id,
      store: plan.store,
      purchaseDate: data.purchaseDate,
      estimatedTotal,
      realTotal: data.realTotal,
      estimatedSavings,
      confirmedSavings,
      items: data.items,
      createdAt: new Date().toISOString(),
    };
    setConfirmed((current) => [purchase, ...current]);
    setHistory((current) => current.map((p) => (p.id === plan.id ? {...p, status: 'purchased'} : p)));
    if (data.addToPantry) {
      addItemsToPantry(data.items);
    }
    setConfirmingPlan(null);
    setToast('Compra confirmada y registrada');
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setView('dashboard');
  };

  if (!authed) {
    const enter = () => {
      localStorage.setItem(AUTH_KEY, 'true');
      setAuthed(true);
    };
    if (showLogin) {
      return <LoginScreen onLogin={enter} onBack={() => setShowLogin(false)} />;
    }
    return <LandingScreen onDemo={enter} onLogin={() => setShowLogin(true)} />;
  }

  return (
    <WebShell view={view} onNavigate={setView} onLogout={logout} basketCount={basketUnits} toast={toast}>
      {apiError && (
        <div className="cw-alert" role="alert">
          No pudimos cargar los precios en este momento. Vuelve a intentarlo en unos segundos.
        </div>
      )}
      {view === 'dashboard' && (
        <Dashboard
          health={health}
          healthError={healthError}
          basket={basket}
          topDeals={topDeals}
          dealsError={dealsError}
          history={history}
          confirmed={confirmed}
          savedLists={savedLists}
          pantry={pantry}
          budget={budget}
          onBudgetChange={setBudget}
          onNavigate={setView}
          onAdd={addToBasket}
          onCompare={compareBasket}
          comparing={comparing}
        />
      )}
      {view === 'plan' && (
        <PlanBuilder
          basket={basket}
          onAdd={addToBasket}
          onQuantity={updateQuantity}
          onRemove={removeFromBasket}
          onSwitchToGeneric={switchToGeneric}
          onClear={clearBasket}
          onCompare={compareBasket}
          onSaveList={() => setSavingList(true)}
          comparing={comparing}
        />
      )}
      {view === 'prices' && <PriceExplorer onAdd={addToBasket} />}
      {view === 'lists' && (
        <ListsView
          lists={savedLists}
          onRepeat={repeatList}
          onCompare={compareList}
          onRename={renameList}
          onDelete={deleteList}
          onNavigate={setView}
        />
      )}
      {view === 'comparison' && (
        <ComparisonView
          comparison={comparison}
          onBack={() => setView('plan')}
          onSave={savePlan}
        />
      )}
      {view === 'history' && (
        <HistoryView
          history={history}
          highlightedPlanId={highlightedPlanId}
          onRepeat={repeatPlan}
          onCompare={compareSavedPlan}
          onDelete={deletePlan}
          onClear={clearHistory}
          onStatusChange={updatePlanStatus}
          onConfirm={(plan) => setConfirmingPlan(plan)}
          onSaveAsList={savePlanAsList}
        />
      )}
      {view === 'pantry' && (
        <PantryView
          pantry={pantry}
          onAdd={addPantryItem}
          onQuantity={updatePantryQuantity}
          onConsume={consumePantryItem}
          onNavigate={setView}
        />
      )}
      {view === 'profile' && (
        <ProfileView
          account={account}
          onAccountChange={setAccount}
        />
      )}
      {confirmingPlan && (
        <ConfirmPurchaseModal
          plan={confirmingPlan}
          onClose={() => setConfirmingPlan(null)}
          onConfirm={confirmPurchase}
        />
      )}
      {savingList && (
        <SaveListModal
          count={basket.length}
          onClose={() => setSavingList(false)}
          onSave={saveCurrentAsList}
        />
      )}
    </WebShell>
  );
}

// Supermercados realmente integrados al snapshot. NO incluir Tottus ni Líder
// como cubiertos (plan §6.3): aún no están en el mart.
const COVERED_STORES = ['Jumbo', 'Santa Isabel', 'Unimarc', 'El Trébol'];
const COMING_SOON_STORES = ['Tottus', 'Líder'];

function LandingScreen({onDemo, onLogin}: {onDemo: () => void; onLogin: () => void}) {
  const [deals, setDeals] = useState<SearchItem[]>([]);

  useEffect(() => {
    api<{items: SearchItem[]}>('/api/deals/top?limit=8')
      .then((data) => setDeals(data.items))
      .catch(() => setDeals([]));
  }, []);

  return (
    <div className="cw-landing">
      <header className="cw-landing-nav">
        <div className="cw-brand">
          <div className="cw-logo">C</div>
          <strong>Cartwise</strong>
        </div>
        <div className="cw-landing-nav-actions">
          <button type="button" className="cw-ghost-btn" onClick={onLogin}>Iniciar sesión</button>
          <button type="button" className="cw-primary-btn" onClick={onDemo}>Probar como demo</button>
        </div>
      </header>

      <main id="cw-main">
        <section className="cw-hero-public">
          <div className="cw-hero-public-copy">
            <span className="cw-kicker">Compara y ahorra</span>
            <h1>Ahorra tiempo y dinero en cada compra</h1>
            <p>
              Cartwise compara el precio de tu compra de comida y bebida entre los
              supermercados chilenos integrados, para que sepas dónde te conviene comprar.
            </p>
            <div className="cw-hero-public-actions">
              <button type="button" className="cw-primary-btn" onClick={onDemo}>
                Probar como demo <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="cw-ghost-btn" onClick={onLogin}>Iniciar sesión</button>
            </div>
            <p className="cw-disclaimer-text">{TRANSPARENCY_SNAPSHOT}</p>
          </div>
        </section>

        <CoveredStoresSection />

        <OpportunitiesCarousel deals={deals} onDemo={onDemo} />

        <HowItWorksSection />
      </main>

      <footer className="cw-landing-foot">
        <PublicDataDisclaimer />
        <button type="button" className="cw-primary-btn" onClick={onDemo}>Entrar como demo</button>
      </footer>
    </div>
  );
}

function CoveredStoresSection() {
  return (
    <section className="cw-landing-section" aria-labelledby="cw-covered-title">
      <h2 id="cw-covered-title">Supermercados actualmente comparados</h2>
      <p className="cw-section-lead">
        Comparamos productos de comida y bebida en supermercados integrados al último snapshot disponible.
      </p>
      <ul className="cw-store-logos" role="list">
        {COVERED_STORES.map((store) => (
          <li key={store} className="cw-store-logo">
            <Store size={22} aria-hidden="true" />
            <span>{store}</span>
          </li>
        ))}
      </ul>
      <p className="cw-coming-soon">Próximamente: {COMING_SOON_STORES.join(' · ')}</p>
    </section>
  );
}

function OpportunitiesCarousel({deals, onDemo}: {deals: SearchItem[]; onDemo: () => void}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = deals.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [paused, count]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (!count) {
    return (
      <section className="cw-landing-section" aria-labelledby="cw-opp-title">
        <h2 id="cw-opp-title">Oportunidades destacadas</h2>
        <EmptyState text="Aún no hay diferencias destacadas para mostrar." />
      </section>
    );
  }

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section
      className="cw-landing-section"
      aria-labelledby="cw-opp-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <h2 id="cw-opp-title">Oportunidades destacadas</h2>
      <p className="cw-section-lead">
        Diferencias de precio relevantes entre tiendas para un mismo producto. No son
        necesariamente promociones.
      </p>
      <div className="cw-carousel" aria-roledescription="carrusel" aria-live="polite">
        <button
          type="button"
          className="cw-carousel-arrow"
          onClick={() => go(index - 1)}
          aria-label="Oportunidad anterior"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <OpportunityCard deal={deals[index]} onDemo={onDemo} position={index + 1} total={count} />
        <button
          type="button"
          className="cw-carousel-arrow"
          onClick={() => go(index + 1)}
          aria-label="Siguiente oportunidad"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="cw-carousel-dots" role="tablist" aria-label="Seleccionar oportunidad">
        {deals.map((deal, i) => (
          <button
            key={deal.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Oportunidad ${i + 1} de ${count}`}
            className={i === index ? 'active' : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}

function OpportunityCard({deal, onDemo, position, total}: {deal: SearchItem; onDemo: () => void; position: number; total: number}) {
  const diff = deal.diferencia ?? null;
  const pct = diff && deal.precio_max ? Math.round((diff / deal.precio_max) * 100) : null;
  return (
    <article className="cw-opp-card" aria-label={`Oportunidad ${position} de ${total}`}>
      <span className="cw-badge-diff"><TrendingUp size={13} aria-hidden="true" /> Diferencia destacada</span>
      <h3>{deal.nombre}</h3>
      {deal.categoria && <p className="cw-opp-cat">{deal.categoria}</p>}
      <dl className="cw-opp-prices">
        <div>
          <dt>Más barato{deal.precio_min_store_label ? `: ${deal.precio_min_store_label}` : ''}</dt>
          <dd className="cw-opp-low">{money(deal.precio_min)}</dd>
        </div>
        {diff != null && (
          <div>
            <dt>Diferencia entre tiendas</dt>
            <dd>{money(diff)}{pct != null ? ` · ${pct}%` : ''}</dd>
          </div>
        )}
      </dl>
      <div className="cw-opp-meta">
        <span className="cw-badge exact">{deal.match_label || 'Exacto por EAN'}</span>
        {deal.n_tiendas ? <span className="cw-muted">{plural(deal.n_tiendas, 'tienda')}</span> : null}
      </div>
      <p className="cw-disclaimer-text">Datos del último snapshot ({SNAPSHOT_FECHA}).</p>
      <button type="button" className="cw-small-btn" onClick={onDemo}>Agregar a una compra</button>
    </article>
  );
}

function HowItWorksSection() {
  const steps = [
    {n: 1, title: 'Busca productos', desc: 'Encuentra alimentos y bebidas disponibles en supermercados cubiertos.', icon: <Search size={22} aria-hidden="true" />},
    {n: 2, title: 'Compara tu compra', desc: 'Cartwise calcula el total estimado por supermercado.', icon: <ShoppingBasket size={22} aria-hidden="true" />},
    {n: 3, title: 'Compra mejor', desc: 'Recibe una recomendación clara según precio y cobertura.', icon: <CheckCircle2 size={22} aria-hidden="true" />},
  ];
  return (
    <section className="cw-landing-section" aria-labelledby="cw-how-title">
      <h2 id="cw-how-title">Cómo funciona en 3 pasos</h2>
      <ol className="cw-how-steps" role="list">
        {steps.map((step) => (
          <li key={step.n} className="cw-how-step">
            <span className="cw-how-icon">{step.icon}</span>
            <strong>{step.n}. {step.title}</strong>
            <p>{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PublicDataDisclaimer() {
  return (
    <div className="cw-public-disclaimer">
      <Tag size={16} aria-hidden="true" />
      <p>{TRANSPARENCY_SNAPSHOT} La disponibilidad puede cambiar en tienda.</p>
    </div>
  );
}

function LoginScreen({onLogin, onBack}: {onLogin: () => void; onBack?: () => void}) {
  const [email, setEmail] = useState(AUTH_EMAIL);
  const [password, setPassword] = useState(AUTH_PASS);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === AUTH_EMAIL && password === AUTH_PASS) {
      setError('');
      onLogin();
      return;
    }
    setError('Credenciales inválidas. Revisa tu correo y contraseña.');
  };

  return (
    <main className="cw-login">
      <div className="cw-login-card">
        <section className="cw-login-form-side">
          {onBack && (
            <button type="button" className="cw-link-btn cw-login-back" onClick={onBack}>
              <ChevronLeft size={16} aria-hidden="true" /> Volver al inicio
            </button>
          )}
          <h1>Bienvenido de vuelta</h1>
          <p>Inicia sesión para preparar tu compra y comparar precios.</p>
          <form onSubmit={submit} className="cw-login-form">
            <label htmlFor="cw-login-email">
              Correo
              <input
                id="cw-login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'cw-login-error' : undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label htmlFor="cw-login-password">
              Contraseña
              <div className="cw-password-field">
                <input
                  id="cw-login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'cw-login-error' : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="cw-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </label>
            {error && <div className="cw-form-error" id="cw-login-error" role="alert">{error}</div>}
            <button type="submit" className="cw-primary-btn">Ingresar</button>
          </form>
        </section>
        <aside className="cw-login-info">
          <span className="cw-kicker">Compara y ahorra</span>
          <h2>Encuentra dónde conviene comprar, en 3 pasos</h2>
          <ol className="cw-login-steps">
            <li className="cw-step"><span>1</span> Busca los productos que necesitas</li>
            <li className="cw-step"><span>2</span> Ajusta las cantidades de tu compra</li>
            <li className="cw-step"><span>3</span> Compara las 4 tiendas y ahorra</li>
          </ol>
        </aside>
      </div>
    </main>
  );
}

function WebShell({
  view,
  onNavigate,
  onLogout,
  basketCount,
  toast,
  children,
}: {
  view: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  basketCount: number;
  toast: string | null;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLElement>(null);

  // Gestión de foco: al cambiar de vista (o al montar tras login), llevar el foco
  // al h1 entrante para que teclado y lectores de pantalla no queden en el <body>.
  useEffect(() => {
    const heading = contentRef.current?.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      (heading as HTMLElement).focus();
    }
  }, [view]);

  const renderNavButton = (item: {id: View; label: string; icon: ReactNode}, withLabelTag: boolean) => (
    <button
      key={item.id}
      type="button"
      className={view === item.id ? 'active' : ''}
      onClick={() => onNavigate(item.id)}
      aria-current={view === item.id ? 'page' : undefined}
    >
      {item.icon}
      {withLabelTag ? <span>{item.label}</span> : item.label}
      {item.id === 'plan' && basketCount > 0 && (
        <span className="cw-nav-count" aria-label={`${basketCount} unidades en tu compra pendiente`}>
          {basketCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="cw-app">
      <a className="cw-skip" href="#cw-main">Saltar al contenido</a>
      <aside className="cw-sidebar">
        <div className="cw-brand cw-sidebar-brand">
          <div className="cw-logo">C</div>
          <div>
            <strong>Cartwise</strong>
            <span>Precios de supermercados</span>
          </div>
        </div>
        <nav className="cw-nav" aria-label="Principal">
          {navItems.map((item) => renderNavButton(item, false))}
        </nav>
      </aside>
      <div className="cw-main">
        <header className="cw-topbar">
          <div className="cw-topbar-actions">
            <button
              type="button"
              className="cw-account-btn"
              onClick={() => onNavigate('profile')}
              aria-label="Tu cuenta y preferencias"
            >
              <span className="cw-account-icon">
                <User size={20} aria-hidden="true" />
                <span className="cw-account-gear" aria-hidden="true">
                  <Settings size={12} />
                </span>
              </span>
            </button>
            <button type="button" className="cw-ghost-btn" onClick={onLogout}>
              <LogOut size={16} aria-hidden="true" />
              Salir
            </button>
          </div>
        </header>
        <main className="cw-content" id="cw-main" ref={contentRef} tabIndex={-1}>{children}</main>
      </div>
      <nav className="cw-mobile-nav" aria-label="Principal (móvil)">
        {navItems.map((item) => renderNavButton(item, true))}
      </nav>
      <div className="cw-toast-region" role="status" aria-live="polite">
        {toast && <div className="cw-toast">{toast}</div>}
      </div>
    </div>
  );
}

function Dashboard({
  health,
  healthError,
  basket,
  topDeals,
  dealsError,
  history,
  confirmed,
  savedLists,
  pantry,
  budget,
  onBudgetChange,
  onNavigate,
  onAdd,
  onCompare,
  comparing,
}: {
  health: Health | null;
  healthError: boolean;
  basket: BasketItem[];
  topDeals: SearchItem[];
  dealsError: boolean;
  history: SavedPlan[];
  confirmed: ConfirmedPurchase[];
  savedLists: SavedList[];
  pantry: PantryItem[];
  budget: number;
  onBudgetChange: (value: number) => void;
  onNavigate: (view: View) => void;
  onAdd: (item: SearchItem) => void;
  onCompare: () => void;
  comparing: boolean;
}) {
  const month = monthKey();
  const monthConfirmed = confirmed.filter((c) => monthKey(c.purchaseDate) === month);
  const gastoMes = monthConfirmed.reduce((s, c) => s + (c.realTotal || 0), 0);
  const ahorroConfirmado = monthConfirmed.reduce((s, c) => s + (c.confirmedSavings || 0), 0);
  const monthPlans = history.filter((p) => monthKey(p.createdAt) === month);
  const ahorroEstimado = monthPlans.reduce((s, p) => s + (p.savings || 0), 0);
  const presupuestoRestante = budget > 0 ? budget - gastoMes : null;
  const pendingPlan = history.find((p) => p.status === 'pending');
  const basketUnits = basket.reduce((sum, item) => sum + item.quantity, 0);
  const recentPurchases = [...confirmed]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const metricNum = (value?: number) =>
    healthError ? '—' : value?.toLocaleString('es-CL') ?? '...';

  // Alertas simples (reglas, no IA).
  const alertas: string[] = [];
  if (budget > 0) {
    const pct = Math.round((gastoMes / budget) * 100);
    alertas.push(`Gastaste ${pct}% de tu presupuesto mensual. Te quedan ${money(budget - gastoMes)} para el mes.`);
  }
  if (pendingPlan) {
    alertas.push(`Tienes un plan pendiente en ${pendingPlan.store}. Ahorro estimado: ${money(pendingPlan.savings)}.`);
  }
  if (basket.length > 0) {
    alertas.push(`Tienes una compra pendiente con ${plural(basket.length, 'producto')} sin comparar.`);
  }

  return (
    <div className="cw-stack">
      <header className="cw-welcome">
        <div>
          <h1>Tu mes en Cartwise 👋</h1>
          <p>Revisa tu gasto en comida, tus compras y dónde conviene comprar.</p>
        </div>
        <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>
          <ShoppingBasket size={18} aria-hidden="true" />
          Armar compra
        </button>
      </header>

      {/* Resumen mensual */}
      <section className="cw-metrics" aria-label="Resumen mensual">
        <MetricCard label="Gasto registrado del mes" value={money(gastoMes)} />
        <MetricCard
          label="Presupuesto restante"
          value={presupuestoRestante == null ? 'Sin presupuesto' : money(presupuestoRestante)}
        />
        <MetricCard label="Ahorro estimado" value={money(ahorroEstimado)} />
        <MetricCard label="Ahorro confirmado" value={money(ahorroConfirmado)} />
        <MetricCard label="Compras del mes" value={String(monthConfirmed.length)} />
        <MetricCard label="Último snapshot" value={SNAPSHOT_FECHA} />
      </section>

      <BudgetCard budget={budget} gastoMes={gastoMes} onBudgetChange={onBudgetChange} />

      {/* Gráficos (máx. 2) */}
      <section className="cw-grid-2" aria-label="Estadísticas del mes">
        <MonthlySpendingChart purchases={monthConfirmed} budget={budget} />
        <CategorySpendingChart purchases={monthConfirmed} />
      </section>

      {/* Compra pendiente / plan pendiente */}
      <section className="cw-grid-2">
        <div className="cw-panel">
          <PanelHeader title="Compra pendiente" subtitle="Lo que estás preparando ahora" />
          {basket.length > 0 ? (
            <>
              <div className="cw-mini-list">
                {basket.slice(0, 5).map((item) => (
                  <div key={`${item.kind}-${item.id}`}>
                    <span>{item.nombre}</span>
                    <strong>x{item.quantity}</strong>
                  </div>
                ))}
              </div>
              <p className="cw-muted">{plural(basket.length, 'producto')} · {plural(basketUnits, 'unidad', 'unidades')}</p>
              <div className="cw-panel-actions">
                <button type="button" className="cw-ghost-btn" onClick={() => onNavigate('plan')}>Continuar</button>
                <button type="button" className="cw-primary-btn" onClick={onCompare} disabled={comparing}>
                  {comparing ? 'Comparando…' : 'Comparar supermercados'}
                </button>
              </div>
            </>
          ) : (
            <>
              <EmptyState text="No tienes una compra pendiente. Crea una compra nueva o repite una lista guardada." />
              <div className="cw-panel-actions">
                <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>Crear compra</button>
              </div>
            </>
          )}
        </div>

        <div className="cw-panel">
          <PanelHeader title="Plan pendiente" subtitle="Recomendación aún no confirmada" />
          {pendingPlan ? (
            <>
              <p className="cw-plan-rec">Recomendación: <strong>{pendingPlan.store}</strong></p>
              <p className="cw-muted">Ahorro estimado: {money(pendingPlan.savings)} · {pendingPlan.date}</p>
              <div className="cw-panel-actions">
                <button type="button" className="cw-ghost-btn" onClick={() => onNavigate('history')}>Ver en historial</button>
              </div>
            </>
          ) : (
            <EmptyState text="No tienes planes pendientes. Compara una compra para generar uno." />
          )}
        </div>
      </section>

      {/* Historial reciente */}
      <div className="cw-panel">
        <div className="cw-panel-headrow">
          <PanelHeader title="Historial reciente" subtitle="Tus últimas compras y planes" />
          <button type="button" className="cw-link-btn" onClick={() => onNavigate('history')}>Ver historial</button>
        </div>
        {recentPurchases.length ? (
          <div className="cw-mini-list">
            {recentPurchases.map((c) => (
              <div key={c.id}>
                <span>{c.store} · {new Date(c.purchaseDate).toLocaleDateString('es-CL')}</span>
                <strong>{money(c.realTotal)}</strong>
              </div>
            ))}
          </div>
        ) : history.length ? (
          <div className="cw-mini-list">
            {history.slice(0, 4).map((p) => (
              <div key={p.id}>
                <span>{p.store} · {p.date} · {PLAN_STATUS_LABELS[p.status ?? 'pending']}</span>
                <strong>{money(p.total)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Aún no registras compras. Cuando confirmes una compra aparecerá aquí." />
        )}
      </div>

      {/* Diferencias destacadas + Ofertas temporales */}
      <section className="cw-grid-2">
        <div className="cw-panel">
          <PanelHeader title="Diferencias destacadas" subtitle="Mayor brecha de precio entre tiendas (no son ofertas)" />
          {dealsError ? (
            <EmptyState text="No pudimos cargar las diferencias por ahora. Inténtalo de nuevo." />
          ) : topDeals.length ? (
            <div className="cw-result-list compact" role="list">
              {topDeals.slice(0, 5).map((item) => (
                <React.Fragment key={item.id}>
                  <SearchResultCard item={item} onAdd={onAdd} compact />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <EmptyState text="Sin diferencias destacadas para mostrar todavía." />
          )}
        </div>
        <div className="cw-panel">
          <PanelHeader title="Ofertas temporales" subtitle="Promociones marcadas en los datos" />
          <EmptyState text="El snapshot actual no incluye marcas de oferta promocional. Mostramos solo diferencias de precio entre tiendas." />
          <p className="cw-disclaimer-text">Oferta detectada en el último snapshot. Disponibilidad sujeta a cambios.</p>
        </div>
      </section>

      {/* Listas guardadas + Almacén (preview) */}
      <section className="cw-grid-2">
        <div className="cw-panel">
          <PanelHeader title="Listas guardadas" subtitle="Compras frecuentes para repetir" />
          {savedLists.length ? (
            <div className="cw-mini-list">
              {savedLists.slice(0, 4).map((list) => (
                <div key={list.id}>
                  <span>{list.name}</span>
                  <strong>{plural(list.items.length, 'producto')}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Aún no tienes listas guardadas. Guarda una compra frecuente para repetirla rápido." />
          )}
        </div>
        <div className="cw-panel">
          <PanelHeader title="Almacén del hogar" subtitle="Productos que ya tienes en casa" />
          {pantry.length ? (
            <p className="cw-muted">{plural(pantry.length, 'producto')} registrado{pantry.length === 1 ? '' : 's'} en tu almacén.</p>
          ) : (
            <EmptyState text="Tu almacén está vacío. Agrega productos que ya tienes para evitar recomprarlos." />
          )}
        </div>
      </section>

      {/* Alertas inteligentes */}
      {alertas.length > 0 && (
        <div className="cw-panel">
          <PanelHeader title="Alertas" subtitle="Recordatorios según tu actividad" />
          <ul className="cw-alert-list" role="list">
            {alertas.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Estado de datos */}
      <div className="cw-panel">
        <PanelHeader title="Estado de los datos" subtitle="Transparencia del snapshot" />
        <section className="cw-metrics">
          <MetricCard label="Supermercados cubiertos" value={metricNum(health?.counts.stores)} />
          <MetricCard label="Productos comparables" value={metricNum(health?.counts.products)} />
          <MetricCard label="Coincidencias por EAN" value={metricNum(health?.counts.exactComparable)} />
          <MetricCard label="Comparables genéricos" value={metricNum(health?.counts.genericComparable)} />
        </section>
        <p className="cw-disclaimer-text">{TRANSPARENCY_SNAPSHOT}</p>
      </div>
    </div>
  );
}

function BudgetCard({budget, gastoMes, onBudgetChange}: {budget: number; gastoMes: number; onBudgetChange: (value: number) => void}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget || ''));
  const pct = budget > 0 ? Math.min(100, Math.round((gastoMes / budget) * 100)) : 0;
  const save = () => {
    const value = Math.max(0, Math.round(Number(draft) || 0));
    onBudgetChange(value);
    setEditing(false);
  };
  return (
    <div className="cw-panel cw-budget-card">
      <div className="cw-panel-headrow">
        <PanelHeader title="Presupuesto mensual de comida" subtitle={`Mes: ${currentMonthLabel()}`} />
        <button type="button" className="cw-link-btn" onClick={() => { setDraft(String(budget || '')); setEditing((v) => !v); }}>
          {editing ? 'Cancelar' : budget > 0 ? 'Editar' : 'Definir'}
        </button>
      </div>
      {editing ? (
        <div className="cw-budget-edit">
          <label htmlFor="cw-budget-input">Presupuesto en CLP</label>
          <input
            id="cw-budget-input"
            type="number"
            min={0}
            step={1000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="button" className="cw-primary-btn" onClick={save}>Guardar</button>
        </div>
      ) : budget > 0 ? (
        <>
          <p className="cw-budget-figure">{money(gastoMes)} <span>/ {money(budget)}</span></p>
          <div className="cw-budget-bar" role="img" aria-label={`Has gastado ${pct}% de tu presupuesto`}>
            <span style={{width: `${pct}%`}} className={pct >= 100 ? 'over' : ''} />
          </div>
          <p className="cw-muted">Te quedan {money(Math.max(0, budget - gastoMes))} para este mes.</p>
        </>
      ) : (
        <EmptyState text="Define un presupuesto mensual para seguir cuánto llevas gastado en comida." />
      )}
    </div>
  );
}

function MonthlySpendingChart({purchases, budget}: {purchases: ConfirmedPurchase[]; budget: number}) {
  // Agrupar por semana del mes (1-5) según día de compra.
  const weeks = [0, 0, 0, 0, 0];
  purchases.forEach((p) => {
    const day = new Date(p.purchaseDate).getDate();
    const idx = Math.min(4, Math.floor((day - 1) / 7));
    weeks[idx] += p.realTotal || 0;
  });
  const max = Math.max(...weeks, budget > 0 ? budget / 4 : 0, 1);
  const hasData = purchases.length > 0;
  return (
    <div className="cw-panel">
      <PanelHeader title="Gasto del mes por semana" subtitle="Compras confirmadas" />
      {hasData ? (
        <div className="cw-bar-chart" role="img" aria-label="Gasto por semana del mes">
          {weeks.map((value, i) => (
            <div key={i} className="cw-bar-col">
              <div className="cw-bar-track">
                <span className="cw-bar-fill" style={{height: `${Math.round((value / max) * 100)}%`}} />
              </div>
              <span className="cw-bar-label">S{i + 1}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="Sin compras confirmadas este mes. El gráfico se llena al confirmar compras." />
      )}
    </div>
  );
}

function CategorySpendingChart({purchases}: {purchases: ConfirmedPurchase[]}) {
  const totals = new Map<string, number>();
  purchases.forEach((p) => {
    p.items.forEach((it) => {
      const cat = it.category || 'Otros';
      const amount = (it.paidPrice || 0) * (it.quantity || 1);
      totals.set(cat, (totals.get(cat) || 0) + amount);
    });
  });
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...rows.map(([, v]) => v), 1);
  return (
    <div className="cw-panel">
      <PanelHeader title="Gasto por categoría" subtitle="Distribución del mes" />
      {rows.length ? (
        <ul className="cw-hbar-chart" role="list">
          {rows.map(([cat, value]) => (
            <li key={cat}>
              <span className="cw-hbar-label">{cat}</span>
              <span className="cw-hbar-track"><span style={{width: `${Math.round((value / max) * 100)}%`}} /></span>
              <span className="cw-hbar-value">{money(value)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState text="Sin datos de categorías todavía. Aparece al confirmar compras con precios." />
      )}
    </div>
  );
}

function PlanBuilder({
  basket,
  onAdd,
  onQuantity,
  onRemove,
  onSwitchToGeneric,
  onClear,
  onCompare,
  onSaveList,
  comparing,
}: {
  basket: BasketItem[];
  onAdd: (item: SearchItem) => void;
  onQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (item: BasketItem) => void;
  onSwitchToGeneric: (item: BasketItem) => void;
  onClear: () => void;
  onCompare: () => void;
  onSaveList: () => void;
  comparing: boolean;
}) {
  return (
    <div className="cw-stack">
      <Hero
        title="Prepara una compra para comparar"
        subtitle="Agrega los productos que quieres comparar y ajusta sus cantidades."
      />
      <section className="cw-grid-2 wide-left">
        <ProductSearch onAdd={onAdd} />
        <BasketPanel
          basket={basket}
          onQuantity={onQuantity}
          onRemove={onRemove}
          onSwitchToGeneric={onSwitchToGeneric}
          onClear={onClear}
          onCompare={onCompare}
          onSaveList={onSaveList}
          comparing={comparing}
        />
      </section>
    </div>
  );
}

function PriceExplorer({onAdd}: {onAdd: (item: SearchItem) => void}) {
  return (
    <div className="cw-stack">
      <Hero
        title="Explora precios reales"
        subtitle="Busca por nombre o marca. Verás el mismo producto y también opciones comparables por unidad."
      />
      <ProductSearch onAdd={onAdd} variant="explore" />
    </div>
  );
}

function ProductSearch({
  onAdd,
  variant = 'basket',
}: {
  onAdd: (item: SearchItem) => void;
  variant?: 'basket' | 'explore';
}) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [exact, setExact] = useState<SearchItem[]>([]);
  const [generic, setGeneric] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [minTwoStores, setMinTwoStores] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const runSearch = async (term: string) => {
    const q = term.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setSubmitted(q);
    try {
      const exactLimit = variant === 'explore' ? 18 : 12;
      const genericLimit = variant === 'explore' ? 10 : 6;
      const [ex, ge] = await Promise.all([
        api<{items: SearchItem[]}>(`/api/products/search?q=${encodeURIComponent(q)}&limit=${exactLimit}`),
        api<{items: SearchItem[]}>(`/api/generic/search?q=${encodeURIComponent(q)}&limit=${genericLimit}`),
      ]);
      setExact(ex.items);
      setGeneric(ge.items);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de busqueda');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runSearch(query);
  };

  const pickSuggestion = (term: string) => {
    setQuery(term);
    runSearch(term);
  };

  const allResults = [...exact, ...generic];
  const categories = Array.from(
    new Set(allResults.map((item) => item.categoria).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'es'));
  const stores = Array.from(
    new Set(allResults.map((item) => item.precio_min_store_label).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'es'));
  const passesFilters = (item: SearchItem) => {
    if (matchFilter !== 'all' && item.kind !== matchFilter) return false;
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false;
    if (storeFilter !== 'all' && item.precio_min_store_label !== storeFilter) return false;
    if (minTwoStores && (item.n_tiendas ?? 0) < 2) return false;
    if (availableOnly && !isAvailableFlag(item.precio_min_disponible)) return false;
    return true;
  };
  const filteredExact = exact.filter(passesFilters);
  const filteredGeneric = generic.filter(passesFilters);
  const rawTotal = exact.length + generic.length;
  const total = filteredExact.length + filteredGeneric.length;

  return (
    <section className="cw-panel">
      <PanelHeader title="Buscar producto" subtitle="Busca por nombre o marca y agrégalo a tu compra." />
      <form className="cw-searchbar" onSubmit={onSubmit} role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busca por nombre, marca o código de barras"
          aria-label="Buscar producto por nombre o marca"
        />
        <button className="cw-primary-btn" disabled={loading || !query.trim()}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      <div className="cw-suggestions">
        <span>Sugerencias:</span>
        {SUGERENCIAS.map((s) => (
          <button key={s} type="button" className="cw-chip-btn" onClick={() => pickSuggestion(s)}>
            {s}
          </button>
        ))}
      </div>
      {variant === 'explore' && searched && (
        <div className="cw-filters" aria-label="Filtros de búsqueda">
          <div className="cw-segmented" role="group" aria-label="Tipo de resultado">
            {[
              ['all', 'Todos'],
              ['product', 'Exactos'],
              ['generic', 'Comparables'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={matchFilter === id ? 'active' : ''}
                aria-pressed={matchFilter === id}
                onClick={() => setMatchFilter(id as MatchFilter)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="cw-check">
            <input
              type="checkbox"
              checked={minTwoStores}
              onChange={(event) => setMinTwoStores(event.target.checked)}
            />
            2+ tiendas
          </label>
          <label className="cw-check">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            Disponible
          </label>
          <label className="cw-select-field">
            Categoría
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Todas</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="cw-select-field">
            Tienda precio mínimo
            <select value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}>
              <option value="all">Todas</option>
              {stores.map((store) => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {error && <div className="cw-form-error" role="alert">{error}</div>}
      <p className="cw-sr-only" aria-live="polite">
        {loading
          ? 'Buscando...'
          : searched
            ? total
              ? `${total} resultados para «${submitted}»`
              : rawTotal
                ? `Sin resultados para «${submitted}» con los filtros activos`
                : `Sin resultados para «${submitted}»`
            : ''}
      </p>
      <div className={`cw-search-results${loading ? ' loading' : ''}`} aria-busy={loading}>
        {!searched && !loading && (
          <EmptyState text="Busca un producto o elige una sugerencia para ver precios reales." />
        )}
        {searched && rawTotal === 0 && !loading && (
          <EmptyState text={`Sin resultados para «${submitted}». Prueba con otro término.`} />
        )}
        {searched && rawTotal > 0 && total === 0 && !loading && (
          <EmptyState text="No hay resultados con los filtros activos." />
        )}
        {filteredExact.length > 0 && (
          <div className="cw-result-group">
            <h3 className="cw-result-group-title">Mismo producto</h3>
            <div className="cw-result-list" role="list">
              {filteredExact.map((item) => (
                <React.Fragment key={`product-${item.id}`}>
                  <SearchResultCard item={item} onAdd={onAdd} />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        {filteredGeneric.length > 0 && (
          <div className="cw-result-group">
            <h3 className="cw-result-group-title">Comparables por unidad</h3>
            <div className="cw-result-list" role="list">
              {filteredGeneric.map((item) => (
                <React.Fragment key={`generic-${item.id}`}>
                  <SearchResultCard item={item} onAdd={onAdd} />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductImage({ean, alt, size = 44}: {ean?: string | null; alt: string; size?: number}) {
  const [failed, setFailed] = useState(false);
  const style = {width: size, height: size};
  if (!ean || failed) {
    return (
      <span className="cw-prod-img placeholder" style={style} aria-hidden="true">
        <Package size={Math.round(size * 0.5)} aria-hidden="true" />
      </span>
    );
  }
  return (
    <img
      className="cw-prod-img"
      style={style}
      src={`/images/products/${ean}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function SearchResultCard({item, onAdd, compact}: {item: SearchItem; onAdd: (item: SearchItem) => void; compact?: boolean}) {
  const [expanded, setExpanded] = useState(false);
  const isExact = item.kind === 'product';
  const badgeTitle = isExact
    ? 'Mismo producto: idéntico código de barras.'
    : 'Sustituto equivalente por contenido; revísalo antes de comprar.';
  const tiendas = item.n_tiendas ?? 0;
  const unitLabel = item.unidad_base ? `por ${item.unidad_base === 'un' ? 'unidad' : `kg/l ref.`}` : '';
  const longName = item.nombre.length > 78;
  return (
    <article className="cw-result-card" role="listitem">
      <ProductImage ean={item.ean} alt={item.nombre} size={compact ? 40 : 52} />
      <div>
        <div className="cw-badges">
          <span className={isExact ? 'cw-badge exact' : 'cw-badge generic'} title={badgeTitle}>
            {item.match_label}
          </span>
          {tiendas > 0 && <span className="cw-badge">{plural(tiendas, 'tienda')}</span>}
          {isAvailableFlag(item.precio_min_disponible) && <span className="cw-badge available">Disponible</span>}
        </div>
        <h3 className={expanded ? 'cw-result-name' : 'cw-result-name truncated'} title={item.nombre}>{item.nombre}</h3>
        {longName && !compact && (
          <button type="button" className="cw-link-btn cw-expand-name" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Ver menos' : 'Ver nombre completo'}
          </button>
        )}
        {!compact && (
          <p>
            {[item.marca, item.categoria, item.ean].filter(Boolean).join(' · ') || 'Producto comparable'}
          </p>
        )}
      </div>
      <div className="cw-result-side">
        <strong>{money(item.precio_min)}</strong>
        {item.precio_min_store_label && (
          <span className="cw-price-store">Menor en {item.precio_min_store_label}</span>
        )}
        {item.kind === 'generic' && item.precio_unitario_min != null && (
          <span>{money(item.precio_unitario_min)} {unitLabel}</span>
        )}
        {!!item.diferencia && <span>Ahorro ref. {money(item.diferencia)}</span>}
        <button
          type="button"
          className="cw-small-btn"
          onClick={() => onAdd(item)}
          aria-label={`Agregar ${item.nombre} a tu compra`}
        >
          Agregar
        </button>
      </div>
    </article>
  );
}

function BasketPanel({
  basket,
  onQuantity,
  onRemove,
  onSwitchToGeneric,
  onClear,
  onCompare,
  onSaveList,
  comparing,
}: {
  basket: BasketItem[];
  onQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (item: BasketItem) => void;
  onSwitchToGeneric: (item: BasketItem) => void;
  onClear: () => void;
  onCompare: () => void;
  onSaveList: () => void;
  comparing: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLButtonElement>(null);
  const units = basket.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = basket.reduce((sum, item) => sum + (item.precio_min ?? 0) * item.quantity, 0);
  const hasEstimate = basket.some((item) => item.precio_min != null);

  const handleRemove = (item: BasketItem) => {
    const willHaveItems = basket.length > 1;
    onRemove(item);
    // Gestión de foco: al desmontarse la fila, el foco caería a <body>.
    // Lo movemos a "Comparar" si quedan ítems, o al panel si quedó vacío.
    requestAnimationFrame(() => {
      if (willHaveItems) compareRef.current?.focus();
      else sectionRef.current?.focus();
    });
  };

  return (
    <section className="cw-panel sticky" ref={sectionRef} tabIndex={-1} aria-label="Compra pendiente">
      <div className="cw-panel-headrow">
        <PanelHeader title="Compra pendiente" subtitle={`${plural(basket.length, 'producto')} · ${plural(units, 'unidad', 'unidades')}`} />
        {basket.length > 0 && (
          <button type="button" className="cw-ghost-btn cw-ghost-sm" onClick={onClear}>Vaciar</button>
        )}
      </div>
      {basket.length ? (
        <>
          <div className="cw-basket-list" role="list">
            {basket.map((item) => (
              <div className="cw-basket-row" role="listitem" key={`${item.kind}-${item.id}`}>
                <ProductImage ean={item.ean} alt={item.nombre} size={40} />
                <div>
                  <strong>{item.nombre}</strong>
                  <span>{item.match_label}</span>
                  {item.kind === 'product' && item.generico_id && (
                    <button
                      type="button"
                      className="cw-link-btn cw-row-action"
                      onClick={() => onSwitchToGeneric(item)}
                    >
                      Cambiar por comparable
                    </button>
                  )}
                </div>
                <div className="cw-basket-actions">
                  <div className="cw-qty" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                    <button
                      type="button"
                      onClick={() => onQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                    >-</button>
                    <span
                      role="spinbutton"
                      tabIndex={0}
                      aria-label={`Cantidad de ${item.nombre}`}
                      aria-valuemin={1}
                      aria-valuenow={item.quantity}
                      aria-live="polite"
                      aria-atomic="true"
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowUp') {
                          event.preventDefault();
                          onQuantity(item, item.quantity + 1);
                        }
                        if (event.key === 'ArrowDown' && item.quantity > 1) {
                          event.preventDefault();
                          onQuantity(item, item.quantity - 1);
                        }
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantity(item, item.quantity + 1)}
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                    >+</button>
                  </div>
                  <button
                    type="button"
                    className="cw-remove-btn"
                    onClick={() => handleRemove(item)}
                    aria-label={`Quitar ${item.nombre} de tu compra`}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hasEstimate && (
            <div className="cw-basket-subtotal">
              <span>Estimado (precio mínimo)</span>
              <strong>{money(subtotal)}</strong>
            </div>
          )}
          <p className="cw-basket-note">
            Estimación con el precio más bajo de cada producto. Se recalcula por tienda al comparar.
          </p>
          <button ref={compareRef} type="button" className="cw-primary-btn" onClick={onCompare} disabled={comparing}>
            {comparing ? 'Comparando...' : 'Comparar supermercados'}
          </button>
          <button type="button" className="cw-ghost-btn cw-full-btn" onClick={onSaveList}>
            <ListChecks size={16} aria-hidden="true" /> Guardar como lista
          </button>
        </>
      ) : (
        <EmptyState text="Tu compra pendiente está vacía." />
      )}
    </section>
  );
}

function ComparisonView({
  comparison,
  onBack,
  onSave,
}: {
  comparison: BasketComparison | null;
  onBack: () => void;
  onSave: () => void;
}) {
  if (!comparison) {
    return (
      <div className="cw-panel">
        <EmptyState text="Todavia no hay una comparacion activa." />
        <button type="button" className="cw-primary-btn" onClick={onBack}>Volver a la compra</button>
      </div>
    );
  }

  const totalItems = comparison.items.length;
  const recommended = comparison.recommendedStore;
  const sortedStores = [...comparison.stores].sort((a, b) =>
    a.missingItems - b.missingItems || a.total - b.total,
  );

  return (
    <div className="cw-stack">
      <Hero
        title="Comparación por supermercado"
        subtitle="El recomendado prioriza completar más productos y luego menor total."
        action={
          <div className="cw-hero-actions">
            <button type="button" className="cw-ghost-btn" onClick={onBack}>Volver y editar compra</button>
            <button type="button" className="cw-primary-btn" onClick={onSave}>Guardar plan</button>
          </div>
        }
      />
      <p className="cw-sr-only" aria-live="polite">
        {recommended
          ? `Comparación lista. Tienda recomendada ${recommended.store.label}, total ${money(recommended.total)}.`
          : 'Comparación lista. Ninguna tienda tiene precios para esta compra.'}
      </p>
      {recommended && (
        <section className="cw-recommendation">
          <CheckCircle2 size={28} aria-hidden="true" />
          <div>
            <span>Mejor opción</span>
            <strong>{recommended.store.label}</strong>
            <p>
              {plural(recommended.pricedItems, 'producto')} de {plural(totalItems, 'producto')} con precio
              {recommended.missingItems > 0 ? ` · ${plural(recommended.missingItems, 'producto')} sin precio` : ''}
            </p>
            <p>
              {comparison.estimatedSavings > 0
                ? `Ahorro estimado frente a la tienda más cara con la misma cobertura: ${money(comparison.estimatedSavings)}`
                : 'Sin otra tienda con la misma cobertura para estimar ahorro.'}
            </p>
          </div>
          <div>{money(recommended.total)}</div>
        </section>
      )}
      <p className="cw-compare-note">
        Solo comparamos productos con precio disponible en cada tienda. Precios actualizados al {SNAPSHOT_FECHA};
        pueden cambiar en tienda.
      </p>
      <section className="cw-store-grid">
        {sortedStores.map((store) => {
          const included = store.lines.filter((line) => line.price !== null);
          const missing = store.lines.filter((line) => line.price === null);
          const availableIncluded = included.filter((line) => line.available).length;
          const outOfStock = included.length - availableIncluded;
          const seg = (n: number) => `${totalItems ? (n / totalItems) * 100 : 0}%`;
          const isRecommended = recommended?.store.id === store.store.id;
          return (
            <article className={`cw-store-card${isRecommended ? ' recommended' : ''}`} key={store.store.id}>
              <div className="cw-store-head">
                <div>
                  <span>{store.store.sitio_web}</span>
                  <h2>{store.store.label}</h2>
                </div>
                {isRecommended ? <span className="cw-store-tag">Recomendada</span> : <Store size={22} aria-hidden="true" />}
              </div>
              <div className="cw-store-total">{store.pricedItems === 0 ? '—' : money(store.total)}</div>
              <div className="cw-coverage">
                {plural(store.pricedItems, 'producto')} de {plural(totalItems, 'producto')} con precio
                {outOfStock > 0 ? ` · ${plural(outOfStock, 'agotado')}` : ''}
              </div>
              <div
                className="cw-coverage-bar stacked"
                role="img"
                aria-label={`Cobertura: ${availableIncluded} con precio disponible, ${outOfStock} agotados, ${missing.length} sin precio, de ${totalItems}`}
              >
                {availableIncluded > 0 && <span className="seg in" style={{width: seg(availableIncluded)}} />}
                {outOfStock > 0 && <span className="seg out" style={{width: seg(outOfStock)}} />}
                {missing.length > 0 && <span className="seg miss" style={{width: seg(missing.length)}} />}
              </div>
              <p className="cw-store-why">
                {isRecommended
                  ? 'Recomendada por mayor cobertura y menor total entre tiendas comparables.'
                  : missing.length
                    ? `${plural(missing.length, 'producto')} sin precio reduce la confianza del total.`
                    : 'Compra completa en esta tienda.'}
              </p>
              {included.length > 0 && (
                <div className="cw-lines">
                  <span className="cw-lines-title">Incluidos en el total</span>
                  {included.map((line) => (
                    <div className="cw-line" key={`${store.store.id}-${line.kind}-${line.itemId}`}>
                      <ProductImage ean={line.ean} alt={line.name} size={30} />
                      <span className="cw-line-name">
                        {line.name}{line.quantity > 1 && <em> ×{line.quantity}</em>}
                        {line.kind === 'generic' && line.matchedProductName && (
                          <small>Se comparó: {line.matchedProductName}</small>
                        )}
                        {line.kind === 'generic' && line.unitPrice != null && (
                          <small>{money(line.unitPrice)} por {line.unitBase === 'un' ? 'unidad' : line.unitBase || 'unidad base'}</small>
                        )}
                        {!line.available && <small className="cw-flag-out">Agotado</small>}
                        {line.url && (
                          <a className="cw-line-link" href={line.url} target="_blank" rel="noreferrer">
                            Ver en tienda
                          </a>
                        )}
                      </span>
                      <strong>{money(line.lineTotal)}</strong>
                    </div>
                  ))}
                </div>
              )}
              {missing.length > 0 && (
                <div className="cw-lines muted">
                  <span className="cw-lines-title">Sin precio en esta tienda</span>
                  {missing.map((line) => (
                    <div className="cw-line" key={`${store.store.id}-${line.kind}-${line.itemId}`}>
                      <ProductImage ean={line.ean} alt={line.name} size={30} />
                      <span className="cw-line-name">
                        {line.name}{line.quantity > 1 && <em> ×{line.quantity}</em>}
                      </span>
                      <strong className="cw-line-missing">Sin precio</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function HistoryView({
  history,
  highlightedPlanId,
  onRepeat,
  onCompare,
  onDelete,
  onClear,
  onStatusChange,
  onConfirm,
  onSaveAsList,
}: {
  history: SavedPlan[];
  highlightedPlanId: string | null;
  onRepeat: (plan: SavedPlan) => void;
  onCompare: (plan: SavedPlan) => void;
  onDelete: (planId: string) => void;
  onClear: () => void;
  onStatusChange: (planId: string, status: PlanStatus) => void;
  onConfirm: (plan: SavedPlan) => void;
  onSaveAsList: (plan: SavedPlan) => void;
}) {
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (highlightedPlanId) setOpenPlanId(highlightedPlanId);
  }, [highlightedPlanId]);

  return (
    <div className="cw-stack">
      <Hero title="Tu historial" subtitle="Los planes que has guardado para volver a revisarlos." />
      <p className="cw-compare-note">
        Los totales corresponden a los precios actualizados al {SNAPSHOT_FECHA}; pueden haber cambiado en tienda.
      </p>
      <section className="cw-panel">
        <div className="cw-panel-headrow">
          <PanelHeader title="Planes guardados" subtitle={plural(history.length, 'plan', 'planes')} />
          {history.length > 0 && (
            <button type="button" className="cw-ghost-btn cw-ghost-sm" onClick={onClear}>
              <Trash2 size={14} aria-hidden="true" />
              Vaciar
            </button>
          )}
        </div>
        {history.length ? (
          <>
          <div className="cw-table-wrap">
            <table className="cw-history-table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Tienda</th>
                  <th scope="col">Productos</th>
                  <th scope="col">Total</th>
                  <th scope="col">Ahorro</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.map((plan) => {
                  const status = plan.status || 'pending';
                  const isOpen = openPlanId === plan.id;
                  const hasLines = !!plan.lines?.length;
                  return (
                    <React.Fragment key={plan.id}>
                      <tr className={highlightedPlanId === plan.id ? 'highlighted' : ''}>
                        <td>{plan.date}</td>
                        <td>
                          <select
                            className={`cw-status-select ${status}`}
                            value={status}
                            onChange={(event) => onStatusChange(plan.id, event.target.value as PlanStatus)}
                            aria-label={`Estado del plan del ${plan.date}`}
                          >
                            {Object.entries(PLAN_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td>{plan.store}</td>
                        <td>{plan.items}</td>
                        <td>{money(plan.total)}</td>
                        <td>{money(plan.savings)}</td>
                        <td>
                          <div className="cw-history-actions">
                            <button
                              type="button"
                              className="cw-icon-btn"
                              onClick={() => setOpenPlanId(isOpen ? null : plan.id)}
                              aria-expanded={isOpen}
                              aria-label={`Ver detalle del plan de ${plan.store}`}
                              title="Ver detalle"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="cw-icon-btn"
                              onClick={() => onRepeat(plan)}
                              disabled={!hasLines}
                              aria-label={`Repetir compra de ${plan.store}`}
                              title="Repetir compra"
                            >
                              <RotateCcw size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="cw-icon-btn"
                              onClick={() => onCompare(plan)}
                              disabled={!hasLines}
                              aria-label={`Comparar de nuevo el plan de ${plan.store}`}
                              title="Comparar de nuevo"
                            >
                              <RefreshCcw size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="cw-icon-btn"
                              onClick={() => onConfirm(plan)}
                              disabled={status === 'purchased'}
                              aria-label={`Confirmar compra del plan de ${plan.store}`}
                              title={status === 'purchased' ? 'Compra ya confirmada' : 'Confirmar compra'}
                            >
                              <CheckCircle2 size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="cw-icon-btn"
                              onClick={() => onSaveAsList(plan)}
                              disabled={!hasLines}
                              aria-label={`Guardar como lista el plan de ${plan.store}`}
                              title="Guardar como lista"
                            >
                              <ListChecks size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="cw-icon-btn danger"
                              onClick={() => onDelete(plan.id)}
                              aria-label={`Eliminar plan de ${plan.store}`}
                              title="Eliminar"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="cw-history-detail-row">
                          <td colSpan={7}>
                            {hasLines ? (
                              <div className="cw-history-detail">
                                <div>
                                  <span>Actualizado</span>
                                  <strong>{plan.snapshotDate || SNAPSHOT_FECHA}</strong>
                                </div>
                                <div className="cw-history-lines" role="list">
                                  {plan.lines?.map((line) => (
                                    <div role="listitem" key={`${plan.id}-${line.kind}-${line.id}`}>
                                      <span>
                                        {line.nombre}
                                        {line.quantity > 1 && <em> ×{line.quantity}</em>}
                                      </span>
                                      <strong>{line.match_label}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <EmptyState text="Este plan fue guardado antes de almacenar líneas accionables." />
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="cw-history-cards" role="list">
            {history.map((plan) => {
              const status = plan.status || 'pending';
              const isOpen = openPlanId === plan.id;
              const hasLines = !!plan.lines?.length;
              return (
                <article
                  className={highlightedPlanId === plan.id ? 'cw-history-card highlighted' : 'cw-history-card'}
                  key={`card-${plan.id}`}
                  role="listitem"
                >
                  <div className="cw-history-card-head">
                    <div>
                      <span>{plan.date}</span>
                      <strong>{plan.store}</strong>
                    </div>
                    <select
                      className={`cw-status-select ${status}`}
                      value={status}
                      onChange={(event) => onStatusChange(plan.id, event.target.value as PlanStatus)}
                      aria-label={`Estado del plan del ${plan.date}`}
                    >
                      {Object.entries(PLAN_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <dl className="cw-history-facts">
                    <div><dt>Productos</dt><dd>{plan.items}</dd></div>
                    <div><dt>Total</dt><dd>{money(plan.total)}</dd></div>
                    <div><dt>Ahorro</dt><dd>{money(plan.savings)}</dd></div>
                    <div><dt>Actualizado</dt><dd>{plan.snapshotDate || SNAPSHOT_FECHA}</dd></div>
                  </dl>
                  <div className="cw-history-actions">
                    <button
                      type="button"
                      className="cw-icon-btn"
                      onClick={() => setOpenPlanId(isOpen ? null : plan.id)}
                      aria-expanded={isOpen}
                      aria-label={`Ver detalle del plan de ${plan.store}`}
                      title="Ver detalle"
                    >
                      <Eye size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="cw-icon-btn"
                      onClick={() => onRepeat(plan)}
                      disabled={!hasLines}
                      aria-label={`Repetir compra de ${plan.store}`}
                      title="Repetir compra"
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="cw-icon-btn"
                      onClick={() => onCompare(plan)}
                      disabled={!hasLines}
                      aria-label={`Comparar de nuevo el plan de ${plan.store}`}
                      title="Comparar de nuevo"
                    >
                      <RefreshCcw size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="cw-icon-btn"
                      onClick={() => onConfirm(plan)}
                      disabled={status === 'purchased'}
                      aria-label={`Confirmar compra del plan de ${plan.store}`}
                      title={status === 'purchased' ? 'Compra ya confirmada' : 'Confirmar compra'}
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="cw-icon-btn"
                      onClick={() => onSaveAsList(plan)}
                      disabled={!hasLines}
                      aria-label={`Guardar como lista el plan de ${plan.store}`}
                      title="Guardar como lista"
                    >
                      <ListChecks size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="cw-icon-btn danger"
                      onClick={() => onDelete(plan.id)}
                      aria-label={`Eliminar plan de ${plan.store}`}
                      title="Eliminar"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="cw-history-detail">
                      {hasLines ? (
                        <div className="cw-history-lines" role="list">
                          {plan.lines?.map((line) => (
                            <div role="listitem" key={`card-${plan.id}-${line.kind}-${line.id}`}>
                              <span>
                                {line.nombre}
                                {line.quantity > 1 && <em> ×{line.quantity}</em>}
                              </span>
                              <strong>{line.match_label}</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="Este plan fue guardado antes de almacenar líneas accionables." />
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          </>
        ) : (
          <EmptyState text="Guarda un plan desde la comparacion para verlo aqui." />
        )}
      </section>
    </div>
  );
}

// ============================================================
// Listas guardadas (§4.6)
// ============================================================
function ListsView({
  lists,
  onRepeat,
  onCompare,
  onRename,
  onDelete,
  onNavigate,
}: {
  lists: SavedList[];
  onRepeat: (list: SavedList) => void;
  onCompare: (list: SavedList) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="cw-stack">
      <Hero
        title="Listas guardadas"
        subtitle="Compras frecuentes que puedes repetir y volver a comparar."
        action={
          <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>
            <Plus size={18} aria-hidden="true" /> Nueva compra
          </button>
        }
      />
      <p className="cw-compare-note">
        Al repetir una lista se compara de nuevo con los precios del último snapshot ({SNAPSHOT_FECHA});
        una lista no guarda una recomendación fija.
      </p>
      {lists.length ? (
        <div className="cw-cards-grid">
          {lists.map((list) => (
            <React.Fragment key={list.id}>
              <SavedListCard
                list={list}
                onRepeat={onRepeat}
                onCompare={onCompare}
                onRename={onRename}
                onDelete={onDelete}
              />
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="cw-panel">
          <EmptyState text="Aún no tienes listas guardadas. Arma una compra y usa “Guardar como lista”." />
          <div className="cw-panel-actions">
            <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>Crear compra</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedListCard({
  list,
  onRepeat,
  onCompare,
  onRename,
  onDelete,
}: {
  list: SavedList;
  onRepeat: (list: SavedList) => void;
  onCompare: (list: SavedList) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const units = list.items.reduce((sum, item) => sum + item.quantity, 0);
  const saveName = () => {
    onRename(list.id, name);
    setEditing(false);
  };
  return (
    <article className="cw-panel cw-list-card">
      <div className="cw-panel-headrow">
        {editing ? (
          <input
            className="cw-inline-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nombre de la lista"
            autoFocus
          />
        ) : (
          <h3 className="cw-list-name">{list.name}</h3>
        )}
        {editing ? (
          <button type="button" className="cw-link-btn" onClick={saveName}>Guardar</button>
        ) : (
          <button type="button" className="cw-link-btn" onClick={() => { setName(list.name); setEditing(true); }}>Editar</button>
        )}
      </div>
      <p className="cw-muted">
        {plural(list.items.length, 'producto')} · {plural(units, 'unidad', 'unidades')}
        {list.lastUsedAt ? ` · usada ${new Date(list.lastUsedAt).toLocaleDateString('es-CL')}` : ''}
      </p>
      <div className="cw-mini-list">
        {list.items.slice(0, 4).map((item) => (
          <div key={`${item.kind}-${item.id}`}>
            <span>{item.nombre}</span>
            <strong>x{item.quantity}</strong>
          </div>
        ))}
        {list.items.length > 4 && <p className="cw-muted">+{list.items.length - 4} más</p>}
      </div>
      <div className="cw-panel-actions">
        <button type="button" className="cw-primary-btn" onClick={() => onCompare(list)}>Comparar ahora</button>
        <button type="button" className="cw-ghost-btn" onClick={() => onRepeat(list)}>
          <RotateCcw size={16} aria-hidden="true" /> Repetir
        </button>
        <button type="button" className="cw-icon-btn danger" onClick={() => onDelete(list.id)} aria-label={`Eliminar lista ${list.name}`} title="Eliminar">
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// ============================================================
// Almacén del hogar (§4.7)
// ============================================================
function PantryView({
  pantry,
  onAdd,
  onQuantity,
  onConsume,
  onNavigate,
}: {
  pantry: PantryItem[];
  onAdd: (data: {productName: string; category?: string | null; quantity: number; unit?: string | null; notes?: string}) => void;
  onQuantity: (id: string, quantity: number) => void;
  onConsume: (id: string) => void;
  onNavigate: (view: View) => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="cw-stack">
      <Hero
        title="Almacén del hogar"
        subtitle="Productos que tienes en casa. Evita comprar de nuevo algo que ya tienes."
        action={
          <button type="button" className="cw-primary-btn" onClick={() => setAdding(true)}>
            <Plus size={18} aria-hidden="true" /> Agregar producto
          </button>
        }
      />
      {pantry.length ? (
        <div className="cw-panel">
          <PanelHeader title="Productos disponibles" subtitle={plural(pantry.length, 'producto')} />
          <ul className="cw-pantry-list" role="list">
            {pantry.map((item) => (
              <li key={item.id} className="cw-pantry-row">
                <div className="cw-pantry-info">
                  <strong>{item.productName}</strong>
                  <span className="cw-muted">
                    {item.category || 'Sin categoría'}
                    {item.source === 'confirmed_purchase' ? ' · de una compra' : ' · agregado a mano'}
                  </span>
                </div>
                <div className="cw-qty" role="group" aria-label={`Cantidad de ${item.productName}`}>
                  <button type="button" onClick={() => onQuantity(item.id, item.quantity - 1)} aria-label="Restar uno">−</button>
                  <span>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                  <button type="button" onClick={() => onQuantity(item.id, item.quantity + 1)} aria-label="Sumar uno">+</button>
                </div>
                <button type="button" className="cw-ghost-btn cw-ghost-sm" onClick={() => onConsume(item.id)}>
                  <Check size={14} aria-hidden="true" /> Consumido
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="cw-panel">
          <EmptyState text="Tu almacén está vacío. Agrega productos que ya tienes o envíalos al confirmar una compra." />
          <div className="cw-panel-actions">
            <button type="button" className="cw-primary-btn" onClick={() => setAdding(true)}>Agregar producto</button>
            <button type="button" className="cw-ghost-btn" onClick={() => onNavigate('history')}>Confirmar una compra</button>
          </div>
        </div>
      )}
      {adding && <AddPantryItemModal onClose={() => setAdding(false)} onAdd={onAdd} />}
    </div>
  );
}

// ============================================================
// Modal reutilizable + modales de la fase 3
// ============================================================
function Modal({title, onClose, children}: {title: string; onClose: () => void; children: ReactNode}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="cw-modal-overlay" onClick={onClose}>
      <div className="cw-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="cw-modal-head">
          <h2>{title}</h2>
          <button type="button" className="cw-icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SaveListModal({count, onClose, onSave}: {count: number; onClose: () => void; onSave: (name: string) => void}) {
  const [name, setName] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };
  return (
    <Modal title="Guardar como lista" onClose={onClose}>
      <form onSubmit={submit} className="cw-modal-form">
        <p className="cw-muted">Guarda los {plural(count, 'producto')} de tu compra pendiente como una lista reutilizable.</p>
        <label htmlFor="cw-list-name">Nombre de la lista</label>
        <input
          id="cw-list-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Compra mensual, Desayuno semanal…"
          autoFocus
        />
        <div className="cw-modal-actions">
          <button type="button" className="cw-ghost-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cw-primary-btn">Guardar lista</button>
        </div>
      </form>
    </Modal>
  );
}

function AddPantryItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: {productName: string; category?: string | null; quantity: number; unit?: string | null; notes?: string}) => void;
}) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    onAdd({
      productName,
      category: category.trim() || null,
      quantity: Math.max(1, Math.round(Number(quantity) || 1)),
    });
    onClose();
  };
  return (
    <Modal title="Agregar al almacén" onClose={onClose}>
      <form onSubmit={submit} className="cw-modal-form">
        <label htmlFor="cw-pantry-name">Producto</label>
        <input id="cw-pantry-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Arroz 1 kg" autoFocus required />
        <label htmlFor="cw-pantry-cat">Categoría (opcional)</label>
        <input id="cw-pantry-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Abarrotes" />
        <label htmlFor="cw-pantry-qty">Cantidad</label>
        <input id="cw-pantry-qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <div className="cw-modal-actions">
          <button type="button" className="cw-ghost-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cw-primary-btn">Agregar</button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmPurchaseModal({
  plan,
  onClose,
  onConfirm,
}: {
  plan: SavedPlan;
  onClose: () => void;
  onConfirm: (plan: SavedPlan, data: {realTotal: number; purchaseDate: string; items: ConfirmedPurchaseItem[]; addToPantry: boolean}) => void;
}) {
  const baseItems = plan.lines ?? [];
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(baseItems.map((l) => [`${l.kind}-${l.id}`, true])),
  );
  const [realTotal, setRealTotal] = useState(String(plan.total || ''));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [addToPantry, setAddToPantry] = useState(true);

  const toggle = (key: string) => setChecked((c) => ({...c, [key]: !c[key]}));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const items: ConfirmedPurchaseItem[] = baseItems
      .filter((l) => checked[`${l.kind}-${l.id}`])
      .map((l) => ({
        productName: l.nombre,
        quantity: l.quantity,
        category: l.categoria ?? null,
        paidPrice: l.precio_min ?? null,
      }));
    onConfirm(plan, {
      realTotal: Math.max(0, Math.round(Number(realTotal) || 0)),
      purchaseDate: new Date(date).toISOString(),
      items,
      addToPantry,
    });
  };

  return (
    <Modal title="Confirmar compra" onClose={onClose}>
      <form onSubmit={submit} className="cw-modal-form">
        <p className="cw-muted">Plan recomendado en <strong>{plan.store}</strong> · total estimado {money(plan.total)}.</p>

        <div className="cw-modal-grid">
          <label htmlFor="cw-confirm-total">Total real pagado (CLP)
            <input id="cw-confirm-total" type="number" min={0} step={100} value={realTotal} onChange={(e) => setRealTotal(e.target.value)} required />
          </label>
          <label htmlFor="cw-confirm-date">Fecha de compra
            <input id="cw-confirm-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
        </div>

        {baseItems.length > 0 ? (
          <fieldset className="cw-confirm-items">
            <legend>Productos comprados</legend>
            {baseItems.map((l) => {
              const key = `${l.kind}-${l.id}`;
              return (
                <label key={key} className="cw-check-row">
                  <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
                  <span>{l.nombre}{l.quantity > 1 ? ` ×${l.quantity}` : ''}</span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <p className="cw-muted">Este plan no guardó líneas de productos; se registrará solo el total.</p>
        )}

        <label className="cw-check-row">
          <input type="checkbox" checked={addToPantry} onChange={(e) => setAddToPantry(e.target.checked)} />
          <span>Enviar estos productos al almacén del hogar</span>
        </label>

        <div className="cw-modal-actions">
          <button type="button" className="cw-ghost-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cw-primary-btn">Confirmar compra</button>
        </div>
      </form>
    </Modal>
  );
}

const PROFILE_TABS: {id: ProfileTab; label: string}[] = [
  {id: 'cuenta', label: 'Datos de cuenta'},
  {id: 'ubicacion', label: 'Ubicación'},
  {id: 'notificaciones', label: 'Notificaciones'},
  {id: 'seguridad', label: 'Seguridad'},
];

function ProfileView({
  account,
  onAccountChange,
}: {
  account: Account;
  onAccountChange: React.Dispatch<React.SetStateAction<Account>>;
}) {
  const [tab, setTab] = useState<ProfileTab>('cuenta');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Account>(account);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const set = <K extends keyof Account>(key: K, value: Account[K]) =>
    setDraft((current) => ({...current, [key]: value}));

  const emailOk = emailValid(draft.email);
  const phoneOk = phoneValid(draft.phone);
  const cityOk = cityValid(draft.city);
  const passwordTouched = newPassword.length > 0 || confirmPassword.length > 0;
  const passwordOk = !passwordTouched || (newPassword.length >= 8 && newPassword === confirmPassword);
  const canSave = emailOk && phoneOk && cityOk && passwordOk;

  const resetPasswordFields = () => {
    setNewPassword('');
    setConfirmPassword('');
  };
  const startEdit = () => {
    setDraft(account);
    resetPasswordFields();
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    resetPasswordFields();
  };
  const save = () => {
    if (!canSave) return;
    onAccountChange(() => ({...draft, email: draft.email.trim(), city: draft.city.trim()}));
    setEditing(false);
    resetPasswordFields();
  };
  const deleteAccount = () => {
    if (window.confirm('¿Eliminar tu cuenta? Se borrarán tus datos guardados en este navegador.')) {
      onAccountChange(() => ({...DEFAULT_ACCOUNT}));
      setEditing(false);
    }
  };

  const fullName = [account.firstName, account.lastName].filter(Boolean).join(' ');
  const yn = (value: boolean) => (value ? 'Sí' : 'No');
  const avatar = (
    <span className="cw-avatar" aria-hidden="true">
      {account.avatarUrl ? <img src={account.avatarUrl} alt="" /> : accountInitials(account)}
    </span>
  );

  const renderView = () => {
    if (tab === 'cuenta') {
      return (
        <>
          <div className="cw-profile-identity">
            {avatar}
            <div>
              <strong>{fullName || account.username}</strong>
              <span>@{account.username}</span>
            </div>
          </div>
          <table className="cw-data-table"><tbody>
            <tr><th scope="row">Nombre de usuario</th><td>{account.username || '—'}</td></tr>
            <tr><th scope="row">Nombre</th><td>{account.firstName || '—'}</td></tr>
            <tr><th scope="row">Apellido</th><td>{account.lastName || '—'}</td></tr>
            <tr><th scope="row">Correo</th><td>{account.email}</td></tr>
            <tr><th scope="row">Teléfono</th><td>{account.phone || '—'}</td></tr>
            <tr><th scope="row">Contraseña</th><td>••••••••</td></tr>
          </tbody></table>
        </>
      );
    }
    if (tab === 'ubicacion') {
      return (
        <table className="cw-data-table"><tbody>
          <tr><th scope="row">País</th><td>{account.country}</td></tr>
          <tr><th scope="row">Región / estado</th><td>{account.region || '—'}</td></tr>
          <tr><th scope="row">Ciudad / comuna</th><td>{account.city}</td></tr>
          <tr><th scope="row">Dirección</th><td>{account.address || '—'}</td></tr>
          <tr><th scope="row">Código postal</th><td>{account.postalCode || '—'}</td></tr>
          <tr><th scope="row">Idioma</th><td>{account.language}</td></tr>
          <tr><th scope="row">Zona horaria</th><td>{account.timezone}</td></tr>
          <tr><th scope="row">Moneda</th><td>{account.currency}</td></tr>
        </tbody></table>
      );
    }
    if (tab === 'notificaciones') {
      return (
        <table className="cw-data-table"><tbody>
          <tr><th scope="row">Correos de novedades</th><td>{yn(account.notifyEmail)}</td></tr>
          <tr><th scope="row">Notificaciones push</th><td>{yn(account.notifyPush)}</td></tr>
          <tr><th scope="row">Alertas de precio</th><td>{yn(account.priceAlerts)}</td></tr>
        </tbody></table>
      );
    }
    return (
      <>
        <table className="cw-data-table"><tbody>
          <tr>
            <th scope="row">Verificación en dos pasos</th>
            <td><span className={account.twoFactor ? 'cw-status-ok' : 'cw-status-bad'}>{account.twoFactor ? 'Activada' : 'Desactivada'}</span></td>
          </tr>
          <tr><th scope="row">Sesión actual</th><td>Este navegador · activa ahora</td></tr>
        </tbody></table>
        <button type="button" className="cw-danger-btn" onClick={deleteAccount}>
          <Trash2 size={16} aria-hidden="true" />
          Eliminar cuenta
        </button>
      </>
    );
  };

  const renderEdit = () => {
    if (tab === 'cuenta') {
      return (
        <div className="cw-profile-grid">
          <label className="cw-field">Nombre de usuario
            <input value={draft.username} onChange={(e) => set('username', e.target.value)} />
          </label>
          <label className="cw-field">URL de avatar (opcional)
            <input value={draft.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} placeholder="https://..." />
          </label>
          <label className="cw-field">Nombre
            <input value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </label>
          <label className="cw-field">Apellido
            <input value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </label>
          <label className="cw-field">Correo
            <input
              type="email"
              value={draft.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={!emailOk || undefined}
              aria-describedby={!emailOk ? 'cw-email-err' : undefined}
            />
            {!emailOk && <span className="cw-form-error" id="cw-email-err" role="alert">Ingresa un correo válido.</span>}
          </label>
          <label className="cw-field">Teléfono
            <input
              value={draft.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+56 9 1234 5678"
              aria-invalid={!phoneOk || undefined}
              aria-describedby={!phoneOk ? 'cw-phone-err' : undefined}
            />
            {!phoneOk && <span className="cw-form-error" id="cw-phone-err" role="alert">Teléfono no válido.</span>}
          </label>
          <fieldset className="cw-field cw-span-2">
            <legend>Cambiar contraseña</legend>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña (mín. 8 caracteres)" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
            {passwordTouched && !passwordOk && (
              <span className="cw-form-error" role="alert">Mínimo 8 caracteres y ambas deben coincidir.</span>
            )}
            <span className="cw-field-hint">Por seguridad, en este demo la contraseña no se almacena.</span>
          </fieldset>
        </div>
      );
    }
    if (tab === 'ubicacion') {
      return (
        <div className="cw-profile-grid">
          <label className="cw-field">País
            <select value={draft.country} onChange={(e) => set('country', e.target.value)}>
              {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="cw-field">Región / estado
            <input value={draft.region} onChange={(e) => set('region', e.target.value)} />
          </label>
          <label className="cw-field" htmlFor="cw-city">Ciudad / comuna
            <input
              id="cw-city"
              list="cw-comunas"
              value={draft.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Escribe y elige tu comuna"
              aria-invalid={!cityOk || undefined}
              aria-describedby={!cityOk ? 'cw-city-err' : undefined}
            />
            <datalist id="cw-comunas">{COMUNAS.map((c) => <option key={c} value={c} />)}</datalist>
            {!cityOk && <span className="cw-form-error" id="cw-city-err" role="alert">Selecciona una comuna válida de la lista.</span>}
          </label>
          <label className="cw-field">Dirección
            <input value={draft.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle y número" />
          </label>
          <label className="cw-field">Código postal
            <input value={draft.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
          </label>
          <label className="cw-field">Idioma
            <select value={draft.language} onChange={(e) => set('language', e.target.value)}>
              {IDIOMAS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <label className="cw-field">Zona horaria
            <select value={draft.timezone} onChange={(e) => set('timezone', e.target.value)}>
              {ZONAS_HORARIAS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </label>
          <label className="cw-field">Moneda
            <select value={draft.currency} onChange={(e) => set('currency', e.target.value)}>
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
      );
    }
    if (tab === 'notificaciones') {
      return (
        <div className="cw-profile-toggles">
          <label className="cw-check">
            <input type="checkbox" checked={draft.notifyEmail} onChange={(e) => set('notifyEmail', e.target.checked)} />
            Recibir correos de novedades
          </label>
          <label className="cw-check">
            <input type="checkbox" checked={draft.notifyPush} onChange={(e) => set('notifyPush', e.target.checked)} />
            Notificaciones push
          </label>
          <label className="cw-check">
            <input type="checkbox" checked={draft.priceAlerts} onChange={(e) => set('priceAlerts', e.target.checked)} />
            Avisarme cuando baje un precio de mi compra
          </label>
        </div>
      );
    }
    return (
      <div className="cw-profile-toggles">
        <label className="cw-check">
          <input type="checkbox" checked={draft.twoFactor} onChange={(e) => set('twoFactor', e.target.checked)} />
          Activar verificación en dos pasos (2FA)
        </label>
        <p className="cw-field-hint">En este demo la 2FA es ilustrativa: no se envía un código real.</p>
      </div>
    );
  };

  return (
    <div className="cw-stack">
      <Hero title="Tu perfil" subtitle="Tus datos personales, ubicación y preferencias." />
      <section className="cw-panel">
        <div className="cw-profile-top">
          <div className="cw-segmented cw-profile-tabs" role="group" aria-label="Secciones del perfil">
            {PROFILE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? 'active' : ''}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {editing ? (
            <div className="cw-profile-actions">
              <button type="button" className="cw-ghost-btn" onClick={cancel}>Cancelar</button>
              <button type="button" className="cw-primary-btn" onClick={save} disabled={!canSave}>Guardar cambios</button>
            </div>
          ) : (
            <button type="button" className="cw-primary-btn" onClick={startEdit}>
              <Settings size={16} aria-hidden="true" />
              Modificar datos
            </button>
          )}
        </div>
        <div className="cw-profile-tab-content">
          {editing ? renderEdit() : renderView()}
        </div>
      </section>
    </div>
  );
}

function Hero({title, subtitle, action}: {title: string; subtitle: string; action?: ReactNode}) {
  return (
    <section className="cw-hero">
      <div>
        <span className="cw-kicker">Cartwise web</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </section>
  );
}

function MetricCard({label, value}: {label: string; value: ReactNode}) {
  return (
    <article className="cw-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelHeader({title, subtitle}: {title: string; subtitle?: string}) {
  return (
    <div className="cw-panel-header">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function EmptyState({text}: {text: string}) {
  return <div className="cw-empty">{text}</div>;
}
