import {useEffect, useState} from 'react';
import type {BasketItem, SavedList, SavedPlan, View} from '../domain/types';
import {loadSavedLists, saveSavedLists} from '../services/localStorageService';

type UseSavedListsOptions = {
  basket: BasketItem[];
  setBasket: (items: BasketItem[]) => void;
  compareItems: (items: BasketItem[]) => void;
  setView: (view: View) => void;
  showToast: (message: string) => void;
};

export function useSavedLists({
  basket,
  setBasket,
  compareItems,
  setView,
  showToast,
}: UseSavedListsOptions) {
  const [savedLists, setSavedLists] = useState<SavedList[]>(loadSavedLists);
  const [savingList, setSavingList] = useState(false);

  useEffect(() => {
    saveSavedLists(savedLists);
  }, [savedLists]);

  const saveCurrentAsList = (name: string) => {
    if (!basket.length) {
      showToast('No hay productos para guardar como lista');
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
    showToast(`Lista "${list.name}" guardada`);
  };

  const repeatList = (list: SavedList) => {
    if (!list.items.length) {
      showToast('Esa lista no tiene productos');
      return;
    }
    setBasket(list.items.map((item) => ({...item})));
    setSavedLists((current) => current.map((l) =>
      l.id === list.id ? {...l, lastUsedAt: new Date().toISOString()} : l,
    ));
    showToast(`Lista "${list.name}" cargada como compra pendiente`);
    setView('plan');
  };

  const compareList = (list: SavedList) => {
    if (!list.items.length) {
      showToast('Esa lista no tiene productos');
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
    showToast('Lista actualizada');
  };

  const deleteList = (id: string) => {
    setSavedLists((current) => current.filter((l) => l.id !== id));
    showToast('Lista eliminada');
  };

  const savePlanAsList = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      showToast('Ese plan no tiene líneas guardadas');
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
    showToast('Lista creada desde el plan');
  };

  return {
    savedLists,
    savingList,
    setSavingList,
    saveCurrentAsList,
    repeatList,
    compareList,
    renameList,
    deleteList,
    savePlanAsList,
  };
}
