import {useState} from 'react';
import {getDemoAuth, setDemoAuth} from '../services/localStorageService';

export function useDemoAuth() {
  const [authed, setAuthed] = useState(getDemoAuth);

  const loginDemo = () => {
    setDemoAuth(true);
    setAuthed(true);
  };

  const logout = () => {
    setDemoAuth(false);
    setAuthed(false);
  };

  return {
    authed,
    loginDemo,
    logout,
  };
}
