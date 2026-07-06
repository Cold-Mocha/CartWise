"use client";

import * as React from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { uid } from "@/lib/id";
import type { BasketItem, SavedList } from "@/types/cartwise";

// Listas guardadas: plantillas de compra reutilizables. Este provider solo
// administra la colección; los flujos que cruzan features (cargar una lista
// como compra pendiente, compararla) viven en hooks/use-list-workflows.ts.

type SavedListsState = {
  hydrated: boolean;
  savedLists: SavedList[];
  addList: (name: string, items: BasketItem[]) => SavedList;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  touchList: (id: string) => void;
};

const SavedListsContext = React.createContext<SavedListsState | null>(null);

export function SavedListsProvider({ children }: { children: React.ReactNode }) {
  const [savedLists, setSavedLists, hydrated] = usePersistentState<SavedList[]>(
    STORAGE_KEYS.lists,
    [],
  );

  const addList = (name: string, items: BasketItem[]) => {
    const now = new Date().toISOString();
    const list: SavedList = {
      id: uid(),
      name,
      items,
      createdAt: now,
      updatedAt: now,
    };
    setSavedLists((current) => [list, ...current]);
    return list;
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

  // Marca la lista como usada recientemente (al repetirla o compararla).
  const touchList = (id: string) => {
    setSavedLists((current) =>
      current.map((l) => (l.id === id ? { ...l, lastUsedAt: new Date().toISOString() } : l)),
    );
  };

  return (
    <SavedListsContext.Provider value={{ hydrated, savedLists, addList, renameList, deleteList, touchList }}>
      {children}
    </SavedListsContext.Provider>
  );
}

export function useSavedLists() {
  const ctx = React.useContext(SavedListsContext);
  if (!ctx) throw new Error("useSavedLists debe usarse dentro de SavedListsProvider");
  return ctx;
}
