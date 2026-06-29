import {useEffect, useState} from 'react';
import {DEFAULT_ACCOUNT} from '../domain/constants';
import type {Account} from '../domain/types';
import {loadAccount, loadBudget, saveAccount, saveBudget} from '../services/localStorageService';

export function useAccount() {
  const [account, setAccount] = useState<Account>(() => ({
    ...DEFAULT_ACCOUNT,
    ...loadAccount(),
  }));
  const [budget, setBudget] = useState<number>(loadBudget);

  useEffect(() => {
    saveAccount(account);
  }, [account]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  return {
    account,
    setAccount,
    budget,
    setBudget,
  };
}
