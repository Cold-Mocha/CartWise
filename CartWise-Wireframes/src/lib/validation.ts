import {COMUNAS} from '../domain/constants';
import type {Account} from '../domain/types';

export function emailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function phoneValid(value: string) {
  const v = value.trim();
  if (!v) return true;
  return /^[+0-9()\s-]{8,}$/.test(v);
}

export function cityValid(value: string) {
  return COMUNAS.includes(value.trim());
}

export function accountInitials(account: Account) {
  const first = account.firstName.trim()[0] || account.username.trim()[0] || account.email.trim()[0] || 'U';
  const second = account.lastName.trim()[0] || '';
  return (first + second).toUpperCase();
}

export function accountValid(account: Account) {
  return emailValid(account.email) && phoneValid(account.phone) && cityValid(account.city);
}
