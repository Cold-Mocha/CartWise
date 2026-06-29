import {STORAGE_KEYS} from '../domain/constants';
import type {Account, BasketItem, ConfirmedPurchase, PantryItem, SavedList, SavedPlan} from '../domain/types';
import {loadJson, saveJson} from '../lib/storage';

export function getDemoAuth() {
  return localStorage.getItem(STORAGE_KEYS.auth) === 'true';
}

export function setDemoAuth(value: boolean) {
  if (value) localStorage.setItem(STORAGE_KEYS.auth, 'true');
  else localStorage.removeItem(STORAGE_KEYS.auth);
}

export function loadBasket() {
  return loadJson<BasketItem[]>(STORAGE_KEYS.basket, []);
}

export function saveBasket(value: BasketItem[]) {
  saveJson(STORAGE_KEYS.basket, value);
}

export function loadHistory() {
  return loadJson<SavedPlan[]>(STORAGE_KEYS.history, []);
}

export function saveHistory(value: SavedPlan[]) {
  saveJson(STORAGE_KEYS.history, value);
}

export function loadAccount() {
  return loadJson<Partial<Account>>(STORAGE_KEYS.account, {});
}

export function saveAccount(value: Account) {
  saveJson(STORAGE_KEYS.account, value);
}

export function loadBudget() {
  return loadJson<number>(STORAGE_KEYS.budget, 0);
}

export function saveBudget(value: number) {
  saveJson(STORAGE_KEYS.budget, value);
}

export function loadConfirmedPurchases() {
  return loadJson<ConfirmedPurchase[]>(STORAGE_KEYS.confirmed, []);
}

export function saveConfirmedPurchases(value: ConfirmedPurchase[]) {
  saveJson(STORAGE_KEYS.confirmed, value);
}

export function loadSavedLists() {
  return loadJson<SavedList[]>(STORAGE_KEYS.lists, []);
}

export function saveSavedLists(value: SavedList[]) {
  saveJson(STORAGE_KEYS.lists, value);
}

export function loadPantry() {
  return loadJson<PantryItem[]>(STORAGE_KEYS.pantry, []);
}

export function savePantry(value: PantryItem[]) {
  saveJson(STORAGE_KEYS.pantry, value);
}
