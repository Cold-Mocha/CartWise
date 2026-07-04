"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DEFAULT_MONTHLY_BUDGET, PLAN_STATUS_LABELS, SNAPSHOT_FECHA, STORAGE_KEYS } from "@/lib/constants";
import { loadJson, removeKey, saveJson } from "@/lib/storage";
import { buildGenericFromProduct, planItemsSignature, savedPlanSignature } from "@/lib/basket";
import { compareBasket } from "@/lib/api";
import type {
  BasketComparison,
  BasketItem,
  ConfirmPurchaseData,
  ConfirmedPurchase,
  ConfirmedPurchaseItem,
  PantryItem,
  PantryItemDraft,
  PlanStatus,
  SavedList,
  SavedPlan,
  SearchItem,
} from "@/types/cartwise";

type AppState = {
  hydrated: boolean;

  // Sesión demo (no es autenticación real).
  isAuthenticated: boolean;
  loginDemo: () => void;
  logout: () => void;

  // Compra pendiente.
  basket: BasketItem[];
  basketUnits: number;
  setBasket: (items: BasketItem[]) => void;
  addToBasket: (item: SearchItem) => void;
  removeFromBasket: (item: BasketItem) => void;
  updateQuantity: (item: BasketItem, quantity: number) => void;
  clearBasket: () => void;
  switchToGeneric: (item: BasketItem) => void;

  // Comparación.
  comparison: BasketComparison | null;
  comparing: boolean;
  apiError: string | null;
  compareItems: (items: BasketItem[]) => Promise<void>;

  // Listas guardadas.
  savedLists: SavedList[];
  saveCurrentAsList: (name: string) => void;
  repeatList: (list: SavedList) => void;
  compareList: (list: SavedList) => void;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  savePlanAsList: (plan: SavedPlan) => void;

  // Historial.
  history: SavedPlan[];
  confirmed: ConfirmedPurchase[];
  highlightedPlanId: string | null;
  savePlan: () => void;
  createPlanFromComparison: () => SavedPlan | null;
  repeatPlan: (plan: SavedPlan) => void;
  compareSavedPlan: (plan: SavedPlan) => void;
  deletePlan: (id: string) => void;
  updatePlanStatus: (id: string, status: PlanStatus) => void;
  confirmPurchase: (plan: SavedPlan, data: ConfirmPurchaseData) => void;

  // Despensa.
  pantry: PantryItem[];
  addPantryItem: (draft: PantryItemDraft) => void;
  addProductsToPantry: (items: SearchItem[], quantities?: Record<string, number>) => void;
  updatePantryQuantity: (id: string, quantity: number) => void;
  consumePantryItem: (id: string) => void;

  // Presupuesto mensual (demo MVP, editable en estado local).
  monthlyBudget: number;
  setMonthlyBudget: (value: number) => void;
};

const AppStateContext = React.createContext<AppState | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [basket, setBasketState] = React.useState<BasketItem[]>([]);
  const [comparison, setComparison] = React.useState<BasketComparison | null>(null);
  const [comparing, setComparing] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [savedLists, setSavedLists] = React.useState<SavedList[]>([]);
  const [history, setHistory] = React.useState<SavedPlan[]>([]);
  const [confirmed, setConfirmed] = React.useState<ConfirmedPurchase[]>([]);
  const [pantry, setPantry] = React.useState<PantryItem[]>([]);
  const [monthlyBudget, setMonthlyBudgetState] = React.useState<number>(DEFAULT_MONTHLY_BUDGET);
  const [highlightedPlanId, setHighlightedPlanId] = React.useState<string | null>(null);

  // Hidratación: leer localStorage solo en cliente, tras el primer render, para
  // evitar mismatch de hidratación (plan de persistencia §18).
  React.useEffect(() => {
    setIsAuthenticated(loadJson<string>(STORAGE_KEYS.auth, "") === "true");
    setBasketState(loadJson<BasketItem[]>(STORAGE_KEYS.basket, []));
    setSavedLists(loadJson<SavedList[]>(STORAGE_KEYS.lists, []));
    setHistory(loadJson<SavedPlan[]>(STORAGE_KEYS.history, []));
    setConfirmed(loadJson<ConfirmedPurchase[]>(STORAGE_KEYS.confirmed, []));
    setPantry(loadJson<PantryItem[]>(STORAGE_KEYS.pantry, []));
    setMonthlyBudgetState(loadJson<number>(STORAGE_KEYS.budget, DEFAULT_MONTHLY_BUDGET));
    setHydrated(true);
  }, []);

  // Persistencia (no escribir antes de hidratar para no pisar lo guardado).
  React.useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEYS.basket, basket);
  }, [basket, hydrated]);
  React.useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEYS.lists, savedLists);
  }, [savedLists, hydrated]);
  React.useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEYS.history, history);
  }, [history, hydrated]);
  React.useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEYS.confirmed, confirmed);
  }, [confirmed, hydrated]);
  React.useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEYS.pantry, pantry);
  }, [pantry, hydrated]);
  React.useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEYS.budget, monthlyBudget);
  }, [monthlyBudget, hydrated]);

  React.useEffect(() => {
    if (!highlightedPlanId) return;
    const t = setTimeout(() => setHighlightedPlanId(null), 3800);
    return () => clearTimeout(t);
  }, [highlightedPlanId]);

  const basketUnits = React.useMemo(
    () => basket.reduce((sum, item) => sum + item.quantity, 0),
    [basket],
  );

  // --- Auth demo ---
  const loginDemo = () => {
    saveJson(STORAGE_KEYS.auth, "true");
    setIsAuthenticated(true);
    router.push("/dashboard");
  };
  const logout = () => {
    removeKey(STORAGE_KEYS.auth);
    setIsAuthenticated(false);
    router.push("/");
  };

  // --- Compra pendiente ---
  const setBasket = (items: BasketItem[]) => setBasketState(items);

  const addToBasket = (item: SearchItem) => {
    setBasketState((current) => {
      const existing = current.find((row) => row.id === item.id && row.kind === item.kind);
      if (existing) {
        return current.map((row) =>
          row.id === item.id && row.kind === item.kind
            ? { ...row, quantity: row.quantity + 1 }
            : row,
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
    toast.success(`${item.nombre} · agregado a tu compra`);
  };

  const removeFromBasket = (item: BasketItem) => {
    setBasketState((current) =>
      current.filter((row) => !(row.id === item.id && row.kind === item.kind)),
    );
    toast(`${item.nombre} · quitado de tu compra`);
  };

  const clearBasket = () => {
    setBasketState([]);
    toast("Compra pendiente vaciada");
  };

  const updateQuantity = (item: BasketItem, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(item);
      return;
    }
    setBasketState((current) =>
      current.map((row) =>
        row.id === item.id && row.kind === item.kind ? { ...row, quantity } : row,
      ),
    );
  };

  const switchToGeneric = (item: BasketItem) => {
    const generic = buildGenericFromProduct(item);
    if (!generic) {
      toast("Ese producto no tiene comparable asociado");
      return;
    }
    setBasketState((current) => {
      const withoutExact = current.filter((row) => !(row.id === item.id && row.kind === item.kind));
      const existing = withoutExact.find((row) => row.kind === "generic" && row.id === generic.id);
      if (existing) {
        return withoutExact.map((row) =>
          row.kind === "generic" && row.id === generic.id
            ? { ...row, quantity: row.quantity + item.quantity }
            : row,
        );
      }
      return [...withoutExact, generic];
    });
    toast.success(`${item.nombre} cambiado por comparable`);
  };

  // --- Comparación ---
  const compareItems = async (items: BasketItem[]) => {
    if (!items.length || comparing) return;
    setApiError(null);
    setComparing(true);
    try {
      const data = await compareBasket(items);
      setComparison(data);
      router.push("/comparar");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo comparar la compra.";
      setApiError(message);
      toast.error(message);
    } finally {
      setComparing(false);
    }
  };

  // --- Despensa ---
  const addItemsToPantry = (items: ConfirmedPurchaseItem[]) => {
    const now = new Date().toISOString();
    setPantry((current) => {
      const next = [...current];
      items.forEach((it) => {
        const idx = next.findIndex(
          (p) => p.productName.toLowerCase() === it.productName.toLowerCase(),
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + it.quantity, updatedAt: now };
        } else {
          next.unshift({
            id: uid(),
            productName: it.productName,
            category: it.category ?? null,
            quantity: it.quantity,
            source: "confirmed_purchase",
            addedAt: now,
            updatedAt: now,
          });
        }
      });
      return next;
    });
  };

  // Agrega varios productos del catálogo a la despensa (flujo de selección
  // múltiple en su propia página, plan §6.2). Guarda el mejor precio/tienda del
  // snapshot al momento de agregar para mostrarlo luego sin volver a consultar.
  // `quantities` es opcional: mapa por `${kind}-${id}` con la cantidad elegida.
  const addProductsToPantry = (items: SearchItem[], quantities?: Record<string, number>) => {
    if (!items.length) return;
    const now = new Date().toISOString();
    const qtyOf = (it: SearchItem) => Math.max(1, quantities?.[`${it.kind}-${it.id}`] ?? 1);
    setPantry((current) => {
      const next = [...current];
      items.forEach((it) => {
        const qty = qtyOf(it);
        const idx = next.findIndex(
          (p) => p.productName.toLowerCase() === it.nombre.toLowerCase(),
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty, updatedAt: now };
        } else {
          // Solo guardamos id/precio para productos exactos: el comparable
          // genérico usa otro id y rompería la compra pendiente. Sin ese dato, el
          // hover de la despensa muestra "Sin precio disponible" (correcto).
          const exact = it.kind === "product";
          next.unshift({
            id: uid(),
            productId: exact ? it.id : null,
            productName: it.nombre,
            category: it.categoria ?? null,
            quantity: qty,
            source: "manual",
            addedAt: now,
            updatedAt: now,
            ean: exact ? it.ean ?? null : null,
            bestPrice: exact ? it.precio_min ?? null : null,
            bestPriceStore: exact ? it.precio_min_store_label ?? null : null,
          });
        }
      });
      return next;
    });
    toast.success(`${items.length} ${items.length === 1 ? "producto agregado" : "productos agregados"} a la despensa`);
  };

  const setMonthlyBudget = (value: number) => {
    setMonthlyBudgetState(value > 0 ? Math.round(value) : DEFAULT_MONTHLY_BUDGET);
  };

  const addPantryItem = (data: PantryItemDraft) => {
    const now = new Date().toISOString();
    setPantry((current) => [
      {
        id: uid(),
        productName: data.productName.trim(),
        category: data.category ?? null,
        quantity: data.quantity,
        unit: data.unit ?? null,
        source: "manual",
        addedAt: now,
        updatedAt: now,
        notes: data.notes,
      },
      ...current,
    ]);
    toast.success(`${data.productName.trim()} agregado al almacén`);
  };

  const updatePantryQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setPantry((current) => current.filter((p) => p.id !== id));
      return;
    }
    setPantry((current) =>
      current.map((p) => (p.id === id ? { ...p, quantity, updatedAt: new Date().toISOString() } : p)),
    );
  };

  const consumePantryItem = (id: string) => {
    setPantry((current) => current.filter((p) => p.id !== id));
    toast("Producto marcado como consumido");
  };

  // --- Listas guardadas ---
  const saveCurrentAsList = (name: string) => {
    if (!basket.length) {
      toast("No hay productos para guardar como lista");
      return;
    }
    const now = new Date().toISOString();
    const list: SavedList = {
      id: uid(),
      name: name.trim() || "Lista sin nombre",
      items: basket.map((item) => ({ ...item })),
      createdAt: now,
      updatedAt: now,
    };
    setSavedLists((current) => [list, ...current]);
    toast.success(`Lista "${list.name}" guardada`);
  };

  const repeatList = (list: SavedList) => {
    if (!list.items.length) {
      toast("Esa lista no tiene productos");
      return;
    }
    setBasketState(list.items.map((item) => ({ ...item })));
    setSavedLists((current) =>
      current.map((l) => (l.id === list.id ? { ...l, lastUsedAt: new Date().toISOString() } : l)),
    );
    toast.success(`Lista "${list.name}" cargada como compra pendiente`);
    router.push("/compra-pendiente");
  };

  const compareList = (list: SavedList) => {
    if (!list.items.length) {
      toast("Esa lista no tiene productos");
      return;
    }
    const lines = list.items.map((item) => ({ ...item }));
    setBasketState(lines);
    setSavedLists((current) =>
      current.map((l) => (l.id === list.id ? { ...l, lastUsedAt: new Date().toISOString() } : l)),
    );
    void compareItems(lines);
  };

  const renameList = (id: string, name: string) => {
    setSavedLists((current) =>
      current.map((l) =>
        l.id === id ? { ...l, name: name.trim() || l.name, updatedAt: new Date().toISOString() } : l,
      ),
    );
    toast("Lista actualizada");
  };

  const deleteList = (id: string) => {
    setSavedLists((current) => current.filter((l) => l.id !== id));
    toast("Lista eliminada");
  };

  const savePlanAsList = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      toast("Ese plan no tiene líneas guardadas");
      return;
    }
    const now = new Date().toISOString();
    setSavedLists((current) => [
      {
        id: uid(),
        name: `Compra ${plan.store} · ${plan.date}`,
        items: plan.lines!.map((item) => ({ ...item })),
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    toast.success("Lista creada desde el plan");
  };

  // --- Historial ---
  // Crea (o reutiliza) el plan del supermercado recomendado y lo guarda en el
  // historial como pendiente. Devuelve el plan para reusarlo al confirmar.
  const createPlanFromComparison = (): SavedPlan | null => {
    if (!comparison?.recommendedStore) return null;
    const rec = comparison.recommendedStore;
    const signature = planItemsSignature(basket);
    const duplicate = history.find(
      (p) => p.store === rec.store.label && p.total === rec.total && savedPlanSignature(p) === signature,
    );
    if (duplicate) return duplicate;
    const now = new Date();
    const saved: SavedPlan = {
      id: uid(),
      date: now.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" }),
      createdAt: now.toISOString(),
      snapshotDate: SNAPSHOT_FECHA,
      total: rec.total,
      store: rec.store.label,
      items: rec.pricedItems,
      savings: comparison.estimatedSavings,
      status: "pending",
      lines: basket.map((item) => ({ ...item })),
      recommendedLines: rec.lines.map((line) => ({ ...line })),
    };
    setHistory((current) => [saved, ...current]);
    return saved;
  };

  const savePlan = () => {
    if (!comparison?.recommendedStore) return;
    const rec = comparison.recommendedStore;
    const signature = planItemsSignature(basket);
    const duplicate = history.find(
      (p) => p.store === rec.store.label && p.total === rec.total && savedPlanSignature(p) === signature,
    );
    if (duplicate) {
      toast("Ese plan ya está en tus compras planificadas");
      setHighlightedPlanId(duplicate.id);
      router.push("/planificadas");
      return;
    }
    const saved = createPlanFromComparison();
    if (!saved) return;
    setHighlightedPlanId(saved.id);
    toast.success("Compra planificada guardada");
    router.push("/planificadas");
  };

  const repeatPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      toast("Ese plan no tiene líneas guardadas");
      return;
    }
    setBasketState(plan.lines.map((item) => ({ ...item })));
    toast.success("Compra restaurada desde el historial");
    router.push("/compra-pendiente");
  };

  const compareSavedPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      toast("Ese plan no tiene líneas guardadas");
      return;
    }
    const lines = plan.lines.map((item) => ({ ...item }));
    setBasketState(lines);
    void compareItems(lines);
  };

  const deletePlan = (id: string) => {
    setHistory((current) => current.filter((plan) => plan.id !== id));
    toast("Plan eliminado");
  };

  const updatePlanStatus = (id: string, status: PlanStatus) => {
    setHistory((current) => current.map((plan) => (plan.id === id ? { ...plan, status } : plan)));
    toast(`Estado actualizado: ${PLAN_STATUS_LABELS[status]}`);
  };

  const confirmPurchase = (plan: SavedPlan, data: ConfirmPurchaseData) => {
    const estimatedTotal = plan.total;
    const estimatedSavings = plan.savings ?? 0;
    const confirmedSavings = estimatedSavings + (estimatedTotal - data.realTotal);
    const purchase: ConfirmedPurchase = {
      id: uid(),
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
    setHistory((current) =>
      current.map((p) => (p.id === plan.id ? { ...p, status: "purchased" } : p)),
    );
    if (data.addToPantry) {
      addItemsToPantry(data.items);
      toast.success("Compra confirmada · productos enviados a tu despensa");
    } else {
      toast.success("Compra confirmada y registrada");
    }
    // Solo vaciamos la compra pendiente si el plan confirmado corresponde a la
    // compra pendiente actual (flujo comparar → resumen). Si se confirma un plan
    // distinto desde "Compras planificadas", no tocamos una compra en curso.
    const matchesBasket = basket.length > 0 && savedPlanSignature(plan) === planItemsSignature(basket);
    if (matchesBasket) {
      setBasketState([]);
      setComparison(null);
    }
    router.push("/dashboard");
  };

  const value: AppState = {
    hydrated,
    isAuthenticated,
    loginDemo,
    logout,
    basket,
    basketUnits,
    setBasket,
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    switchToGeneric,
    comparison,
    comparing,
    apiError,
    compareItems,
    savedLists,
    saveCurrentAsList,
    repeatList,
    compareList,
    renameList,
    deleteList,
    savePlanAsList,
    history,
    confirmed,
    highlightedPlanId,
    savePlan,
    createPlanFromComparison,
    repeatPlan,
    compareSavedPlan,
    deletePlan,
    updatePlanStatus,
    confirmPurchase,
    pantry,
    addPantryItem,
    addProductsToPantry,
    updatePantryQuantity,
    consumePantryItem,
    monthlyBudget,
    setMonthlyBudget,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState debe usarse dentro de AppStateProvider");
  return ctx;
}
